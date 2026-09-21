import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { fetchEventRegistrationByEmail } from "@/lib/api";
import { getEvent } from "@/services/events/eventsApi";
import EventExchangeSpace from "@/components/events/EventExchangeSpace";
import GoogleSignInDialog from "@/components/auth/GoogleSignInDialog";

const EventEspace = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isFr = i18n.language === "fr";

  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const event = await getEvent(id);
        if (cancelled) return;
        setEventTitle(isFr && event.titleFr ? event.titleFr : event.title);

        const user = authService.getUser();
        if (!user?.email) {
          setShowAuth(true);
          setLoading(false);
          return;
        }

        const reg = await fetchEventRegistrationByEmail(id, user.email);
        if (cancelled) return;
        if (!reg?.id) {
          toast({
            title: isFr ? "Inscription requise" : "Registration required",
            description: isFr
              ? "Inscrivez-vous d'abord à l'événement pour accéder à l'espace d'échange."
              : "Please register for the event first.",
          });
          navigate(`/events/${id}`, { replace: true });
          return;
        }
        setRegistrationId(reg.id);
      } catch {
        if (!cancelled) {
          toast({ title: t("events.loadError"), variant: "destructive" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id, isFr, navigate, t, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("admin.loading")}
      </div>
    );
  }

  if (!id || !registrationId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <MessageCircle className="mx-auto mb-4 h-10 w-10 text-[#ffb800]" />
        <p className="mb-4 text-[#0f2847] dark:text-white">
          {isFr
            ? "Connectez-vous pour accéder à votre espace d'échange."
            : "Sign in to access your exchange space."}
        </p>
        <Button variant="glow" onClick={() => setShowAuth(true)}>
          Continuer avec Google
        </Button>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to={id ? `/events/${id}` : "/events"}>{t("events.backToEvents")}</Link>
          </Button>
        </div>
        <GoogleSignInDialog
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => window.location.reload()}
          title={isFr ? "Espace d'échange" : "Exchange space"}
          description={
            isFr
              ? "Connectez-vous avec Google pour discuter avec l'équipe Ynuka Labs."
              : "Sign in with Google to chat with the Ynuka Labs team."
          }
        />
      </div>
    );
  }

  return <EventExchangeSpace eventId={id} eventTitle={eventTitle} registrationId={registrationId} />;
};

export default EventEspace;
