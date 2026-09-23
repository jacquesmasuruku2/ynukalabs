import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft, Share2, MessageCircle, Link as LinkIcon } from "lucide-react";
import { FacebookLogo, TelegramLogo, XLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactionBar from "@/components/ReactionBar";
import { useToast } from "@/hooks/use-toast";
import { fetchBlogComments, fetchBlogPost, submitBlogComment } from "@/lib/api";
import RichTextDisplay from "@/components/RichTextDisplay";
import { authService } from "@/lib/auth";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  title_fr: string | null;
  content: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  created_at: string;
  cover_url: string | null;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const BlogPost = () => {
  const { id: slugOrId } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isFr = i18n.language === "fr";

  const [post, setPost] = useState<BlogPostData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(authService.getUser());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: "", author_email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const postData = await fetchBlogPost(slugOrId);
        setPost(postData);
        const articleId = postData?.id || slugOrId;
        try {
          const items = await fetchBlogComments(articleId);
          setComments(items.map(mapComment));
        } catch {
          setComments([]);
        }
      } catch {
        setPost(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slugOrId]);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const handleGoogleSignIn = () => {
    if (typeof window !== "undefined" && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: any) => {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const userData = JSON.parse(jsonPayload);
          const authUser = {
            email: userData.email,
            name: userData.name,
            avatar: userData.picture,
          };
          
          authService.signIn(authUser);
          setUser(authUser);
          setShowAuthDialog(false);
          setIsCommentFormOpen(true);
          
          toast({
            title: isFr ? "Connexion réussie" : "Signed in successfully",
            description: isFr 
              ? `Bienvenue, ${authUser.name}` 
              : `Welcome, ${authUser.name}`,
          });
        },
      });
      
      const buttonDiv = document.getElementById('google-signin-button-blog');
      if (buttonDiv) {
        (window as any).google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: '100%',
        });
      }
    }
  };

  useEffect(() => {
    if (showAuthDialog && typeof window !== "undefined" && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: any) => {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const userData = JSON.parse(jsonPayload);
          const authUser = {
            email: userData.email,
            name: userData.name,
            avatar: userData.picture,
          };
          
          authService.signIn(authUser);
          setUser(authUser);
          setShowAuthDialog(false);
          setIsCommentFormOpen(true);
          
          toast({
            title: isFr ? "Connexion réussie" : "Signed in successfully",
            description: isFr 
              ? `Bienvenue, ${authUser.name}` 
              : `Welcome, ${authUser.name}`,
          });
        },
      });
      
      setTimeout(() => {
        const buttonDiv = document.getElementById('google-signin-button-blog');
        if (buttonDiv) {
          (window as any).google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: '100%',
          });
        }
      }, 100);
    }
  }, [showAuthDialog]);

  const mapComment = (comment: unknown): Comment => {
    const item = comment as {
      id?: string | number;
      author_name?: string;
      content?: string;
      created_at?: string;
      attributes?: { author_name?: string; content?: string; createdAt?: string; created_at?: string };
    };
    return {
      id: String(item.id ?? crypto.randomUUID()),
      author_name: item.attributes?.author_name ?? item.author_name ?? "",
      content: item.attributes?.content ?? item.content ?? "",
      created_at: item.attributes?.createdAt ?? item.attributes?.created_at ?? item.created_at ?? new Date().toISOString(),
    };
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id) return;
    setSubmitting(true);
    try {
      const createdComment = await submitBlogComment({
        articleId: post.id,
        authorName: commentForm.author_name,
        authorEmail: commentForm.author_email,
        content: commentForm.content,
      });

      toast({ title: t("blog.commentAdded") });
      setComments((current) => [...current, mapComment(createdComment)]);
      setCommentForm({ author_name: "", author_email: "", content: "" });
      setIsCommentFormOpen(false);
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t("blog.linkCopied") });
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  if (loading) return <div className="py-32 text-center text-muted-foreground">{t("admin.loading")}</div>;
  if (!post) return (
    <div className="py-32 text-center">
      <p className="text-muted-foreground mb-4">{t("blog.notFound")}</p>
      <Button variant="outline-glow" asChild><Link to="/resources#blog">{t("blog.backToBlog")}</Link></Button>
    </div>
  );

  const title = isFr && post.title_fr ? post.title_fr : post.title;
  const content = post.content;

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
          {post.cover_url && <img src={post.cover_url} alt={title} className="w-full rounded-xl mb-8 object-cover max-h-96" />}
          
          {content ? (
            <RichTextDisplay content={content} className="mb-12 text-foreground" />
          ) : (
            <div className="prose prose-invert mb-12 text-foreground">{t("blog.noContent")}</div>
          )}

          {/* Share */}
          <div className="mb-12 flex flex-wrap items-center gap-3 border-t border-b border-border py-4">
            <ReactionBar storageKey={`article-${post.id}`} initialThumbs={Math.floor(Math.random() * 48)} initialHearts={Math.floor(Math.random() * 26)} />
            <button
              type="button"
              onClick={shareNative}
              aria-label={t("blog.share")}
              title={t("blog.share")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Share2 className="h-4 w-4" />
              {t("blog.share")}
            </button>
            <button
              type="button"
              onClick={() => shareOn("twitter")}
              aria-label="X"
              title="X"
              className="rounded-lg bg-secondary p-2 transition-colors hover:bg-primary/20"
            >
              <XLogo weight="fill" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => shareOn("facebook")}
              aria-label="Facebook"
              title="Facebook"
              className="rounded-lg bg-secondary p-2 transition-colors hover:bg-primary/20"
            >
              <FacebookLogo weight="fill" className="h-5 w-5 text-[#1877F2]" />
            </button>
            <button
              type="button"
              onClick={() => shareOn("telegram")}
              aria-label="Telegram"
              title="Telegram"
              className="rounded-lg bg-secondary p-2 transition-colors hover:bg-primary/20"
            >
              <TelegramLogo weight="fill" className="h-5 w-5 text-[#26A5E4]" />
            </button>
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copier le lien"
              title="Copier le lien"
              className="rounded-lg bg-secondary p-2 transition-colors hover:bg-primary/20"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Commentaires */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {t("blog.comments")} ({comments.length})
            </h2>

            {comments.map((c) => (
              <div key={c.id} className="glass mb-4 rounded-card border border-border bg-card/80 p-4 text-card-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
                <div className="mt-3 flex items-center justify-end">
                  <ReactionBar storageKey={`blog-comment-${c.id}`} initialThumbs={Math.floor(Math.random() * 18)} initialHearts={Math.floor(Math.random() * 12)} compact />
                </div>
              </div>
            ))}

            {!isCommentFormOpen && (
              <Button type="button" variant="glow" className="mt-6" onClick={() => {
                if (!user) {
                  setShowAuthDialog(true);
                } else {
                  setIsCommentFormOpen(true);
                }
              }}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("blog.addComment")}
              </Button>
            )}

            {isCommentFormOpen && <form onSubmit={handleComment} className="glass mt-6 space-y-4 rounded-card border border-border/70 bg-card/80 p-6 text-card-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <h3 className="font-display font-semibold text-foreground">{t("blog.addComment")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder={t("blog.yourName")}
                  value={commentForm.author_name}
                  onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })}
                  required
                  className="dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
                />
                <Input
                  type="email"
                  placeholder={t("blog.yourEmail")}
                  value={commentForm.author_email}
                  onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })}
                  required
                  className="dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
                />
              </div>
              <Textarea
                placeholder={t("blog.yourComment")}
                value={commentForm.content}
                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                required
                rows={4}
                className="dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="glow" disabled={submitting}>
                  {submitting ? t("events.submitting") : t("blog.submitComment")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCommentFormOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>}
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      {showAuthDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="font-display text-xl font-semibold mb-2">
              {isFr ? "Connectez-vous pour continuer" : "Sign in to continue"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isFr 
                ? "Connectez-vous avec votre compte Google pour commenter ou liker." 
                : "Sign in with your Google account to comment or like."}
            </p>
            <div className="flex flex-col gap-3">
              <div id="google-signin-button-blog" className="w-full"></div>
              <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                {isFr ? "Annuler" : "Cancel"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
