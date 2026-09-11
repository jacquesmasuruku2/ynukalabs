import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EventsHomeStyleGrid from "@/components/events/EventsHomeStyleGrid";
import SpeakerApplicationForm from "@/components/events/SpeakerApplicationForm";
import EventProposalForm from "@/components/events/EventProposalForm";
import { cn } from "@/lib/utils";
import { LUMA_EMBED_URL, LUMA_PUBLIC_PAGE_URL } from "@/config/luma";
import { registerForEvent } from "@/services/events/eventsApi";
import {
  filterUnifiedEvents,
  loadMergedCarouselEvents,
  sortUnifiedForFilter,
  type UnifiedCarouselEvent,
} from "@/services/events/eventsCatalog";
import type { EventAgendaFilter } from "@/services/events/types";

type HubAction = "agenda" | "devenir-speaker" | "proposer-evenement" | "soutenir";

const Events = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EventAgendaFilter>("All");
  const [activeAction, setActiveAction] = useState<HubAction>("agenda");
  const [events, setEvents] = useState<UnifiedCarouselEvent[]>([]);
  const [lumaFailed, setLumaFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [registerEventId, setRegisterEventId] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const filters: { key: EventAgendaFilter; label: string }[] = [
    { key: "All", label: t("events.all") },
    { key: "Upcoming", label: t("events.upcoming") },
    { key: "Past", label: t("events.past") },
    { key: "InPerson", label: t("events.formatInPerson") },
    { key: "Online", label: t("events.formatOnline") },
    { key: "Workshop", label: t("events.workshop") },
    { key: "Hackathon", label: t("events.hackathon") },
    { key: "Meetup", label: t("events.meetup") },
  ];

  const hubActions: { id: HubAction; label: string }[] = [
    { id: "agenda", label: t("events.navAgenda") },
    { id: "devenir-speaker", label: t("events.navSpeaker") },
    { id: "proposer-evenement", label: t("events.navPropose") },
    { id: "soutenir", label: t("events.navSupport") },
  ];

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await loadMergedCarouselEvents({
        lang: i18n.language,
        t,
        lumaFutureLimit: 30,
        lumaPastLimit: 30,
      });
      setEvents(result.items);
      setLumaFailed(result.lumaFailed);
      setLoadError(result.siteFailed && result.items.length === 0);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
      setLoadError(true);
      setLumaFailed(true);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    if (hash === "soutenir") {
      navigate("/soutenir", { replace: true });
      return;
    }
    const allowed: HubAction[] = ["agenda", "devenir-speaker", "proposer-evenement"];
    if (!hash) {
      setActiveAction("agenda");
      return;
    }
    if (allowed.includes(hash as HubAction)) {
      setActiveAction(hash as HubAction);
    }
  }, [location.hash, navigate]);

  const goAction = (id: HubAction) => {
    if (id === "soutenir") {
      navigate("/soutenir");
      return;
    }
    setActiveAction(id);
    const url = id === "agenda" ? "/events#agenda" : `/events#${id}`;
    window.history.replaceState(null, "", url);
    if (id === "agenda") {
      document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filtered = useMemo(
    () => sortUnifiedForFilter(filterUnifiedEvents(events, activeFilter), activeFilter),
    [events, activeFilter]
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEventId || registerEventId.startsWith("luma-")) return;
    setSubmitting(true);
    try {
      await registerForEvent({
        event_id: registerEventId,
        full_name: regForm.full_name,
        email: regForm.email,
        phone: regForm.phone || null,
      });

      toast({ title: t("events.registerSuccess") });
      setRegisterEventId(null);
      setRegForm({ full_name: "", email: "", phone: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const status =
        msg.includes("409") || msg.toLowerCase().includes("duplicate") ? 409 : null;

      if (status === 409) {
        toast({ title: t("events.alreadyRegistered"), variant: "destructive" });
      } else {
        toast({ title: t("events.registerError"), variant: "destructive" });
      }
    }
    setSubmitting(false);
  };

  const showAgenda = activeAction === "agenda";

  return (
    <div className="min-h-[70vh] bg-[#f7f8fa] dark:bg-[#0a1628]">
      <header className="border-b border-[#0f2847]/15 bg-[#0f2847] text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-6 md:px-8">
          <Link
            to="/blockchains#events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-[#ffb800]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("events.navBackEcosystem")}
          </Link>
          <div className="pb-4 pt-3">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("events.pageTitle")}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm font-medium text-white/75 sm:text-base">
              {t("events.pageIntro")}
            </p>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0">
            {hubActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => goAction(action.id)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2.5 text-sm font-bold transition-colors sm:px-4",
                  activeAction === action.id
                    ? "border-[#ffb800] text-[#ffb800]"
                    : "border-transparent text-white/70 hover:text-white"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8 md:py-10">
        {showAgenda ? (
          <section id="agenda" className="scroll-mt-28">
            <aside className="mb-8 overflow-hidden bg-[#0f2847] text-white">
              <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 text-center md:text-left">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#ffb800]/90">
                    Luma
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight">
                    {t("events.lumaTitle")}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-white/75">
                    {t("events.lumaInvite")}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Link
                    to="/luma-events"
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#ffb800] px-5 py-2.5 text-sm font-bold text-[#0f2847] transition-opacity hover:opacity-90 sm:w-auto"
                  >
                    {t("events.lumaCta")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <a
                    href={LUMA_PUBLIC_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 border border-white/35 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
                  >
                    {t("events.lumaOpenExternal")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </div>
              </div>
            </aside>

            <div
              className="mb-6 flex flex-wrap justify-center gap-2"
              role="listbox"
              aria-label={t("events.filtersAria")}
            >
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="option"
                  aria-selected={activeFilter === f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    activeFilter === f.key
                      ? "bg-[#ffb800] text-[#0f2847]"
                      : "border border-slate-200 bg-white text-[#0f2847] hover:border-[#ffb800] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="border border-slate-200 bg-white py-16 text-center text-sm text-muted-foreground dark:border-slate-700 dark:bg-[#0c1a2e]">
                {t("admin.loading")}
              </div>
            ) : loadError ? (
              <div className="border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-[#0c1a2e]">
                <p className="font-medium text-[#0f2847] dark:text-white">{t("events.loadError")}</p>
                <p className="mt-2 text-sm text-[#315795] dark:text-slate-400">
                  {t("events.loadErrorHint")}
                </p>
                <Button
                  type="button"
                  variant="outline-glow"
                  className="mt-5"
                  onClick={() => void loadEvents()}
                >
                  {t("events.retry")}
                </Button>
              </div>
            ) : events.length === 0 ? (
              <div className="border border-slate-200 bg-white py-16 text-center text-sm text-muted-foreground dark:border-slate-700 dark:bg-[#0c1a2e]">
                {t("events.emptyAll")}
                {lumaFailed ? (
                  <div className="mx-auto mt-6 max-w-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <iframe
                      title={t("events.lumaPageTitle")}
                      src={LUMA_EMBED_URL}
                      className="block h-[420px] w-full border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-slate-200 bg-white py-16 text-center text-sm text-muted-foreground dark:border-slate-700 dark:bg-[#0c1a2e]">
                {t("events.emptyFilter")}
              </div>
            ) : (
              <EventsHomeStyleGrid
                key={activeFilter}
                events={filtered}
                visibleRows={2}
                onRegister={(event) => {
                  if (event.id && !event.id.startsWith("luma-") && !event.isPast) {
                    setRegisterEventId(event.id);
                  }
                }}
              />
            )}
          </section>
        ) : activeAction === "devenir-speaker" ? (
          <section id="devenir-speaker" className="scroll-mt-28">
            <SpeakerApplicationForm onBackToAgenda={() => goAction("agenda")} />
          </section>
        ) : (
          <section id="proposer-evenement" className="scroll-mt-28">
            <EventProposalForm onBackToAgenda={() => goAction("agenda")} />
          </section>
        )}
      </main>

      <Dialog open={!!registerEventId} onOpenChange={(open) => !open && setRegisterEventId(null)}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{t("events.registerTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <Input
              placeholder={t("events.fullName")}
              value={regForm.full_name}
              onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder={t("events.email")}
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              required
            />
            <Input
              placeholder={t("events.phone")}
              value={regForm.phone}
              onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
            />
            <Button type="submit" variant="glow" className="w-full" disabled={submitting}>
              {submitting ? t("admin.loading") : t("events.submitRegistration")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
