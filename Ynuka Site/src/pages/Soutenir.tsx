import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, CalendarDays, GraduationCap, HandCoins, Users } from "lucide-react";
import DonatePanel from "@/components/donate/DonatePanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchProjects } from "@/lib/api";
import { isEventPast, listEvents } from "@/services/events/eventsApi";
import type { YnukaEvent } from "@/services/events/types";
import type { SupportDestinationId } from "@/services/donations/types";
import { cn } from "@/lib/utils";

/** Destinations visibles (Éducation regroupe Onboarding / Events / Community Call). */
const DESTINATIONS: SupportDestinationId[] = [
  "general",
  "education",
  "digital_projects",
  "environment",
  "charitable_actions",
  "specific_event",
  "specific_project",
];

const EDUCATION_FOCUS = ["events", "onboarding", "community_call"] as const;
type EducationFocus = (typeof EDUCATION_FOCUS)[number];

const EDUCATION_ICONS: Record<EducationFocus, typeof CalendarDays> = {
  events: CalendarDays,
  onboarding: GraduationCap,
  community_call: Users,
};

const LEGACY_TO_EDUCATION = new Set([
  "community_events",
  "onboarding_program",
  "community_call",
]);

type DialogStep = "info" | "pay";

type ProjectOption = { id: string; title: string };

/**
 * Page /soutenir — destinations structurées + listes événements/projets.
 */
const Soutenir = () => {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const isFr = i18n.language.startsWith("fr");

  const paramDest = params.get("destination") as SupportDestinationId | null;
  const paramEventId = params.get("eventId");
  const paramProjectId = params.get("projectId");

  const [openDest, setOpenDest] = useState<SupportDestinationId | null>(null);
  const [step, setStep] = useState<DialogStep>("info");
  const [educationFocus, setEducationFocus] = useState<EducationFocus | null>(null);

  const [upcomingEvents, setUpcomingEvents] = useState<YnukaEvent[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    if (!paramDest) return;
    if (LEGACY_TO_EDUCATION.has(paramDest)) {
      setOpenDest("education");
      if (paramDest === "onboarding_program") setEducationFocus("onboarding");
      else if (paramDest === "community_call") setEducationFocus("community_call");
      else setEducationFocus("events");
      setStep("info");
      return;
    }
    if (DESTINATIONS.includes(paramDest)) {
      setOpenDest(paramDest);
      setStep("info");
    }
  }, [paramDest]);

  useEffect(() => {
    if (paramEventId) setSelectedEventId(paramEventId);
    if (paramProjectId) setSelectedProjectId(paramProjectId);
  }, [paramEventId, paramProjectId]);

  useEffect(() => {
    if (openDest !== "specific_event" && openDest !== "specific_project") return;
    let cancelled = false;
    setListsLoading(true);
    void (async () => {
      try {
        if (openDest === "specific_event") {
          const rows = await listEvents(100);
          if (cancelled) return;
          setUpcomingEvents(rows.filter((e) => e.id && !isEventPast(e)));
        } else {
          const rows = await fetchProjects(100);
          if (cancelled) return;
          setProjects(
            rows
              .filter((p) => p.id && p.title)
              .map((p) => ({ id: String(p.id), title: String(p.title) }))
          );
        }
      } catch {
        if (!cancelled) {
          if (openDest === "specific_event") setUpcomingEvents([]);
          else setProjects([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [openDest]);

  const context = useMemo(() => {
    if (openDest === "education") {
      if (educationFocus === "onboarding") return "onboarding_program";
      if (educationFocus === "community_call") return "community_call";
      if (educationFocus === "events") return "community_events";
      return "education";
    }
    if (openDest === "charitable_actions") return "charitable_actions";
    return "support_page";
  }, [openDest, educationFocus]);

  const relatedEventId =
    openDest === "specific_event" ? selectedEventId || paramEventId : paramEventId;
  const relatedProjectId =
    openDest === "specific_project" ? selectedProjectId || paramProjectId : paramProjectId;

  const canProceedToPay = () => {
    if (openDest === "specific_event") return Boolean(selectedEventId);
    if (openDest === "specific_project") return Boolean(selectedProjectId);
    return true;
  };

  const openInfo = (id: SupportDestinationId) => {
    setOpenDest(id);
    setStep("info");
    if (id !== "education") setEducationFocus(null);
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setOpenDest(null);
      setStep("info");
      setEducationFocus(null);
    }
  };

  const eventLabel = (e: YnukaEvent) => {
    const title = isFr && e.titleFr ? e.titleFr : e.title;
    const date = e.date
      ? new Date(e.date).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    return date ? `${title} · ${date}` : title;
  };

  return (
    <div className="min-h-[70vh] bg-[#f7f8fa] dark:bg-[#0a1628]">
      <header className="border-b border-[#0f2847]/15 bg-[#0f2847] text-white">
        <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-6 md:px-8">
          <Link
            to="/events#agenda"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-[#ffb800]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {t("support.backEvents")}
          </Link>
        </div>
        <div className="mx-auto max-w-[36rem] px-4 pb-8 pt-5 text-center sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("support.title")}
          </h1>
          <p className="mx-auto mt-3 text-base font-medium leading-snug text-white sm:text-lg">
            {t("support.intro")}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[880px] px-4 py-7 sm:px-6 md:py-9">
        <section className="bg-white p-5 dark:bg-[#0c1a2e] sm:p-6">
          <h2 className="text-center text-lg font-extrabold text-[#0f2847] dark:text-white">
            {t("support.destinationTitle")}
          </h2>
          <p className="mt-1 text-center text-sm font-medium text-[#0f2847]/75 dark:text-slate-300">
            {t("support.destinationHint")}
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {DESTINATIONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => openInfo(id)}
                className={cn(
                  "flex items-center justify-between gap-2 border border-slate-200 bg-[#f7f8fa] px-3.5 py-3 text-left text-sm font-bold text-[#0f2847] transition-colors hover:border-[#ffb800] dark:border-slate-600 dark:bg-slate-900 dark:text-white",
                  openDest === id && "border-[#ffb800] bg-[#ffb800]/20"
                )}
              >
                <span>{t(`support.dest.${id}`)}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#ffb800]" aria-hidden />
              </button>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={!!openDest} onOpenChange={closeDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#0f2847]/20 bg-white dark:bg-[#0c1a2e]">
          {openDest ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-left text-xl font-extrabold text-[#0f2847] dark:text-white">
                  {t(`support.programs.${openDest}.title`)}
                </DialogTitle>
              </DialogHeader>

              {step === "info" ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed text-[#0f2847] dark:text-slate-100">
                    {t(`support.programs.${openDest}.desc`)}
                  </p>
                  <p className="text-sm font-semibold leading-relaxed text-[#0f2847] dark:text-[#ffb800]">
                    {t(`support.programs.${openDest}.why`)}
                  </p>

                  {openDest === "education" ? (
                    <div className="space-y-3">
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f2847]/70 dark:text-slate-400">
                        {t("support.educationIncludes")}
                      </p>
                      <div className="grid gap-2.5">
                        {EDUCATION_FOCUS.map((focus) => {
                          const Icon = EDUCATION_ICONS[focus];
                          const active = educationFocus === focus;
                          return (
                            <button
                              key={focus}
                              type="button"
                              onClick={() => setEducationFocus(focus)}
                              className={cn(
                                "group flex w-full gap-3 border p-3.5 text-left transition-colors",
                                active
                                  ? "border-[#ffb800] bg-[#0f2847] text-white"
                                  : "border-slate-200 bg-[#f7f8fa] hover:border-[#ffb800]/80 dark:border-slate-600 dark:bg-slate-900"
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center",
                                  active ? "bg-[#ffb800] text-[#0f2847]" : "bg-[#0f2847] text-[#ffb800]"
                                )}
                              >
                                <Icon className="h-5 w-5" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "block text-sm font-extrabold",
                                    active ? "text-white" : "text-[#0f2847] dark:text-white"
                                  )}
                                >
                                  {t(`support.educationFocus.${focus}.title`)}
                                </span>
                                <span
                                  className={cn(
                                    "mt-1 block text-xs font-medium leading-relaxed",
                                    active ? "text-white/85" : "text-[#0f2847]/80 dark:text-slate-300"
                                  )}
                                >
                                  {t(`support.educationFocus.${focus}.desc`)}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs font-medium text-[#0f2847]/70 dark:text-slate-400">
                        {t("support.educationFocusHint")}
                      </p>
                    </div>
                  ) : null}

                  {openDest === "environment" ? (
                    <ul className="space-y-1.5 text-sm font-semibold text-[#0f2847] dark:text-slate-100">
                      {(["trees", "community", "followup"] as const).map((key) => (
                        <li key={key} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffb800]" aria-hidden />
                          {t(`support.environmentPoints.${key}`)}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {openDest === "charitable_actions" ? (
                    <ul className="space-y-1.5 text-sm font-semibold text-[#0f2847] dark:text-slate-100">
                      {(["supplies", "clothes", "orphanage", "visits"] as const).map((key) => (
                        <li key={key} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffb800]" aria-hidden />
                          {t(`support.charityPoints.${key}`)}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {openDest === "specific_event" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-[#0f2847] dark:text-white">
                        {t("support.pickEvent")}
                      </label>
                      {listsLoading ? (
                        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                      ) : upcomingEvents.length === 0 ? (
                        <p className="text-sm font-medium text-[#0f2847] dark:text-slate-200">
                          {t("support.noUpcomingEvents")}
                        </p>
                      ) : (
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[#0f2847] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="">{t("support.pickEventPlaceholder")}</option>
                          {upcomingEvents.map((e) => (
                            <option key={e.id} value={e.id}>
                              {eventLabel(e)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : null}

                  {openDest === "specific_project" ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-[#0f2847] dark:text-white">
                        {t("support.pickProject")}
                      </label>
                      {listsLoading ? (
                        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                      ) : projects.length === 0 ? (
                        <p className="text-sm font-medium text-[#0f2847] dark:text-slate-200">
                          {t("support.noProjects")}
                        </p>
                      ) : (
                        <select
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="w-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[#0f2847] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        >
                          <option value="">{t("support.pickProjectPlaceholder")}</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={!canProceedToPay()}
                    onClick={() => setStep("pay")}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#ffb800] px-5 py-3 text-sm font-extrabold text-[#0f2847] transition-colors hover:bg-[#e6a600] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <HandCoins className="h-4 w-4" aria-hidden />
                    {t("support.contributeCta")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="text-sm font-semibold text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
                  >
                    {t("support.backToProgramInfo")}
                  </button>
                  <p className="text-sm font-bold text-[#0f2847] dark:text-white">
                    {t("support.waysHint")}
                  </p>
                  <DonatePanel
                    key={`${openDest}-${relatedEventId ?? ""}-${relatedProjectId ?? ""}-${educationFocus ?? ""}`}
                    donationContext={context}
                    destination={openDest}
                    relatedEventId={relatedEventId}
                    relatedProjectId={relatedProjectId}
                    showTitle={false}
                  />
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Soutenir;
