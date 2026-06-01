import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import * as React from "react";
import { Plus, RefreshCcw, Upload, Image as ImageIcon } from "lucide-react";
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

export const Route = createFileRoute("/admin/blog_posts")({
  component: BlogPostsAdmin,
});

type Post = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  published: boolean;
  author_id: string | null;
  created_at: string;
};

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_url: "",
  published: false,
};

function BlogPostsAdmin() {
  const [rows, setRows] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.list("blog_posts", page, limit, search);
      setRows((res.rows ?? []) as any);
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

  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title ?? "",
      slug: p.slug ?? "",
      excerpt: p.excerpt ?? "",
      content: p.content ?? "",
      cover_url: p.cover_url ?? "",
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
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt: form.excerpt || null,
        content: form.content || null,
        cover_url: form.cover_url || null,
        published: form.published ? 1 : 0,
      };

      if (editing) {
        await api.update("blog_posts", editing.id, payload);
        toast.success("Article mis à jour");
      } else {
        await api.create("blog_posts", payload);
        toast.success("Article créé");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await api.remove("blog_posts", id);
      toast.success("Article supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Articles de Blog"
        description={`${total} article${total > 1 ? "s" : ""}`}
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
                <TableHead>Slug</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Aucun article
                  </TableCell>
                </TableRow>
              )}
              {rows.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-[200px] truncate font-semibold">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.slug}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(post.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(post)}
                      onDelete={() => remove(post.id)}
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

      <BlogPostDialog
        open={open}
        post={editing}
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

function BlogPostDialog({
  open,
  post,
  onClose,
  onSave,
  form,
  setForm,
}: {
  open: boolean;
  post: Post | null;
  onClose: () => void;
  onSave: () => void;
  form: any;
  setForm: (f: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm({ ...form, cover_url: result.url });
      toast.success("Image uploadée");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-full sm:max-w-3xl overflow-y-auto dark:bg-slate-900">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-xl font-bold dark:text-white">
            {post ? "Modifier l'article" : "Créer un nouvel article"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack mt-6">
          <FormField label="Titre *" htmlFor="title">
            <Input
              id="title"
              placeholder="Titre de l'article"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug">
            <Input
              id="slug"
              placeholder="url-amical (auto-généré si vide)"
              value={form.slug || ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </FormField>

          <FormField label="Extrait" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              placeholder="Résumé court de l'article"
              value={form.excerpt || ""}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
            />
          </FormField>

          <FormField label="Contenu" htmlFor="content">
            <Textarea
              id="content"
              placeholder="Contenu complet de l'article"
              value={form.content || ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={6}
            />
          </FormField>

          <FormField label="Image de couverture" htmlFor="cover_url">
            <div className="space-y-3">
              {form.cover_url && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={form.cover_url}
                    alt="Cover"
                    className="max-h-48 w-full object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setForm({ ...form, cover_url: "" })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
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
              <p className="text-xs text-muted-foreground">
                Ou entrer une URL directement
              </p>
              <Input
                placeholder="URL de l'image (optionnel)"
                value={form.cover_url || ""}
                onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Publié" htmlFor="published">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, published: checked })
                }
              />
              <span className="text-sm">
                {form.published ? "Publié" : "Brouillon"}
              </span>
            </div>
          </FormField>
        </div>

        <DialogFooter className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave} className="min-w-[120px]">
            {post ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
