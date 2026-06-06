import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchBlogPosts } from "@/lib/api";

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
    const loadPosts = async () => {
      try {
        const posts = await fetchBlogPosts(100);
        setPosts(posts);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        // No fallback - only database data will be displayed
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const displayPosts = posts;

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
        ) : displayPosts.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucun article de blog disponible pour le moment.</p>
          </div>
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
