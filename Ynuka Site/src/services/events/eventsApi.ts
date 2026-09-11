/**
 * Service Events — appels API centralisés + helpers agenda.
 * N’invente aucune donnée : champs absents → null.
 */
import { fetchFromApi, registerForEvent as registerForEventApi } from "@/lib/api";
import type {
  EventAgendaFilter,
  EventFormat,
  EventRegistrationPayload,
  YnukaEvent,
} from "./types";

function pickOptionalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return url ? url : null;
}

function extractYoutubeUrl(text: string): string | null {
  const match = text.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+[^\s"'<>]*|youtu\.be\/[\w-]+)/i
  );
  return match ? match[0] : null;
}

function normalizeFormat(value: unknown): EventFormat | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (v === "in_person" || v === "online" || v === "hybrid") return v;
  return null;
}

function mapEventRow(item: Record<string, unknown>): YnukaEvent {
  const description = (item.description as string) || null;
  const descriptionFr = (item.description_fr as string) || null;
  const youtubeFromFields = pickOptionalUrl(
    item.youtube_url || item.youtubeUrl || item.video_url || item.videoUrl
  );
  const youtubeFromText =
    youtubeFromFields ||
    extractYoutubeUrl(`${description || ""} ${descriptionFr || ""}`);

  const publishedRaw = item.published;
  let published: boolean | null = null;
  if (publishedRaw === true || publishedRaw === 1 || publishedRaw === "1") published = true;
  else if (publishedRaw === false || publishedRaw === 0 || publishedRaw === "0") published = false;

  return {
    id: String(item.id ?? ""),
    title: String(item.title || ""),
    titleFr: (item.title_fr as string) || null,
    description,
    descriptionFr,
    date: String(item.date || item.start_date || ""),
    location: String(item.location || ""),
    type: String(item.type || ""),
    upcoming: Boolean(item.upcoming),
    time: (item.time as string) || null,
    imageUrl: pickOptionalUrl(item.image_url || item.imageUrl || item.featured_image),
    capacity:
      item.capacity !== undefined && item.capacity !== null && item.capacity !== ""
        ? Number(item.capacity)
        : null,
    format: normalizeFormat(item.format),
    timezone: (item.timezone as string) || null,
    organizer: (item.organizer as string) || null,
    speakers: (item.speakers as string) || null,
    partners: (item.partners as string) || null,
    audience: (item.audience as string) || null,
    recapUrl: pickOptionalUrl(item.recap_url || item.recapUrl || item.summary_url),
    youtubeUrl: youtubeFromText,
    resources: (item.resources as string) || null,
    registrationUrl: pickOptionalUrl(item.registration_url || item.registrationUrl),
    published,
  };
}

function unwrapListRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== "object") return [];
  const r = result as { rows?: unknown[]; data?: unknown[] };
  const list = Array.isArray(r.rows) ? r.rows : Array.isArray(r.data) ? r.data : [];
  return list.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
}

/** Liste les événements (source existante `events`). */
export async function listEvents(limit = 100): Promise<YnukaEvent[]> {
  const result = await fetchFromApi("list", { resource: "events", limit });
  return unwrapListRows(result)
    .map(mapEventRow)
    .filter((e) => e.id && e.title);
}

/** Détail d’un événement. */
export async function getEvent(id: string): Promise<YnukaEvent | null> {
  const result = await fetchFromApi<{ row?: unknown }>("get", {
    resource: "events",
    id,
  });
  const row = result?.row;
  if (!row || typeof row !== "object") return null;
  const mapped = mapEventRow(row as Record<string, unknown>);
  return mapped.id ? mapped : null;
}

/** Inscription (contrat existant event_registrations). */
export async function registerForEvent(payload: EventRegistrationPayload) {
  return registerForEventApi({
    event_id: payload.event_id,
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone,
    organization: payload.organization,
    message: payload.message,
  });
}

export function isEventPast(event: YnukaEvent, now = new Date()): boolean {
  try {
    const d = new Date(event.date);
    if (!Number.isNaN(d.getTime()) && d < now) return true;
  } catch {
    /* ignore */
  }
  return !event.upcoming;
}

export function filterEvents(events: YnukaEvent[], filter: EventAgendaFilter): YnukaEvent[] {
  return events.filter((e) => {
    const past = isEventPast(e);
    switch (filter) {
      case "All":
        return true;
      case "Upcoming":
        return !past;
      case "Past":
        return past;
      case "InPerson":
        return e.format === "in_person";
      case "Online":
        return e.format === "online";
      case "Workshop":
      case "Hackathon":
      case "Meetup":
        return e.type === filter;
      default:
        return true;
    }
  });
}

/**
 * Tri :
 * - À venir : date croissante
 * - Passés : date décroissante
 * - Tous : à venir d’abord, puis passés récents
 */
export function sortEventsForAgenda(events: YnukaEvent[], filter: EventAgendaFilter): YnukaEvent[] {
  const copy = [...events];
  const byDateAsc = (a: YnukaEvent, b: YnukaEvent) =>
    new Date(a.date).getTime() - new Date(b.date).getTime();
  const byDateDesc = (a: YnukaEvent, b: YnukaEvent) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();

  if (filter === "Upcoming") return copy.sort(byDateAsc);
  if (filter === "Past") return copy.sort(byDateDesc);

  return copy.sort((a, b) => {
    const aPast = isEventPast(a);
    const bPast = isEventPast(b);
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? byDateDesc(a, b) : byDateAsc(a, b);
  });
}
