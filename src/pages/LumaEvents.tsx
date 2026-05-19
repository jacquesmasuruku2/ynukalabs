import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LumaEvents = () => {
  const { t } = useTranslation();

  const lumaUrl = (import.meta.env.VITE_LUMA_EVENTS_URL as string | undefined)?.trim();

  return (
    <div className="min-h-screen">
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("events.lumaTitle")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("events.lumaSubtitle")}</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="outline-glow" size="lg" asChild>
              <Link to="/events">
                {t("events.backToEvents")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            {lumaUrl ? (
              <Button variant="glow" size="lg" asChild>
                <a href={lumaUrl} target="_blank" rel="noreferrer">
                  {t("events.lumaCta")} <ArrowRight className="ml-1 h-3 w-3" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          {!lumaUrl ? (
            <div className="text-center">
              <p className="text-muted-foreground">{t("events.lumaMissingUrl")}</p>
            </div>
          ) : (
            <img
              src="/luma-embed-blocked.png"
              alt="Luma embed not available"
              className="mx-auto w-full max-w-6xl rounded-2xl border border-border"
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default LumaEvents;

