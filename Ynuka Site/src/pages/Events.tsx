import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { fetchEvents as fetchEventsFromApi, registerForEvent } from "@/lib/api";
import EventVisualCard from "@/components/events/EventVisualCard";
import { stripHtml } from "@/lib/utils";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

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
  time?: string | null;
  imageUrl?: string | null;
}

const Events = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerEventId, setRegisterEventId] = useState<string | null>(null);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const isFr = i18n.language === "fr";

  const filters = [
    { key: "All", label: t("events.all") },
    { key: "Upcoming", label: t("events.upcoming") },
    { key: "Past", label: t("events.past") },
    { key: "Workshop", label: t("events.workshop") },
    { key: "Hackathon", label: t("events.hackathon") },
    { key: "Meetup", label: t("events.meetup") },
  ];

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const events = await fetchEventsFromApi(100);
      setEvents(events);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // No fallback - only database data will be displayed
    } finally {
      setLoading(false);
    }
  };

  const isPast = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d < new Date();
    } catch { return false; }
  };

  const filtered = events.filter((e) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Upcoming") return e.upcoming && !isPast(e.date);
    if (activeFilter === "Past") return !e.upcoming || isPast(e.date);
    return e.type === activeFilter;
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEventId) return;
    setSubmitting(true);
    try {
      await registerForEvent({
        event: registerEventId,
        full_name: regForm.full_name,
        email: regForm.email,
        phone: regForm.phone || null,
      });

      toast({ title: t("events.registerSuccess") });
      setRegisterEventId(null);
      setRegForm({ full_name: "", email: "", phone: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const status = msg.includes("409")
        ? 409
        : msg.toLowerCase().includes("duplicate")
          ? 409
          : null;

      // Sans code d'erreur Supabase, on retombe sur le message générique.
      if (status === 409) {
        toast({ title: t("events.alreadyRegistered"), variant: "destructive" });
      } else {
        toast({ title: t("events.registerError"), variant: "destructive" });
      }
    }
    setSubmitting(false);
  };

  const getTitle = (e: EventData) => isFr && e.title_fr ? e.title_fr : e.title;
  const getDesc = (e: EventData) =>
    stripHtml((isFr && e.description_fr ? e.description_fr : e.description) || "");
  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const displayEventsBase = filtered;

  // Quand "All" est actif, on veut toujours afficher d'abord les "upcoming",
  // ensuite les "past" (tri par date ensuite).
  const displayEvents =
    activeFilter === "All"
      ? [...displayEventsBase].sort((a, b) => {
          const aPast = isPast(a.date) || !a.upcoming;
          const bPast = isPast(b.date) || !b.upcoming;
          if (aPast !== bPast) return aPast ? 1 : -1; // upcoming d'abord

          const ad = new Date(a.date).getTime();
          const bd = new Date(b.date).getTime();
          // upcoming : plus proche en premier ; past : plus récent en premier
          if (!aPast) return ad - bd;
          return bd - ad;
        })
      : displayEventsBase;

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="typo-page-title mb-4 text-[#0f2847] dark:text-white">
              {t("events.title")}
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-[#315795] dark:text-[#93c5fc]">{t("events.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-center">
            <Button variant="outline-glow" size="lg" asChild>
              <Link to="/luma-events">{t("events.onLuma")}</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {filters.map((f) => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)} className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${activeFilter === f.key ? "bg-[#ffb800] text-[#0f2847]" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">{t("admin.loading")}</div>
          ) : displayEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Aucun événement disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {displayEvents.map((event, i) => {
                const eventIsPast = isPast(event.date) || !event.upcoming;
                return (
                  <motion.div
                    key={event.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                    className="h-full"
                  >
                    <EventVisualCard
                      compact
                      showTime={true}
                      event={{
                        id: event.id,
                        title: getTitle(event),
                        description: getDesc(event),
                        date: formatEventDate(event.date),
                        type: event.type,
                        location: event.location,
                        time: event.time ?? null,
                        imageUrl: event.imageUrl ?? null,
                      }}
                      primaryLabel={t("home.registerNow")}
                      onPrimaryClick={!eventIsPast ? () => setRegisterEventId(event.id) : undefined}
                      secondaryHref={eventIsPast ? `/events/${event.id}` : undefined}
                      secondaryLabel={t("events.viewDetails")}
                      secondaryTone={eventIsPast ? "red" : "teal"}
                      className="h-full"
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!registerEventId} onOpenChange={(open) => !open && setRegisterEventId(null)}>
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

export default Events;
