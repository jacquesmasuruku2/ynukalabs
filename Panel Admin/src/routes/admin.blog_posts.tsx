import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCcw, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { phpApi } from "@/lib/php-api";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await phpApi.list("blog_posts", { 
        limit: 100,
        search: search ? `%${search}%` : undefined
      });
      setRows((res.rows ?? []) as any);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // Note: For now, just save the filename as cover_url
      // In production, you would upload to a server and get back a URL
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.name.split(".").pop()}`;
      setForm((f: any) => ({ ...f, cover_url: `/uploads/${filename}` }));
      toast.success("Image sélectionnée (upload non implémenté - à faire)");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      const payload: any = {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt: form.excerpt || null,
        content: form.content || null,
        cover_url: form.cover_url || null,
        published: !!form.published,
      };
      if (editing) {
        await phpApi.update("blog_posts", editing.id, payload);
        toast.success("Article mis à jour");
      } else {
        await phpApi.create("blog_posts", payload);
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
      await phpApi.delete("blog_posts", id);
      toast.success("Supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground">{rows.length} article(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Nouvel article
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Couverture</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Publié</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Chargement…</TableCell></TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Aucun article</TableCell></TableRow>
            )}
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" className="h-10 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-10 w-16 rounded bg-muted grid place-items-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[280px] truncate">{p.title}</TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">{p.slug}</TableCell>
                <TableCell>{p.published ? "Oui" : "Non"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'article" />
            </div>
            <div className="grid gap-1.5">
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="mon-article (laisser vide pour générer)" />
            </div>
            <div className="grid gap-1.5">
              <Label>Image de couverture</Label>
              <div className="flex items-start gap-3">
                {form.cover_url ? (
                  <img src={form.cover_url} alt="" className="h-24 w-32 object-cover rounded border" />
                ) : (
                  <div className="h-24 w-32 rounded border bg-muted grid place-items-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading ? "Téléversement…" : "Téléverser une image"}
                      </span>
                    </Button>
                  </label>
                  <Input
                    value={form.cover_url}
                    onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                    placeholder="ou collez une URL d'image"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Résumé</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Court résumé affiché en aperçu" />
            </div>
            <div className="grid gap-1.5">
              <Label>Contenu</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Contenu complet de l'article" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label>Publier l'article</Label>
                <p className="text-xs text-muted-foreground">Visible publiquement sur le site</p>
              </div>
              <Switch checked={!!form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={!form.title}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
