import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import ModernButton from "@/components/ui/ModernButton";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

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
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop";

type CardVariant = "light" | "dark" | "image";

function EventSlideCard({
  event,
  variant,
  isInteractive = false,
  className,
  onRegister,
}: {
  event: CarouselEvent;
  variant: CardVariant;
  isInteractive?: boolean;
  className?: string;
  onRegister?: () => void;
}) {
  const { t } = useTranslation();
  const img = event.image?.trim() ? event.image : FALLBACK_IMG;
  const blurb =
    event.description?.trim() ||
    (event.fullDescription ? event.fullDescription.slice(0, 120) + "…" : "");

  const header = (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="" className="h-8 w-8 shrink-0 object-contain md:h-9 md:w-9" />
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-xs font-bold uppercase tracking-wider",
            variant === "dark" ? "text-white/70" : variant === "image" ? "text-white/80" : "text-[#2563eb]/85"
          )}
        >
          Ynuka Labs
        </p>
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold",
            variant === "dark" && "bg-[#ffb800] text-[#1e3a8a]",
            variant === "light" && "bg-[#ffb800]/90 text-[#1e3a8a]",
            variant === "image" && "bg-white/20 text-white backdrop-blur-sm"
          )}
        >
          {event.type}
        </span>
      </div>
    </div>
  );

  if (variant === "image") {
    return (
      <div
        className={cn(
          "relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl shadow-xl ring-1 ring-[#2563eb]/25 md:min-h-[420px] md:rounded-3xl",
          className
        )}
      >
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f2847]/92 via-[#1e4a7e]/52 to-[#2563eb]/22"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col p-5 md:p-6">
          {header}
          <h3 className="mt-5 font-display text-lg font-bold leading-tight tracking-tight text-white md:text-xl">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85">{blurb}</p>
          <div className="mt-auto space-y-2 pt-6 text-xs text-white/90">
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#ffb800]" />
              {event.date}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-white/70" />
              <span className="line-clamp-1">{event.location}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={cn(
          "flex min-h-[245px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4a7e] via-[#173a62] to-[#0f2847] p-4 text-white shadow-2xl ring-1 ring-[#3b82f6]/35 md:min-h-[330px] md:rounded-3xl md:p-4",
          className
        )}
      >
        {header}
        <h3 className="mt-2 font-display text-lg font-bold leading-[1.15] tracking-tight text-white md:text-[1.05rem]">
          {event.title}
        </h3>
        <p className="mt-0.5 line-clamp-3 text-sm leading-relaxed text-white/75 md:text-[0.925rem]">
          {blurb}
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <p className="flex items-center gap-2 text-[#ffb800]">
            <Calendar className="h-4 w-4 shrink-0" />
            {event.date}
          </p>
          <p className="flex items-center gap-2 text-[#bfdbfe]">
            <MapPin className="h-4 w-4 shrink-0 text-[#ffb800]" />
            {event.location}
          </p>
          <p className="flex items-center gap-2 text-[#ffb800]">
            <Zap className="h-4 w-4 shrink-0" />
            {event.time}
          </p>
        </div>

        <div className="mt-auto overflow-hidden rounded-2xl pt-2">
          <div className="aspect-[16/7.5] w-full overflow-hidden rounded-xl bg-[#0a3d44] ring-1 ring-[#12B1A6]/25">
            <img src={img} alt={event.title} className="h-full w-full object-cover" />
          </div>
        </div>

        {isInteractive && onRegister && (
          <ModernButton
            variant="primary"
            size="sm"
            className="mt-4 w-full bg-[#ffb800] font-bold text-[#1e3a8a] hover:bg-[#e6a600]"
            onClick={onRegister}
          >
            {t("home.registerNow")}
          </ModernButton>
        )}
      </div>
    );
  }

  /* light */
  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[#2563eb]/18 bg-[#e8eef9] p-5 shadow-lg dark:border-[#3b82f6]/35 dark:bg-[#1a3055]/65 dark:shadow-[#2563eb]/12 md:min-h-[420px] md:rounded-3xl md:p-6",
        className
      )}
    >
      {header}
      <h3 className="mt-5 font-display text-lg font-bold leading-tight tracking-tight text-[#1e3a8a] dark:text-[#93c5fc] md:text-xl">
        {event.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#315795] dark:text-[#7dd3fc]">{blurb}</p>
      <div className="mt-auto overflow-hidden rounded-2xl pt-5">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#d2ddf0] dark:bg-[#152f52]/85 dark:ring-1 dark:ring-[#3b82f6]/28">
          <img src={img} alt={event.title} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

const navBtnClass =
  "z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2563eb]/35 bg-white/95 text-[#1e40af] shadow-md backdrop-blur-sm transition hover:border-[#2563eb]/55 hover:bg-[#e8eef9] md:h-12 md:w-12 dark:border-[#3b82f6]/45 dark:bg-[#1a3055]/90 dark:text-[#93c5fc] dark:hover:bg-[#1e3a5f]/95";

type UpcomingEventsCarouselProps = {
  events: CarouselEvent[];
  onRegister: (event: CarouselEvent) => void;
};

const UpcomingEventsCarousel = ({ events, onRegister }: UpcomingEventsCarouselProps) => {
  const { t } = useTranslation();
  const n = events.length;
  const [activeIndex, setActiveIndex] = useState(0);

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
      <div className="mx-auto max-w-lg px-2">
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
      {/* Desktop : 3 volets + flèches */}
      <div className="hidden items-stretch justify-center gap-3 pb-2 md:flex lg:gap-5">
        <button type="button" aria-label={t("home.carouselPrevEvent")} className={cn(navBtnClass, "self-center")} onClick={goPrev}>
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} />
        </button>

        <div className="grid min-h-0 max-w-[1100px] flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch gap-3 lg:gap-5">
          <motion.div
            className="min-w-0 origin-right"
            initial={false}
            animate={{ scale: 0.9, opacity: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <EventSlideCard key={events[prev].id ?? `p-${prev}`} event={events[prev]} variant="light" />
          </motion.div>

          <motion.div
            className="relative z-10 min-w-0"
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id ?? activeIndex}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.35 }}
              >
                <EventSlideCard
                  event={current}
                  variant="dark"
                  isInteractive
                  onRegister={() => onRegister(current)}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="min-w-0 origin-left"
            initial={false}
            animate={{ scale: 0.9, opacity: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <EventSlideCard key={events[next].id ?? `n-${next}`} event={events[next]} variant="image" />
          </motion.div>
        </div>

        <button type="button" aria-label={t("home.carouselNextEvent")} className={cn(navBtnClass, "self-center")} onClick={goNext}>
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.25} />
        </button>
      </div>

      {/* Mobile : carte active + flèches */}
      <div className="flex flex-col items-stretch gap-4 md:hidden">
        <div className="flex items-center justify-center gap-3">
          <button type="button" aria-label={t("home.carouselPrevEvent")} className={navBtnClass} onClick={goPrev}>
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <button type="button" aria-label={t("home.carouselNextEvent")} className={navBtnClass} onClick={goNext}>
            <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id ?? activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
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
                "h-2 rounded-full transition-all",
                i === activeIndex
                  ? "w-6 bg-[#ffb800]"
                  : "w-2 bg-[#2563eb]/40 hover:bg-[#2563eb]/60 dark:bg-[#3b82f6]/30 dark:hover:bg-[#3b82f6]/50"
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
