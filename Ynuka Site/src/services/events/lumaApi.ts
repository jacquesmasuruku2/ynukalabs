import { LUMA_CALENDAR_ID } from "@/config/luma";

export type LumaCalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  timezone: string | null;
  coverUrl: string | null;
  /** URL publique Luma */
  url: string;
  locationLabel: string;
  locationType: string | null;
};

type LumaApiEvent = {
  api_id?: string;
  name?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  cover_url?: string;
  url?: string;
  location_type?: string;
  geo_address_info?: { city?: string; full_address?: string } | null;
};

type LumaApiEntry = {
  event?: LumaApiEvent;
};

function mapLumaEntries(entries: LumaApiEntry[]): LumaCalendarEvent[] {
  return entries
    .map((entry) => {
      const e = entry.event;
      if (!e?.api_id || !e.name || !e.start_at) return null;
      const slug = e.url?.trim();
      const city = e.geo_address_info?.city || e.geo_address_info?.full_address;
      const locationLabel =
        city?.trim() ||
        (e.location_type === "meet" || e.location_type === "online" ? "Online" : "Luma");

      return {
        id: e.api_id,
        title: e.name,
        startAt: e.start_at,
        endAt: e.end_at ?? null,
        timezone: e.timezone ?? null,
        coverUrl: e.cover_url ?? null,
        url: slug ? `https://luma.com/${slug}` : `https://luma.com/event/${e.api_id}`,
        locationLabel,
        locationType: e.location_type ?? null,
      } satisfies LumaCalendarEvent;
    })
    .filter((e): e is LumaCalendarEvent => !!e);
}

async function fetchLumaPeriod(
  period: "future" | "past",
  limit: number
): Promise<LumaCalendarEvent[]> {
  const calId =
    (import.meta.env.VITE_LUMA_CALENDAR_ID as string | undefined)?.trim() ||
    LUMA_CALENDAR_ID;

  const qs = new URLSearchParams({
    calendar_api_id: calId,
    pagination_limit: String(Math.min(Math.max(limit, 1), 50)),
    period,
  });

  const res = await fetch(`/luma-api/calendar/get-items?${qs.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Luma calendar HTTP ${res.status}`);
  }

  const data = (await res.json()) as { entries?: LumaApiEntry[] };
  return mapLumaEntries(Array.isArray(data.entries) ? data.entries : []);
}

/** Événements Luma à venir. */
export async function listLumaUpcoming(limit = 5): Promise<LumaCalendarEvent[]> {
  return fetchLumaPeriod("future", limit);
}

/** Événements Luma passés (les plus récents d’abord côté API). */
export async function listLumaPast(limit = 10): Promise<LumaCalendarEvent[]> {
  return fetchLumaPeriod("past", limit);
}

/** Alias rétrocompatible. */
export type LumaUpcomingEvent = LumaCalendarEvent;
