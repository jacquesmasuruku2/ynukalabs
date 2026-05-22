import { useState, useEffect, useMemo } from "react";
import type { ElementType } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, Calendar, Rocket, Trees, Star, Zap, Globe } from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import ModernCard from "@/components/ui/ModernCard";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";
import Container from "@/components/ui/Container";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";
import { useCountUp } from "@/hooks/useCountUp";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";
import { cn } from "@/lib/utils";
import UpcomingEventsCarousel from "@/components/UpcomingEventsCarousel";

interface Event {
  id?: string;
  title: string;
  date: string;
  type: string;
  location: string;
  time: string;
  image: string;
  description: string;
  fullDescription: string;
}

interface HomeBlogPost {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
}

interface HomeBlogPost {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
}

type StatItem = {
  icon: ElementType;
  value: number;
  label: string;
  suffix: string;
};

const StatBentoTile = ({
  stat,
  delay = 0,
  className,
  variant = "default",
}: {
  stat: StatItem;
  delay?: number;
  className?: string;
  variant?: "default" | "wide" | "tall";
}) => {
  const { count, barProgress, elementRef } = useCountUp({
    end: stat.value,
    duration: 2500,
    startOnView: true,
  });
  const Icon = stat.icon;
  const isLargeValue = stat.value >= 1000;

  const numberClass = cn(
    "font-display font-extrabold tabular-nums tracking-[-0.035em] text-[#111111] leading-[0.95]",
    variant === "default" &&
      (isLargeValue
        ? "text-[clamp(1.35rem,3.8vw,2rem)] md:text-[clamp(1.5rem,3.2vw,2.15rem)]"
        : "text-[clamp(1.5rem,4.2vw,2.2rem)] md:text-[clamp(1.65rem,3.5vw,2.45rem)]"),
    variant === "wide" &&
      (isLargeValue
        ? "text-[clamp(1.45rem,3.8vw,2.1rem)] md:text-[clamp(1.6rem,3.2vw,2.35rem)]"
        : "text-[clamp(1.65rem,4.2vw,2.35rem)] md:text-[clamp(1.85rem,3.5vw,2.65rem)]"),
    variant === "tall" &&
      (isLargeValue
        ? "text-[clamp(1.3rem,3.4vw,1.85rem)] md:text-[clamp(1.45rem,2.9vw,2.1rem)] lg:text-[clamp(1.55rem,2.6vw,2.25rem)]"
        : "text-[clamp(1.55rem,4vw,2.15rem)] md:text-[clamp(1.75rem,3.2vw,2.45rem)]")
  );

  const suffixClass = cn(
    "font-display font-bold text-[#ffb800] tabular-nums",
    variant === "default" && "text-[clamp(0.8rem,2vw,1.1rem)] md:text-[clamp(0.85rem,1.7vw,1.2rem)]",
    variant === "wide" && "text-[clamp(0.85rem,2.1vw,1.15rem)] md:text-[clamp(0.9rem,1.8vw,1.25rem)]",
    variant === "tall" && "text-[clamp(0.8rem,1.9vw,1.1rem)] md:text-[clamp(0.85rem,1.65vw,1.2rem)]"
  );

  const bar = (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full border border-[#111111]/10 bg-[#111111]/[0.07]",
        variant === "default" && "mt-2 h-1 max-w-none",
        variant === "wide" && "mt-2 h-1 md:max-w-none",
        variant === "tall" && "mt-2 h-1.5"
      )}
      aria-hidden
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0f6be8] via-[#12B1A6] to-[#ffb800]"
        style={{
          width: `${Math.max(0, Math.min(100, Math.round(barProgress * 100)))}%`,
          minWidth: barProgress > 0 ? "4px" : undefined,
        }}
      />
    </div>
  );

  const labelClass = cn(
    "font-semibold leading-snug text-[#111111]",
    variant === "default" && "mt-2 text-[0.75rem] leading-snug md:mt-auto md:text-[0.8125rem]",
    variant === "wide" &&
      "mt-2 max-w-[22ch] text-[0.75rem] md:mt-0 md:flex-1 md:text-[0.8125rem] md:leading-snug lg:max-w-none lg:text-sm",
    variant === "tall" && "mt-2 text-[0.75rem] md:mt-0 md:text-[0.8125rem] lg:max-w-[16ch]"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-40px" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      role="group"
      aria-label={stat.label}
      className={cn("w-full min-w-0 text-left", className)}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#fff8f0] p-4 text-left text-[#111111] shadow-[0_6px_24px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.06] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] dark:bg-[#fff8f0] dark:ring-black/10",
          variant === "tall" && "md:justify-between md:py-4",
          variant === "wide" && "md:flex-row md:items-center md:gap-4 md:p-5 lg:gap-5 lg:p-5",
          variant === "default" && "md:p-5"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.88]"
          aria-hidden
          style={{
            backgroundImage: [
              "linear-gradient(135deg, hsl(230 42% 58% / 0.11) 0%, transparent 46%)",
              "linear-gradient(315deg, hsl(43 100% 50% / 0.09) 0%, transparent 42%)",
              "linear-gradient(to right, transparent 49.5%, rgba(255,184,0,0.16) 50%, transparent 50.5%)",
              "linear-gradient(to bottom, transparent 49.5%, rgba(255,184,0,0.16) 50%, transparent 50.5%)",
            ].join(","),
          }}
        />
        <div
          className={cn(
            "relative z-[1] flex min-h-0 flex-1 flex-col",
            variant === "wide" && "md:flex-row md:items-center md:gap-4",
            variant === "tall" && "md:justify-between"
          )}
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              variant === "wide" && "md:flex md:shrink-0 md:flex-col md:items-start",
              variant === "tall" && "md:justify-between"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="inline-flex shrink-0 rounded-lg bg-[#111111]/[0.05] p-1.5 text-[#111111] ring-1 ring-black/[0.05]">
                <Icon className="h-6 w-6 text-[#111111] md:h-7 md:w-7" strokeWidth={2} aria-hidden />
              </div>
            </div>

            <div
              ref={elementRef}
              className={cn(
                "mt-2 min-w-0 flex-1 md:mt-3",
                variant === "tall" && "flex flex-col md:mt-3 md:justify-center",
                variant === "wide" && "md:mt-3"
              )}
            >
              <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
                <span className={numberClass}>
                  {count}
                  <span className={suffixClass}>{stat.suffix}</span>
                </span>
              </div>
              {bar}
            </div>
          </div>

          <p className={labelClass}>{stat.label}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Les événements de la section "Événements à venir" sont pilotés par Strapi.
  // On garde une valeur de fallback pour éviter une page vide si l'API n'est pas joignable.
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { t, i18n } = useTranslation();

  const { heroRef, titleRef, buttonsRef, navigationRef } = useHeroAnimations(isLoading);

  const innovationSentenceWords = useMemo(
    () => t("home.innovationMission").split(/\s+/).filter(Boolean),
    [t, i18n.language]
  );

  const handleOpenModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const stats: StatItem[] = useMemo(
    () => [
      { icon: Users, value: 500, label: "Membres Actifs", suffix: "+" },
      { icon: Calendar, value: 30, label: "Événements Organisés", suffix: "+" },
      { icon: Rocket, value: 15, label: "Projets Lancés", suffix: "+" },
      { icon: Trees, value: 10000, label: t("stats.treesPlanted"), suffix: "+" },
    ],
    [t]
  );

  const hardcodedUpcomingEvents: Event[] = [
    {
      id: "fallback-1",
      title: "Workshop Blockchain Fondamentaux",
      date: "25 Mars 2026",
      type: "Workshop",
      location: "Goma Innovation Center",
      time: "14:00 - 18:00",
      image: "https://images.unsplash.com/photo-1639322533843-2b5a3b5b5b5?w=600&h=400&fit=crop",
      description: "Initiation aux concepts fondamentaux de la blockchain",
      fullDescription:
        "Plongez dans l'univers fascinant de la blockchain avec ce workshop intensif. Vous apprendrez les concepts de base, les mécanismes de consensus, la cryptographie, et comment cette technologie révolutionnaire transforme les industries. Session pratique avec démonstrations live et études de cas concrets applicables au contexte africain.",
    },
    {
      id: "fallback-2",
      title: "Hackathon Web3 pour le Développement",
      date: "10 Avril 2026",
      type: "Hackathon",
      location: "Virunga Tech Park",
      time: "09:00 - 20:00",
      image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=400&fit=crop",
      description: "48h de développement intensif pour créer des solutions Web3",
      fullDescription:
        "Rejoignez-nous pour 48 heures de création intensive ! Formez des équipes, développez des solutions innovantes utilisant les technologies Web3, et présentez vos projets à un jury d'experts. Thème central : 'Technologie Blockchain pour le Développement Durable en RDC'. Prix exceptionnels et opportunités de financement pour les meilleurs projets.",
    },
    {
      id: "fallback-3",
      title: "Meetup Crypto et Investissement",
      date: "20 Avril 2026",
      type: "Meetup",
      location: "Goma Hub HQ",
      time: "17:00 - 19:00",
      image: "https://images.unsplash.com/photo-1611224923853-80b0237ed8b3?w=600&h=400&fit=crop",
      description: "Réseautage et discussions sur les opportunités d'investissement crypto",
      fullDescription:
        "Un meetup exclusif pour explorer les opportunités d'investissement dans les cryptomonnaies et projets blockchain. Échanges avec des investisseurs expérimentés, analyses de marché, et présentation de projets prometteurs. Session networking suivie d'un cocktail. Places limitées pour garantir des échanges de qualité.",
    },
    {
      id: "fallback-4",
      title: "Workshop Blockchain Fondamentaux — session 2",
      date: "15 Avril 2026",
      type: "Workshop",
      location: "Goma Innovation Center",
      time: "14:00 - 18:00",
      image: "https://images.unsplash.com/photo-1639322533843-2b5a3b5b5b5?w=600&h=400&fit=crop",
      description: "Initiation aux concepts fondamentaux de la blockchain",
      fullDescription:
        "Plongez dans l'univers fascinant de la blockchain avec ce workshop intensif. Vous apprendrez les concepts de base, les mécanismes de consensus, la cryptographie, et comment cette technologie révolutionnaire transforme les industries. Session pratique avec démonstrations live et études de cas concrets applicables au contexte africain.",
    },
    {
      id: "fallback-5",
      title: "Hackathon Web3 pour le Développement — édition printemps",
      date: "22 Mai 2026",
      type: "Hackathon",
      location: "Virunga Tech Park",
      time: "09:00 - 20:00",
      image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=400&fit=crop",
      description: "48h de développement intensif pour créer des solutions Web3",
      fullDescription:
        "Rejoignez-nous pour 48 heures de création intensive ! Formez des équipes, développez des solutions innovantes utilisant les technologies Web3, et présentez vos projets à un jury d'experts. Thème central : 'Technologie Blockchain pour le Développement Durable en RDC'. Prix exceptionnels et opportunités de financement pour les meilleurs projets.",
    },
    {
      id: "fallback-6",
      title: "Meetup Crypto et Investissement — afterwork",
      date: "5 Juin 2026",
      type: "Meetup",
      location: "Goma Hub HQ",
      time: "17:00 - 19:00",
      image: "https://images.unsplash.com/photo-1611224923853-80b0237ed8b3?w=600&h=400&fit=crop",
      description: "Réseautage et discussions sur les opportunités d'investissement crypto",
      fullDescription:
        "Un meetup exclusif pour explorer les opportunités d'investissement dans les cryptomonnaies et projets blockchain. Échanges avec des investisseurs expérimentés, analyses de marché, et présentation de projets prometteurs. Session networking suivie d'un cocktail. Places limitées pour garantir des échanges de qualité.",
    },
  ];

  useEffect(() => {
    setUpcomingEvents(hardcodedUpcomingEvents);

    const fetchUpcoming = async () => {
      try {
        type StrapiEventItem = {
          id: string | number;
          attributes?: {
            title?: string;
            title_fr?: string | null;
            date?: string;
            type?: string;
            location?: string;
            time?: string;
            image?: unknown;
            description?: string | null;
            description_fr?: string | null;
          };
        };

        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/events?filters[upcoming][$eq]=true&sort=date:asc&populate=image&pagination[pageSize]=12"
        );
        const items = res.data || [];

        const formatDate = (d: string) => {
          try {
            const dt = new Date(d);
            return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
          } catch {
            return d;
          }
        };

        const mapped: Event[] = items
          .map((item) => {
            const it = item as StrapiEventItem;
            return {
              id: String(it.id),
              title: it.attributes?.title_fr ?? it.attributes?.title ?? "",
              date: formatDate(it.attributes?.date ?? ""),
              type: it.attributes?.type ?? "",
              location: it.attributes?.location ?? "",
              time: it.attributes?.time ?? "",
              image: mediaToUrl(it.attributes?.image) ?? "",
              description: it.attributes?.description_fr ?? it.attributes?.description ?? "",
              fullDescription: it.attributes?.description_fr ?? it.attributes?.description ?? "",
            };
          })
          .filter((e) => e.id && e.title && e.date && e.type && e.location);

        if (mapped.length) setUpcomingEvents(mapped);
      } catch {
        // fallback déjà présent (hardcodedUpcomingEvents)
      }
    };

    fetchUpcoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  type HomeProject = { name: string; category: string; description: string };
  const hardcodedProjects: HomeProject[] = [
    { 
      name: "KivuPay", 
      category: "DeFi", 
      description: "Plateforme de paiement décentralisée pour la région des Grands Lacs"
    },
    { 
      name: "EduChain", 
      category: "Éducation", 
      description: "Système éducatif basé sur la blockchain pour les écoles congolaises"
    },
    { 
      name: "VolcanoDAO", 
      category: "Impact Social", 
      description: "Organisation autonome pour le développement durable autour du Virunga"
    },
  ];

  const [projectsList, setProjectsList] = useState<HomeProject[]>(hardcodedProjects);

  const [latestBlogPosts, setLatestBlogPosts] = useState<HomeBlogPost[]>([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);

  const blogFallbackPosts = useMemo(
    () =>
      [
        { id: "1", title: t("blog.p1Title"), title_fr: null, excerpt: t("blog.p1Excerpt"), excerpt_fr: null, category: "Announcement", created_at: "2026-03-01" },
        { id: "2", title: t("blog.p2Title"), title_fr: null, excerpt: t("blog.p2Excerpt"), excerpt_fr: null, category: "Event Recap", created_at: "2026-02-20" },
        { id: "3", title: t("blog.p3Title"), title_fr: null, excerpt: t("blog.p3Excerpt"), excerpt_fr: null, category: "Education", created_at: "2026-02-10" },
        { id: "4", title: t("blog.p4Title"), title_fr: null, excerpt: t("blog.p4Excerpt"), excerpt_fr: null, category: "Innovation", created_at: "2026-01-28" },
        { id: "5", title: t("blog.p5Title"), title_fr: null, excerpt: t("blog.p5Excerpt"), excerpt_fr: null, category: "Community", created_at: "2026-01-15" },
        { id: "6", title: t("blog.p6Title"), title_fr: null, excerpt: t("blog.p6Excerpt"), excerpt_fr: null, category: "Education", created_at: "2026-01-05" },
      ] satisfies HomeBlogPost[],
    [t]
  );

  const displayHomeBlogPosts = useMemo(() => {
    if (latestBlogPosts.length > 0) return latestBlogPosts.slice(0, 3);
    return blogFallbackPosts.slice(0, 3);
  }, [latestBlogPosts, blogFallbackPosts]);

  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        type StrapiBlogPostItem = {
          id: string | number;
          attributes?: {
            title?: string;
            title_fr?: string | null;
            excerpt?: string | null;
            excerpt_fr?: string | null;
            category?: string;
            createdAt?: string;
            created_at?: string;
          };
        };
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/blog-posts?filters[published][$eq]=true&sort=createdAt:desc&pagination[pageSize]=3"
        );
        const items = res.data || [];
        const mapped: HomeBlogPost[] = items
          .map((item) => {
            const it = item as StrapiBlogPostItem;
            return {
              id: String(it.id),
              title: it.attributes?.title ?? "",
              title_fr: it.attributes?.title_fr ?? null,
              excerpt: it.attributes?.excerpt ?? null,
              excerpt_fr: it.attributes?.excerpt_fr ?? null,
              category: it.attributes?.category ?? "",
              created_at: it.attributes?.createdAt ?? it.attributes?.created_at ?? "",
            };
          })
          .filter((p) => p.id && p.created_at);
        if (mapped.length) setLatestBlogPosts(mapped);
      } catch {
        // fallback: blogFallbackPosts
      } finally {
        setBlogPostsLoading(false);
      }
    };
    fetchLatestBlog();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/projects?sort=createdAt:desc&pagination[pageSize]=100"
        );
        const items = res.data || [];
        const mapped: HomeProject[] = items
          .map((item) => {
            const it = item as { attributes?: Record<string, unknown>; id?: string | number };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const name = String(attrs.name ?? "");
            const category = String(attrs.category ?? "");
            const description = String(attrs.description ?? "");
            if (!name || !category) return null;
            return { name, category, description };
          })
          .filter((p): p is HomeProject => p !== null);

        if (mapped.length) setProjectsList(mapped);
      } catch {
        // fallback: hardcodedProjects
      }
    };

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300">
      {/* Hero : même fond que la section Mission/Vision (À propos) = --background ; voile au-dessus de la vidéo */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden bg-background pt-6 md:pt-10 dark:bg-transparent"
        ref={heroRef}
      >
        <div className="absolute inset-0">
          <iframe
            src="https://www.youtube.com/embed/3Lp9Zj2tSRo?autoplay=1&mute=1&loop=1&controls=0&playlist=3Lp9Zj2tSRo&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&rel=0&fs=0"
            className="absolute inset-0 w-full h-full"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.77vh',
              transform: 'translateX(-50%) translateY(-50%)',
              pointerEvents: 'none'
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Ynuka Labs Background Video"
            frameBorder="0"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950/35 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-indigo-900/60" />
        </div>
        
        <Container className="relative z-10 text-center">
          <div className="hero-decoration inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-8 bg-white/20 backdrop-blur-md border border-white/30">
            <Star className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300">Innovation Web3 par Ynuka Labs</span>
          </div>
          
          <h1 
            ref={titleRef}
            className="text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6 text-white overflow-hidden"
          >
            <div>
              <span className="text-white">Ynuka </span>
              <span className="text-[#ffb800]">Labs</span>
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed text-white/90">
            <div className="text-blue-300">Le centre d'innovation blockchain pour le développement de la RD Congo</div>
          </p>
          
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <ModernButton
              variant="primary"
              size="lg"
              href="/community"
              className="!bg-[#ffb800] !text-[#111111] shadow-none hover:shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#ffb800]/60"
            >
              <Zap className="mr-2 h-5 w-5" />
              Rejoindre la communauté
              <ArrowRight className="ml-2 h-5 w-5" />
            </ModernButton>
            
            <ModernButton variant="outline" size="lg" href="/events" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Calendar className="mr-2 h-5 w-5" />
              Voir les événements
            </ModernButton>
          </div>
        </Container>
      </section>

      {/* Un seul fond continu (thème) : mission / visuels → impacts → blog */}
      <div>
      {/* About */}
      <ModernSectionWrapper className="py-24">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-12 gap-10 items-center"
          >
            <div className="lg:col-span-5">
              <div className="relative max-w-[520px] mx-auto lg:mx-0">
                <div className="absolute -left-6 top-2 w-[78%] h-[88%] rounded-[34px] bg-[#e8f8f7]" />
                <div className="absolute -left-8 -bottom-8 grid grid-cols-5 gap-2 opacity-90 z-0 pointer-events-none">
                  {Array.from({ length: 35 }).map((_, idx) => (
                    <span key={idx} className="h-2 w-2 rounded-full bg-slate-500/80" />
                  ))}
                </div>

                <div className="relative z-10 rounded-[34px] overflow-hidden shadow-2xl w-[78%]">
                  <img
                    src="/onboarding/onboarding-2.jpg"
                    alt="Innovation technologique locale"
                    className="w-full h-[300px] md:h-[360px] object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="absolute z-20 right-3 top-3 h-[72px] w-[146px] rounded-2xl bg-gradient-to-br from-[#0f6be8] to-[#0a3f95] text-white shadow-xl inline-flex items-center gap-1 px-2">
                  <span className="text-[30px] leading-none font-extrabold">+5</span>
                  <span className="text-[9.5px] font-semibold leading-[1.06] uppercase tracking-wide opacity-95 text-right max-w-[78px]">
                    YEARS OF
                    <br />
                    EXISTENCE
                  </span>
                </div>

                <div className="absolute z-20 -right-6 bottom-8 w-[44%] h-[230px] rounded-[22px] overflow-hidden border-[8px] border-white shadow-xl bg-white">
                  <img
                    src="/onboarding/onboarding-4.jpg"
                    alt="Programme d'innovation Ynuka Labs"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="w-full max-w-2xl"
              >
                <p className="text-justify text-pretty hyphens-auto text-base font-bold leading-relaxed text-foreground sm:text-lg md:text-xl md:leading-relaxed lg:text-[1.35rem]">
                  <span className="text-[#ffb800]">
                    {innovationSentenceWords.slice(0, 2).join(" ")}
                  </span>
                  {innovationSentenceWords.length > 2
                    ? ` ${innovationSentenceWords.slice(2).join(" ")}`
                    : null}
                </p>
              </motion.div>
              <ModernButton variant="primary" href="/about" className="!bg-[#ffb800] !text-[#111111] hover:brightness-105 mx-auto">
                <Globe className="mr-2 h-5 w-5" />
                {t("home.learnMore")}
              </ModernButton>
            </div>
          </motion.div>
        </Container>
      </ModernSectionWrapper>

      {/* Stats — message fort à gauche, grille bento à droite */}
      <ModernSectionWrapper className="py-16 md:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-60px" }}
            className="relative lg:col-span-5"
          >
            <div
              className="absolute -left-1 top-2 h-20 w-1 rounded-full bg-gradient-to-b from-[#ffb800] via-[#12B1A6] to-[#ffb800]/30 md:h-28 lg:top-3 lg:h-32"
              aria-hidden
            />
            <h2 className="max-w-[16ch] pl-5 font-display text-[clamp(1.85rem,4.5vw,3.15rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-foreground md:max-w-[18ch] md:pl-6 lg:max-w-none lg:text-[clamp(2rem,2.8vw,3.35rem)]">
              <span className="block text-balance">{t("home.statsImpactPart1")}</span>
              <span className="mt-2 block bg-gradient-to-r from-[#ffb800] via-[#e6a600] to-[#ffb800] bg-clip-text text-balance text-transparent dark:from-[#ffd54d] dark:via-[#ffb800] dark:to-[#e6a600]">
                {t("home.statsImpactPart2")}
              </span>
            </h2>
            <div
              className="mt-8 hidden h-px max-w-[200px] bg-gradient-to-r from-[#ffb800]/80 to-transparent md:block"
              aria-hidden
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-60px" }}
            className="min-w-0 lg:col-span-7"
          >
            <div className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-3 lg:gap-4 md:min-h-[220px] lg:min-h-[250px]">
              <StatBentoTile
                stat={stats[0]}
                delay={0}
                className="md:col-start-1 md:row-start-1"
              />
              <StatBentoTile
                stat={stats[1]}
                delay={0.06}
                className="md:col-start-2 md:row-start-1"
              />
              <StatBentoTile
                stat={stats[2]}
                delay={0.12}
                variant="wide"
                className="md:col-span-2 md:row-start-2"
              />
              <StatBentoTile
                stat={stats[3]}
                delay={0.18}
                variant="tall"
                className="md:col-start-3 md:row-start-1 md:row-span-2"
              />
            </div>
          </motion.div>
        </div>
      </ModernSectionWrapper>

      {/* Events — carrousel type maquette (carte centrale mise en avant) */}
      <ModernSectionWrapper className="py-24">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-center text-4xl font-bold md:text-5xl">
              <span className="text-[#ffb800]">{t("home.upcomingTitle")}</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-[#315795] dark:text-[#93c5fc] md:mb-16">
              {t("home.upcomingSubtitle")}
            </p>

            <UpcomingEventsCarousel events={upcomingEvents} onRegister={handleOpenModal} />

            <div className="mt-12 text-center">
              <ModernButton
                variant="outline"
                href="/events"
                className="border-[#2563eb]/50 text-[#1e40af] hover:border-[#2563eb] hover:bg-[#e8eef9] dark:border-[#3b82f6]/45 dark:text-[#93c5fc] dark:hover:bg-[#1a3055]/50"
              >
                {t("home.viewAllEvents")}
              </ModernButton>
            </div>
          </motion.div>
        </div>
      </ModernSectionWrapper>

      {/* Projects */}
      <ModernSectionWrapper className="py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            <div className="text-[#ffb800]">Projets Innovants</div>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {projectsList.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <ModernCard className="p-8">
                  <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold mb-4 ${
                    i === 0 ? 'bg-[#ffb800] text-[#111111]' :
                    i === 1 ? 'bg-[#ffb800] text-[#111111]' :
                    'bg-[#ffb800] text-[#111111]'
                  }`}>
                    {project.category}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-card-foreground">{project.name}</h3>
                  <p className="leading-relaxed text-muted-foreground">{project.description}</p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </ModernSectionWrapper>

      {/* Derniers articles blog */}
      <ModernSectionWrapper className="py-24">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
              <span className="text-[#ffb800]">{t("home.latestBlogTitle")}</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12 text-lg">
              {t("home.latestBlogSubtitle")}
            </p>

            {blogPostsLoading && latestBlogPosts.length === 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  {displayHomeBlogPosts.map((post, i) => {
                    const isFr = i18n.language.startsWith("fr");
                    const title = (isFr && post.title_fr ? post.title_fr : post.title) || "";
                    const excerpt = (isFr && post.excerpt_fr ? post.excerpt_fr : post.excerpt) || "";
                    const dateStr = post.created_at
                      ? new Date(post.created_at).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "";
                    return (
                      <motion.div
                        key={`${post.id}-${i}`}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        viewport={{ once: true }}
                      >
                        <Link to={`/blog/${post.id}`} className="group block h-full">
                          <ModernCard className="h-full p-6 flex flex-col border-border/80 hover:border-[#ffb800]/40 transition-colors">
                            <span className="text-xs font-medium text-[#ffb800] bg-[#ffb800]/10 px-3 py-1 rounded-full self-start">
                              {post.category}
                            </span>
                            <h3 className="font-semibold text-lg mt-4 mb-2 text-card-foreground line-clamp-2 group-hover:text-[#ffb800] transition-colors">
                              {title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{excerpt}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                {dateStr}
                              </span>
                              <span className="text-sm font-medium text-[#ffb800] flex items-center gap-1">
                                {t("blog.readMore")}
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </ModernCard>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-12">
                  <ModernButton
                    variant="primary"
                    href="/resources#blog"
                    size="lg"
                    className="!bg-[#ffb800] !text-[#111111] hover:brightness-105"
                  >
                    {t("home.viewAllBlog")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </ModernButton>
                </div>
              </>
            )}
          </motion.div>
        </Container>
      </ModernSectionWrapper>
      </div>

      {/* Modal d'inscription aux événements */}
      <EventRegistrationModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
};

export default Index;
