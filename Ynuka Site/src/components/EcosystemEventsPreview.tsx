import { useEffect, useMemo, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  MapPin,
  Send,
  Radio,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadMergedCarouselEvents,
  type UnifiedCarouselEvent,
} from "@/services/events/eventsCatalog";

const FALLBACK_EVENTS: UnifiedCarouselEvent[] = [
  {
    id: "event-1",
    title: "Introduction au Web3, Blockchain & Smart Contracts",
    date: "18 Octobre 2026",
    type: "Workshop",
    location: "Goma Innovation Center",
    time: "14:00 - 18:00",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    description: "Atelier pratique pour comprendre l'architecture décentralisée et coder son premier smart contract.",
    fullDescription: "Atelier pratique pour comprendre l'architecture décentralisée et coder son premier smart contract.",
    isPast: false,
    isLive: false,
    sortDate: "2026-10-18",
    source: "site",
  },
  {
    id: "event-2",
    title: "Hackathon Goma Web3 Build : Solutions Locales",
    date: "08 Novembre 2026",
    type: "Hackathon",
    location: "Virunga Tech Park",
    time: "09:00 - 20:00",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
    description: "48 heures pour concevoir des applications décentralisées au service de l'agriculture et de l'environnement.",
    fullDescription: "48 heures pour concevoir des applications décentralisées au service de l'agriculture et de l'environnement.",
    isPast: false,
    isLive: true,
    sortDate: "2026-11-08",
    source: "site",
  },
  {
    id: "event-3",
    title: "Meetup Communauté Cardano & Ynuka Labs Hub",
    date: "05 Décembre 2026",
    type: "Meetup",
    location: "Ynuka Labs, Goma",
    time: "17:00 - 19:00",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
    description: "Échanges ouverts sur les actualités de la blockchain, la gouvernance participative et le networking.",
    fullDescription: "Échanges ouverts sur les actualités de la blockchain, la gouvernance participative et le networking.",
    isPast: false,
    isLive: false,
    sortDate: "2026-12-05",
    source: "site",
  },
  {
    id: "event-4",
    title: "Web3 Pitch Night : Présentation des Projets Incubés",
    date: "15 Janvier 2027",
    type: "Pitch",
    location: "Kivu Tech Hub",
    time: "18:00 - 21:00",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&h=600&fit=crop",
    description: "Soirée de présentation devant un panel de mentors, investisseurs et partenaires de l'écosystème.",
    fullDescription: "Soirée de présentation devant un panel de mentors, investisseurs et partenaires de l'écosystème.",
    isPast: false,
    isLive: false,
    sortDate: "2027-01-15",
    source: "site",
  },
  {
    id: "event-5",
    title: "Masterclass Blockchain Basics & Sécurité Numérique",
    date: "10 Février 2027",
    type: "Workshop",
    location: "Ynuka Labs, Goma",
    time: "10:00 - 15:00",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec8e5?w=800&h=600&fit=crop",
    description: "Fondamentaux de la cryptographie, gestion des portefeuilles et sécurité des transactions on-chain.",
    fullDescription: "Fondamentaux de la cryptographie, gestion des portefeuilles et sécurité des transactions on-chain.",
    isPast: false,
    isLive: false,
    sortDate: "2027-02-10",
    source: "site",
  },
  {
    id: "event-6",
    title: "Atelier Agriculture Régénérative & Traçabilité Web3",
    date: "02 Mars 2027",
    type: "Web3",
    location: "Hub Régional Goma",
    time: "14:00 - 17:30",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&h=600&fit=crop",
    description: "Comment la blockchain révolutionne la chaîne de valeur agricole et la certification carbone en RDC.",
    fullDescription: "Comment la blockchain révolutionne la chaîne de valeur agricole et la certification carbone en RDC.",
    isPast: false,
    isLive: false,
    sortDate: "2027-03-02",
    source: "site",
  },
];

export const EcosystemEventsPreview = ({ showDivider = false }: { showDivider?: boolean }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<UnifiedCarouselEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadMergedCarouselEvents({
          lang: i18n.language,
          t,
          lumaFutureLimit: 50,
          lumaPastLimit: 50,
        });
        if (cancelled) return;
        setItems(result.items);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n.language, t]);

  // Merge live items with fallback to ensure we always have 6 rich cards + sidebar
  const allEvents = useMemo(() => {
    if (items.length >= 6) return items;
    const combined = [...items];
    for (const fb of FALLBACK_EVENTS) {
      if (!combined.some((ev) => ev.title.toLowerCase() === fb.title.toLowerCase())) {
        combined.push(fb);
      }
    }
    return combined;
  }, [items]);

  const categories = useMemo(() => {
    return [
      { id: "all", label: "All" },
      { id: "workshop", label: "Ateliers" },
      { id: "meetup", label: "Meetups" },
      { id: "web3", label: "Web3" },
      { id: "hackathon", label: "Hackathons" },
      { id: "pitch", label: "Pitch & Conf" },
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return allEvents;
    return allEvents.filter((ev) => {
      const typeStr = (ev.type || "").toLowerCase();
      const titleStr = ev.title.toLowerCase();
      if (activeFilter === "workshop") return typeStr.includes("workshop") || typeStr.includes("atelier");
      if (activeFilter === "meetup") return typeStr.includes("meetup");
      if (activeFilter === "web3") return typeStr.includes("web3") || titleStr.includes("web3");
      if (activeFilter === "hackathon") return typeStr.includes("hackathon");
      if (activeFilter === "pitch") return typeStr.includes("pitch") || typeStr.includes("masterclass");
      return true;
    });
  }, [allEvents, activeFilter]);

  const mainSixEvents = useMemo(() => {
    return filteredEvents.slice(0, 6);
  }, [filteredEvents]);

  const trendingEvents = useMemo(() => {
    return allEvents.slice(0, 5);
  }, [allEvents]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterDone(true);
    setTimeout(() => {
      setNewsletterEmail("");
      setNewsletterDone(false);
    }, 4000);
  };

  const handleCardClick = (event: UnifiedCarouselEvent) => {
    if (event.id && !event.id.startsWith("preview-") && !event.id.startsWith("luma-") && !event.id.startsWith("event-")) {
      navigate(`/events/${event.id}`);
    } else if (event.viewUrl) {
      window.open(event.viewUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate("/events");
    }
  };

  return (
    <section
      id="events"
      className={cn(
        "relative scroll-mt-28 overflow-hidden py-12 md:py-18 bg-transparent text-foreground",
        showDivider && "border-t border-white/10"
      )}
    >
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header Bar matching the reference: Title on Left, Category Pills on Right */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Événements & Ateliers
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
              Nos prochains rendez-vous de la communauté • Mis à jour régulièrement
            </p>
          </div>

          {/* Category Filter Pills on Right */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => {
              const active = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFilter(cat.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    active
                      ? "bg-white text-[#0f2847] shadow-md scale-105"
                      : "border border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: 2 Columns on desktop (6 Cards on Left, Sidebar on Right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7 items-start">
          {/* Left Column: 6 Cards in 2 rows x 3 cols */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {mainSixEvents.map((event, idx) => {
                  const eventId = event.id || `event-${idx}`;
                  const isBookmarked = bookmarkedIds.has(eventId);
                  const isLive = event.isLive;
                  const isPast = event.isPast;

                  return (
                    <motion.article
                      key={eventId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      onClick={() => handleCardClick(event)}
                      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1c31]/85 p-3.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Media Header with Badges */}
                      <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-900">
                          <img
                            src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop"}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                          {/* Category Badge on Top-Left */}
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm border border-white/10">
                            {event.type || "Événement"}
                          </span>

                          {/* Bookmark Button on Top-Right */}
                          <button
                            type="button"
                            onClick={(e) => toggleBookmark(eventId, e)}
                            aria-label="Sauvegarder l'événement"
                            className={cn(
                              "absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-200",
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

                        {/* Title (2 lines clamp) */}
                        <h3 className="mt-3 font-display text-sm font-bold leading-snug text-white line-clamp-2 group-hover:text-[#ffb800] transition-colors">
                          {event.title}
                        </h3>
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-[11px] font-medium text-slate-400">
                        <span className="truncate max-w-[130px]">
                          {event.date}
                        </span>

                        {isLive ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-500 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                            Live
                          </span>
                        ) : isPast ? (
                          <span className="text-slate-500 shrink-0">
                            Terminé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-400 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Trending
                          </span>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: 3 Sidebar Modules */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-4">
            {/* Widget 1: Trending Now */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1c31]/85 p-5 shadow-sm backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-sm font-bold text-white tracking-tight">
                  Trending Now
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="space-y-3.5">
                {trendingEvents.map((item, index) => (
                  <div
                    key={item.id || index}
                    onClick={() => handleCardClick(item)}
                    className="group flex items-start gap-3 cursor-pointer"
                  >
                    <span className="font-display text-base font-extrabold text-slate-600 dark:text-slate-500 group-hover:text-[#ffb800] transition-colors w-4 shrink-0 pt-0.5">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-xs sm:text-[0.825rem] font-bold text-white leading-snug line-clamp-1 group-hover:text-[#ffb800] transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                        {item.location || "Goma"} • {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Get the Daily Briefing */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#091b36] to-[#071326] p-5 text-white shadow-md">
              <div className="flex items-center gap-2 text-[#ffb800] mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Newsletter Hub</span>
              </div>
              <h3 className="font-display text-base font-bold tracking-tight text-white">
                Get the daily briefing
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Top rendez-vous, résumés d'ateliers et annonces exclusives. Sans spam.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="relative mt-4">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#ffb800] focus:outline-none focus:ring-1 focus:ring-[#ffb800] pr-10"
                />
                <button
                  type="submit"
                  aria-label="S'inscrire à la newsletter"
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#091b36] hover:bg-[#ffb800] transition-all hover:scale-105"
                >
                  {newsletterDone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Send className="h-3 w-3" />}
                </button>
              </form>
              {newsletterDone && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-400">
                  Inscription confirmée avec succès !
                </p>
              )}
            </div>

            {/* Widget 3: Propose an Event / Call for Speakers (ADVERTISEMENT spot in reference) */}
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-5 text-center flex flex-col items-center justify-center min-h-[140px] hover:border-white/35 transition-colors">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                COMMUNAUTÉ & HUB
              </span>
              <h4 className="font-display text-sm font-bold text-white mb-1">
                Un sujet ou atelier à partager ?
              </h4>
              <p className="text-xs text-slate-400 mb-3 max-w-[240px]">
                Devenez speaker ou co-organisez un meetup avec Ynuka Labs.
              </p>
              <Link
                to="/events#proposer-evenement"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffb800] hover:text-white transition-colors"
              >
                <span>Proposer un événement</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemEventsPreview;
