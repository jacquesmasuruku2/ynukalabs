import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft, Share2, MessageCircle, Send, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";

interface BlogPostData {
  id: string;
  title: string;
  title_fr: string | null;
  content: string | null;
  content_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
  image_url: string | null;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isFr = i18n.language === "fr";

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ author_name: "", author_email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      type StrapiBlogPostItem = {
        id: string | number;
        attributes?: {
          title?: string;
          title_fr?: string | null;
          content?: string | null;
          content_fr?: string | null;
          excerpt?: string | null;
          excerpt_fr?: string | null;
          category?: string;
          published?: boolean;
          createdAt?: string;
          created_at?: string;
          image?: unknown;
        };
      };

      type StrapiBlogCommentItem = {
        id: string | number;
        attributes?: {
          author_name?: string;
          content?: string;
          createdAt?: string;
          created_at?: string;
        };
      };

      const [postRes, commentsRes] = await Promise.all([
        strapiFetch<{ data: unknown }>(`/api/blog-posts/${id}?populate=image`),
        strapiFetch<{ data: unknown[] }>(
          `/api/blog-comments?filters[post][id][$eq]=${id}&sort=createdAt:asc&pagination[pageSize]=100`
        ),
      ]);
      const detail = postRes.data as StrapiBlogPostItem | undefined;
      if (detail?.attributes) {
        const attrs = detail.attributes;
        if (attrs.published === true) {
          setPost({
            id: String(detail.id),
            title: attrs.title,
            title_fr: attrs.title_fr ?? null,
            content: attrs.content ?? null,
            content_fr: attrs.content_fr ?? null,
            excerpt: attrs.excerpt ?? null,
            excerpt_fr: attrs.excerpt_fr ?? null,
            category: attrs.category,
            created_at: attrs.createdAt ?? attrs.created_at ?? "",
            image_url: mediaToUrl(attrs.image),
          });
        } else {
          setPost(null);
        }
      }

      if (commentsRes?.data?.length) {
        setComments(
          commentsRes.data.map((c) => {
            const item = c as StrapiBlogCommentItem;
            return {
              id: String(item.id),
              author_name: item.attributes?.author_name ?? "",
              content: item.attributes?.content ?? "",
              created_at: item.attributes?.createdAt ?? item.attributes?.created_at ?? "",
            };
          })
        );
      } else {
        setComments([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await strapiFetch("/api/blog-comments", {
        method: "POST",
        body: JSON.stringify({
          data: {
            post: id,
            author_name: commentForm.author_name,
            author_email: commentForm.author_email,
            content: commentForm.content,
          },
        }),
      });

      toast({ title: t("blog.commentAdded") });
      setCommentForm({ author_name: "", author_email: "", content: "" });

      const commentsRes = await strapiFetch<{ data: unknown[] }>(
        `/api/blog-comments?filters[post][id][$eq]=${id}&sort=createdAt:asc&pagination[pageSize]=100`
      );
      setComments(
        commentsRes.data.map((c) => {
          const item = c as { id: string | number; attributes?: { author_name?: string; content?: string; createdAt?: string; created_at?: string } };
          return {
            id: String(item.id),
            author_name: item.attributes?.author_name ?? "",
            content: item.attributes?.content ?? "",
            created_at: item.attributes?.createdAt ?? item.attributes?.created_at ?? "",
          };
        })
      );
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
    setSubmitting(false);
  };

  const shareUrl = window.location.href;
  const shareTitle = post ? (isFr && post.title_fr ? post.title_fr : post.title) : "";

  const shareOn = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    };
    window.open(urls[platform], "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: t("blog.linkCopied") });
  };

  if (loading) return <div className="py-32 text-center text-muted-foreground">{t("admin.loading")}</div>;
  if (!post) return (
    <div className="py-32 text-center">
      <p className="text-muted-foreground mb-4">{t("blog.notFound")}</p>
      <Button variant="outline-glow" asChild><Link to="/resources#blog">{t("blog.backToBlog")}</Link></Button>
    </div>
  );

  const title = isFr && post.title_fr ? post.title_fr : post.title;
  const content = isFr && post.content_fr ? post.content_fr : post.content;

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <Link to="/resources#blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-4 w-4" /> {t("blog.backToBlog")}
            </Link>
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {post.image_url && <img src={post.image_url} alt={title} className="w-full rounded-xl mb-8 object-cover max-h-96" />}
          
          <div className="prose prose-invert max-w-none mb-12 text-foreground leading-relaxed whitespace-pre-wrap">
            {content || t("blog.noContent")}
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-12">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("blog.share")}:</span>
            <button onClick={() => shareOn("twitter")} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Twitter className="h-4 w-4" /></button>
            <button onClick={() => shareOn("facebook")} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Facebook className="h-4 w-4" /></button>
            <button onClick={() => shareOn("telegram")} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Send className="h-4 w-4" /></button>
            <button onClick={copyLink} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><LinkIcon className="h-4 w-4" /></button>
          </div>

          {/* Commentaires */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {t("blog.comments")} ({comments.length})
            </h2>

            {comments.map((c) => (
              <div key={c.id} className="glass rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
              </div>
            ))}

            <form onSubmit={handleComment} className="glass rounded-xl p-6 mt-6 space-y-4">
              <h3 className="font-display font-semibold">{t("blog.addComment")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder={t("blog.yourName")} value={commentForm.author_name} onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })} required />
                <Input type="email" placeholder={t("blog.yourEmail")} value={commentForm.author_email} onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })} required />
              </div>
              <Textarea placeholder={t("blog.yourComment")} value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} required rows={4} />
              <Button type="submit" variant="glow" disabled={submitting}>
                {submitting ? t("events.submitting") : t("blog.submitComment")}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
