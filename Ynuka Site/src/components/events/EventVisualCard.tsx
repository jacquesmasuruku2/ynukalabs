import { useMemo } from "react";
import { Calendar, MapPin, Zap } from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type EventVisualCardData = {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  type: string;
  location: string;
  time?: string | null;
  imageUrl?: string | null;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop";

type EventVisualCardProps = {
  event: EventVisualCardData;
  /** Carte compacte pour les grilles */
  compact?: boolean;
  /** Si défini, bouton CTA pointe vers une page de détail */
  primaryHref?: string;
  /** Si défini, bouton CTA déclenche une action (ex: ouvrir le modal d'inscription) */
  onPrimaryClick?: () => void;
  /** Si défini, texte du bouton CTA */
  primaryLabel?: string;
  /** Si défini et si l'événement est "past", bouton secondaire */
  secondaryHref?: string;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  /**
   * Thème du bouton secondaire (quand event passé).
   * - "teal" : look habituel
   * - "red" : look "événement passé"
   */
  secondaryTone?: "teal" | "red";
  /** Par défaut: carte CTA (dark) */
  showTime?: boolean;
  className?: string;
};

const EventVisualCard = ({
  event,
  compact = false,
  primaryHref,
  onPrimaryClick,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onSecondaryClick,
  secondaryTone = "teal",
  showTime = true,
  className,
}: EventVisualCardProps) => {
  const { t } = useTranslation();

  const descClamp = compact ? "line-clamp-2" : "line-clamp-3";
  const descTextClass = compact ? "text-[0.92rem]" : "text-sm";
  const infoClass = compact ? "mt-2 space-y-1.5 text-xs" : "mt-4 space-y-2 text-sm";
  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";
  const titleClass = compact
    ? "mt-1 font-display text-base font-bold leading-[1.15] tracking-tight text-white md:text-[0.98rem]"
    : "mt-2 font-display text-lg font-bold leading-[1.15] tracking-tight text-white md:text-[1.05rem]";

  const secondaryClass = compact
    ? secondaryTone === "red"
      ? "!px-3 !py-1.5 mt-3 w-full bg-transparent border-[#ff4d4d]/45 text-[#ffd6d6] hover:bg-[#ff4d4d]/10 hover:text-[#ffecec]"
      : "!px-3 !py-1.5 mt-3 w-full bg-transparent border-[#12B1A6]/35 text-[#bfdbfe] hover:bg-white/10 hover:text-white"
    : secondaryTone === "red"
      ? "!px-3 !py-1.5 mt-6 w-full bg-transparent border-[#ff4d4d]/40 text-[#ffd6d6] hover:bg-[#ff4d4d]/10 hover:text-[#ffecec]"
      : "mt-6 w-full bg-transparent border-[#12B1A6]/35 text-[#bfdbfe] hover:bg-white/10 hover:text-white";

  const img = useMemo(() => {
    const u = event.imageUrl?.trim();
    return u ? u : FALLBACK_IMG;
  }, [event.imageUrl]);

  const description = event.description?.trim() ? event.description : "";
  const showZap = showTime && !!event.time?.trim();

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4a7e] via-[#173a62] to-[#0f2847] text-white shadow-2xl ring-1 ring-[#3b82f6]/35",
        compact ? "min-h-[165px] p-4 md:min-h-[220px] md:p-4" : "min-h-[320px] p-5 md:min-h-[420px] md:p-6",
        className
      )}
    >
      <div className="flex h-full flex-col p-0">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8 shrink-0 object-contain md:h-9 md:w-9" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-white/70">
                Ynuka Labs
              </p>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#ffb800] text-[#1e3a8a]">
                {event.type}
              </span>
            </div>
          </div>

          <h3 className={titleClass}>
            {event.title}
          </h3>

          {description ? (
            <p className={cn("mt-0.5 leading-relaxed text-white/75 dark:text-white/75", descClamp, descTextClass)}>
              {description}
            </p>
          ) : null}

          <div className={infoClass}>
            <p className="flex items-center gap-2 text-[#ffb800]">
              <Calendar className={`${iconClass} shrink-0`} />
              {event.date}
            </p>
            <p className="flex items-center gap-2 text-[#bfdbfe]">
              <MapPin className={`${iconClass} shrink-0 text-[#ffb800]`} />
              <span className="line-clamp-1">{event.location}</span>
            </p>
            {showZap ? (
              <p className="flex items-center gap-2 text-[#ffb800]">
                <Zap className={`${iconClass} shrink-0`} />
                {event.time}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto overflow-hidden rounded-2xl pt-2">
          <div
            className={cn(
              "w-full overflow-hidden rounded-xl bg-[#0a3d44] ring-1 ring-[#12B1A6]/25",
              compact ? "aspect-[16/5.2] md:aspect-[16/5.8]" : "aspect-[16/7.5] md:aspect-[16/9]"
            )}
          >
            <img src={img} alt={event.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          {primaryHref ? (
            <ModernButton
              variant="primary"
              size="sm"
              href={primaryHref}
              className={cn(
                compact
                  ? "!px-3 !py-1.5 mt-3 w-full bg-[#ffb800] font-bold text-[#1e3a8a] hover:bg-[#e6a600]"
                  : "mt-6 w-full bg-[#ffb800] font-bold text-[#1e3a8a] hover:bg-[#e6a600]"
              )}
            >
              {primaryLabel ?? t("home.registerNow")}
            </ModernButton>
          ) : onPrimaryClick ? (
            <ModernButton
              variant="primary"
              size="sm"
              onClick={onPrimaryClick}
              className={cn(
                compact
                  ? "!px-3 !py-1.5 mt-3 w-full bg-[#ffb800] font-bold text-[#1e3a8a] hover:bg-[#e6a600]"
                  : "mt-6 w-full bg-[#ffb800] font-bold text-[#1e3a8a] hover:bg-[#e6a600]"
              )}
            >
              {primaryLabel ?? t("home.registerNow")}
            </ModernButton>
          ) : null}

          {!primaryHref && !onPrimaryClick && secondaryHref ? (
            <ModernButton
              variant="outline"
              size="sm"
              href={secondaryHref}
              className={cn(secondaryClass)}
            >
              {secondaryLabel ?? t("events.viewDetails")}
            </ModernButton>
          ) : null}

          {!primaryHref && !onPrimaryClick && onSecondaryClick ? (
            <ModernButton
              variant="outline"
              size="sm"
              onClick={onSecondaryClick}
              className={cn(secondaryClass)}
            >
              {secondaryLabel ?? t("events.viewDetails")}
            </ModernButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventVisualCard;

