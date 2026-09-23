import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calendar } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";
import { withTimeout } from "@/lib/utils";

const PAGE_SHELL = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
  cover_url: string | null;
}

type BlogPostsSectionProps = {
  /** Sur la page /blog uniquement : le hero porte déjà le titre */
  showHeading?: boolean;
};

const BlogPostsSection = ({ showHeading = true }: BlogPostsSectionProps) => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const isFr = i18n.language === "fr";

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await withTimeout(fetchBlogPosts(100));
        setPosts(posts);
        setLoadError(false);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const getTitle = (p: BlogPost) => (isFr && p.title_fr ? p.title_fr : p.title);
  const getExcerpt = (p: BlogPost) => (isFr && p.excerpt_fr ? p.excerpt_fr : p.excerpt);
  const getHref = (p: BlogPost) => `/blog/${p.slug || p.id}`;

  return (
    <section id="blog" className="scroll-mt-24 py-16">
      <div className={PAGE_SHELL}>
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              <span className="gradient-text">{t("blog.title")}</span>
            </h2>
            <p className="typo-lead mx-auto mt-3 max-w-2xl text-muted-foreground">{t("blog.subtitle")}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-card border border-[#0f2847]/10 dark:border-white/10"
              >
                <div className="aspect-[16/9] bg-muted" />
                <div className="h-32 bg-muted/40" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{t("common.loadError")}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{t("home.noBlogPosts")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const title = getTitle(post);
              const excerpt = getExcerpt(post);

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3) }}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-[#0f2847]/12 bg-white transition-colors duration-300 hover:border-[#ffb800]/70 dark:border-white/10 dark:bg-[#12253f]"
                >
                  <Link to={getHref(post)} className="relative block aspect-[16/9] overflow-hidden bg-[#152a48]">
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e4a7e] to-[#0f2847]">
                        <span className="font-display text-2xl font-bold text-white/25">Ynuka</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2847]/55 via-transparent to-transparent opacity-80" />
                    {post.category ? (
                      <span className="absolute left-0 top-3 bg-[#ffb800] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0f2847]">
                        {post.category}
                      </span>
                    ) : null}
                  </Link>

                  <div className="flex flex-1 flex-col px-3.5 py-3.5">
                    <h3 className="font-display text-[0.98rem] font-bold leading-snug tracking-tight text-[#0f2847] dark:text-white md:text-base">
                      <Link to={getHref(post)} className="transition-colors hover:text-[#ffb800]">
                        {title}
                      </Link>
                    </h3>

                    {excerpt ? (
                      <p className="mt-1.5 line-clamp-2 flex-1 text-[0.8rem] leading-snug text-slate-600 dark:text-[#93c5fc]/85">
                        {excerpt}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#0f2847]/08 pt-3 dark:border-white/10">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-white/45">
                        <Calendar className="h-3 w-3" aria-hidden />
                        {new Date(post.created_at).toLocaleDateString(i18n.language)}
                      </span>
                      <Link
                        to={getHref(post)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#0f2847] transition-colors hover:text-[#ffb800] dark:text-[#ffb800]"
                      >
                        {t("blog.readMore")}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPostsSection;
