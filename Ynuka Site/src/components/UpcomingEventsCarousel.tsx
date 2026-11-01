import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import ModernButton from "@/components/ui/ModernButton";
import { cn, stripHtml } from "@/lib/utils";

export type CarouselEvent = {
  id?: string;
  title: string;
  date: string;
  type: string;
  location: string;
  time: string;
  image: string;
  description: string;
  fullDescription: string;
  isPast?: boolean;
  /** En cours maintenant */
  isLive?: boolean;
  /** Vrai résumé publié par l’organisateur (pas un simple lien de secours) */
  recapUrl?: string | null;
  youtubeUrl?: string | null;
  /** Affiché seulement s’il est fourni (in_person / online / hybrid / libellé déjà traduit) */
  formatLabel?: string | null;
  timezone?: string | null;
  /** Lien d’inscription externe ; prioritaire sur le modal si présent */
  registrationUrl?: string | null;
  /** Consulter l’événement passé / Luma (sans inscription) */
  viewUrl?: string | null;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop";

type PastCta = {
  href: string;
  label: string;
  /** Résumé / vidéo = or ; simple consultation passé = bleu nuit */
  tone: "recap" | "past";
};

function getPastCta(event: CarouselEvent, t: (key: string) => string): PastCta | null {
  // Résumé réel partagé par l’organisateur
  if (event.recapUrl?.trim()) {
    return { href: event.recapUrl, label: t("events.readRecap"), tone: "recap" };
  }
  if (event.youtubeUrl?.trim()) {
    return { href: event.youtubeUrl, label: t("events.watchYoutube"), tone: "recap" };
  }
  // Pas de résumé : consultation seulement (pas une inscription)
  if (event.viewUrl?.trim()) {
    const isLuma =
      event.id?.startsWith("luma-") ||
      /luma\.com|lu\.ma/i.test(event.viewUrl);
    return {
      href: event.viewUrl,
      label: isLuma ? t("events.viewOnLuma") : t("events.viewPastEvent"),
      tone: "past",
    };
  }
  if (event.id?.startsWith("luma-")) {
    return null;
  }
  if (event.id && !event.id.startsWith("preview-")) {
    return {
      href: `/events/${event.id}`,
      label: t("events.viewPastEvent"),
      tone: "past",
    };
  }
  return null;
}

type CardVariant = "light" | "dark";

export function EventSlideCard({
  event,
  variant,
  isInteractive = false,
  className,
  onRegister,
  onSelect,
}: {
  event: CarouselEvent;
  variant?: CardVariant;
  isInteractive?: boolean;
  className?: string;
  onRegister?: () => void;
  onSelect?: () => void;
}) {
  const { t } = useTranslation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const img = event.image?.trim() ? event.image : FALLBACK_IMG;
  const blurb = stripHtml(
    event.description?.trim() ||
      (event.fullDescription ? event.fullDescription.slice(0, 140) : "")
  );
  const pastCta = event.isPast ? getPastCta(event, t) : null;
  const canRegister = !event.isPast;
  const externalRegisterHref = canRegister && event.registrationUrl?.trim() ? event.registrationUrl : null;
  const showRegister = canRegister && !externalRegisterHref && onRegister;

  const pastBtnClass =
    pastCta?.tone === "past"
      ? "w-full rounded-xl !px-3 !py-2 text-xs font-bold !bg-[#163a66] !text-white hover:!bg-[#1e4d87] !border !border-white/10 shadow-sm transition-colors"
      : "w-full rounded-xl !bg-[#ffb800] !px-3 !py-2 text-xs font-bold !text-[#0f2847] hover:!bg-[#e6a600] shadow-sm transition-colors";

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else if (onRegister && !event.isPast) {
      onRegister();
    } else if (pastCta?.href) {
      if (/^https?:\/\//i.test(pastCta.href)) {
        window.open(pastCta.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = pastCta.href;
      }
    } else if (externalRegisterHref) {
      window.open(externalRegisterHref, "_blank", "noopener,noreferrer");
    } else if (event.id && !event.id.startsWith("preview-")) {
      if (event.id.startsWith("luma-")) {
        const url = event.registrationUrl || event.viewUrl;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = `/events/${event.id}`;
      }
    }
  };

  const cta = (
    pastCta ? (
      <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
        {pastCta.tone === "past" ? (
          /^https?:\/\//i.test(pastCta.href) ? (
            <a
              href={pastCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center ${pastBtnClass}`}
            >
              {pastCta.label}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
          ) : (
            <Link to={pastCta.href} className={`inline-flex items-center justify-center ${pastBtnClass}`}>
              {pastCta.label}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          )
        ) : (
          <ModernButton
            variant="primary"
            size="sm"
            href={pastCta.href}
            className={pastBtnClass}
          >
            {pastCta.label}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </ModernButton>
        )}
      </div>
    ) : externalRegisterHref ? (
      <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
        <ModernButton
          variant="primary"
          size="sm"
          href={externalRegisterHref}
          className="w-full rounded-xl bg-[#ffb800] !px-3 !py-2 text-xs font-bold text-[#0f2847] hover:bg-[#e6a600] transition-colors shadow-sm"
        >
          {event.isLive ? t("events.joinLive") : t("home.registerNow")}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </ModernButton>
      </div>
    ) : showRegister ? (
      <div className="pt-2.5" onClick={(e) => e.stopPropagation()}>
        <ModernButton
          variant="primary"
          size="sm"
          className="w-full rounded-xl bg-[#ffb800] !px-3 !py-2 text-xs font-bold text-[#0f2847] hover:bg-[#e6a600] transition-colors shadow-sm"
          onClick={onRegister}
        >
          {event.isLive ? t("events.joinLive") : t("home.registerNow")}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </ModernButton>
      </div>
    ) : null
  );

  return (
    <article
      className={cn(
        "group relative flex h-full w-full flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1c31]/90 p-3.5 shadow-md backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Top Media & Content */}
      <div className="flex flex-col">
        {/* Banner with 16/10 aspect ratio matching reference */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-900">
          <img
            src={img}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

          {/* Category Pill on Top-Left */}
          <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm border border-white/10">
            {event.type || "Événement"}
          </span>

          {/* Bookmark Button on Top-Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked((prev) => !prev);
            }}
            aria-label="Sauvegarder l'événement"
            className={cn(
              "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer",
              isBookmarked
                ? "bg-[#ffb800] text-[#0f2847] scale-110"
                : "bg-black/40 text-white/80 hover:bg-white hover:text-[#0f2847] border border-white/10"
            )}
          >
            <Bookmark
              className="h-3.5 w-3.5"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="mt-3 font-display text-sm sm:text-base font-bold leading-snug text-white line-clamp-2 group-hover:text-[#ffb800] transition-colors">
          {event.title}
        </h3>

        {/* Location & Details Info */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ffb800]" />
          <span className="line-clamp-1 truncate">{event.location}</span>
        </div>
      </div>

      {/* Bottom Section: Footer Metadata + Optional CTA Button */}
      <div className="mt-3.5 flex flex-col">
        {/* Border-t footer with Date on Left & Status Badge on Right */}
        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-xs font-medium text-slate-400">
          <span className="truncate max-w-[140px] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#ffb800] shrink-0" />
            <span className="truncate">{event.date}</span>
          </span>

          {event.isLive ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-500 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              Live
            </span>
          ) : event.isPast ? (
            <span className="text-slate-400 font-semibold shrink-0">
              Terminé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-400 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Trending
            </span>
          )}
        </div>

        {/* Optional Action Button if interactive */}
        {cta}
      </div>
    </article>
  );
}

const navBtnClass =
  "z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0f2847] text-white transition hover:border-[#ffb800] hover:bg-[#ffb800] hover:text-[#0f2847] md:h-10 md:w-10 shadow-sm";

type UpcomingEventsCarouselProps = {
  events: CarouselEvent[];
  onRegister: (event: CarouselEvent) => void;
};

const UpcomingEventsCarousel = ({ events, onRegister }: UpcomingEventsCarouselProps) => {
  const { t } = useTranslation();
  const n = events.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [events]);

  const goPrev = useCallback(() => {
    if (n < 1) return;
    setActiveIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    if (n < 1) return;
    setActiveIndex((i) => (i + 1) % n);
  }, [n]);

  if (n === 0) return null;

  const prev = (activeIndex - 1 + n) % n;
  const next = (activeIndex + 1) % n;
  const current = events[activeIndex];

  if (n === 1) {
    return (
      <div className="mx-auto max-w-sm px-2">
        <EventSlideCard
          event={events[0]}
          variant="dark"
          isInteractive
          onRegister={() => onRegister(events[0])}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Desktop 3D Perspective Carousel */}
      <div className="relative hidden w-full pb-6 md:block">
        <div className="relative w-full h-[470px] flex items-center justify-center overflow-hidden">
          {events.map((event, i) => {
            let offset = i - activeIndex;
            if (offset > Math.floor(n / 2)) offset -= n;
            if (offset < -Math.floor(n / 2)) offset += n;
            
            const isCenter = offset === 0;
            
            return (
              <motion.div
                key={event.id ?? i}
                initial={false}
                animate={{
                  x: offset * 260 - 130,
                  scale: isCenter ? 1 : Math.max(0.75, 1 - Math.abs(offset) * 0.15),
                  opacity: Math.abs(offset) > 2.5 ? 0 : (isCenter ? 1 : Math.max(0.25, 1 - Math.abs(offset) * 0.35)),
                  zIndex: 10 - Math.abs(offset),
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute left-1/2 top-0 bottom-0 w-[360px] -ml-[180px] flex items-center justify-center cursor-pointer"
                onClick={() => {
                  if (!isCenter) setActiveIndex(i);
                }}
              >
                <div className={cn("w-full h-[92%] transition-all duration-300", isCenter ? "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]" : "shadow-md pointer-events-none")}>
                  <EventSlideCard
                    event={event}
                    variant={isCenter ? "dark" : "light"}
                    isInteractive={isCenter}
                    onRegister={isCenter && !event.isPast ? () => onRegister(event) : undefined}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-end gap-6 pr-8">
          <div className="relative h-[2px] w-48 bg-gray-200 dark:bg-white/10 overflow-hidden rounded-full">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-[#ffb800]"
              initial={false}
              animate={{ width: `${((activeIndex + 1) / n) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-baseline gap-4">
            {events.map((_, i) => (
              <span
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "cursor-pointer transition-all duration-300 select-none leading-none",
                  i === activeIndex
                    ? "text-[2.25rem] font-extrabold text-[#ffb800] dark:text-[#ffb800]"
                    : "text-base font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile view with nav buttons and swipe transition */}
      <div className="flex flex-col items-stretch gap-3 md:hidden">
        <div className="flex items-center justify-center gap-2">
          <button type="button" aria-label={t("home.carouselPrevEvent")} className={navBtnClass} onClick={goPrev}>
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button type="button" aria-label={t("home.carouselNextEvent")} className={navBtnClass} onClick={goNext}>
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id ?? activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <EventSlideCard
              event={current}
              variant="dark"
              isInteractive
              onRegister={() => onRegister(current)}
            />
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 pt-1">
          {events.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1} / ${n}`}
              aria-current={i === activeIndex}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex ? "w-6 bg-[#ffb800]" : "w-1.5 bg-[#0f2847]/25 hover:bg-[#0f2847]/45 dark:bg-white/30"
              )}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsCarousel;
