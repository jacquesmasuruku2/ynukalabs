import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ExternalLink, Search } from "lucide-react";
import { fetchProjects } from "@/lib/api";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Projects = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  type ProjectShowcase = {
    slug: string;
    title: string;
    category: string;
    shortPresentation: string;
    imageUrl: string;
    exploreUrl: string;
    external?: boolean;
  };

  const [projectShowcases, setProjectShowcases] = useState<ProjectShowcase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjects(100);
        setProjectShowcases(
          projects.map((project) => ({
            slug: project.slug,
            title: project.title,
            category: project.category,
            shortPresentation: project.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
            imageUrl: project.featured_image || "/projects/default.jpg",
            exploreUrl: project.live_url || project.repository_url || `/projects#${project.slug}`,
            external: Boolean(project.live_url || project.repository_url),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjectShowcases([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const categories = ["Tous", ...Array.from(new Set(projectShowcases.map((project) => project.category).filter(Boolean)))];

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return projectShowcases.filter((project) => {
      const categoryOk = activeCategory === "Tous" || project.category === activeCategory;
      if (!categoryOk) return false;
      if (!queryTokens.length) return true;

      const searchCorpus = normalizeText(
        `${project.title} ${project.category} ${project.shortPresentation}`
      );

      // "Recherche intelligente" simple: chaque mot saisi doit apparaitre
      return queryTokens.every((token) => searchCorpus.includes(token));
    });
  }, [activeCategory, searchQuery, projectShowcases]);

  return (
    <div>
      <section
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: "url('/projects/hero.PNG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#ffb800]">
              Découvrez nos Projets
            </h1>
            <p className="text-white/90 max-w-2xl mx-auto text-lg font-bold">
              Des solutions Web3 innovantes, des projets environnementaux, hackathons et
              programmes d'education construits et incubes par Ynuka Labs.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="mb-10 space-y-5 text-center">
            <div className="flex flex-wrap justify-center gap-2.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(23,52,168,0.25)]"
                      : "border border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher intelligemment (nom, categorie, mots-cles...)"
                className="w-full rounded-2xl border border-border/80 bg-background py-3 pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Chargement des projets...</div>
          ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, i) => (
              <motion.article
                key={project.slug}
                id={project.slug}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="group flex min-h-[220px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e4a7e] via-[#173a62] to-[#0f2847] p-4 text-white shadow-2xl ring-1 ring-[#3b82f6]/35 md:min-h-[245px] md:p-4"
              >
                <div className="flex h-full flex-col">
                  <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg font-bold leading-[1.12] tracking-tight text-white md:text-xl">
                        {project.title}
                      </h3>
                      <span className="inline-flex rounded-full bg-[#ffb800] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1e3a8a]">
                        {project.category}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[0.92rem] leading-relaxed text-white/75">{project.shortPresentation}</p>
                  </div>

                  <div className="mt-auto overflow-hidden rounded-2xl pt-2">
                    <div className="relative w-full overflow-hidden rounded-xl bg-[#0a3d44] ring-1 ring-[#12B1A6]/25 aspect-[16/5.6] md:aspect-[16/6]">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <a
                    href={project.exploreUrl}
                    target={project.external === false ? undefined : "_blank"}
                    rel={project.external === false ? undefined : "noopener noreferrer"}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-3 py-1.5 text-sm font-bold text-[#1e3a8a] transition-colors hover:bg-[#e6a600]"
                  >
                    Explorer davantage
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            ))}
            {filteredProjects.length === 0 && (
              <div className="rounded-2xl border border-border/70 bg-card/60 p-6 text-center text-muted-foreground md:col-span-2 xl:col-span-3">
                Aucun projet ne correspond a votre recherche.
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
