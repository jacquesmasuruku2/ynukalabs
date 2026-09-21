import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEvent,
  isEventPast,
  registerForEvent,
} from "@/services/events/eventsApi";
import type { YnukaEvent } from "@/services/events/types";
import RichTextDisplay from "@/components/RichTextDisplay";
import GoogleSignInDialog from "@/components/auth/GoogleSignInDialog";
import { authService, type AuthUser } from "@/lib/auth";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#315795] dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0f2847] dark:text-white">{value}</p>
    </div>
  );
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isFr = i18n.language === "fr";

  const [event, setEvent] = useState<YnukaEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [regForm, setRegForm] = useState({ phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const data = await getEvent(id);
        if (!cancelled) setEvent(data);
      } catch {
        if (!cancelled) {
          setEvent(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const startRegister = () => {
    const current = authService.getUser();
    if (!current) {
      setShowAuth(true);
      return;
    }
    setUser(current);
    setShowRegister(true);
  };

  const completeRegistration = async (authUser: AuthUser) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await registerForEvent({
        event_id: id,
        full_name: authUser.name,
        email: authUser.email,
        phone: regForm.phone || null,
        avatarUrl: authUser.avatar || null,
      });
      toast({
        title: result.alreadyRegistered
          ? t("events.alreadyRegistered")
          : t("events.registerSuccess"),
        description: isFr
          ? "Vous pouvez maintenant échanger avec notre équipe."
          : "You can now chat with our team.",
      });
      setShowRegister(false);
      setRegForm({ phone: "" });
      navigate(`/events/${id}/espace`);
    } catch {
      toast({ title: t("events.registerError"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }
    await completeRegistration(user);
  };

  if (loading) {
    return <div className="py-32 text-center text-muted-foreground">{t("admin.loading")}</div>;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <p className="font-medium text-[#0f2847] dark:text-white">{t("events.loadError")}</p>
        <Button variant="outline-glow" className="mt-6" asChild>
          <Link to="/events">{t("events.backToEvents")}</Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-32 text-center">
        <p className="mb-4 text-muted-foreground">{t("events.notFound")}</p>
        <Button variant="outline-glow" asChild>
          <Link to="/events">{t("events.backToEvents")}</Link>
        </Button>
      </div>
    );
  }

  const title = isFr && event.titleFr ? event.titleFr : event.title;
  const desc = isFr && event.descriptionFr ? event.descriptionFr : event.description;
  const eventIsPast = isEventPast(event);

  const formatLabel =
    event.format === "in_person"
      ? t("events.formatInPerson")
      : event.format === "online"
        ? t("events.formatOnline")
        : event.format === "hybrid"
          ? t("events.formatHybrid")
          : null;

  const dateDisplay = (() => {
    const d = new Date(event.date);
    if (Number.isNaN(d.getTime())) return event.date;
    return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  const upcomingRegister =
    !eventIsPast &&
    (event.registrationUrl ? (
      <Button variant="glow" size="lg" asChild>
        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
          {t("events.register")} <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    ) : (
      <div className="flex flex-wrap gap-3">
        <Button variant="glow" size="lg" onClick={startRegister}>
          {t("events.register")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        {user ? (
          <Button variant="outline-glow" size="lg" asChild>
            <Link to={`/events/${event.id}/espace`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {isFr ? "Espace d'échange" : "Exchange space"}
            </Link>
          </Button>
        ) : null}
      </div>
    ));

  return (
    <div className="min-h-[70vh] bg-[#f7f8fa] dark:bg-[#0a1628]">
      <header className="border-b border-[#0f2847]/15 bg-[#0f2847] text-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 md:py-6">
          <Link
            to="/events#agenda"
            className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-[#ffb800]"
          >
            <ArrowLeft className="h-4 w-4" /> {t("events.backToEvents")}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffb800]">
            Ynuka Labs · {t("events.navAgenda")}
          </p>
          <div className="mt-3 mb-3 flex flex-wrap items-center gap-2">
            {event.type ? (
              <span className="bg-[#ffb800] px-2.5 py-1 text-xs font-semibold text-[#0f2847]">
                {event.type}
              </span>
            ) : null}
            {eventIsPast ? (
              <span className="border border-white/30 px-2.5 py-1 text-xs font-medium text-white">
                {t("events.pastLabel")}
              </span>
            ) : null}
            {formatLabel ? (
              <span className="border border-white/20 px-2.5 py-1 text-xs font-medium text-white/85">
                {formatLabel}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        </div>
      </header>

      <section className="py-10 md:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {event.imageUrl ? (
            <div className="mb-8 overflow-hidden border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <img
                src={event.imageUrl}
                alt={title}
                className="max-h-[28rem] w-full object-cover object-center"
              />
            </div>
          ) : null}

          <div className="mb-8 grid gap-5 border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#0c1a2e] sm:grid-cols-2">
            <div className="flex gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb800]" aria-hidden />
              <DetailRow label={t("events.dateLabel")} value={dateDisplay} />
            </div>
            {event.time || event.timezone ? (
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb800]" aria-hidden />
                <DetailRow
                  label={t("events.timeLabel")}
                  value={[event.time, event.timezone].filter(Boolean).join(" · ")}
                />
              </div>
            ) : null}
            {event.location ? (
              <div className="flex gap-3 sm:col-span-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb800]" aria-hidden />
                <DetailRow label={t("events.locationLabel")} value={event.location} />
              </div>
            ) : null}
          </div>

          {event.organizer ? (
            <div className="mb-6">
              <DetailRow label={t("events.organizerLabel")} value={event.organizer} />
            </div>
          ) : null}
          {event.speakers ? (
            <div className="mb-6">
              <DetailRow label={t("events.speakersLabel")} value={event.speakers} />
            </div>
          ) : null}
          {event.partners ? (
            <div className="mb-6">
              <DetailRow label={t("events.partnersLabel")} value={event.partners} />
            </div>
          ) : null}
          {event.audience ? (
            <div className="mb-6">
              <DetailRow label={t("events.audienceLabel")} value={event.audience} />
            </div>
          ) : null}
          {event.capacity ? (
            <div className="mb-6">
              <DetailRow label={t("events.capacityLabel")} value={String(event.capacity)} />
            </div>
          ) : null}

          {desc ? (
            <RichTextDisplay
              content={desc}
              className="mb-10 text-base leading-relaxed text-[#1e3a5f] dark:text-slate-200"
            />
          ) : (
            <div className="mb-10 text-base leading-relaxed text-[#1e3a5f] dark:text-slate-200">
              {t("events.noDescription")}
            </div>
          )}

          {eventIsPast ? (
            <div className="space-y-4 border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#0c1a2e]">
              <p className="text-sm font-semibold text-[#0f2847] dark:text-white">
                {t("events.registrationClosed")}
              </p>
              {event.recapUrl ? (
                <Button variant="glow" asChild>
                  <a href={event.recapUrl} target="_blank" rel="noopener noreferrer">
                    {t("events.readRecap")}
                  </a>
                </Button>
              ) : null}
              {!event.recapUrl && event.youtubeUrl ? (
                <Button variant="glow" asChild>
                  <a href={event.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    {t("events.watchYoutube")}
                  </a>
                </Button>
              ) : null}
              {event.resources ? (
                <div className="pt-2">
                  <DetailRow label={t("events.resourcesLabel")} value={event.resources} />
                </div>
              ) : null}
            </div>
          ) : (
            upcomingRegister
          )}

          <aside className="mt-10 overflow-hidden border-2 border-[#ffb800] bg-[#0f2847] text-white">
            <div className="flex flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
              <p className="text-sm font-extrabold sm:text-base">{t("events.supportThisEvent")}</p>
              <Link
                to={`/soutenir?destination=specific_event&eventId=${encodeURIComponent(event.id)}`}
                className="inline-flex shrink-0 items-center justify-center bg-[#ffb800] px-5 py-2.5 text-sm font-extrabold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
              >
                {t("events.supportBannerCta")}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <GoogleSignInDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(authUser) => {
          setUser(authUser);
          setShowAuth(false);
          setShowRegister(true);
        }}
        title={isFr ? "S'inscrire à l'événement" : "Register for the event"}
        description={
          isFr
            ? "Connectez-vous avec Google pour vous inscrire, puis échanger avec l'équipe Ynuka Labs."
            : "Sign in with Google to register, then chat with the Ynuka Labs team."
        }
      />

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-md rounded-md bg-card">
          <DialogHeader>
            <DialogTitle>{t("events.registerTitle")}</DialogTitle>
          </DialogHeader>
          {user ? (
            <div className="mb-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f2847] text-sm font-bold text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0f2847]">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          ) : null}
          <form onSubmit={handleRegister} className="mt-2 space-y-4">
            <Input
              placeholder={t("events.phone")}
              value={regForm.phone}
              onChange={(e) => setRegForm({ phone: e.target.value })}
            />
            <Button type="submit" variant="glow" className="w-full" disabled={submitting || !user}>
              {submitting ? t("events.submitting") : t("events.confirmRegister")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
