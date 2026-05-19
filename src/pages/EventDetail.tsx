import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, ArrowLeft, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";

interface EventData {
  id: string;
  title: string;
  title_fr: string | null;
  description: string | null;
  description_fr: string | null;
  date: string;
  location: string;
  type: string;
  upcoming: boolean;
  image_url: string | null;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isFr = i18n.language === "fr";

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        type StrapiEventDetailItem = {
          id: string | number;
          attributes?: {
            title?: string;
            title_fr?: string | null;
            description?: string | null;
            description_fr?: string | null;
            date?: string;
            location?: string;
            type?: string;
            upcoming?: boolean;
            image?: unknown;
          };
        };

        const res = await strapiFetch<{ data: unknown }>(`/api/events/${id}?populate=image`);
        const item = res.data;
        const detail = item as StrapiEventDetailItem;
        if (detail?.attributes) {
          setEvent({
            id: String(detail.id),
            title: detail.attributes.title ?? "",
            title_fr: detail.attributes.title_fr ?? null,
            description: detail.attributes.description ?? null,
            description_fr: detail.attributes.description_fr ?? null,
            date: detail.attributes.date ?? "",
            location: detail.attributes.location ?? "",
            type: detail.attributes.type ?? "",
            upcoming: !!detail.attributes.upcoming,
            image_url: mediaToUrl(detail.attributes.image),
          });
        }
      } catch {
        // keep loading false; UI will show not found
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Determine if event date is past
  const isPast = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d < new Date();
    } catch { return false; }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await strapiFetch("/api/event-registrations", {
        method: "POST",
        body: JSON.stringify({
          data: {
            event: id,
            full_name: regForm.full_name,
            email: regForm.email,
            phone: regForm.phone || null,
          },
        }),
      });
      toast({ title: t("events.registerSuccess") });
      setShowRegister(false);
      setRegForm({ full_name: "", email: "", phone: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const status = msg.includes("409")
        ? 409
        : msg.toLowerCase().includes("duplicate")
          ? 409
          : null;

      if (status === 409) {
        toast({ title: t("events.alreadyRegistered"), variant: "destructive" });
      } else {
        toast({ title: t("events.registerError"), variant: "destructive" });
      }
    }
    setSubmitting(false);
  };

  if (loading) return <div className="py-32 text-center text-muted-foreground">{t("admin.loading")}</div>;
  if (!event) return (
    <div className="py-32 text-center">
      <p className="text-muted-foreground mb-4">{t("events.notFound")}</p>
      <Button variant="outline-glow" asChild><Link to="/events">{t("events.backToEvents")}</Link></Button>
    </div>
  );

  const title = isFr && event.title_fr ? event.title_fr : event.title;
  const desc = isFr && event.description_fr ? event.description_fr : event.description;
  const eventIsPast = isPast(event.date) || !event.upcoming;

  return (
    <div>
      <section className={`py-20 ${eventIsPast ? "bg-destructive/10" : "hero-gradient"}`}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-4 w-4" /> {t("events.backToEvents")}
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${eventIsPast ? "bg-destructive/20 text-destructive" : "text-primary bg-primary/10"}`}>
                {event.type}
              </span>
              {eventIsPast && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-destructive/20 text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {t("events.eventPassed")}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {event.image_url && <img src={event.image_url} alt={title} className="w-full rounded-xl mb-8 object-cover max-h-96" />}

          <div className={`glass rounded-xl p-6 mb-8 ${eventIsPast ? "border-destructive/30" : ""}`}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className={`h-5 w-5 ${eventIsPast ? "text-destructive" : "text-primary"}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{t("events.dateLabel")}</p>
                  <p className={`font-semibold ${eventIsPast ? "text-destructive" : ""}`}>{event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("events.locationLabel")}</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8 text-foreground leading-relaxed whitespace-pre-wrap">
            {desc || t("events.noDescription")}
          </div>

          {eventIsPast ? (
            <div className="glass rounded-xl p-6 border-destructive/30 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-semibold">{t("events.registrationClosed")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("events.eventAlreadyPassed")}</p>
            </div>
          ) : (
            <Button variant="glow" size="lg" onClick={() => setShowRegister(true)}>
              {t("events.register")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>{t("events.registerTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 mt-4">
            <Input placeholder={t("events.fullName")} value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} required />
            <Input type="email" placeholder={t("events.email")} value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
            <Input placeholder={t("events.phone")} value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
            <Button type="submit" variant="glow" className="w-full" disabled={submitting}>
              {submitting ? t("events.submitting") : t("events.confirmRegister")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
