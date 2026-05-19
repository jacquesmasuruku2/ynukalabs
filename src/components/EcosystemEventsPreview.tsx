import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";
import EventVisualCard from "@/components/events/EventVisualCard";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

type EventData = {
  id: string;
  title: string;
  title_fr: string | null;
  description: string | null;
  description_fr: string | null;
  date: string;
  location: string;
  type: string;
  upcoming: boolean;
  time?: string | null;
  imageUrl?: string | null;
};

/** Aperçu événements sur la page Écosystème (#events) — défilement vers la page complète */
export const EcosystemEventsPreview = ({ showDivider = true }: { showDivider?: boolean }) => {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language.startsWith("fr");
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        type StrapiEventItem = {
          id: string | number;
          attributes?: {
            title?: string;
            title_fr?: string | null;
            description?: string | null;
            description_fr?: string | null;
            date?: string;
            location?: string;
            type?: string;
            upcoming?: boolean;
            time?: string | null;
            image?: unknown;
          };
        };

        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/events?sort=createdAt:desc&populate=image&pagination[pageSize]=100"
        );
        const items = res.data || [];
        const mapped: EventData[] = items
          .map((item) => {
            const it = item as StrapiEventItem;
            return {
              id: String(it.id),
              title: it.attributes?.title ?? "",
              title_fr: it.attributes?.title_fr ?? null,
              description: it.attributes?.description ?? null,
              description_fr: it.attributes?.description_fr ?? null,
              date: it.attributes?.date ?? "",
              location: it.attributes?.location ?? "",
              type: it.attributes?.type ?? "",
              upcoming: !!it.attributes?.upcoming,
              time: (it.attributes?.time as string | null | undefined) ?? null,
              imageUrl: mediaToUrl(it.attributes?.image) ?? null,
            };
          })
          .filter((e) => e.id && e.date && e.location && e.type);

        if (mapped.length) setEvents(mapped);
      } catch {
        // fallback hardcodé ci-dessous
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const isPast = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d < new Date();
    } catch {
      return false;
    }
  };

  const hardcoded: EventData[] = [
    {
      id: "1",
      title: t("events.event1Title"),
      title_fr: null,
      description: t("events.event1Desc"),
      description_fr: null,
      date: "2026-04-01",
      location: "Goma Innovation Center",
      type: "Workshop",
      upcoming: true,
      time: "14:00 - 18:00",
      imageUrl: "https://images.unsplash.com/photo-1639322533843-2b5a3b5b5b5?w=800&h=600&fit=crop",
    },
    {
      id: "2",
      title: t("events.event2Title"),
      title_fr: null,
      description: t("events.event2Desc"),
      description_fr: null,
      date: "2026-04-10",
      location: "Virunga Tech Park",
      type: "Hackathon",
      upcoming: true,
      time: "09:00 - 20:00",
      imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
    },
    {
      id: "3",
      title: t("events.event3Title"),
      title_fr: null,
      description: t("events.event3Desc"),
      description_fr: null,
      date: "2026-04-20",
      location: "Goma Hub HQ",
      type: "Meetup",
      upcoming: true,
      time: "17:00 - 19:00",
      imageUrl: "https://images.unsplash.com/photo-1611224923853-80b0237ed8b3?w=800&h=600&fit=crop",
    },
  ];

  const source = events.length > 0 ? events : hardcoded;
  const upcoming = source.filter((e) => e.upcoming && !isPast(e.date)).slice(0, 6);

  const getTitle = (e: EventData) => (isFr && e.title_fr ? e.title_fr : e.title);
  const getDesc = (e: EventData) => (isFr && e.description_fr ? e.description_fr : e.description);

  return (
    <section
      id="events"
      className={cn(
        "scroll-mt-24 bg-muted/30 py-16 md:py-20 dark:bg-muted/10",
        showDivider && "border-t border-border"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            <span className="gradient-text">{t("events.title")}</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("events.subtitle")}</p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">{t("admin.loading")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {upcoming.map((event, i) => (
              <motion.div
                key={event.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="h-full"
              >
                <EventVisualCard
                  compact
                  showTime={true}
                  event={{
                    id: event.id,
                    title: getTitle(event),
                    description: getDesc(event),
                    date: event.date,
                    type: event.type,
                    location: event.location,
                    time: event.time ?? null,
                    imageUrl: event.imageUrl ?? null,
                  }}
                  primaryHref={`/events/${event.id}`}
                  primaryLabel={t("home.registerNow")}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button variant="glow" size="lg" asChild>
            <Link to="/events">
              {t("home.viewAllEvents")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline-glow"
            size="lg"
            asChild
            className="border-[#2563eb]/50 text-[#1e40af] hover:border-[#2563eb] hover:bg-[#e8eef9] dark:border-[#3b82f6]/45 dark:text-[#93c5fc] dark:hover:bg-[#1a3055]/50"
          >
            <Link to="/luma-events">{t("events.onLuma")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
