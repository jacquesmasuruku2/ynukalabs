import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { fetchProjects } from "@/lib/api";
import { DEMO_PROJECTS, USE_DEMO_PROJECTS } from "@/data/demoProjects";
import { cn } from "@/lib/utils";

const ALL_CATEGORY = "__all__";
const FALLBACK_IMAGE = "/mission5.jpg";
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
}: {
  project: ProjectShowcase;
  delay: number;
  fallbackCategory: string;
}) {
  const categoryLabel = project.category || fallbackCategory;
  const detailHref = `/projects/${project.slug}`;
  const hasImage = Boolean(project.imageUrl);

  return (
    <motion.article
      id={project.slug}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      viewport={{ once: true }}
      className="group relative flex h-full flex-col"
    >
      <Link to={detailHref} className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[16/9]">
        <img
          src={project.imageUrl || FALLBACK_IMAGE}
          alt={project.title}
          className={
            hasImage
              ? "h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
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
        <span className="absolute bottom-3 left-3 inline-flex rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#1554f6] shadow-sm">
          {categoryLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-2 pt-3">
        <Link to={detailHref} className="font-display text-base font-bold leading-[1.05] tracking-tight text-[#061a4b] transition-colors hover:text-[#1554f6] md:text-lg">
          {project.title}
        </Link>
        {project.shortPresentation ? (
          <Link to={detailHref} className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500 hover:text-[#061a4b]">
            {project.shortPresentation}
          </Link>
        ) : null}
        <span className="mt-3 text-[10px] font-medium text-slate-400">{categoryLabel}</span>
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
  const [loadError, setLoadError] = useState(false);

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
      setLoadError(false);
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
        if (!cancelled) {
          setApiProjects([]);
          setLoadError(true);
        }
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
    const activeNorm = normalizeText(activeCategory);

    return projectShowcases.filter((project) => {
      const categoryOk =
        activeCategory === ALL_CATEGORY ||
        normalizeText(project.category) === activeNorm;
      if (!categoryOk) return false;
      if (!queryTokens.length) return true;

      const searchCorpus = normalizeText(
        `${project.title} ${project.category} ${project.shortPresentation}`
      );

      return queryTokens.every((token) => searchCorpus.includes(token));
    });
  }, [activeCategory, searchQuery, projectShowcases]);

  const emptyMessage = loadError
    ? t("projects.loadError", {
      defaultValue: "Impossible de charger les projets. Vérifiez que l’admin API est accessible.",
    })
    : activeCategory !== ALL_CATEGORY && !searchQuery.trim()
      ? t("projects.emptyCategory")
      : t("projects.empty");

  const heroPills = [
    { id: "web3", label: "Web 3" },
    { id: "innovation", label: "Innovation" },
    { id: "technologie", label: "Technologie" },
    { id: "agriculture", label: "Agriculture" },
    { id: "environnement", label: "Environnement" },
  ];

  const handlePillClick = (label: string) => {
    const norm = normalizeText(label);
    const foundCategory = categories.find((c) => normalizeText(c) === norm);
    if (foundCategory) {
      if (activeCategory === foundCategory) {
        selectCategory(ALL_CATEGORY);
      } else {
        selectCategory(foundCategory);
        setSearchQuery("");
      }
    } else {
      if (normalizeText(searchQuery) === norm) {
        setSearchQuery("");
      } else {
        setSearchQuery(label);
        selectCategory(ALL_CATEGORY);
      }
    }

    const target = document.getElementById("projects-list");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isPillActive = (pill: (typeof heroPills)[0]) => {
    const norm = normalizeText(pill.label);
    return normalizeText(activeCategory) === norm || normalizeText(searchQuery) === norm;
  };

  return (
    <div>
      <section className="relative overflow-hidden pb-6 pt-10 sm:pb-8 sm:pt-12">
        <div className={`relative ${PAGE_SHELL}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-[#ead836] sm:text-[2.65rem] md:text-5xl">
              {t("projects.title")}
            </h1>
            <p className="typo-lead mx-auto mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
              {t("projects.subtitle")}
            </p>
          </motion.div>

          <div className="relative left-1/2 mt-8 w-full max-w-[1100px] -translate-x-1/2 sm:mt-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="relative w-full"
            >
              {/* SVG Cutout ClipPath with clean rounded-xl geometry (R = 16px) */}
              <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
                <defs>
                  <clipPath id="projects-hero-photo-cutout" clipPathUnits="objectBoundingBox">
                    <path d="M 0.30 0 H 0.98 Q 1 0 1 0.04 V 0.46 Q 1 0.50 0.98 0.50 H 0.57 Q 0.55 0.50 0.55 0.54 V 0.96 Q 0.55 1 0.53 1 H 0.02 Q 0 1 0 0.96 V 0.42 Q 0 0.38 0.02 0.38 H 0.26 Q 0.28 0.38 0.28 0.34 V 0.04 Q 0.28 0 0.30 0 Z" />
                  </clipPath>
                </defs>
              </svg>

              {/* Main Photo with Cutout & rounded-xl */}
              <div
                className="relative z-0 aspect-[2/1] w-full overflow-hidden rounded-xl"
                style={{ clipPath: "url(#projects-hero-photo-cutout)" }}
              >
                <img
                  src="/projects/mtidano.jpg"
                  alt=""
                  className="h-full w-full object-cover object-center rounded-xl"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1d496af7] via-[#0f3847]/40 to-[#0c2648] rounded-xl" />
              </div>

              {/* Top-Left Web3 Overlay Box */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.36 }}
                className="absolute left-0 top-[3%] z-10 hidden w-[25%] rounded-xl bg-[#06051a] p-4 text-white md:block"
              >
                <p className="font-display text-[clamp(1.5rem,4.3vw,5rem)] font-bold leading-none">Web3</p>
                <p className="mt-[clamp(0.35rem,1vw,1.25rem)] text-[clamp(0.5rem,0.85vw,0.9rem)] font-medium leading-snug text-white/70">
                  {t("projects.heroWeb3")}
                </p>
              </motion.div>

              {/* Bottom-Right Pill Buttons - Perfectly contained within the cutout area */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 md:absolute md:bottom-0 md:right-0 md:mt-0 md:h-[50%] md:w-[45%] md:flex-wrap md:content-center md:items-center md:justify-start md:gap-2 md:pl-6 md:pr-4 lg:gap-2.5 lg:pl-10 z-10"
              >
                {heroPills.map((pill) => {
                  const active = isPillActive(pill);
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => handlePillClick(pill.label)}
                      className={cn(
                        "group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-md cursor-pointer whitespace-nowrap",
                        active
                          ? "bg-[#ffb800] text-[#0f2847] shadow-[0_0_18px_rgba(255,184,0,0.5)] scale-105"
                          : "border border-white/20 bg-[#0f2847]/85 text-white backdrop-blur-md hover:border-[#ffb800]/80 hover:bg-[#ffb800] hover:text-[#0f2847] hover:scale-105"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors shrink-0",
                          active
                            ? "bg-[#0f2847]"
                            : "bg-[#ffb800] group-hover:bg-[#0f2847]"
                        )}
                        aria-hidden="true"
                      />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="projects-list" className="relative scroll-mt-24 py-8 sm:py-12">
        <div className={PAGE_SHELL}>
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_14rem]">
            <div>
              <div className="mb-8 rounded-2xl border border-white/70 bg-white/45 p-4 text-left shadow-[0_12px_32px_rgba(6,26,75,0.07)] backdrop-blur-xl sm:p-5 dark:border-white/15 dark:bg-white/5">
                <div className="flex flex-col gap-3 border-b border-[#0f2847]/10 pb-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("projects.searchPlaceholder")}
                      aria-label={t("projects.searchPlaceholder")}
                      className="w-full rounded-xl border border-[#0f2847]/15 bg-white/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1554f6]/20 dark:border-white/15 dark:bg-white/5"
                    />
                  </div>
                  <div className="inline-flex self-end rounded-xl border border-white/75 bg-white/25 p-1 text-xs font-semibold text-[#0f2847] shadow-sm sm:self-auto dark:border-white/15 dark:bg-white/5 dark:text-white">
                    <span className="rounded-lg bg-white/65 px-3 py-1.5 text-[#1554f6]">▦ Grille</span>
                    <span className="px-3 py-1.5 text-slate-400">☰ Liste</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-slate-500">Filtres :</span>
                  <button type="button" onClick={() => selectCategory(ALL_CATEGORY)} className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${activeCategory === ALL_CATEGORY ? "border-[#1554f6] text-[#1554f6]" : "border-[#0f2847]/15 text-[#0f2847] hover:border-[#1554f6]/50 dark:border-white/15 dark:text-white"}`}>
                    {t("projects.all")}
                  </button>
                  {categories.map((category) => (
                    <button key={category} type="button" onClick={() => selectCategory(category)} className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${activeCategory === category ? "border-[#1554f6] text-[#1554f6]" : "border-[#0f2847]/15 text-[#0f2847] hover:border-[#1554f6]/50 dark:border-white/15 dark:text-white"}`}>
                      {category}
                    </button>
                  ))}
                  <button type="button" onClick={() => { setSearchQuery(""); selectCategory(ALL_CATEGORY); }} className="px-2 py-2 text-xs font-medium text-[#1554f6]">Réinitialiser</button>
                  <span className="ml-auto py-2 text-xs text-slate-400">{filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} trouvé{filteredProjects.length > 1 ? "s" : ""}</span>
                </div>
              </div>

              {loading ? (
                <div
                  className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3"
                  aria-busy="true"
                  aria-live="polite"
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse"
                    >
                      <div className="aspect-[16/10] rounded-2xl bg-muted/60 sm:aspect-[16/9]" />
                      <div className="mt-3 h-12 rounded bg-muted/40" />
                    </div>
                  ))}
                  <span className="sr-only">{t("projects.loading")}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project, i) => (
                    <ProjectCard
                      key={project.id || project.slug}
                      project={project}
                      delay={Math.min(i * 0.06, 0.3)}
                      fallbackCategory={t("projects.fallbackCategory")}
                    />
                  ))}

                  {filteredProjects.length === 0 && (
                    <div className="rounded-2xl border border-[#061a4b]/10 p-5 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24">
              <div className="rounded-2xl border border-[#ffb800]/45 p-5 text-[#061a4b]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffb800] text-base">ϟ</span>
                <h2 className="mt-3 font-display text-lg font-bold">Vous avez un projet ?</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Nous sommes là pour vous accompagner et créer des solutions utiles pour votre communauté.</p>
                <Link to="/services" className="mt-5 block rounded-xl bg-[#ffb800] px-3 py-3 text-center text-xs font-bold text-[#061a4b]">Découvrir nos services</Link>
              </div>
              <div className="rounded-2xl border border-[#1554f6]/20 p-5 text-[#061a4b]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1554f6]/20 text-sm text-[#1554f6]">♧</span>
                <h2 className="mt-3 font-display text-lg font-bold">Parlez à nos experts</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">Laissez-nous un message pour prendre rendez-vous avec nous.</p>
                <Link to="/contact" className="mt-5 block rounded-xl border border-[#061a4b] px-3 py-3 text-center text-xs font-bold text-[#061a4b]">Prendre rendez-vous</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
