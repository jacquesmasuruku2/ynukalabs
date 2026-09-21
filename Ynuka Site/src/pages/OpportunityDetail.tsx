import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, ExternalLink, Share2, User, LogOut, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareButtons from "@/components/ShareButtons";
import MotivationFormModal from "@/components/MotivationFormModal";
import { fetchOpportunity, applyForOpportunity, submitMotivationForm, uploadCVFile } from "@/lib/api";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface OpportunityData {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  content: string | null;
  content_fr: string | null;
  category: string;
  cover_url: string | null;
  created_at: string;
}

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === "fr";
  const { toast } = useToast();

  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(authService.getUser());
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMotivationForm, setShowMotivationForm] = useState(false);
  const [submittingMotivation, setSubmittingMotivation] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOpportunityData = async () => {
      try {
        const data = await fetchOpportunity(id);
        setOpportunity(data);
      } catch {
        // keep loading false; UI will show not found
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunityData();
  }, [id]);

  useEffect(() => {
    // Check if user is authenticated
    setUser(authService.getUser());
  }, []);

  const handleApply = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!opportunity) return;

    setApplying(true);
    try {
      await applyForOpportunity({
        opportunity_id: opportunity.id,
        user_email: user.email,
        user_name: user.name,
        user_avatar: user.avatar,
      });
      setHasApplied(true);
      toast({
        title: isFr ? "Candidature envoyée" : "Application submitted",
        description: isFr 
          ? "Votre candidature a été envoyée avec succès." 
          : "Your application has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isFr ? "Erreur" : "Error",
        description: error.message || (isFr ? "Une erreur est survenue" : "An error occurred"),
      });
    } finally {
      setApplying(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Load Google Sign-In
    if (typeof window !== "undefined" && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: any) => {
          // Decode JWT token
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
          // Show motivation form after successful Google sign-in
          setShowMotivationForm(true);
          
          toast({
            title: isFr ? "Connexion réussie" : "Signed in successfully",
            description: isFr 
              ? `Bienvenue, ${authUser.name}` 
              : `Welcome, ${authUser.name}`,
          });
        },
      });
      
      // Render the Google Sign-In button
      const buttonDiv = document.getElementById('google-signin-button');
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
    // Initialize Google Sign-In when dialog opens
    if (showAuthDialog && typeof window !== "undefined" && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: (response: any) => {
          // Decode JWT token
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
          // Show motivation form after successful Google sign-in
          setShowMotivationForm(true);
          
          toast({
            title: isFr ? "Connexion réussie" : "Signed in successfully",
            description: isFr 
              ? `Bienvenue, ${authUser.name}` 
              : `Welcome, ${authUser.name}`,
          });
        },
      });
      
      // Render the button after a short delay to ensure the div exists
      setTimeout(() => {
        const buttonDiv = document.getElementById('google-signin-button');
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

  const handleSignOut = () => {
    authService.signOut();
    setUser(null);
    setHasApplied(false);
    toast({
      title: isFr ? "Déconnexion" : "Signed out",
      description: isFr ? "Vous avez été déconnecté" : "You have been signed out",
    });
  };

  const handleMotivationSubmit = async (formData: any) => {
    if (!user || !opportunity) return;

    setSubmittingMotivation(true);
    try {
      // Upload CV if provided
      let cvFileUrl = undefined;
      if (formData.cv_file) {
        try {
          cvFileUrl = await uploadCVFile(formData.cv_file);
        } catch (error: any) {
          // Log error but don't fail the entire submission
          console.error('CV upload failed:', error);
          toast({
            variant: "destructive",
            title: isFr ? "Attention" : "Warning",
            description: isFr 
              ? "Le CV n'a pas pu être téléchargé, mais votre candidature sera quand même envoyée." 
              : "The CV could not be uploaded, but your application will still be submitted.",
          });
        }
      }

      // Submit motivation form
      await submitMotivationForm({
        opportunity_id: opportunity.id,
        user_email: user.email,
        user_name: user.name,
        user_avatar: user.avatar,
        linkedin_url: formData.linkedin_url,
        twitter_url: formData.twitter_url,
        portfolio_url: formData.portfolio_url,
        message: formData.message,
        cv_file_url: cvFileUrl,
      });

      setShowMotivationForm(false);
      setHasApplied(true);
      toast({
        title: isFr ? "Candidature envoyée" : "Application submitted",
        description: isFr 
          ? "Votre candidature a été envoyée avec succès." 
          : "Your application has been submitted successfully.",
      });
    } catch (error: any) {
      // Check for 409 Conflict error (duplicate submission)
      if (error.message.includes('409') || error.message.includes('already submitted')) {
        toast({
          variant: "destructive",
          title: isFr ? "Déjà soumis" : "Already submitted",
          description: isFr 
            ? "Vous avez déjà soumis une candidature pour cette opportunité." 
            : "You have already submitted an application for this opportunity.",
        });
      } else {
        toast({
          variant: "destructive",
          title: isFr ? "Erreur" : "Error",
          description: error.message || (isFr ? "Une erreur est survenue" : "An error occurred"),
        });
      }
    } finally {
      setSubmittingMotivation(false);
    }
  };

  const title = isFr && opportunity?.title_fr ? opportunity.title_fr : opportunity?.title;
  const desc = isFr && opportunity?.excerpt_fr ? opportunity.excerpt_fr : opportunity?.excerpt;
  const content = isFr && opportunity?.content_fr ? opportunity.content_fr : opportunity?.content;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("opportunities.noContent")}</h1>
          <Button asChild>
            <Link to="/opportunities">{t("opportunities.backToOpportunities")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/opportunities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("opportunities.backToOpportunities")}
              </Link>
            </Button>
            
            <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full inline-block mb-4">
              {opportunity.category}
            </span>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {title}
            </h1>
            
            <p className="typo-lead mb-6 text-muted-foreground">
              {desc}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(opportunity.created_at).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>

            {/* User info and apply button */}
            <div className="mt-6 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar && (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
                  <User className="h-4 w-4 mr-2" />
                  {isFr ? "Se connecter" : "Sign in"}
                </Button>
              )}
            </div>
          </motion.div>
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
              {isFr ? "Connectez-vous pour postuler" : "Sign in to apply"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isFr 
                ? "Connectez-vous avec votre compte Google pour postuler à cette opportunité." 
                : "Sign in with your Google account to apply for this opportunity."}
            </p>
            <div className="flex flex-col gap-3">
              <div id="google-signin-button" className="w-full"></div>
              <Button variant="outline" onClick={() => setShowAuthDialog(false)}>
                {isFr ? "Annuler" : "Cancel"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Motivation Form Modal */}
      <MotivationFormModal
        isOpen={showMotivationForm}
        onClose={() => setShowMotivationForm(false)}
        onSubmit={handleMotivationSubmit}
        userEmail={user?.email || ""}
        userName={user?.name || ""}
        isSubmitting={submittingMotivation}
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {opportunity.cover_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 rounded-card overflow-hidden"
              >
                <img
                  src={opportunity.cover_url}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-invert prose-lg prose-headings:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-a:text-primary prose-code:text-foreground max-w-none mb-8 text-foreground leading-relaxed [&>mark]:bg-yellow-500/30 [&>u]:underline [&>p]:text-justify [&>div]:text-justify"
            >
              <div dangerouslySetInnerHTML={{ __html: content || t("opportunities.noContent") }} />
            </motion.div>

            {/* Share */}
            <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-8">
              <span className="text-sm text-muted-foreground">{t("blog.share")}:</span>
              <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={title} />
            </div>

            {/* Apply Button */}
            <div className="flex justify-center">
              {hasApplied ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {isFr ? "Vous avez déjà postulé" : "You have already applied"}
                  </span>
                </div>
              ) : (
                <Button 
                  variant="glow" 
                  size="lg" 
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying 
                    ? (isFr ? "Envoi en cours..." : "Submitting...") 
                    : (isFr ? "Postuler maintenant" : "Apply now")}
                </Button>
              )}
            </div>

            {/* Back to opportunities */}
            <div className="flex justify-center mt-4">
              <Button variant="ghost" asChild>
                <Link to="/opportunities">
                  {t("opportunities.viewAll")} <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpportunityDetail;
