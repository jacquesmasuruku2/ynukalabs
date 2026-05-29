import { useEffect, useState, useRef } from "react";
import { Plus, RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description?: string;
  status?: string;
  image_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const empty: any = {
  title: "",
  description: "",
  status: "active",
  image_url: "",
  published: false,
};

export function ProjectForm() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.list("projects", page, limit, search);
      setProjects((res.rows ?? []) as any);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title ?? "",
      description: p.description ?? "",
      status: p.status ?? "active",
      image_url: p.image_url ?? "",
      published: !!p.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) {
      toast.error("Le titre est obligatoire");
      return;
    }

    try {
      const payload: any = {
        title: form.title,
        description: form.description || null,
        status: form.status || "active",
        image_url: form.image_url || null,
        published: form.published ? 1 : 0,
      };

      if (editing) {
        await api.update("projects", editing.id, payload);
        toast.success("Projet mis à jour");
      } else {
        await api.create("projects", payload);
        toast.success("Projet créé");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    try {
      await api.remove("projects", id);
      toast.success("Projet supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Projets"
        description={`${total} projet${total > 1 ? "s" : ""}`}
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
            <Button onClick={openCreate} className="h-10 shadow-sm">
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
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Publié</TableHead>
                <TableHead>Créé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Aucun projet
                  </TableCell>
                </TableRow>
              )}
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="max-w-[200px] truncate font-semibold">
                    {project.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.status || "active"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.published ? "default" : "secondary"}>
                      {project.published ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(project.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(project)}
                      onDelete={() => remove(project.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
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
        )}
      </ContentCard>

      <ProjectDialog
        open={open}
        project={editing}
        onClose={() => {
          setEditing(null);
          setOpen(false);
        }}
        onSave={save}
        form={form}
        setForm={setForm}
      />
    </PageShell>
  );
}

function ProjectDialog({
  open,
  project,
  onClose,
  onSave,
  form,
  setForm,
}: {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
  form: any;
  setForm: (f: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm({ ...form, image_url: result.url });
      toast.success("Image uploadée");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? "Modifier le projet" : "Créer un nouveau projet"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          <FormField label="Titre *" htmlFor="title">
            <Input
              id="title"
              placeholder="Titre du projet"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              placeholder="Description du projet"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>

          <FormField label="Statut" htmlFor="status">
            <Input
              id="status"
              placeholder="active, completed, archived"
              value={form.status || ""}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </FormField>

          <FormField label="Image" htmlFor="image_url">
            <div className="space-y-2">
              {form.image_url && (
                <div className="relative group">
                  <img
                    src={form.image_url}
                    alt="Project"
                    className="w-full h-48 rounded-lg object-cover border border-slate-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setForm({ ...form, image_url: "" })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Upload en cours…" : "Télécharger une image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.currentTarget.files?.[0]) {
                    handleUploadImage(e.currentTarget.files[0]);
                  }
                }}
              />
              <Input
                placeholder="Ou URL directe de l'image"
                value={form.image_url || ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Publié">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, published: checked })
                }
              />
              <span className="text-sm">
                {form.published ? "Oui, publié" : "Non, brouillon"}
              </span>
            </div>
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            {project ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
