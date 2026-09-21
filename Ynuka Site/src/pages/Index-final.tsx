import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";
import Container from "@/components/ui/Container";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";
import { useCountUp } from "@/hooks/useCountUp";
import { fetchBlogPosts, fetchHomeProjects } from "@/lib/api";
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
      <div className="flex items-start justify-between gap-4">
        {project.logoUrl ? (
          <img
            src={project.logoUrl}
            alt=""
            className="h-10 max-w-[160px] object-contain object-left"
          />
        ) : (
          <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight text-[#0f2847] dark:text-white">
            {project.name}
          </span>
        )}
        <span className="shrink-0 pt-1 text-sm font-medium text-slate-300 dark:text-white/30">
          {project.name}
        </span>
      </div>
      <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-slate-600 dark:text-[#93c5fc]/80">
        {project.description}
      </p>
      {project.tags.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-500 dark:border-white/15 dark:bg-transparent dark:text-[#93c5fc]/80"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  const cardClass =
    "flex h-full min-h-[180px] flex-col rounded-card border border-slate-200 bg-white px-6 py-5 transition-colors hover:border-[#ffb800]/50 dark:border-[#3b82f6]/25 dark:bg-[#152a48]";
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
    setUpcomingEvents(fallbackEvents.slice(0, 3));
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
        const preview = pickRecentPreview(result.items, 3).map((event) => ({
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
        setUpcomingEvents(preview.length > 0 ? preview : fallbackEvents.slice(0, 3));
      } catch {
        setUpcomingEvents(fallbackEvents.slice(0, 3));
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
            href: project.live_url || project.repository_url || `/projects#${project.slug}`,
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

  return (
    <div className="min-h-screen bg-white text-foreground transition-colors duration-300 dark:bg-background">
      {/* Hero : même fond que la section Mission/Vision (À propos) = --background ; voile au-dessus de la vidéo */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden bg-white pt-6 md:pt-10 dark:bg-transparent"
        ref={heroRef}
      >
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/3Lp9Zj2tSRo?autoplay=1&mute=1&loop=1&controls=0&playlist=3Lp9Zj2tSRo&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&rel=0&fs=0"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] min-h-full w-[177.78%] min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 md:h-[140%] md:w-[180%]"
            allow="autoplay; encrypted-media"
            title="Ynuka Labs"
            tabIndex={-1}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950/35 dark:from-blue-900/80 dark:via-blue-800/70 dark:to-indigo-900/60" />
        </div>
        
        <Container className="relative z-10 text-center">
          <div className="hero-decoration mb-8 inline-flex items-center rounded-full border border-white/30 bg-white/20 px-6 py-3 text-sm font-medium backdrop-blur-md">
            <span className="text-blue-300">{t("hero.badge")}</span>
          </div>
          
          <h1 
            ref={titleRef}
            className="typo-display mb-6 overflow-hidden text-white"
          >
            <span className="text-white">Ynuka </span>
            <span className="text-[#ffb800]">Labs</span>
          </h1>
          
          <p className="typo-lead mx-auto mb-10 max-w-4xl text-white/90">
            <span className="text-blue-300">{t("hero.subtitle")}</span>
          </p>
          
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <ModernButton
              variant="primary"
              size="lg"
              href="/about"
              className="!bg-[#ffb800] !text-[#111111] shadow-none hover:shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#ffb800]/60"
            >
              {t("home.discoverCta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </ModernButton>
            
            <ModernButton variant="outline" size="lg" href="/community" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              {t("hero.joinBtn")}
            </ModernButton>
          </div>
        </Container>
      </section>

      {/* Un seul fond continu (thème) : mission / visuels → impacts → blog */}
      <div>
      {/* About */}
      <ModernSectionWrapper className="py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-6">
            <div className="relative w-full">
              <div className="mission-visual-grid">
                <span className="mission-visual-blob mission-visual-blob--tr" aria-hidden />
                <span className="mission-visual-blob mission-visual-blob--bl" aria-hidden />
                {homeMosaicImages.map((src, i) => (
                  <div key={src} className={`mission-visual-card mission-visual-${i + 1}`}>
                    <img
                      src={src}
                      alt={t("home.innovationPhotoAlt")}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-none bg-[#0f2847] px-3 py-2.5 text-white sm:right-4 sm:top-4 sm:px-3.5 sm:py-3">
                <span className="text-[1.6rem] font-extrabold leading-none sm:text-[1.85rem]">+5</span>
                <span className="max-w-[5.5rem] text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-white/95 sm:text-[0.7rem]">
                  {t("home.yearsOfExistence")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center gap-5 lg:col-span-6">
            <motion.ul
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full space-y-3"
            >
              {innovationPoints.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  viewport={{ once: true }}
                  className="flex gap-3 text-[0.95rem] font-semibold leading-relaxed text-[#0f2847] dark:text-[#dbeafe] sm:text-base md:text-[1.05rem]"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffb800]" aria-hidden />
                  <span>
                    {i === 0 ? (
                      <>
                        <span className="text-[#ffb800]">Ynuka Labs</span>
                        {point.replace(/^Ynuka Labs/, "")}
                      </>
                    ) : (
                      point
                    )}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
            <ModernButton
              variant="primary"
              href="/about"
              className="!rounded-none !bg-[#ffb800] !text-[#111111] hover:brightness-105"
            >
              {t("home.learnMore")}
            </ModernButton>
          </div>
        </motion.div>
      </ModernSectionWrapper>

      {/* Impacts — bandeau marine, grille type réalisations */}
      <section className="bg-[#0f2847] py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 md:auto-rows-fr md:min-h-[24rem] md:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-40px" }}
              className="flex items-center md:col-span-5"
            >
              <h2 className="impact-title max-w-[18ch] font-display text-white">
                <span className="block">{t("home.statsImpactPart1")}</span>
                <span className="mt-2 block text-[#ffb800]">{t("home.statsImpactPart2")}</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:col-span-7 md:grid-cols-2 md:gap-5">
              <ImpactStatCard
                value={15}
                suffix="+"
                label={t("stats.projects")}
                points={projectPoints}
                delay={0.05}
                locale={impactLocale}
              />
              <ImpactStatCard
                value={500}
                suffix="+"
                label={t("stats.members")}
                points={memberPoints}
                delay={0.1}
                locale={impactLocale}
              />
            </div>

            <div className="md:col-span-4">
              <ImpactStatCard
                value={10000}
                suffix="+"
                label={t("stats.treesPlanted")}
                points={treePoints}
                delay={0.12}
                locale={impactLocale}
              />
            </div>

            <div className="md:col-span-4">
              <ImpactStatCard
                value={30}
                suffix="+"
                label={t("stats.events")}
                points={eventPoints}
                delay={0.16}
                locale={impactLocale}
              />
            </div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-40px" }}
              className="h-full md:col-span-4"
            >
              <div
                style={{ animationDelay: "0.85s" }}
                className="impact-card flex h-full items-center justify-center rounded-card border border-[#ffb800]/40 bg-[#ffb800]/[0.08] px-6 py-6 text-center md:px-7 md:py-7"
              >
                <p className="typo-lead mx-auto max-w-[20ch] text-pretty text-center leading-snug text-white">
                  {t("home.statsTagline")}
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Projects — uniquement ceux flagués show_on_home par l'admin */}
      {displayHomeProjects.length > 0 && (
      <ModernSectionWrapper className="py-16 md:py-20">
        <div id="home-projects">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="mb-10 text-center md:mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              {t("home.projectsTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-[#93c5fc]/80 md:text-lg">
              {t("home.projectsSubtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {displayHomeProjects.map((project, i) => (
              <HomeProjectCard key={`${project.name}-${i}`} project={project} delay={i * 0.06} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <ModernButton
              variant="primary"
              href="/projects"
              className="!rounded-none bg-[#ffb800] px-7 py-3 font-bold text-[#0f2847] hover:bg-[#e6a600]"
            >
              {t("home.viewAllProjects")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </ModernButton>
          </div>
        </div>
      </ModernSectionWrapper>
      )}

      {/* Events — compact editorial carousel */}
      <ModernSectionWrapper className="py-16 md:py-20">
        <div id="upcoming-events" className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-10 text-left md:mb-12">
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

            <div className="mt-10 text-center">
              <ModernButton
                variant="primary"
                href="/events"
                className="!rounded-none bg-[#ffb800] px-7 py-3 font-bold text-[#0f2847] hover:bg-[#e6a600]"
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
      <ModernSectionWrapper className="py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <div className="mb-10 text-left md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              {t("home.latestBlogTitle")}
            </h2>
            <p className="mt-3 max-w-3xl text-justify text-base font-semibold leading-relaxed text-[#1e3a5f] dark:text-[#93c5fc] md:text-lg">
              {t("home.latestBlogSubtitle")}
            </p>
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

      <ContactSection />
      </div>

    </div>
  );
};

export default Index;
