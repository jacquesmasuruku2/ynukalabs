import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api, type Resource, RESOURCE_LABELS } from "@/lib/api";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {RESOURCE_LABELS[resource]}
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} enregistrement{total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              load();
            }}
            className="relative"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="pl-8 w-64"
            />
          </form>
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
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
                  <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-10">
                    Aucun enregistrement
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row, i) => (
                <TableRow key={row[idKey] ?? i}>
                  {columns.slice(0, 6).map((c) => (
                    <TableCell key={c} className="max-w-[260px] truncate">
                      {formatCell(row[c])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row[idKey])}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/40">
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

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
              await api.create(resource, data);
              toast.success("Créé");
            }
            setEditing(null);
            setCreating(false);
            load();
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </div>
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row ? "Modifier" : "Ajouter"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {editable.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Chargez d'abord la liste pour détecter les colonnes.
            </p>
          )}
          {editable.map((c) => {
            const v = form[c];
            const long = typeof v === "string" && v.length > 80;
            return (
              <div key={c} className="grid gap-1.5">
                <Label htmlFor={c}>{c}</Label>
                {long ? (
                  <Textarea
                    id={c}
                    value={v ?? ""}
                    onChange={(e) => setForm({ ...form, [c]: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={c}
                    value={v ?? ""}
                    onChange={(e) => setForm({ ...form, [c]: e.target.value })}
                  />
                )}
              </div>
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
