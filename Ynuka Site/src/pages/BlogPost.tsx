import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft, Share2, MessageCircle, Send, Link as LinkIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchBlogPost } from "@/lib/api";
import { strapiFetch } from "@/lib/strapi";
import RichTextDisplay from "@/components/RichTextDisplay";
import { authService } from "@/lib/auth";

interface BlogPostData {
  id: string;
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
  const { id } = useParams<{ id: string }>();
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
    if (!id) return;
    const fetchData = async () => {
      try {
        const postData = await fetchBlogPost(id);
        setPost(postData);
        const commentsRes = await strapiFetch<{ data?: unknown[]; rows?: unknown[] }>(
          `/api/blog-comments?search=post_id=${encodeURIComponent(id)}&pagination[pageSize]=100`
        );
        const items = commentsRes.data ?? commentsRes.rows ?? [];
        setComments(items.map(mapComment));
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    if (!id) return;
    setSubmitting(true);
    try {
      await strapiFetch("/api/blog-comments", {
        method: "POST",
        body: JSON.stringify({
          data: {
            post_id: id,
            author_name: commentForm.author_name,
            author_email: commentForm.author_email,
            content: commentForm.content,
          },
        }),
      });

      toast({ title: t("blog.commentAdded") });
      setComments((current) => [...current, mapComment({
        id: `local-${Date.now()}`,
        author_name: commentForm.author_name,
        content: commentForm.content,
        created_at: new Date().toISOString(),
      })]);
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
          <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-12">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("blog.share")}:</span>
            <button onClick={() => shareOn("twitter")} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Share2 className="h-4 w-4" /></button>
            <button onClick={() => shareOn("facebook")} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"><Share2 className="h-4 w-4" /></button>
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
              <div key={c.id} className="glass rounded-card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.content}</p>
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

            {isCommentFormOpen && <form onSubmit={handleComment} className="glass rounded-card p-6 mt-6 space-y-4">
              <h3 className="font-display font-semibold">{t("blog.addComment")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input placeholder={t("blog.yourName")} value={commentForm.author_name} onChange={(e) => setCommentForm({ ...commentForm, author_name: e.target.value })} required />
                <Input type="email" placeholder={t("blog.yourEmail")} value={commentForm.author_email} onChange={(e) => setCommentForm({ ...commentForm, author_email: e.target.value })} required />
              </div>
              <Textarea placeholder={t("blog.yourComment")} value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} required rows={4} />
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
