import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCcw, Upload, X, Image as ImageIcon } from "lucide-react";
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

interface GalleryImage {
  id: string;
  event_id: string;
  alt: string | null;
  image_url: string;
  position: number;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  [key: string]: any;
}

export function GalleryImageFormRefactored() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [creating, setCreating] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      const r = await api.list("gallery_images", page, limit, search);
      setImages(r.rows || []);
      setTotal(r.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const r = await api.list("events", 1, 1000);
      setEvents(r.rows || []);
    } catch (e: any) {
      toast.error("Erreur lors du chargement des événements");
    }
  };

  useEffect(() => {
    loadImages();
    loadEvents();
  }, [page]);

  const onDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;
    try {
      await api.remove("gallery_images", id);
      toast.success("Image supprimée avec succès");
      loadImages();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec titre et actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Galerie d'images
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez les images de vos événements
            </p>
          </div>
        </div>

        {/* Compteur */}
        <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-sm font-semibold text-primary">
            {total} image{total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Recherche */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadImages();
          }}
          className="flex-1 min-w-64"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une image…"
              className="pl-10 h-10 rounded-full bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </form>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadImages}
            disabled={loading}
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreating(true)}
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium h-10 px-6"
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter une image
          </Button>
        </div>
      </div>

      {/* Tableau des images */}
      <Card className="overflow-hidden border-0 shadow-sm rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-primary/10 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Événement</TableHead>
                <TableHead className="font-semibold text-foreground">Image</TableHead>
                <TableHead className="font-semibold text-foreground">Alt</TableHead>
                <TableHead className="font-semibold text-foreground">Position</TableHead>
                <TableHead className="font-semibold text-foreground">Date</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && images.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCcw className="h-6 w-6 animate-spin opacity-50" />
                      Chargement…
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && images.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground font-medium">Aucune image dans la galerie</p>
                      <p className="text-xs text-muted-foreground">Cliquez sur "Ajouter une image" pour commencer</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {images.map((image) => {
                const event = events.find((e) => e.id === image.event_id);
                return (
                  <TableRow key={image.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                    <TableCell className="font-medium text-foreground">
                      {event?.title || image.event_id}
                    </TableCell>
                    <TableCell>
                      <a
                        href={image.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        Voir
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                      {image.alt || "—"}
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-primary">{image.position}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(image)}
                          className="rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(image.id)}
                          className="rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-primary/10 bg-primary/5">
            <span className="text-sm font-medium text-foreground">
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg hover:bg-primary/10 hover:text-primary"
              >
                Précédent
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg hover:bg-primary/10 hover:text-primary"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog d'ajout/modification */}
      <GalleryImageDialogRefactored
        open={creating || !!editing}
        image={editing}
        events={events}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (data) => {
          try {
            if (editing) {
              await api.update("gallery_images", editing.id, data);
              toast.success("Image mise à jour avec succès");
            } else {
              await api.create("gallery_images", data);
              toast.success("Image ajoutée avec succès");
            }
            setEditing(null);
            setCreating(false);
            loadImages();
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </div>
  );
}

function GalleryImageDialogRefactored({
  open,
  image,
  events,
  onClose,
  onSave,
}: {
  open: boolean;
  image: GalleryImage | null;
  events: Event[];
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({
        event_id: image?.event_id ?? "",
        image_url: image?.image_url ?? "",
        alt: image?.alt ?? "",
        position: image?.position ?? 0,
      });
      setPreview(image?.image_url ?? null);
    }
  }, [open, image]);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 MB");
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm({ ...form, image_url: result.url });
      setPreview(result.url);
      toast.success("Image téléversée avec succès");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du téléversement");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleUploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleUploadFile(files[0]);
    }
  };

  const handleSave = () => {
    if (!form.event_id) {
      toast.error("Veuillez sélectionner un événement");
      return;
    }
    if (!form.image_url) {
      toast.error("Veuillez téléverser une image ou entrer une URL");
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {image ? "Modifier l'image" : "Ajouter une nouvelle image"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {/* Événement */}
          <div className="grid gap-3">
            <Label htmlFor="event_id" className="font-bold text-foreground">
              Événement *
            </Label>
            <Select
              value={form.event_id || ""}
              onValueChange={(value) => setForm({ ...form, event_id: value })}
            >
              <SelectTrigger
                id="event_id"
                className="rounded-full h-11 bg-muted/40 border-0 focus:ring-2 focus:ring-primary"
              >
                <SelectValue placeholder="Choisir un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title || event.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload d'image */}
          <div className="grid gap-3">
            <Label className="font-bold text-foreground">Téléverser l'image *</Label>
            <p className="text-xs text-muted-foreground">
              Glissez-déposez une image ou cliquez pour sélectionner (max 10 MB)
            </p>

            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="max-h-56 rounded-2xl object-cover w-full border-2 border-primary/20"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  onClick={() => {
                    setPreview(null);
                    setForm({ ...form, image_url: "" });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-primary/60" />
                <p className="text-sm font-semibold text-foreground">
                  {uploading ? "Téléversement en cours…" : "Glissez une image ici"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Ou URL manuelle */}
          <div className="grid gap-3">
            <Label htmlFor="image_url" className="font-bold text-foreground">
              Ou entrer l'URL directement
            </Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={form.image_url || ""}
              onChange={(e) => {
                setForm({ ...form, image_url: e.target.value });
                setPreview(e.target.value);
              }}
              className="rounded-full h-11 bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Texte alternatif */}
          <div className="grid gap-3">
            <Label htmlFor="alt" className="font-bold text-foreground">
              Texte alternatif (ALT)
            </Label>
            <p className="text-xs text-muted-foreground">
              Description courte pour l'accessibilité et l'SEO
            </p>
            <Textarea
              id="alt"
              placeholder="Ex: Groupe de participants à l'atelier de 2026"
              value={form.alt || ""}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
              rows={3}
              className="rounded-2xl bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>

          {/* Position */}
          <div className="grid gap-3">
            <Label htmlFor="position" className="font-bold text-foreground">
              Position (ordre d'affichage)
            </Label>
            <Input
              id="position"
              type="number"
              min="0"
              value={form.position ?? 0}
              onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
              className="rounded-full h-11 bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={uploading}
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {image ? "Mettre à jour" : "Ajouter l'image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
