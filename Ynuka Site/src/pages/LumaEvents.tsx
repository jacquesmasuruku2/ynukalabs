import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { LUMA_EMBED_URL, LUMA_PUBLIC_PAGE_URL } from "@/config/luma";

function extractCalendarId(raw: string): string | null {
  const match = raw.match(/cal-[A-Za-z0-9]+/);
  return match ? match[0] : null;
}

/** Embed uniquement via ID `cal-…` (le slug /goma renvoie 404 côté API Luma). */
function toLumaEmbedUrl(raw: string): string {
  const fromId = extractCalendarId(raw);
  if (fromId) return `https://luma.com/embed/calendar/${fromId}/events`;
  try {
    const u = new URL(raw);
    if (u.pathname.includes("/embed/calendar/")) {
      const idInPath = extractCalendarId(u.pathname);
      if (idInPath) return `https://luma.com/embed/calendar/${idInPath}/events`;
    }
  } catch {
    /* ignore */
  }
  return LUMA_EMBED_URL;
}

function toLumaPublicPageUrl(raw: string | undefined): string {
  if (!raw?.trim()) return LUMA_PUBLIC_PAGE_URL;
  try {
    const u = new URL(raw.trim());
    if (u.pathname.includes("/manage/") || u.pathname.includes("/embed/")) {
      return LUMA_PUBLIC_PAGE_URL;
    }
    if (u.hostname.includes("lu.ma")) return `https://luma.com${u.pathname}`;
    return raw.trim();
  } catch {
    return LUMA_PUBLIC_PAGE_URL;
  }
}

const LumaEvents = () => {
  const { t } = useTranslation();
  const [iframeReady, setIframeReady] = useState(false);

  const envLuma = (import.meta.env.VITE_LUMA_EVENTS_URL as string | undefined)?.trim();
  const envCalId = (import.meta.env.VITE_LUMA_CALENDAR_ID as string | undefined)?.trim();

  const lumaPageUrl = useMemo(() => toLumaPublicPageUrl(envLuma), [envLuma]);

  const embedUrl = useMemo(() => {
    if (envCalId && /^cal-[A-Za-z0-9]+$/.test(envCalId)) {
      return `https://luma.com/embed/calendar/${envCalId}/events`;
    }
    if (envLuma) {
      const fromEnv = toLumaEmbedUrl(envLuma);
      if (extractCalendarId(fromEnv)) return fromEnv;
    }
    return LUMA_EMBED_URL;
  }, [envCalId, envLuma]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#f4f6f9] dark:bg-[#07111f]">
      <header className="shrink-0 border-b border-[#0f2847]/12 bg-[#0f2847] text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <Link
              to="/events#agenda"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/65 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("events.backToEvents")}
            </Link>
            <h1 className="mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl">
              {t("events.lumaPageTitle")}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm font-medium leading-snug text-white/75">
              {t("events.lumaInvite")}
            </p>
          </div>
          <a
            href={lumaPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 bg-[#ffb800] px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-opacity hover:opacity-90 sm:w-auto"
          >
            {t("events.lumaOpenExternal")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-3 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex flex-col items-center justify-center gap-2 border border-[#0f2847]/15 bg-white px-4 py-3 text-center sm:flex-row sm:gap-3 dark:border-slate-700 dark:bg-[#0c1a2e]">
          <p className="text-sm font-semibold text-[#0f2847] dark:text-white">
            {t("events.lumaEmptyHint")}
          </p>
          <a
            href={lumaPageUrl || LUMA_PUBLIC_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#0f2847] underline decoration-[#ffb800] decoration-2 underline-offset-4 transition-opacity hover:opacity-80 dark:text-[#ffb800]"
          >
            {t("events.lumaOpenExternal")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white shadow-[0_1px_0_rgba(15,40,71,0.06)]">
          {!iframeReady ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-white"
              aria-busy="true"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#0f2847]/15 border-t-[#ffb800]" />
                <p className="text-sm font-medium text-[#315795]">{t("events.lumaLoading")}</p>
              </div>
            </div>
          ) : null}
          <iframe
            title={t("events.lumaPageTitle")}
            src={embedUrl}
            className="block h-[min(82vh,960px)] w-full min-h-[640px] border-0 bg-white"
            loading="eager"
            allowFullScreen
            tabIndex={0}
            onLoad={() => setIframeReady(true)}
          />
        </div>
      </main>
    </div>
  );
};

export default LumaEvents;
