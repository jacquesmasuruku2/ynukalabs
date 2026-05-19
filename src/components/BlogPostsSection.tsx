import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { strapiFetch } from "@/lib/strapi";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export interface BlogPost {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
}

type BlogPostsSectionProps = {
  /** Sur la page /blog uniquement : le hero porte déjà le titre */
  showHeading?: boolean;
};

const BlogPostsSection = ({ showHeading = true }: BlogPostsSectionProps) => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const isFr = i18n.language === "fr";

  useEffect(() => {
    const fetchPosts = async () => {
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
          "/api/blog-posts?filters[published][$eq]=true&sort=createdAt:desc&pagination[pageSize]=100"
        );
        const items = res.data || [];
        const mapped: BlogPost[] = items
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
        if (mapped.length) setPosts(mapped);
      } catch {
        // fallback hardcoded
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const hardcodedPosts: BlogPost[] = [
    { id: "1", title: t("blog.p1Title"), title_fr: null, excerpt: t("blog.p1Excerpt"), excerpt_fr: null, category: "Announcement", created_at: "2026-03-01" },
    { id: "2", title: t("blog.p2Title"), title_fr: null, excerpt: t("blog.p2Excerpt"), excerpt_fr: null, category: "Event Recap", created_at: "2026-02-20" },
    { id: "3", title: t("blog.p3Title"), title_fr: null, excerpt: t("blog.p3Excerpt"), excerpt_fr: null, category: "Education", created_at: "2026-02-10" },
    { id: "4", title: t("blog.p4Title"), title_fr: null, excerpt: t("blog.p4Excerpt"), excerpt_fr: null, category: "Innovation", created_at: "2026-01-28" },
    { id: "5", title: t("blog.p5Title"), title_fr: null, excerpt: t("blog.p5Excerpt"), excerpt_fr: null, category: "Community", created_at: "2026-01-15" },
    { id: "6", title: t("blog.p6Title"), title_fr: null, excerpt: t("blog.p6Excerpt"), excerpt_fr: null, category: "Education", created_at: "2026-01-05" },
  ];

  const displayPosts = posts.length > 0 ? posts : hardcodedPosts;

  const getTitle = (p: BlogPost) => (isFr && p.title_fr ? p.title_fr : p.title);
  const getExcerpt = (p: BlogPost) => (isFr && p.excerpt_fr ? p.excerpt_fr : p.excerpt);

  return (
    <section id="blog" className="scroll-mt-24 py-16">
      <div className="container mx-auto px-4">
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
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">{t("blog.subtitle")}</p>
          </motion.div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post, i) => (
              <motion.div
                key={post.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-colors flex flex-col"
              >
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full self-start">{post.category}</span>
                <h3 className="font-display text-lg font-semibold mt-4 mb-2">{getTitle(post)}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{getExcerpt(post)}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="link" className="p-0 h-auto text-primary text-sm" asChild>
                    <Link to={`/blog/${post.id}`}>
                      {t("blog.readMore")} <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPostsSection;
