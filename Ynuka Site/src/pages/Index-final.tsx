import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight, Check, Users, Calendar, Rocket, Trees } from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";
import Container from "@/components/ui/Container";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";
import { useCountUp } from "@/hooks/useCountUp";
import { fetchBlogPosts, fetchProjects, fetchHomeProjects } from "@/lib/api";
import { DEMO_PROJECTS, USE_DEMO_PROJECTS } from "@/data/demoProjects";
import { cn, withTimeout, stripHtml } from "@/lib/utils";
import UpcomingEventsCarousel from "@/components/UpcomingEventsCarousel";
import OpportunitiesSection from "@/components/OpportunitiesSection";
import ContactSection from "@/components/ContactSection";
import {
  loadMergedCarouselEvents,
  pickRecentPreview,
} from "@/services/events/eventsCatalog";
import "@/styles/AboutDesign.css";


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
  isPast?: boolean;
  isLive?: boolean;
  recapUrl?: string | null;
  youtubeUrl?: string | null;
  registrationUrl?: string | null;
  viewUrl?: string | null;
  formatLabel?: string | null;
  timezone?: string | null;
  sortDate?: string;
}

interface HomeBlogPost {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  cover_url: string | null;
  created_at: string;
}

const BLOG_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop";

type ImpactStatCardProps = {
  value: number;
  suffix: string;
  label: string;
  points?: string[];
  delay?: number;
  locale: string;
};

const ImpactStatCard = ({
  value,
  suffix,
  label,
  points,
  delay = 0,
  locale,
}: ImpactStatCardProps) => {
  const { count, elementRef } = useCountUp({
    end: value,
    duration: 2200,
    startOnView: true,
  });
  const isWide = Boolean(points?.length);
  const formatted = count.toLocaleString(locale.startsWith("fr") ? "fr-FR" : "en-US");

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-40px" }}
      aria-label={`${formatted}${suffix} ${label}`}
      className="h-full"
    >
      <div
        style={{ animationDelay: `${0.4 + delay}s` }}
        className={cn(
          "impact-card h-full rounded-card border border-white/20 bg-white/[0.04] px-6 py-6 md:px-7 md:py-7",
          isWide
            ? "flex flex-col justify-center gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            : "flex flex-col justify-center"
        )}
      >
        <div ref={elementRef} className="min-w-0">
          <p className="font-display text-[2rem] font-bold leading-none tracking-tight text-white tabular-nums md:text-[2.35rem]">
            {formatted}
            <span>{suffix}</span>
          </p>
          <p className="typo-support mt-2.5 max-w-[18ch] text-pretty leading-snug text-white/75">
            {label}
          </p>
        </div>
        {isWide ? (
          <ul className="flex min-w-0 flex-col gap-1.5 border-white/15 sm:border-l sm:pl-6">
            {points!.map((point) => (
              <li key={point} className="typo-support leading-snug text-white/90">
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.article>
  );
};

type HomeProject = {
  name: string;
  category: string;
  description: string;
  tags: string[];
  logoUrl?: string | null;
  href?: string;
};

const TAG_STOPWORDS = new Set([
  "de", "la", "le", "les", "et", "pour", "du", "des", "aux", "au", "en", "un", "une",
  "the", "of", "and", "a", "an", "for", "to", "in",
]);

function tagsFromText(...parts: Array<string | string[] | null | undefined>) {
  const collected: string[] = [];
  parts.forEach((part) => {
    if (!part) return;
    const values = Array.isArray(part) ? part : String(part).split(/[,|;/]+|\s+/);
    values.forEach((value) => {
      const tag = value.trim();
      if (tag.length < 2) return;
      if (TAG_STOPWORDS.has(tag.toLowerCase())) return;
      if (collected.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
      collected.push(tag);
    });
  });
  return collected.slice(0, 4);
}

function HomeProjectCard({ project, delay }: { project: HomeProject; delay: number }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-4 mb-2">
        {project.logoUrl ? (
          <img
            src={project.logoUrl}
            alt=""
            className="h-12 max-w-[160px] object-contain object-left transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-[1.8rem] font-bold leading-none tracking-tight text-[#0f2847] dark:text-white transition-colors group-hover:text-[#ffb800]">
            {project.name}
          </span>
        )}
        <span className="shrink-0 pt-1 text-sm font-bold uppercase tracking-wider text-[#ffb800]">
          {project.category}
        </span>
      </div>
      <p className="mt-4 flex-1 text-base leading-relaxed text-slate-600 dark:text-white/70">
        {project.description}
      </p>
      {project.tags.length ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  const cardClass =
    "group flex h-full min-h-[240px] flex-col rounded-[1.5rem] border border-slate-200/80 bg-white px-8 py-8 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(15,40,71,0.08)] hover:-translate-y-1 dark:border-white/10 dark:bg-[#0f2847]/40 dark:hover:bg-[#0f2847]/70 dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]";
  const isExternal = Boolean(project.href && /^https?:\/\//i.test(project.href));

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="h-full"
    >
      {project.href ? (
        isExternal ? (
          <a href={project.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
            {inner}
          </a>
        ) : (
          <Link to={project.href} className={cardClass}>
            {inner}
          </Link>
        )
      ) : (
        <div className={cardClass}>{inner}</div>
      )}
    </motion.article>
  );
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { heroRef, titleRef, buttonsRef } = useHeroAnimations(isLoading);
  const innovationPoints = useMemo(() => {
    const points = t("home.innovationPoints", { returnObjects: true });
    return Array.isArray(points) ? (points as string[]) : [];
  }, [t, i18n.language]);

  const homeMosaicImages = useMemo(
    () => [
      "/onboarding/onboarding-1.jpg",
      "/onboarding/onboarding-2.jpg",
      "/onboarding/onboarding-3.jpg",
      "/onboarding/onboarding-4.jpg",
    ],
    []
  );

  const handleOpenModal = (event: Event) => {
    if (event.isPast) {
      if (event.recapUrl) {
        if (/^https?:\/\//i.test(event.recapUrl)) {
          window.open(event.recapUrl, "_blank", "noopener,noreferrer");
          return;
        }
        navigate(event.recapUrl);
        return;
      }
      if (event.youtubeUrl) {
        window.open(event.youtubeUrl, "_blank", "noopener,noreferrer");
        return;
      }
      if (event.viewUrl) {
        if (/^https?:\/\//i.test(event.viewUrl)) {
          window.open(event.viewUrl, "_blank", "noopener,noreferrer");
          return;
        }
        navigate(event.viewUrl);
        return;
      }
      return;
    }
    if (event.registrationUrl) {
      window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (event.id?.startsWith("luma-")) {
      navigate("/luma-events");
      return;
    }
    if (event.id && !event.id.startsWith("preview-")) {
      navigate(`/events/${event.id}`);
      return;
    }
    navigate("/events");
  };

  const fallbackEvents = useMemo<Event[]>(() => {
    const locale = i18n.language === "fr" ? "fr-FR" : "en-US";
    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    return [
      {
        id: "preview-1",
        title: t("events.event1Title"),
        date: formatDate("2026-10-18"),
        type: t("events.workshop"),
        location: "Goma Innovation Center",
        time: "14:00 - 18:00",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
        description: t("events.event1Desc"),
        fullDescription: t("events.event1Desc"),
        isPast: false,
        recapUrl: null,
        youtubeUrl: null,
        sortDate: "2026-10-18",
      },
      {
        id: "preview-2",
        title: t("events.event2Title"),
        date: formatDate("2026-11-08"),
        type: t("events.hackathon"),
        location: "Virunga Tech Park",
        time: "09:00 - 20:00",
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
        description: t("events.event2Desc"),
        fullDescription: t("events.event2Desc"),
        isPast: false,
        recapUrl: null,
        youtubeUrl: null,
        sortDate: "2026-11-08",
      },
      {
        id: "preview-3",
        title: t("events.event3Title"),
        date: formatDate("2026-12-05"),
        type: t("events.meetup"),
        location: "Ynuka Labs, Goma",
        time: "17:00 - 19:00",
        image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
        description: t("events.event3Desc"),
        fullDescription: t("events.event3Desc"),
        isPast: false,
        recapUrl: null,
        youtubeUrl: null,
        sortDate: "2026-12-05",
      },
      {
        id: "preview-4",
        title: "Web3 Pitch Night",
        date: formatDate("2027-01-15"),
        type: "Pitch",
        location: "Kivu Tech Hub",
        time: "18:00 - 21:00",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=800&h=600&fit=crop",
        description: "Une soirée dédiée aux startups Web3 pour présenter leurs projets devant un panel d'investisseurs locaux et internationaux.",
        fullDescription: "Une soirée dédiée aux startups Web3 pour présenter leurs projets devant un panel d'investisseurs locaux et internationaux.",
        isPast: false,
        recapUrl: null,
        youtubeUrl: null,
        sortDate: "2027-01-15",
      },
      {
        id: "preview-5",
        title: "Masterclass Blockchain Basics",
        date: formatDate("2027-02-10"),
        type: "Masterclass",
        location: "Ynuka Labs, Goma",
        time: "10:00 - 15:00",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec8e5?w=800&h=600&fit=crop",
        description: "Apprenez les bases de la technologie blockchain et comment elle transforme les secteurs clés en Afrique.",
        fullDescription: "Apprenez les bases de la technologie blockchain et comment elle transforme les secteurs clés en Afrique.",
        isPast: false,
        recapUrl: null,
        youtubeUrl: null,
        sortDate: "2027-02-10",
      },
    ];
  }, [t, i18n.language]);

  const impactLocale = i18n.language || "fr";
  const projectPoints = useMemo(
    () => [t("home.proj1Category"), t("home.proj2Category"), t("home.proj3Category")],
    [t]
  );
  const memberPoints = useMemo(
    () => [t("home.statsMemberBuilders"), t("home.statsMemberLearners"), t("home.statsMemberMentors")],
    [t]
  );
  const treePoints = useMemo(
    () => [t("home.statsSiteBweremana"), t("home.statsSiteShaha"), t("home.statsSiteMukwija")],
    [t]
  );
  const eventPoints = useMemo(
    () => [t("events.workshop"), t("events.hackathon"), t("events.meetup")],
    [t]
  );

  useEffect(() => {
    setUpcomingEvents(fallbackEvents.slice(0, 4));
    const fetchUpcoming = async () => {
      try {
        const result = await withTimeout(
          loadMergedCarouselEvents({
            lang: i18n.language,
            t,
            lumaFutureLimit: 50,
            lumaPastLimit: 50,
          })
        );
        const preview = pickRecentPreview(result.items, 4).map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          type: event.type,
          location: event.location,
          time: event.time,
          image: event.image,
          description: event.description,
          fullDescription: event.fullDescription,
          isPast: event.isPast,
          isLive: event.isLive,
          recapUrl: event.recapUrl,
          youtubeUrl: event.youtubeUrl,
          registrationUrl: event.registrationUrl,
          viewUrl: event.viewUrl,
          formatLabel: event.formatLabel,
          timezone: event.timezone,
          sortDate: event.sortDate,
        }));
        setUpcomingEvents(preview.length > 0 ? preview : fallbackEvents.slice(0, 4));
      } catch {
        setUpcomingEvents(fallbackEvents.slice(0, 4));
      }
    };
    void fetchUpcoming();
  }, [i18n.language, fallbackEvents, t]);

  const hardcodedProjects: HomeProject[] = useMemo(
    () => [
      {
        name: t("home.proj1Name"),
        category: t("home.proj1Category"),
        description: t("home.proj1Desc"),
        tags: tagsFromText(t("home.proj1Tags", { returnObjects: true }) as string[]),
        href: "/projects",
      },
      {
        name: t("home.proj2Name"),
        category: t("home.proj2Category"),
        description: t("home.proj2Desc"),
        tags: tagsFromText(t("home.proj2Tags", { returnObjects: true }) as string[]),
        href: "/projects",
      },
      {
        name: t("home.proj3Name"),
        category: t("home.proj3Category"),
        description: t("home.proj3Desc"),
        tags: tagsFromText(t("home.proj3Tags", { returnObjects: true }) as string[]),
        href: "/projects",
      },
      {
        name: t("home.proj4Name"),
        category: t("home.proj4Category"),
        description: t("home.proj4Desc"),
        tags: tagsFromText(t("home.proj4Tags", { returnObjects: true }) as string[]),
        href: "/projects",
      },
    ],
    [t]
  );

  const [projectsList, setProjectsList] = useState<HomeProject[]>([]);
  const [usedFallbackProjects, setUsedFallbackProjects] = useState(false);

  useEffect(() => {
    if (usedFallbackProjects) setProjectsList(hardcodedProjects.slice(0, 4));
  }, [hardcodedProjects, usedFallbackProjects]);

  const displayHomeProjects = projectsList.slice(0, 4);

  const [latestBlogPosts, setLatestBlogPosts] = useState<HomeBlogPost[]>([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(true);
  const [blogPostsError, setBlogPostsError] = useState(false);

  const displayHomeBlogPosts = latestBlogPosts.slice(0, 4);
  const featuredBlogPost = displayHomeBlogPosts[0] ?? null;
  const sideBlogPosts = displayHomeBlogPosts.slice(1, 4);

  useEffect(() => {
    const fetchLatestBlog = async () => {
      try {
        const posts = await withTimeout(fetchBlogPosts(100));
        setLatestBlogPosts(
          posts
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4)
            .map((post) => ({
              id: post.id,
              title: post.title,
              title_fr: post.title_fr,
              excerpt: post.excerpt,
              excerpt_fr: post.excerpt_fr,
              category: post.category,
              cover_url: post.cover_url,
              created_at: post.created_at,
            }))
        );
      } catch {
        setLatestBlogPosts([]);
        setBlogPostsError(true);
      } finally {
        setBlogPostsLoading(false);
      }
    };
    fetchLatestBlog();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const items = await withTimeout(fetchHomeProjects(4));
        const mapped: HomeProject[] = items.map((project) => {
          const description = stripHtml(project.description);
          return {
            name: project.title,
            category: project.category || t("home.projFallbackCategory"),
            description,
            tags: tagsFromText(project.tags, project.category, description),
            logoUrl: project.featured_image,
            href: `/projects/${project.slug}`,
          };
        });

        setProjectsList(mapped);
        setUsedFallbackProjects(false);
      } catch {
        setUsedFallbackProjects(true);
      }
    };

    loadProjects();
  }, [t]);

  const [apiProjects, setApiProjects] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadApiProjects = async () => {
      try {
        const items = await withTimeout(fetchProjects(10));
        if (!cancelled && Array.isArray(items)) {
          setApiProjects(items);
        }
      } catch {
        if (!cancelled) setApiProjects([]);
      }
    };
    void loadApiProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const showcaseProjects = useMemo(() => {
    const demos = USE_DEMO_PROJECTS
      ? DEMO_PROJECTS.map((demo) => ({
          id: demo.id,
          slug: demo.slug,
          title: t(demo.titleKey),
          category: demo.category,
          shortPresentation: t(demo.descKey),
          imageUrl: demo.imageUrl,
          liveUrl: demo.liveUrl,
        }))
      : [];

    if (!demos.length) {
      return apiProjects.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        title: p.title,
        category: p.category || 'Projet',
        shortPresentation: stripHtml(p.description),
        imageUrl: p.featured_image || '/projects/mission5.jpg',
        liveUrl: p.live_url || null,
      }));
    }

    const apiSlugs = new Set(apiProjects.map((p) => p.slug));
    const apiTitles = new Set(apiProjects.map((p) => (p.title || '').toLowerCase().trim()));
    const demosOnly = demos.filter(
      (d) => !apiSlugs.has(d.slug) && !apiTitles.has(d.title.toLowerCase().trim())
    );

    const merged = [
      ...apiProjects.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        title: p.title,
        category: p.category || 'Projet',
        shortPresentation: stripHtml(p.description),
        imageUrl: p.featured_image || '/projects/mission5.jpg',
        liveUrl: p.live_url || null,
      })),
      ...demosOnly,
    ];

    return merged.slice(0, 6);
  }, [apiProjects, t, i18n.language]);

  return (
    <div className="relative min-h-screen text-foreground transition-colors duration-300">
      {/* Hero */}
      <section
        className="relative min-h-[95vh] flex items-center overflow-hidden bg-transparent pt-32 md:pt-40"
        ref={heroRef}
      >
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/3Lp9Zj2tSRo?autoplay=1&mute=1&loop=1&controls=0&playlist=3Lp9Zj2tSRo&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&rel=0&fs=0"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] min-h-full w-[177.78%] min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 md:h-[150%] md:w-[200%] opacity-80 mix-blend-luminosity"
            allow="autoplay; encrypted-media"
            title="Ynuka Labs"
            tabIndex={-1}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2848]/60 via-[#0f2847]/40 to-[#0c2646]/90" />
        </div>

        <Container className="relative z-10 w-full">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-[0.9rem] font-medium text-white/90 backdrop-blur-md shadow-sm"
            >
              Hub d'Innovation Web3 : Afrique Centrale
            </motion.div>

            <h1
              ref={titleRef}
              className="font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-[1.1] tracking-tight font-extrabold text-white mb-6"
            >
              Ynuka <span className="text-[#ffb800]">Labs</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-[clamp(1.1rem,2vw,1.25rem)] font-normal text-white/90 max-w-4xl mb-12 leading-relaxed"
            >
              Former la prochaine génération de builders blockchain en RDC à travers l'éducation, l'incubation et la communauté.
            </motion.p>

            <div
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto"
            >
              <ModernButton
                variant="primary"
                size="lg"
                href="/about"
                className="!bg-[#ffb800] !text-[#0a1128] font-bold shadow-[0_0_40px_-10px_rgba(255,184,0,0.5)] hover:shadow-[0_0_60px_-10px_rgba(255,184,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] px-8 py-4 h-auto rounded-xl text-[1.05rem]"
              >
                Découvrir Ynuka Labs
                <ArrowRight className="ml-2 h-5 w-5" />
              </ModernButton>

              <ModernButton
                variant="outline"
                size="lg"
                href="/community"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-md font-semibold px-8 py-4 h-auto transition-all duration-300 hover:-translate-y-1 rounded-xl text-[1.05rem]"
              >
                Rejoindre la communauté
              </ModernButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Section About Ynuka (Transparente sans fond) */}
      <section className="py-10 md:py-16 relative z-10 text-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Colonne gauche : Grille d'images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Image 1 (verticale) + Box */}
                <div className="flex flex-col gap-4 lg:gap-6">
                  <div className="w-full h-[300px] lg:h-[400px] rounded-2xl overflow-hidden relative shadow-lg">
                    <img
                      src="/assets-about/about.jpg"
                      alt="About Ynuka Labs"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center shadow-lg">
                    <span className="text-4xl font-extrabold text-[#ffb800] mb-1">5+</span>
                    <span className="text-sm font-medium text-white/80 uppercase tracking-widest">Années d'Expertise</span>
                  </div>
                </div>
                {/* Images 2 et 3 (empilées) */}
                <div className="flex flex-col gap-4 lg:gap-6 pt-8 lg:pt-12">
                  <div className="w-full h-[200px] lg:h-[240px] rounded-2xl overflow-hidden relative shadow-lg">
                    <img
                      src="/assets-about/vision-computer.jpg"
                      alt="Vision"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full h-[200px] lg:h-[240px] rounded-2xl overflow-hidden relative shadow-lg">
                    <img
                      src="/hero-bg.jpg"
                      alt="Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : Texte */}
            <div className="flex flex-col">
              <span className="text-[#ffb800] text-sm font-bold uppercase tracking-widest mb-4">
                À propos de Ynuka Labs
              </span>
              <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight font-extrabold mb-6">
                Ynuka Labs imagine un avenir où la technologie devient un véritable moteur de transformation.
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Nous réunissons innovation, Web3, données et créativité pour aider les organisations et les communautés à relever les défis de demain et à créer de nouvelles opportunités.
              </p>

              <div>
                <ModernButton
                  variant="primary"
                  size="lg"
                  href="/about"
                  className="!bg-[#ffb800] !text-[#0a1128] font-bold shadow-[0_0_20px_-5px_rgba(255,184,0,0.4)] hover:!bg-[#ffb800]/90 transition-all rounded-xl px-8 py-3 h-auto"
                >
                  En savoir plus
                </ModernButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section Réalisations en chiffres (Floating Pill Bar) */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#0f2847]/95 backdrop-blur-xl rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row justify-between items-stretch shadow-[0_20px_50px_-12px_rgba(15,40,71,0.5)] border border-blue-400/20"
        >
          {[
            { icon: Users, value: "500+", label: "Membres de la communauté" },
            { icon: Calendar, value: "30+", label: "Événements organisés" },
            { icon: Rocket, value: "15+", label: "Projets incubés" },
            { icon: Trees, value: "10000+", label: "Arbres plantés" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col md:flex-row w-full md:flex-1 items-center">
              {i !== 0 && (
                <>
                  <div className="w-full h-px bg-blue-400/10 md:hidden my-2" />
                  <div className="hidden md:block w-px h-12 bg-blue-400/10" />
                </>
              )}
              <div className="group flex items-center gap-5 py-3 md:py-2 px-2 md:px-6 w-full flex-1 justify-center md:justify-start transition-all hover:bg-white/5 rounded-2xl">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="text-2xl lg:text-3xl font-extrabold text-white mb-1 leading-none tracking-tight">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-blue-200/80 font-medium">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Section Solutions / Projets Phares */}
      <section className="py-10 md:py-16 relative z-10 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <h2 className="font-display text-[clamp(2.5rem,4vw,3.5rem)] leading-tight font-extrabold mb-4 sm:mb-6">
              Des solutions pour la communauté
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Découvrez nos projets phares qui offrent des réponses concrètes aux besoins de la communauté.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {showcaseProjects.map((project) => (
              <div
                key={project.id || project.slug}
                className="bg-[#0f2847]/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl flex flex-col group border border-white/10 transition-all hover:bg-[#0f2847] hover:border-white/25 hover:-translate-y-1"
              >
                <Link to={`/projects/${project.slug}`} className="block h-56 overflow-hidden relative bg-slate-900">
                  <img
                    src={project.imageUrl || '/projects/mission5.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </Link>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="bg-blue-500/20 text-blue-300 text-[0.65rem] font-bold uppercase tracking-widest py-1.5 px-3.5 rounded-full self-start mb-4 border border-blue-400/20">
                    {project.category}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white mb-3 leading-snug group-hover:text-[#ffb800] transition-colors">
                    <Link to={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed flex-1 line-clamp-3">
                    {project.shortPresentation}
                  </p>
                  <div className="mt-6 pt-2">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[0.8rem] font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-[#ffb800] group-hover:text-[#0f2847] group-hover:border-[#ffb800]"
                    >
                      Voir le projet <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ModernButton
              variant="primary"
              href="/projects"
              className="rounded-xl bg-[#ffb800] px-7 py-3 font-bold text-[#0f2847] hover:bg-[#e6a600]"
            >
              Découvrir tous les projets
              <ArrowRight className="ml-2 h-4 w-4" />
            </ModernButton>
          </div>
        </Container>
      </section>

      {/* Events — compact editorial carousel */}
      <ModernSectionWrapper className="py-10 md:py-14">
        <div id="upcoming-events" className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8 text-left md:mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
                {t("home.upcomingTitle")}
              </h2>
              <p className="mt-3 max-w-3xl text-justify text-base font-semibold leading-relaxed text-[#1e3a5f] dark:text-[#93c5fc] md:text-lg">
                {t("home.upcomingSubtitle")}
              </p>
            </div>

            <UpcomingEventsCarousel events={upcomingEvents} onRegister={handleOpenModal} />
            {upcomingEvents.length === 0 && (
              <p className="text-center text-muted-foreground">{t("home.noEvents")}</p>
            )}

            <div className="mt-8 text-center">
              <ModernButton
                variant="primary"
                href="/blockchains#events"
                className="rounded-xl bg-[#ffb800] px-7 py-3 font-bold text-[#0f2847] hover:bg-[#e6a600]"
              >
                {t("home.viewAllEvents")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </ModernButton>
            </div>
          </motion.div>
        </div>
      </ModernSectionWrapper>

      {/* Opportunities from the published database content */}
      <OpportunitiesSection />

      {/* Actualités & Publications */}
      <ModernSectionWrapper className="py-12 md:py-16 bg-white dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <div className="mb-10 border-b border-slate-200 dark:border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="text-[#ffb800] font-bold tracking-widest uppercase text-sm mb-4 block">Research & Insights</span>
              <h2 className="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold uppercase tracking-tight text-[#0f2847] dark:text-white leading-[1.1]">
                Ideas that <br /><span className="text-slate-400 dark:text-slate-500">Move Forward.</span>
              </h2>
            </div>
            <ModernButton href="/blog" variant="outline" className="hidden md:flex rounded-full px-6 py-2 border-slate-300 dark:border-white/20 text-[#0f2847] dark:text-white font-semibold">
              View all publications <ArrowUpRight className="ml-2 h-4 w-4" />
            </ModernButton>
          </div>

          {blogPostsLoading && latestBlogPosts.length === 0 ? (
            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
              <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ) : !featuredBlogPost ? (
            <div className="py-12 text-center text-muted-foreground">
              {blogPostsError ? t("home.loadError") : t("home.noBlogPosts")}
            </div>
          ) : (
            (() => {
              const isFr = i18n.language.startsWith("fr");
              const locale = isFr ? "fr-FR" : "en-US";
              const getTitle = (post: HomeBlogPost) =>
                (isFr && post.title_fr ? post.title_fr : post.title) || "";
              const getExcerpt = (post: HomeBlogPost) =>
                stripHtml((isFr && post.excerpt_fr ? post.excerpt_fr : post.excerpt) || "");
              const getDate = (post: HomeBlogPost, long = false) =>
                post.created_at
                  ? new Date(post.created_at).toLocaleDateString(locale, {
                    day: "numeric",
                    month: long ? "long" : "short",
                    year: "numeric",
                  })
                  : "";
              const getTags = (post: HomeBlogPost) =>
                String(post.category || "")
                  .split(/[,|;/]+/)
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 3);
              const cover = (post: HomeBlogPost) =>
                post.cover_url?.trim() ? post.cover_url : BLOG_FALLBACK_IMG;

              return (
                <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
                  <motion.article
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="min-w-0"
                  >
                    <Link to={`/blog/${featuredBlogPost.id}`} className="group block">
                      <div className="relative overflow-hidden rounded-card">
                        <img
                          src={cover(featuredBlogPost)}
                          alt=""
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#ffb800] px-3 py-1 text-[0.7rem] font-bold text-[#0f2847]">
                            {t("home.blogFeatured")}
                          </span>
                          {getTags(featuredBlogPost).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-[#0f2847] backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-[#0f2847] transition-colors group-hover:text-[#0a3f95] dark:text-white md:text-[1.7rem]">
                        {getTitle(featuredBlogPost)}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-slate-500 dark:text-[#93c5fc]/80">
                        {getExcerpt(featuredBlogPost)}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-white/10">
                        <span className="text-sm text-slate-400 dark:text-[#93c5fc]/65">
                          {t("home.blogPublishedOn")} {getDate(featuredBlogPost, true)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f2847] dark:text-[#ffb800]">
                          {t("home.blogReadArticle")}
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>

                  <div className="flex min-w-0 flex-col gap-4">
                    {sideBlogPosts.map((post, i) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.06 * (i + 1) }}
                        viewport={{ once: true }}
                      >
                        <Link
                          to={`/blog/${post.id}`}
                          className="group flex gap-3.5 rounded-card border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:border-[#ffb800]/40 hover:bg-white dark:border-[#3b82f6]/20 dark:bg-[#152a48]/70 dark:hover:bg-[#152a48]"
                        >
                          <div className="h-[92px] w-[108px] shrink-0 overflow-hidden rounded-card sm:h-[100px] sm:w-[118px]">
                            <img
                              src={cover(post)}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <h3 className="line-clamp-2 text-[0.95rem] font-bold leading-snug text-[#0f2847] transition-colors group-hover:text-[#0a3f95] dark:text-white">
                              {getTitle(post)}
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-400 dark:text-[#93c5fc]/65">
                              {getDate(post)}
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1 self-end pt-2 text-xs font-semibold text-[#0f2847] dark:text-[#ffb800]">
                              {t("home.blogReadArticle")}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </Link>
                      </motion.article>
                    ))}

                    <div className="pt-1">
                      <ModernButton
                        variant="primary"
                        href="/blog"
                        className="!rounded-full bg-[#ffb800] px-7 py-3 font-bold text-white hover:bg-[#e6a600]"
                      >
                        {t("home.viewAllBlog")}
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </ModernButton>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </motion.div>
      </ModernSectionWrapper>
    </div>
  );
};

export default Index;
