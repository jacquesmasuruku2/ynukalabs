import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ressources
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} ressource{total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              loadItems();
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
          <Button variant="outline" size="icon" onClick={loadItems} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une ressource
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
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
                      <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </div>
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Modifier la ressource" : "Créer une nouvelle ressource"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Section */}
          {sections.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="section_id" className="font-semibold">
                Section
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                La section à laquelle cette ressource appartient
              </p>
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
          <div className="grid gap-2">
            <Label htmlFor="title_fr" className="font-semibold">
              Titre en français *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Le titre principal de la ressource
            </p>
            <Input
              id="title_fr"
              placeholder="Ex: Guide complet du design"
              value={form.title_fr || ""}
              onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
            />
          </div>

          {/* Titre English */}
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-semibold">
              Titre en anglais
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Version anglaise du titre
            </p>
            <Input
              id="title"
              placeholder="Ex: Complete Design Guide"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description Français */}
          <div className="grid gap-2">
            <Label htmlFor="description_fr" className="font-semibold">
              Description en français
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Détails complets sur la ressource
            </p>
            <Textarea
              id="description_fr"
              placeholder="Décrivez la ressource en détail..."
              value={form.description_fr || ""}
              onChange={(e) => setForm({ ...form, description_fr: e.target.value })}
              rows={4}
            />
          </div>

          {/* Description English */}
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-semibold">
              Description en anglais
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Version anglaise de la description
            </p>
            <Textarea
              id="description"
              placeholder="Describe the resource in English..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* URL */}
          <div className="grid gap-2">
            <Label htmlFor="url" className="font-semibold">
              URL de la ressource *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              L'adresse complète de la ressource (https://...)
            </p>
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
