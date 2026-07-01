import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as React from "react";
import { Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/dateUtils";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { toast } from "sonner";
import { phpApi } from "@/lib/php-api";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/events/registrations")({
  component: EventRegistrationsAdmin,
});

type Event = {
  id: string;
  title: string;
  title_fr: string | null;
  date: string;
  location: string;
};

type Registration = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
};

function EventRegistrationsAdmin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch registrations with optional event filter
      const searchParams = search;
      let finalSearch = searchParams;
      if (selectedEvent) {
        finalSearch = searchParams 
          ? `${searchParams} AND event_id = ${selectedEvent}`
          : `event_id = ${selectedEvent}`;
      }

      const res = await phpApi.list("event_registrations", {
        page,
        limit,
        search: finalSearch,
      });
      setRegistrations((res.rows ?? []) as any);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await phpApi.list("events", {
        page: 1,
        limit: 1000,
      });
      setEvents((res.rows ?? []) as any);
    } catch (e: any) {
      toast.error(e.message || "Failed to load events");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedEvent]);

  useEffect(() => {
    loadEvents();
  }, []);

  const exportToExcel = () => {
    if (!registrations.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Prepare data for export
    const data = registrations.map((reg) => {
      const event = events.find((e) => e.id === reg.event_id);
      return {
        ID: reg.id,
        Événement: event?.title || `Event ${reg.event_id}`,
        "Date événement": event?.date ? formatShortDate(event.date) : "",
        Email: reg.email,
        Nom: reg.name,
        Téléphone: reg.phone || "",
        "Date d'inscription": formatShortDate(reg.created_at),
      };
    });

    // Create workbook and add data
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscriptions");

    // Auto-fit columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const max = Math.max(
        key.length,
        Math.max(...data.map((row: any) => (row[key] || "").toString().length))
      );
      return Math.min(max + 2, maxWidth);
    });
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

    // Download file
    const filename = `inscriptions-evenements-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success("Fichier exporté avec succès");
  };

  const getEventTitle = (id: string) => {
    return events.find((e) => e.id === id)?.title || `Event ${id}`;
  };

  return (
    <PageShell>
      <PageHeader
        title="Inscriptions aux événements"
        description="Gérez les inscriptions des participants aux événements"
      />

      <PageToolbar>
        <PageSearch
          placeholder="Rechercher par email, nom..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les événements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les événements</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => load()}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>

        <Button onClick={exportToExcel} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en XLSX
        </Button>
      </PageToolbar>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Date événement</TableHead>
              <TableHead>Date d'inscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Aucune inscription trouvée
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => {
                const event = events.find((e) => e.id === reg.event_id);
                return (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.email}</TableCell>
                    <TableCell>{reg.name}</TableCell>
                    <TableCell>{reg.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getEventTitle(reg.event_id)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event?.date ? formatShortDate(event.date) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatShortDate(reg.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Affichage {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total || loading}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
