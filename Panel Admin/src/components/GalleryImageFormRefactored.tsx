import { useEffect, useState, useRef } from "react";
import { Plus, RefreshCcw, Upload, X, Image as ImageIcon } from "lucide-react";
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
import { FormField } from "@/components/ui/form-field";
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
    <PageShell>
      <PageHeader
        title="Galerie d'images"
        description={`${total} image${total > 1 ? "s" : ""} · Gérez les visuels de vos événements`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                loadImages();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={loadImages}
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
                <TableHead>Événement</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Alt</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableRow key={image.id}>
                    <TableCell className="font-semibold text-slate-900">
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
                      <TableRowActions
                        onEdit={() => setEditing(image)}
                        onDelete={() => onDelete(image.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
    </PageShell>
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
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{image ? "Modifier l'image" : "Ajouter une image"}</DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          <FormField label="Événement" htmlFor="event_id">
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
          </FormField>

          <FormField label="Téléverser l'image" hint="Glissez-déposez ou cliquez (max 10 Mo)">
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-full h-48 rounded-lg object-cover border border-slate-200"
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
                  Supprimer
                </Button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/10"
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-900/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {uploading ? "Téléversement en cours…" : "Glissez une image ici"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ou cliquez pour parcourir</p>
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
          </FormField>

          <FormField label="Ou URL directe" htmlFor="image_url">
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
          </FormField>

          <FormField label="Texte alternatif (ALT)" htmlFor="alt" hint="Accessibilité et SEO">
            <Textarea
              id="alt"
              placeholder="Ex: Participants à l'atelier 2026"
              value={form.alt || ""}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
            />
          </FormField>

          <FormField label="Position" htmlFor="position" hint="Ordre d'affichage dans la galerie">
            <Input
              id="position"
              type="number"
              min="0"
              value={form.position ?? 0}
              onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={uploading}>
            {image ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
