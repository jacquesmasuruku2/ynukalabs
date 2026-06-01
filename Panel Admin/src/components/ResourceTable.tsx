import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { toast } from "sonner";
import { api, type Resource, RESOURCE_LABELS } from "@/lib/api";
import { notifications } from "@/lib/notifications";

// Fonction helper pour envoyer des notifications lors de la création de ressources
async function sendNotificationForResource(resource: Resource, data: Record<string, any>) {
  try {
    switch (resource) {
      case "newsletter_subscribers":
        await notifications.newsletter(data.email || "Nouvel abonné");
        break;
      case "contact_messages":
        await notifications.contactMessage(data.name || "Contact", data.subject || "Nouveau message");
        break;
      case "blog_comments":
        await notifications.blogComment(data.author_name || "Anonyme");
        break;
      case "donations":
        await notifications.donation(data.donor_name || "Donateur", data.amount || "0");
        break;
      case "event_registrations":
        await notifications.eventRegistration(data.name || "Participant");
        break;
      default:
        // Pas de notification pour les autres ressources
        break;
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
  }
}

export function ResourceTable({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.list(resource, page, limit, search);
      setRows(r.rows || []);
      setColumns(r.columns || (r.rows?.[0] ? Object.keys(r.rows[0]) : []));
      setTotal(r.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, page]);

  const onDelete = async (id: any) => {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    try {
      await api.remove(resource, id);
      toast.success("Supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const idKey = useMemo(
    () => columns.find((c) => c === "id") || columns[0],
    [columns],
  );

  return (
    <PageShell>
      <PageHeader
        title={RESOURCE_LABELS[resource]}
        description={`${total} enregistrement${total > 1 ? "s" : ""}`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                load();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={load}
              disabled={loading}
              aria-label="Actualiser"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setCreating(true)} className="h-10 shadow-sm">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </PageToolbar>
        }
      />

      <ContentCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.slice(0, 6).map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="table-empty">
                    Aucun enregistrement
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, i) => (
                <TableRow key={row[idKey] ?? i}>
                  {columns.slice(0, 6).map((c) => (
                    <TableCell key={c} className="max-w-[260px] truncate text-slate-600">
                      {formatCell(row[c])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <TableRowActions
                      onEdit={() => setEditing(row)}
                      onDelete={() => onDelete(row[idKey])}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ContentCardFooter>
          <span className="text-sm font-medium text-slate-500">
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-200 bg-white"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-200 bg-white"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </ContentCardFooter>
      </ContentCard>

      <RowDialog
        open={creating || !!editing}
        row={editing}
        columns={columns}
        idKey={idKey}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (data) => {
          try {
            if (editing) {
              await api.update(resource, editing[idKey], data);
              toast.success("Mis à jour");
            } else {
              const result = await api.create(resource, data);
              toast.success("Créé");

              // Envoyer une notification pour les ressources spécifiques
              await sendNotificationForResource(resource, data);
            }
            setEditing(null);
            setCreating(false);
            load();
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </PageShell>
  );
}

function formatCell(v: any) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function RowDialog({
  open,
  row,
  columns,
  idKey,
  onClose,
  onSave,
}: {
  open: boolean;
  row: any | null;
  columns: string[];
  idKey: string;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}) {
  const editable = columns.filter(
    (c) => c !== idKey && c !== "created_at" && c !== "updated_at",
  );
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, any> = {};
      editable.forEach((c) => (init[c] = row?.[c] ?? ""));
      setForm(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-full sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{row ? "Modifier l'enregistrement" : "Nouvel enregistrement"}</DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          {editable.length === 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chargez d'abord la liste pour détecter les colonnes.
            </p>
          )}
          {editable.map((c) => {
            const v = form[c];
            const long = typeof v === "string" && v.length > 80;
            const label = c.replace(/_/g, " ");
            return (
              <FormField key={c} label={label} htmlFor={c}>
                {long ? (
                  <Textarea
                    id={c}
                    value={v ?? ""}
                    onChange={(e) => setForm({ ...form, [c]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={c}
                    value={v ?? ""}
                    onChange={(e) => setForm({ ...form, [c]: e.target.value })}
                  />
                )}
              </FormField>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => onSave(form)}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}