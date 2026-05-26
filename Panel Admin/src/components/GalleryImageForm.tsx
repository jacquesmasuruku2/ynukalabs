import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCcw, Upload, X } from "lucide-react";
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

export function GalleryImageForm() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Galerie d'images
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} image{total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              loadImages();
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
          <Button variant="outline" size="icon" onClick={loadImages} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une image
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>URL de l'image</TableHead>
                <TableHead>Texte alternatif</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && images.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && images.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Aucune image dans la galerie
                  </TableCell>
                </TableRow>
              )}
              {images.map((image) => {
                const event = events.find((e) => e.id === image.event_id);
                return (
                  <TableRow key={image.id}>
                    <TableCell className="max-w-[200px] truncate">
                      {event?.title || image.event_id}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a
                        href={image.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {image.image_url.substring(0, 50)}...
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {image.alt || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>{image.position}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(image)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(image.id)}
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

      <GalleryImageDialog
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

function GalleryImageDialog({
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {image ? "Modifier l'image" : "Ajouter une nouvelle image"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Événement */}
          <div className="grid gap-2">
            <Label htmlFor="event_id" className="font-semibold">
              Événement *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Sélectionnez l'événement auquel cette image appartient
            </p>
            <Select
              value={form.event_id || ""}
              onValueChange={(value) => setForm({ ...form, event_id: value })}
            >
              <SelectTrigger id="event_id">
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
          <div className="grid gap-2">
            <Label className="font-semibold">Téléverser l'image *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Glissez-déposez une image ou cliquez pour sélectionner (max 10 MB)
            </p>

            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="max-h-48 rounded-lg object-cover w-full border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {uploading ? "Téléversement en cours..." : "Glissez une image ici"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ou cliquez pour parcourir
                </p>
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
          <div className="grid gap-2">
            <Label htmlFor="image_url" className="font-semibold">
              Ou entrer l'URL directement
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              L'adresse complète de l'image (https://...)
            </p>
            <Input
              id="image_url"
              type="url"
              placeholder="https://exemple.com/image.jpg"
              value={form.image_url || ""}
              onChange={(e) => {
                setForm({ ...form, image_url: e.target.value });
                setPreview(e.target.value);
              }}
            />
          </div>

          {/* Texte alternatif */}
          <div className="grid gap-2">
            <Label htmlFor="alt" className="font-semibold">
              Texte alternatif (ALT)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Description courte de l'image pour l'accessibilité. Important pour l'SEO et les lecteurs d'écran.
            </p>
            <Textarea
              id="alt"
              placeholder="Ex: Groupe de participants à l'atelier de 2026"
              value={form.alt || ""}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
              rows={3}
            />
          </div>

          {/* Position */}
          <div className="grid gap-2">
            <Label htmlFor="position" className="font-semibold">
              Position (ordre d'affichage)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Numéro définissant l'ordre d'affichage (0 = première image, 1 = deuxième, etc.)
            </p>
            <Input
              id="position"
              type="number"
              min="0"
              value={form.position ?? 0}
              onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={uploading}>
            {image ? "Mettre à jour" : "Ajouter l'image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
