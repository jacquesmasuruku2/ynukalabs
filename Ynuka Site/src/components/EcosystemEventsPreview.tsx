import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, CalendarDays } from "lucide-react";
import EventsHomeStyleGrid from "@/components/events/EventsHomeStyleGrid";
import { cn } from "@/lib/utils";
import {
  loadMergedCarouselEvents,
  pickRecentPreview,
  type UnifiedCarouselEvent,
} from "@/services/events/eventsCatalog";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

/**
 * Aperçu Events écosystème (#events) :
 * jusqu’à 3 cartes (API site + Luma) — jamais d’iframe Luma scrollable.
 * (Le fallback iframe après merge cassait l’affichage en prod.)
 */
export const EcosystemEventsPreview = ({ showDivider = true }: { showDivider?: boolean }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<UnifiedCarouselEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadMergedCarouselEvents({
          lang: i18n.language,
          t,
          lumaFutureLimit: 50,
          lumaPastLimit: 50,
        });
        if (cancelled) return;
        setItems(result.items);
        setFailed(result.siteFailed && result.items.length === 0);
      } catch {
        if (!cancelled) {
          setItems([]);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n.language, t]);

  const preview = useMemo(() => pickRecentPreview(items, 3), [items]);
  const showingPastOnly = preview.length > 0 && preview.every((e) => e.isPast);

  return (
    <section
      id="events"
      className={cn(
        "scroll-mt-28 overflow-hidden bg-[#f4f6f9] py-14 md:py-20 dark:bg-[#07111f]",
        showDivider && "border-t border-[#0f2847]/10 dark:border-white/10"
      )}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div {...fadeUp} className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#0f2847]/55 dark:text-[#ffb800]/80">
            {t("events.ecosystemEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#0f2847] md:text-4xl dark:text-white">
            {t("events.title")}
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-[#315795] md:text-lg dark:text-slate-300">
            {t("events.ecosystemPreviewSubtitle")}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[300px] animate-pulse border border-[#0f2847]/10 bg-white dark:border-slate-700 dark:bg-[#0c1a2e]"
              />
            ))}
          </div>
        ) : failed && preview.length === 0 ? (
          <div className="border border-[#0f2847]/12 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-[#0c1a2e]">
            <CalendarDays className="mx-auto h-8 w-8 text-[#ffb800]" aria-hidden />
            <p className="mt-3 font-semibold text-[#0f2847] dark:text-white">
              {t("events.loadError")}
            </p>
            <p className="mt-1 text-sm text-[#315795] dark:text-slate-400">
              {t("events.ecosystemFallbackHint")}
            </p>
          </div>
        ) : preview.length === 0 ? (
          <div className="border border-[#0f2847]/12 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-[#0c1a2e]">
            <CalendarDays className="mx-auto h-8 w-8 text-[#ffb800]" aria-hidden />
            <p className="mt-3 font-semibold text-[#0f2847] dark:text-white">
              {t("events.ecosystemEmpty")}
            </p>
            <p className="mt-1 text-sm text-[#315795] dark:text-slate-400">
              {t("events.ecosystemEmptyHint")}
            </p>
          </div>
        ) : (
          <>
            {showingPastOnly ? (
              <p className="mb-3 text-center text-sm font-semibold text-[#315795] dark:text-slate-400">
                {t("events.ecosystemShowingPast")}
              </p>
            ) : null}
            <EventsHomeStyleGrid
              events={preview}
              onRegister={(event) => {
                if (event.id && !event.id.startsWith("luma-") && !event.isPast) {
                  navigate(`/events/${event.id}`);
                }
              }}
            />
          </>
        )}

        {!loading ? (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/events"
              className="inline-flex w-full items-center justify-center gap-2 bg-[#ffb800] px-5 py-3 text-sm font-bold text-[#0f2847] transition-opacity hover:opacity-90 sm:w-auto"
            >
              {t("home.viewAllEvents")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/events#proposer-evenement"
              className="inline-flex w-full items-center justify-center gap-2 border border-[#0f2847]/20 bg-white px-5 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:border-[#ffb800] dark:border-slate-600 dark:bg-transparent dark:text-white sm:w-auto"
            >
              {t("events.navPropose")}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
};
