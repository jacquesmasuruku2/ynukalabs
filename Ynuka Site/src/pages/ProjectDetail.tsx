import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react";
import { fetchProjectBySlug } from "@/lib/api";
import { DEMO_PROJECTS, USE_DEMO_PROJECTS } from "@/data/demoProjects";
import RichTextDisplay from "@/components/RichTextDisplay";

const FALLBACK_IMAGE = "/logo.png";
const PAGE_SHELL = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10";

type ProjectDetailData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  featured_image: string | null;
  repository_url: string | null;
  live_url: string | null;
};

const isPublicGithubUrl = (url: string | null | undefined): url is string => {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "github.com" || host.endsWith(".github.io");
  } catch {
    return /github\.com/i.test(url);
  }
};

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await fetchProjectBySlug(slug);
        if (cancelled) return;
        if (data) {
          setProject(data);
          return;
        }
        if (USE_DEMO_PROJECTS) {
          const demo = DEMO_PROJECTS.find((p) => p.slug === slug);
          if (demo) {
            setProject({
              id: demo.id,
              slug: demo.slug,
              title: t(demo.titleKey),
              category: demo.category,
              description: `<p>${t(demo.descKey)}</p>`,
              featured_image: demo.imageUrl,
              repository_url: demo.githubUrl,
              live_url: demo.liveUrl,
            });
            return;
          }
        }
        setProject(null);
        setNotFound(true);
      } catch {
        if (!cancelled) {
          setProject(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t("projects.loading")}
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className={`${PAGE_SHELL} py-20 text-center`}>
        <p className="text-lg text-muted-foreground">{t("projects.notFound")}</p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("projects.backToList")}
        </Link>
      </div>
    );
  }

  const githubUrl = isPublicGithubUrl(project.repository_url) ? project.repository_url : null;
  const liveUrl = project.live_url?.trim() || null;
  const hasImage = Boolean(project.featured_image);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0a1628] dark:via-background dark:to-[#0a1628]">
      <header className="relative overflow-hidden bg-[#0f2847] text-white">
        <div className={`${PAGE_SHELL} relative z-10 py-10 md:py-14`}>
          <Link
            to="/projects"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-[#ffb800]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("projects.backToList")}
          </Link>

          {project.category ? (
            <span className="mb-4 inline-flex rounded-none bg-[#ffb800] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0f2847]">
              {project.category}
            </span>
          ) : null}

          <h1 className="max-w-3xl font-display text-3xl font-bold tracking-tight md:text-5xl">
            {project.title}
          </h1>
        </div>
      </header>

      <section className={`${PAGE_SHELL} py-10 md:py-14`}>
        <article className="mx-auto max-w-3xl">
          <div className="mb-8 overflow-hidden rounded-card border border-[#0f2847]/12 bg-[#152a48] dark:border-white/10">
            <div className="relative aspect-[16/8] bg-[#152a48]">
              <img
                src={project.featured_image || FALLBACK_IMAGE}
                alt={project.title}
                className={
                  hasImage
                    ? "h-full w-full object-cover"
                    : "absolute inset-0 m-auto h-12 w-12 object-contain opacity-50"
                }
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.endsWith(FALLBACK_IMAGE)) return;
                  img.src = FALLBACK_IMAGE;
                  img.className = "absolute inset-0 m-auto h-12 w-12 object-contain opacity-50";
                }}
              />
            </div>
          </div>

          <div className="prose prose-slate max-w-none dark:prose-invert">
            {project.description?.trim() ? (
              <RichTextDisplay content={project.description} />
            ) : (
              <p className="text-muted-foreground">{t("projects.noDescription")}</p>
            )}
          </div>

          {(liveUrl || githubUrl) && (
            <div className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-8">
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#ffb800] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#0f2847] transition hover:bg-[#e6a600]"
                >
                  {t("projects.openLive")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
              {githubUrl ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[#0f2847]/20 bg-[#0f2847] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-[#ffb800] dark:border-white/20"
                >
                  <GithubLogo weight="fill" className="h-4 w-4" aria-hidden />
                  {t("projects.viewGithub")}
                </a>
              ) : null}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default ProjectDetail;
