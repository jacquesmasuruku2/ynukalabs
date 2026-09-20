import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, Search } from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";
import { fetchProjects } from "@/lib/api";
import { DEMO_PROJECTS, USE_DEMO_PROJECTS } from "@/data/demoProjects";

const ALL_CATEGORY = "__all__";
const FALLBACK_IMAGE = "/logo.png";
const NAV_CATEGORIES = ["Education", "Environnement", "Blockchain"] as const;
/** Même largeur / paddings que la barre de menu */
const PAGE_SHELL =
  "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const slugify = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "project";

const isPublicGithubUrl = (url: string | null | undefined): url is string => {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "github.com" || host.endsWith(".github.io");
  } catch {
    return /github\.com/i.test(url);
  }
};

type ProjectShowcase = {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortPresentation: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
};

function ProjectCard({
  project,
  delay,
  fallbackCategory,
  labels,
}: {
  project: ProjectShowcase;
  delay: number;
  fallbackCategory: string;
  labels: { viewProject: string; viewGithub: string };
}) {
  const categoryLabel = project.category || fallbackCategory;
  const exploreHref = project.liveUrl || `/projects#${project.slug}`;
  const exploreExternal = Boolean(project.liveUrl);
  const hasImage = Boolean(project.imageUrl);

  return (
    <motion.article
      id={project.slug}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      viewport={{ once: true }}
      className="group relative flex h-full flex-col overflow-hidden rounded-none border border-[#0f2847]/12 bg-[#0f2847] transition-all duration-300 hover:border-[#ffb800]/70 dark:border-white/10 dark:hover:border-[#ffb800]/55"
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-[#152a48]">
        <img
          src={project.imageUrl || FALLBACK_IMAGE}
          alt={project.title}
          className={
            hasImage
              ? "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              : "absolute inset-0 m-auto h-10 w-10 object-contain opacity-50"
          }
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.endsWith(FALLBACK_IMAGE)) return;
            img.src = FALLBACK_IMAGE;
            img.className = "absolute inset-0 m-auto h-10 w-10 object-contain opacity-50";
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2847] via-[#0f2847]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[#ffb800] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-0 top-3 inline-flex rounded-none bg-[#ffb800] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0f2847]">
          {categoryLabel}
        </span>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8">
          <h3 className="font-display text-base font-bold leading-snug tracking-tight text-white md:text-lg">
            {project.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-white px-3 py-3 dark:bg-[#12253f]">
        {project.shortPresentation ? (
          <p className="line-clamp-2 flex-1 text-[0.78rem] leading-snug text-slate-600 dark:text-[#93c5fc]/85">
            {project.shortPresentation}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-3 flex items-stretch gap-1.5">
          <a
            href={exploreHref}
            target={exploreExternal ? "_blank" : undefined}
            rel={exploreExternal ? "noopener noreferrer" : undefined}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-none bg-[#ffb800] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0f2847] transition-colors hover:bg-[#e6a600]"
          >
            {labels.viewProject}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>

          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labels.viewGithub}
              title={labels.viewGithub}
              className="inline-flex w-9 shrink-0 items-center justify-center rounded-none border border-[#0f2847]/15 bg-[#0f2847] text-white transition-colors hover:border-[#ffb800] hover:bg-[#173a62] dark:border-white/20"
            >
              <GithubLogo weight="fill" className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

const Projects = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const catFromUrl = searchParams.get("cat")?.trim() || "";

  const [activeCategory, setActiveCategory] = useState(catFromUrl || ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiProjects, setApiProjects] = useState<ProjectShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  const demoProjects = useMemo((): ProjectShowcase[] => {
    if (!USE_DEMO_PROJECTS) return [];
    return DEMO_PROJECTS.map((demo) => ({
      id: demo.id,
      slug: demo.slug,
      title: t(demo.titleKey),
      category: demo.category,
      shortPresentation: t(demo.descKey),
      imageUrl: demo.imageUrl,
      liveUrl: demo.liveUrl,
      githubUrl: demo.githubUrl,
    }));
  }, [t, i18n.language]);

  const projectShowcases = useMemo(() => {
    if (!demoProjects.length) return apiProjects;

    const apiTitles = new Set(apiProjects.map((p) => normalizeText(p.title)));
    const apiSlugs = new Set(apiProjects.map((p) => p.slug));
    const demosOnly = demoProjects.filter(
      (demo) => !apiTitles.has(normalizeText(demo.title)) && !apiSlugs.has(demo.slug)
    );

    return [...apiProjects, ...demosOnly];
  }, [apiProjects, demoProjects]);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const projects = await fetchProjects(100);
        if (cancelled) return;

        setApiProjects(
          projects.map((project) => {
            const slug = (project.slug || "").trim() || slugify(project.title) || project.id;
            const liveUrl = project.live_url?.trim() || null;
            const repo = project.repository_url?.trim() || null;
            const githubUrl = isPublicGithubUrl(repo) ? repo : null;

            return {
              id: project.id,
              slug,
              title: project.title,
              category: (project.category || "").trim(),
              shortPresentation: stripHtml(project.description),
              imageUrl: project.featured_image || null,
              liveUrl,
              githubUrl,
            };
          })
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        if (!cancelled) setApiProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveCategory(catFromUrl || ALL_CATEGORY);
  }, [catFromUrl]);

  const selectCategory = useCallback(
    (category: string) => {
      setActiveCategory(category);
      if (category === ALL_CATEGORY) {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ cat: category }, { replace: true });
      }
    },
    [setSearchParams]
  );

  const categories = useMemo(() => {
    const fromData = Array.from(
      new Set(projectShowcases.map((project) => project.category).filter(Boolean))
    );
    if (USE_DEMO_PROJECTS) {
      NAV_CATEGORIES.forEach((cat) => {
        if (!fromData.includes(cat)) fromData.push(cat);
      });
    }
    if (catFromUrl && !fromData.includes(catFromUrl)) {
      fromData.push(catFromUrl);
    }
    return fromData.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [projectShowcases, catFromUrl]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return projectShowcases.filter((project) => {
      const categoryOk =
        activeCategory === ALL_CATEGORY || project.category === activeCategory;
      if (!categoryOk) return false;
      if (!queryTokens.length) return true;

      const searchCorpus = normalizeText(
        `${project.title} ${project.category} ${project.shortPresentation}`
      );

      return queryTokens.every((token) => searchCorpus.includes(token));
    });
  }, [activeCategory, searchQuery, projectShowcases]);

  const emptyMessage =
    activeCategory !== ALL_CATEGORY && !searchQuery.trim()
      ? t("projects.emptyCategory")
      : t("projects.empty");

  const cardLabels = {
    viewProject: t("projects.viewProject"),
    viewGithub: t("projects.viewGithub"),
  };

  return (
    <div>
      <section
        className="relative overflow-hidden py-20"
        style={{
          backgroundImage: "url('/projects/hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className={`relative z-10 text-center ${PAGE_SHELL}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4 font-display text-4xl font-bold text-[#ffb800] md:text-5xl">
              {t("projects.title")}
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-white/90">{t("projects.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="relative border-t border-border/60 bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 dark:from-[#0a1628] dark:via-background dark:to-[#0a1628]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffb800]/50 to-transparent" />
        <div className={`relative ${PAGE_SHELL}`}>
          <div className="mb-8 space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => selectCategory(ALL_CATEGORY)}
                className={`rounded-none px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  activeCategory === ALL_CATEGORY
                    ? "bg-[#ffb800] text-[#0f2847]"
                    : "border border-[#0f2847]/15 bg-white text-[#0f2847] hover:border-[#ffb800] dark:border-white/15 dark:bg-[#12253f] dark:text-white"
                }`}
              >
                {t("projects.all")}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`rounded-none px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                    activeCategory === category
                      ? "bg-[#ffb800] text-[#0f2847]"
                      : "border border-[#0f2847]/15 bg-white text-[#0f2847] hover:border-[#ffb800] dark:border-white/15 dark:bg-[#12253f] dark:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("projects.searchPlaceholder")}
                aria-label={t("projects.searchPlaceholder")}
                className="w-full rounded-none border border-[#0f2847]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ffb800]/35 dark:border-white/15 dark:bg-[#12253f]"
              />
            </div>
          </div>

          {loading ? (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
              aria-live="polite"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-none border border-[#0f2847]/10 bg-muted/50 dark:border-white/10"
                >
                  <div className="aspect-[16/7] bg-muted" />
                  <div className="h-20 bg-muted/40" />
                </div>
              ))}
              <span className="sr-only">{t("projects.loading")}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, i) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  delay={Math.min(i * 0.06, 0.3)}
                  fallbackCategory={t("projects.fallbackCategory")}
                  labels={cardLabels}
                />
              ))}

              {filteredProjects.length === 0 && (
                <div className="rounded-none border border-border/70 bg-card/60 p-5 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
                  {emptyMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
