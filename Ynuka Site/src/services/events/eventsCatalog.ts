/**
 * Catalogue unifié site + Luma pour accueil, écosystème et page Events.
 */
import type { TFunction } from "i18next";
import type { CarouselEvent } from "@/components/UpcomingEventsCarousel";
import { stripHtml } from "@/lib/utils";
import {
  isEventPast,
  listEvents,
} from "@/services/events/eventsApi";
import {
  listLumaPast,
  listLumaUpcoming,
  type LumaCalendarEvent,
} from "@/services/events/lumaApi";
import { findLumaRecap } from "@/config/lumaRecaps";
import type { EventAgendaFilter, YnukaEvent } from "@/services/events/types";

export type UnifiedCarouselEvent = CarouselEvent & {
  /** ISO pour tri */
  sortDate: string;
  source: "site" | "luma";
};

export type MergedEventsResult = {
  items: UnifiedCarouselEvent[];
  siteFailed: boolean;
  lumaFailed: boolean;
};

function formatLabelKey(format: YnukaEvent["format"]): string | null {
  if (format === "in_person") return "events.formatInPerson";
  if (format === "online") return "events.formatOnline";
  if (format === "hybrid") return "events.formatHybrid";
  return null;
}

function localeTag(lang: string) {
  return lang.startsWith("fr") ? "fr-FR" : "en-US";
}

function formatDisplayDate(iso: string, lang: string, timeZone?: string | null) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeTag(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timeZone || undefined,
  });
}

function formatDisplayTime(iso: string, lang: string, timeZone?: string | null) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(localeTag(lang), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZone || undefined,
  });
}

function dedupeKey(title: string, sortDate: string) {
  const day = sortDate.slice(0, 10);
  return `${title.trim().toLowerCase()}|${day}`;
}

function isHappeningNow(startIso: string, endIso?: string | null, now = Date.now()): boolean {
  const start = new Date(startIso).getTime();
  if (Number.isNaN(start) || start > now) return false;
  if (endIso) {
    const end = new Date(endIso).getTime();
    if (!Number.isNaN(end)) return now <= end;
  }
  // Sans heure de fin : fenêtre de 3 h après le début
  return now - start < 3 * 60 * 60 * 1000;
}

function siteToCarousel(
  event: YnukaEvent,
  lang: string,
  t: TFunction
): UnifiedCarouselEvent {
  const isFr = lang.startsWith("fr");
  const past = isEventPast(event);
  const live = !past && isHappeningNow(event.date);
  const description = stripHtml(
    (isFr && event.descriptionFr ? event.descriptionFr : event.description) || ""
  );
  const formatKey = formatLabelKey(event.format);
  const sortDate = event.date;
  const realRecap = past ? event.recapUrl?.trim() || null : null;

  return {
    id: event.id,
    slug: event.slug,
    title: isFr && event.titleFr ? event.titleFr : event.title,
    date: formatDisplayDate(event.date, lang),
    type: event.type || "Meetup",
    location: event.location || "Goma",
    time: event.time || "",
    image: event.imageUrl || "",
    description,
    fullDescription: description,
    isPast: past,
    isLive: live,
    recapUrl: realRecap,
    youtubeUrl: past ? event.youtubeUrl : null,
    formatLabel: formatKey ? t(formatKey) : null,
    timezone: event.timezone,
    registrationUrl: past ? null : event.registrationUrl,
    viewUrl: past && !realRecap && event.slug ? `/events/${event.slug}` : null,
    sortDate,
    source: "site",
  };
}

function lumaToCarousel(
  event: LumaCalendarEvent,
  isPast: boolean,
  lang: string,
  t: TFunction
): UnifiedCarouselEvent {
  const online =
    event.locationType === "meet" ||
    event.locationType === "online" ||
    event.locationLabel.toLowerCase() === "online";
  const live = !isPast && isHappeningNow(event.startAt, event.endAt);
  const slug = event.url.replace(/^https?:\/\/(www\.)?luma\.com\//i, "").split(/[/?#]/)[0];
  const recap = findLumaRecap(event.id, slug || event.url);
  const realRecap = recap?.recapUrl?.trim() || null;
  const realYoutube = recap?.youtubeUrl?.trim() || null;

  return {
    id: `luma-${event.id}`,
    title: event.title,
    date: formatDisplayDate(event.startAt, lang, event.timezone),
    type: "Luma",
    location: event.locationLabel,
    time: formatDisplayTime(event.startAt, lang, event.timezone),
    image: event.coverUrl || "",
    description: t("events.ecosystemLumaCardDesc"),
    fullDescription: t("events.ecosystemLumaCardDesc"),
    isPast,
    isLive: live,
    recapUrl: isPast ? realRecap : null,
    youtubeUrl: isPast ? realYoutube : null,
    formatLabel: online ? t("events.formatOnline") : null,
    timezone: event.timezone,
    registrationUrl: isPast ? null : event.url,
    viewUrl: isPast && !realRecap && !realYoutube ? event.url : null,
    sortDate: event.startAt,
    source: "luma",
  };
}

function sortUnified(items: UnifiedCarouselEvent[]): UnifiedCarouselEvent[] {
  return [...items].sort((a, b) => {
    // LIVE d’abord
    if (!!a.isLive !== !!b.isLive) return a.isLive ? -1 : 1;
    const aPast = !!a.isPast;
    const bPast = !!b.isPast;
    if (aPast !== bPast) return aPast ? 1 : -1;
    const aTime = new Date(a.sortDate).getTime();
    const bTime = new Date(b.sortDate).getTime();
    if (aPast) return bTime - aTime;
    return aTime - bTime;
  });
}

function mergeUnique(lists: UnifiedCarouselEvent[][]): UnifiedCarouselEvent[] {
  const seen = new Set<string>();
  const out: UnifiedCarouselEvent[] = [];
  for (const list of lists) {
    for (const item of list) {
      const key = dedupeKey(item.title, item.sortDate);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/**
 * Charge site + Luma (à venir et passés) et renvoie une liste unifiée triée.
 */
export async function loadMergedCarouselEvents(opts: {
  lang: string;
  t: TFunction;
  siteLimit?: number;
  lumaFutureLimit?: number;
  lumaPastLimit?: number;
}): Promise<MergedEventsResult> {
  const {
    lang,
    t,
    siteLimit = 100,
    lumaFutureLimit = 50,
    lumaPastLimit = 50,
  } = opts;

  const [siteResult, lumaFutureResult, lumaPastResult] = await Promise.allSettled([
    listEvents(siteLimit),
    listLumaUpcoming(lumaFutureLimit),
    listLumaPast(lumaPastLimit),
  ]);

  const siteFailed = siteResult.status === "rejected";
  const lumaFailed =
    lumaFutureResult.status === "rejected" && lumaPastResult.status === "rejected";

  const siteItems =
    siteResult.status === "fulfilled"
      ? siteResult.value
          .filter((e) => e.id && e.title && e.date)
          .map((e) => siteToCarousel(e, lang, t))
      : [];

  const lumaFuture =
    lumaFutureResult.status === "fulfilled"
      ? lumaFutureResult.value.map((e) => lumaToCarousel(e, false, lang, t))
      : [];

  const lumaPast =
    lumaPastResult.status === "fulfilled"
      ? lumaPastResult.value.map((e) => lumaToCarousel(e, true, lang, t))
      : [];

  // Luma Goma Hub en premier (future + past) pour ne pas être écrasé par des events site / fake
  const items = sortUnified(mergeUnique([lumaFuture, lumaPast, siteItems]));

  return { items, siteFailed, lumaFailed };
}

/** Aperçu accueil / écosystème : LIVE, puis à venir, puis passés récents. */
export function pickRecentPreview(
  items: UnifiedCarouselEvent[],
  limit = 3
): UnifiedCarouselEvent[] {
  const live = items.filter((e) => e.isLive);
  const upcoming = items.filter((e) => !e.isPast && !e.isLive);
  const past = items.filter((e) => e.isPast);
  return [...live, ...upcoming, ...past].slice(0, limit);
}

/** Filtres agenda sur le catalogue unifié. */
export function filterUnifiedEvents(
  items: UnifiedCarouselEvent[],
  filter: EventAgendaFilter
): UnifiedCarouselEvent[] {
  return items.filter((e) => {
    const past = !!e.isPast;
    switch (filter) {
      case "All":
        return true;
      case "Upcoming":
        return !past;
      case "Past":
        return past;
      case "InPerson":
        return Boolean(
          e.formatLabel?.toLowerCase().includes("présentiel") ||
            e.formatLabel?.toLowerCase().includes("person") ||
            (!e.formatLabel && e.location.toLowerCase() !== "online")
        );
      case "Online":
        return Boolean(
          e.formatLabel?.toLowerCase().includes("ligne") ||
            e.formatLabel?.toLowerCase().includes("online") ||
            e.location.toLowerCase() === "online"
        );
      case "Workshop":
      case "Hackathon":
      case "Meetup":
        return e.type === filter || (filter === "Meetup" && e.type === "Luma");
      default:
        return true;
    }
  });
}

export function sortUnifiedForFilter(
  items: UnifiedCarouselEvent[],
  filter: EventAgendaFilter
): UnifiedCarouselEvent[] {
  const copy = [...items];
  if (filter === "Upcoming") {
    return copy.sort(
      (a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime()
    );
  }
  if (filter === "Past") {
    return copy.sort(
      (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );
  }
  return sortUnified(copy);
}
