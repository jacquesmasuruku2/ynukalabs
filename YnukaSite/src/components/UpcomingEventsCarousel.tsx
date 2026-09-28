import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ModernButton from "@/components/ui/ModernButton";
import { cn, stripHtml } from "@/lib/utils";

export type CarouselEvent = {
  id?: string;
  slug?: string;
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
  /** Résumé / vidéo = or ; simple consultation passé = rouge */
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
      href: `/events/${event.slug || event.id}`,
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
  variant: CardVariant;
  isInteractive?: boolean;
  className?: string;
  onRegister?: () => void;
  onSelect?: () => void;
}) {
  const { t } = useTranslation();
  const img = event.image?.trim() ? event.image : FALLBACK_IMG;
  const blurb = stripHtml(
    event.description?.trim() ||
      (event.fullDescription ? event.fullDescription.slice(0, 140) : "")
  );
  const isDark = variant === "dark";
  const pastCta = event.isPast ? getPastCta(event, t) : null;
  const canRegister = !event.isPast;
  const externalRegisterHref = canRegister && event.registrationUrl?.trim() ? event.registrationUrl : null;
  const showRegister = canRegister && !externalRegisterHref && onRegister;

  const pastBtnClass =
    pastCta?.tone === "past"
      ? // Charte Ynuka : navy + or (pas de rouge hors charte)
        "w-full !rounded-none !px-3 !py-2 text-[0.8rem] font-bold !bg-[#0f2847] !text-white hover:!bg-[#163a66] !border !border-[#ffb800] shadow-none"
      : "w-full !rounded-none !bg-[#ffb800] !px-3 !py-2 text-[0.8rem] font-bold !text-[#0f2847] hover:!bg-[#e6a600] shadow-none";

  const cta = (
    pastCta ? (
      <div className="mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
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
      <div className="mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
        <ModernButton
          variant="primary"
          size="sm"
          href={externalRegisterHref}
          className="w-full !rounded-none bg-[#ffb800] !px-3 !py-2 text-[0.8rem] font-bold text-[#0f2847] hover:bg-[#e6a600]"
        >
          {event.isLive ? t("events.joinLive") : t("home.registerNow")}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </ModernButton>
      </div>
    ) : showRegister ? (
      <div className="mt-auto pt-3" onClick={(e) => e.stopPropagation()}>
        <ModernButton
          variant="primary"
          size="sm"
          className="w-full !rounded-none bg-[#ffb800] !px-3 !py-2 text-[0.8rem] font-bold text-[#0f2847] hover:bg-[#e6a600]"
          onClick={onRegister}
        >
          {event.isLive ? t("events.joinLive") : t("home.registerNow")}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </ModernButton>
      </div>
    ) : (
      <div className="mt-auto min-h-[42px] pt-3" aria-hidden />
    )
  );

  const card = (
    <article
      className={cn(
        "flex h-full min-h-[360px] flex-col overflow-hidden rounded-card border transition-colors md:min-h-[380px]",
        isDark
          ? "border-[#ffb800]/45 bg-[#0f2847] text-white"
          : "border-black/[0.08] bg-white text-[#0f2847] dark:border-[#3b82f6]/30 dark:bg-[#152a48] dark:text-[#dbeafe]",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={onSelect}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#152a48] sm:aspect-[16/9]">
        <img
          src={img}
          alt=""
          className="h-full w-full object-cover object-center"
          aria-hidden
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            isDark ? "bg-gradient-to-t from-[#0f2847]/50 via-transparent to-[#0f2847]/10" : "bg-gradient-to-t from-black/20 via-transparent to-transparent"
          )}
          aria-hidden
        />
        <span
          className={cn(
            "typo-meta absolute left-0 top-0 px-2.5 py-1",
            isDark ? "bg-[#ffb800] text-[#0f2847]" : "bg-[#0f2847] text-white"
          )}
        >
          {event.type}
        </span>
        {event.isLive ? (
          <span className="typo-meta absolute right-0 top-0 bg-[#ffb800] px-2.5 py-1 font-extrabold tracking-wide text-[#0f2847]">
            {t("events.liveLabel")}
          </span>
        ) : event.isPast ? (
          <span
            className={cn(
              "typo-meta absolute right-0 top-0 px-2.5 py-1",
              isDark ? "bg-white text-[#0f2847]" : "bg-[#0f2847] text-white"
            )}
          >
            {t("events.pastLabel")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-3 md:px-4 md:py-3.5">
        <h3
          className={cn(
            "line-clamp-2 min-h-[2.4rem] text-[0.95rem] font-bold leading-snug tracking-tight md:text-base",
            isDark ? "text-white" : "text-[#0f2847] dark:text-[#93c5fc]"
          )}
        >
          {event.title}
        </h3>
        <p
          className={cn(
            "mt-1.5 line-clamp-2 min-h-[2.5rem] text-[0.8rem] leading-relaxed",
            isDark ? "text-white/75" : "text-[#315795] dark:text-[#93c5fc]/80"
          )}
        >
          {blurb || "\u00a0"}
        </p>

        <div
          className={cn(
            "space-y-1 pt-3 text-[0.72rem]",
            isDark ? "text-white/85" : "text-[#315795] dark:text-[#93c5fc]/85"
          )}
        >
          <p className="flex items-center gap-1.5">
            <Calendar
              className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-[#ffb800]" : "text-[#0f2847] dark:text-[#ffb800]")}
            />
            <span className="line-clamp-1">
              {event.date}
              {event.time ? ` · ${event.time}` : ""}
              {event.timezone ? ` · ${event.timezone}` : ""}
            </span>
          </p>
          {event.formatLabel ? (
            <p className="line-clamp-1 pl-5 text-[0.7rem] opacity-90">{event.formatLabel}</p>
          ) : null}
          <p className="flex items-center gap-1.5">
            <MapPin
              className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-[#ffb800]" : "text-[#0f2847] dark:text-[#ffb800]")}
            />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        </div>

        {cta}
      </div>
    </article>
  );

  return card;
}

const navBtnClass =
  "z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-black/15 bg-white text-[#0f2847] transition hover:border-[#ffb800] hover:bg-[#ffb800] md:h-10 md:w-10 dark:border-[#3b82f6]/45 dark:bg-[#152a48] dark:text-[#93c5fc] dark:hover:border-[#ffb800] dark:hover:bg-[#ffb800] dark:hover:text-[#0f2847]";

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
      <div className="relative hidden w-full pb-2 md:block">
        <div className="grid min-h-[320px] w-full min-w-0 grid-cols-3 grid-rows-1 items-stretch gap-3 lg:gap-4">
          <div className="flex h-full min-h-0 min-w-0 self-stretch opacity-90 transition-opacity hover:opacity-100">
            <EventSlideCard
              key={events[prev].id ?? `p-${prev}`}
              event={events[prev]}
              variant="light"
              onSelect={goPrev}
              onRegister={events[prev].isPast ? undefined : () => onRegister(events[prev])}
              className="min-h-full w-full"
            />
          </div>

          <div className="relative z-10 flex h-full min-h-0 min-w-0 self-stretch">
            <div className="flex h-full w-full">
              <EventSlideCard
                event={current}
                variant="dark"
                isInteractive
                onRegister={() => onRegister(current)}
                className="min-h-full w-full"
              />
            </div>
          </div>

          <div className="flex h-full min-h-0 min-w-0 self-stretch opacity-90 transition-opacity hover:opacity-100">
            <EventSlideCard
              key={events[next].id ?? `n-${next}`}
              event={events[next]}
              variant="light"
              onSelect={goNext}
              onRegister={events[next].isPast ? undefined : () => onRegister(events[next])}
              className="min-h-full w-full"
            />
          </div>
        </div>

        <button
          type="button"
          aria-label={t("home.carouselPrevEvent")}
          className={cn(navBtnClass, "absolute left-2 top-1/2 -translate-y-1/2 shadow-sm")}
          onClick={goPrev}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label={t("home.carouselNextEvent")}
          className={cn(navBtnClass, "absolute right-2 top-1/2 -translate-y-1/2 shadow-sm")}
          onClick={goNext}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

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
                "h-1.5 rounded-none transition-all",
                i === activeIndex ? "w-6 bg-[#ffb800]" : "w-1.5 bg-[#0f2847]/25 hover:bg-[#0f2847]/45 dark:bg-[#3b82f6]/30"
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
