import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  EventSlideCard,
  type CarouselEvent,
} from "@/components/UpcomingEventsCarousel";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

/** 2 lignes × 3 colonnes (desktop) */
const DEFAULT_ROWS = 2;
const COLS_DESKTOP = 3;

type EventsHomeStyleGridProps = {
  events: CarouselEvent[];
  onRegister: (event: CarouselEvent) => void;
  /** Si true, un clic hors CTA ouvre le détail */
  linkToDetail?: boolean;
  /**
   * Nombre de lignes visibles avant « Voir plus ».
   * `null` / `undefined` = tout afficher.
   * Par défaut sur la page Events : 2 lignes.
   */
  visibleRows?: number | null;
};

/**
 * Grille de cartes au style de l’accueil (EventSlideCard),
 * pour la page /events et tout listing hors carrousel.
 */
const EventsHomeStyleGrid = ({
  events,
  onRegister,
  linkToDetail = true,
  visibleRows = null,
}: EventsHomeStyleGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const pageSize =
    visibleRows != null && visibleRows > 0 ? visibleRows * COLS_DESKTOP : null;

  const visibleEvents = useMemo(() => {
    if (pageSize == null || expanded) return events;
    return events.slice(0, pageSize);
  }, [events, pageSize, expanded]);

  const canToggle = pageSize != null && events.length > pageSize;

  if (events.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3 md:gap-4">
        {visibleEvents.map((event, i) => (
          <motion.div
            key={event.id ?? `${event.title}-${i}`}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: Math.min(i, 8) * 0.06 }}
            className="flex h-full min-h-0 w-full"
          >
            <EventSlideCard
              event={event}
              variant={i % 3 === 1 ? "dark" : "light"}
              isInteractive
              onRegister={
                event.isPast || event.registrationUrl ? undefined : () => onRegister(event)
              }
            onSelect={
              linkToDetail && event.id
                ? () => {
                    if (event.id?.startsWith("luma-")) {
                      const url = event.registrationUrl || event.viewUrl || event.recapUrl;
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer");
                      }
                      return;
                    }
                    navigate(`/events/${event.id}`);
                  }
                : undefined
            }
              className="min-h-full w-full"
            />
          </motion.div>
        ))}
      </div>

      {canToggle ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 border border-[#0f2847]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:border-[#ffb800] dark:border-slate-600 dark:bg-transparent dark:text-white"
          >
            {expanded ? t("events.showLess") : t("events.showMore")}
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default EventsHomeStyleGrid;

export { DEFAULT_ROWS as EVENTS_GRID_DEFAULT_ROWS };
