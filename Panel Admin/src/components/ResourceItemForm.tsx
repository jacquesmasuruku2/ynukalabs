import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ResourceItem {
  id: string;
  section_id: string | null;
  title: string | null;
  title_fr: string | null;
  description: string | null;
  description_fr: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  name: string;
  [key: string]: any;
}

export function ResourceItemForm() {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [creating, setCreating] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const r = await api.list("resource_items", page, limit, search);
      setItems(r.rows || []);
      setTotal(r.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      // Try to load sections if the table exists
      const r = await api.list("resource_sections", 1, 1000);
      setSections(r.rows || []);
    } catch (e: any) {
      // Sections table might not exist, that's okay
      setSections([]);
    }
  };

  useEffect(() => {
    loadItems();
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;
    try {
      await api.remove("resource_items", id);
      toast.success("Ressource supprimée avec succès");
      loadItems();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Ressources"
        description={`${total} ressource${total > 1 ? "s" : ""}`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                loadItems();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={loadItems}
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
                <TableHead>Titre (FR)</TableHead>
                <TableHead>Titre (EN)</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Créé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="table-empty">
                    Aucune ressource
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => {
                const section = sections.find((s) => s.id === item.section_id);
                const createdDate = new Date(item.created_at).toLocaleDateString("fr-FR");
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[150px] truncate font-semibold">
                      {item.title_fr || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {item.title || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.url.substring(0, 40)}...
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {section?.name || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{createdDate}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onEdit={() => setEditing(item)}
                        onDelete={() => onDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <ResourceItemDialog
        open={creating || !!editing}
        item={editing}
        sections={sections}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (data) => {
          try {
            if (editing) {
              await api.update("resource_items", editing.id, data);
              toast.success("Ressource mise à jour avec succès");
            } else {
              await api.create("resource_items", data);
              toast.success("Ressource créée avec succès");
            }
            setEditing(null);
            setCreating(false);
            loadItems();
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </PageShell>
  );
}

function ResourceItemDialog({
  open,
  item,
  sections,
  onClose,
  onSave,
}: {
  open: boolean;
  item: ResourceItem | null;
  sections: Section[];
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      setForm({
        section_id: item?.section_id ?? "",
        title: item?.title ?? "",
        title_fr: item?.title_fr ?? "",
        description: item?.description ?? "",
        description_fr: item?.description_fr ?? "",
        url: item?.url ?? "",
      });
    }
  }, [open, item]);

  const handleSave = () => {
    if (!form.title_fr) {
      toast.error("Le titre en français est obligatoire");
      return;
    }
    if (!form.url) {
      toast.error("L'URL est obligatoire");
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "Modifier la ressource" : "Créer une nouvelle ressource"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          {/* Section */}
          {sections.length > 0 && (
            <div className="form-field">
              <Label htmlFor="section_id" className="font-semibold">
                Section
              </Label>
              <Select
                value={form.section_id || ""}
                onValueChange={(value) => setForm({ ...form, section_id: value || null })}
              >
                <SelectTrigger id="section_id">
                  <SelectValue placeholder="Aucune section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune section</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name || section.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Titre Français */}
          <div className="form-field">
            <Label htmlFor="title_fr" className="font-semibold">
              Titre en français *
            </Label>
            <Input
              id="title_fr"
              placeholder="Ex: Guide complet du design"
              value={form.title_fr || ""}
              onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
            />
          </div>

          {/* Titre English */}
          <div className="form-field">
            <Label htmlFor="title" className="font-semibold">
              Titre en anglais
            </Label>
            <Input
              id="title"
              placeholder="Ex: Complete Design Guide"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description Français */}
          <div className="form-field">
            <Label htmlFor="description_fr" className="font-semibold">
              Description en français
            </Label>
            <Textarea
              id="description_fr"
              placeholder="Décrivez la ressource en détail..."
              value={form.description_fr || ""}
              onChange={(e) => setForm({ ...form, description_fr: e.target.value })}
            />
          </div>

          {/* Description English */}
          <div className="form-field">
            <Label htmlFor="description" className="font-semibold">
              Description en anglais
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the resource in English..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* URL */}
          <div className="form-field">
            <Label htmlFor="url" className="font-semibold">
              URL de la ressource *
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://ynukalabs.com/ressource"
              value={form.url || ""}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {item ? "Mettre à jour" : "Créer la ressource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
