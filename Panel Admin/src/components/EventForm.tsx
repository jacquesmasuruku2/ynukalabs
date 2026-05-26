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
import { Checkbox } from "@/components/ui/checkbox";
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
  { value: "Workshop", label: "Atelier" },
  { value: "Seminar", label: "Séminaire" },
  { value: "Conference", label: "Conférence" },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Événements
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} événement{total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              loadEvents();
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
          <Button variant="outline" size="icon" onClick={loadEvents} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter un événement
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    Aucun événement
                  </TableCell>
                </TableRow>
              )}
              {events.map((event) => {
                const typeLabel = EVENT_TYPES.find((t) => t.value === event.type)?.label || event.type;
                const eventDate = event.date ? new Date(event.date).toLocaleDateString("fr-FR") : "—";
                const createdDate = new Date(event.created_at).toLocaleDateString("fr-FR");
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
                      <Button variant="ghost" size="sm" onClick={() => setEditing(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(event.id)}
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
    </div>
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
    }
  }, [open, event]);

  const handleSave = () => {
    if (!form.title_fr) {
      toast.error("Le titre en français est obligatoire");
      return;
    }
    if (!form.date) {
      toast.error("La date est obligatoire");
      return;
    }
    onSave({
      ...form,
      upcoming: form.upcoming ? 1 : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? "Modifier l'événement" : "Créer un nouvel événement"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Titre Français */}
          <div className="grid gap-2">
            <Label htmlFor="title_fr" className="font-semibold">
              Titre en français *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Le titre principal de l'événement
            </p>
            <Input
              id="title_fr"
              placeholder="Ex: Atelier de photographie créative"
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
              placeholder="Ex: Creative Photography Workshop"
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
              Détails complets sur l'événement
            </p>
            <Textarea
              id="description_fr"
              placeholder="Décrivez l'événement en détail..."
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
              placeholder="Describe the event in English..."
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label htmlFor="date" className="font-semibold">
              Date et heure *
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Quand l'événement aura-t-il lieu ?
            </p>
            <Input
              id="date"
              type="datetime-local"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location" className="font-semibold">
              Localisation
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Où se déroulera l'événement ?
            </p>
            <Input
              id="location"
              placeholder="Ex: Studio YnukaHub, Rue de la Paix, Dakar"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label htmlFor="type" className="font-semibold">
              Type d'événement
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Catégorie de l'événement
            </p>
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

          {/* Image URL */}
          <div className="grid gap-2">
            <Label htmlFor="image_url" className="font-semibold">
              Image
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              URL de l'image promotionnelle de l'événement
            </p>
            <Input
              id="image_url"
              type="url"
              placeholder="https://exemple.com/event-image.jpg"
              value={form.image_url || ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>

          {/* Upcoming */}
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
            <p className="text-sm text-muted-foreground">
              (Cochez si l'événement n'a pas encore eu lieu)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {event ? "Mettre à jour" : "Créer l'événement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
