import { useEffect, useState } from "react";
import { Plus, RefreshCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
import { formatShortDate } from "@/lib/dateUtils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Event {
  id: string;
  title: string | null;
  title_fr: string | null;
  description: string | null;
  description_fr: string | null;
  date: string | null;
  location: string | null;
  type: string | null;
  image_url: string | null;
  upcoming: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const EVENT_TYPES = [
  { value: "Workshop", label: "Atelier Web3" },
  { value: "Seminar", label: "Hackathon" },
  { value: "Conference", label: "Conférence" },
  { value: "Autres", label: "Autres" },
];

export function EventForm() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const r = await api.list("events", page, limit, search);
      setEvents(r.rows || []);
      setTotal(r.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    try {
      await api.remove("events", id);
      toast.success("Événement supprimé avec succès");
      loadEvents();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Événements"
        description={`${total} événement${total > 1 ? "s" : ""}`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                loadEvents();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={loadEvents}
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
                <TableHead>Date</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upcoming</TableHead>
                <TableHead>Créé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="table-empty">
                    Aucun événement
                  </TableCell>
                </TableRow>
              )}
              {events.map((event) => {
                const typeLabel = EVENT_TYPES.find((t) => t.value === event.type)?.label || event.type;
                const eventDate = event.date ? formatShortDate(event.date) : "—";
                const createdDate = formatShortDate(event.created_at);
                return (
                  <TableRow key={event.id}>
                    <TableCell className="max-w-[150px] truncate font-semibold">
                      {event.title_fr || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {event.title || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{eventDate}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {event.location || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{typeLabel}</TableCell>
                    <TableCell className="text-center">
                      {event.upcoming ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Non
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{createdDate}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onEdit={() => setEditing(event)}
                        onDelete={() => onDelete(event.id)}
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

      <EventDialog
        open={creating || !!editing}
        event={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (data) => {
          try {
            if (editing) {
              await api.update("events", editing.id, data);
              toast.success("Événement mis à jour avec succès");
            } else {
              await api.create("events", data);
              toast.success("Événement créé avec succès");
            }
            setEditing(null);
            setCreating(false);
            loadEvents();
          } catch (e: any) {
            toast.error(e.message);
          }
        }}
      />
    </PageShell>
  );
}

function EventDialog({
  open,
  event,
  onClose,
  onSave,
}: {
  open: boolean;
  event: Event | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: event?.title ?? "",
        title_fr: event?.title_fr ?? "",
        description: event?.description ?? "",
        description_fr: event?.description_fr ?? "",
        date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        location: event?.location ?? "",
        type: event?.type ?? "Workshop",
        image_url: event?.image_url ?? "",
        upcoming: event?.upcoming ?? true,
      });
      setImagePreview(event?.image_url ?? "");
      setImageFile(null);
    }
  }, [open, event]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm({ ...form, image_url: "" });
  };

  const handleSave = async () => {
    if (!form.title_fr) {
      toast.error("Le titre en français est obligatoire");
      return;
    }
    if (!form.date) {
      toast.error("La date est obligatoire");
      return;
    }

    let imageUrl = form.image_url;

    // Upload image if a file is selected
    if (imageFile) {
      setUploading(true);
      try {
        const { api } = await import("@/lib/api");
        const uploadResult = await api.uploadImage(imageFile);
        imageUrl = uploadResult.url;
        setForm({ ...form, image_url: imageUrl });
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de l'upload de l'image");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSave({
      ...form,
      image_url: imageUrl,
      upcoming: form.upcoming ? 1 : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {event ? "Modifier l'événement" : "Créer un nouvel événement"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          {/* Titre Français */}
          <div className="form-field">
            <Label htmlFor="title_fr" className="font-semibold">
              Titre en français *
            </Label>
            <Input
              id="title_fr"
              placeholder="Ex: Atelier sur comment devenir un Evaluateur Communautaire"
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
              placeholder="Ex: Workshop on How to become et CR"
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
              placeholder="Décrivez l'événement en détail..."
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
              placeholder="Describe the event in English..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Two column grid for date and location */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date */}
            <div className="form-field">
              <Label htmlFor="date" className="font-semibold">
                Date et heure *
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            {/* Type */}
            <div className="form-field">
              <Label htmlFor="type" className="font-semibold">
                Type d'événement
              </Label>
              <Select
                value={form.type || "Workshop"}
                onValueChange={(value) => setForm({ ...form, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="form-field">
            <Label htmlFor="location" className="font-semibold">
              Localisation
            </Label>
            <Input
              id="location"
              placeholder="Ex: Bakanja, Ville de Goma"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="form-field">
            <Label htmlFor="image" className="font-semibold">
              Image de promotion
            </Label>
            {imagePreview ? (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Upcoming checkbox */}
          <div className="form-toggle-row">
            <div className="flex items-center gap-3">
              <Checkbox
                id="upcoming"
                checked={form.upcoming || false}
                onCheckedChange={(checked) =>
                  setForm({ ...form, upcoming: checked })
                }
              />
              <Label htmlFor="upcoming" className="font-semibold cursor-pointer">
                Événement à venir
              </Label>
            </div>
            <span className="text-xs text-muted-foreground">
              (Cochez si pas encore eu lieu)
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={uploading}>
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : event ? (
              "Mettre à jour"
            ) : (
              "Créer l'événement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
