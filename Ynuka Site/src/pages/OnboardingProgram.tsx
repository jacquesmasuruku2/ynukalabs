import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  HeartHandshake,
  TrendingUp,
  HandCoins,
  PlayCircle,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import DonatePanel from "@/components/donate/DonatePanel";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const ImpactStat = ({ value, suffix, label }: { value: number; suffix?: string; label: string }) => {
  const { count, barProgress, elementRef } = useCountUp({ end: value, duration: 1800, startOnView: true });

  return (
    <div ref={elementRef} className="glass rounded-card p-6 text-center">
      <p className="font-display text-4xl font-bold text-primary">
        {suffix ?? ""}
        {count}
      </p>
      <div
        className="mx-auto mt-3 h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full border border-primary/25 bg-primary/10"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 via-[#12B1A6] to-primary"
          style={{
            width: `${Math.max(0, Math.min(100, Math.round(barProgress * 100)))}%`,
            minWidth: barProgress > 0 ? "3px" : undefined,
          }}
        />
      </div>
      <p className="text-muted-foreground mt-3">{label}</p>
    </div>
  );
};

const OnboardingProgram = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [missingImages, setMissingImages] = useState<number[]>([]);

  const onboardingImages = [
    "/onboarding/onboarding-1.jpg",
    "/onboarding/onboarding-2.jpg",
    "/onboarding/onboarding-3.jpg",
    "/onboarding/onboarding-4.jpg",
    "/onboarding/onboarding-5.jpg",
    "/onboarding/onboarding-6.jpg",
  ];
  const testimonials = [
    {
      name: "Martin MUSAGARA.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
    {
      name: "Olivier M.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
    {
      name: "Olivier M.",
      photo: "/onboarding/testimonials/testimonial-1.png",
      videoUrl: "https://www.youtube.com/watch?v=AERCr9821Ig&t=11s",
    },
  ];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % onboardingImages.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [onboardingImages.length, isPaused]);

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-start mb-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux projets
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("onboarding.title")}</span>
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">
              {t("onboarding.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 space-y-10">
          <motion.div
            id="what-is-onboarding"
            {...fadeUp}
            className="scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.whatTitle")}</h2>
            </div>
            <div
              className="min-h-[520px] lg:min-h-[620px]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-2 lg:gap-4">
                {/* Image (gauche) */}
                <div className="relative min-h-[360px] lg:min-h-0 overflow-hidden rounded-card border border-border">
                  <AnimatePresence mode="wait">
                    {missingImages.includes(currentImageIndex) ? (
                      <motion.div
                        key={`placeholder-${currentImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground text-center px-4 bg-secondary/40"
                      >
                        Ajoute une image ici:{" "}
                        <code>/public/onboarding/onboarding-{currentImageIndex + 1}.jpg</code>
                      </motion.div>
                    ) : (
                      <motion.img
                        key={`bg-${currentImageIndex}`}
                        src={onboardingImages[currentImageIndex]}
                        alt={`Onboarding background ${currentImageIndex + 1}`}
                        onError={() =>
                          setMissingImages((prev) =>
                            prev.includes(currentImageIndex) ? prev : [...prev, currentImageIndex]
                          )
                        }
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.03 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </AnimatePresence>

                  {/* Légère ombre pour la lisibilité côté gauche */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
                </div>

                {/* Texte (droite) */}
                <div className="flex items-center justify-end p-5 md:p-6 lg:p-4">
                  <div className="max-w-md py-1 px-1 md:py-2 md:px-2">
                    <h3 className="font-display text-xl md:text-2xl font-bold mb-3 text-left text-foreground">
                      Web3 Onboarding Program
                    </h3>
                    <p
                      className="font-display leading-relaxed text-justify text-sm md:text-base lg:text-lg font-medium text-foreground"
                    >
                      Since 2023, Ynuka Labs identified a strong need for Web3 education, especially around the Cardano blockchain.
                      This led us to launch this program, through which at the end of each month we mobilize our limited resources and
                      recruit young entrepreneurs, students, and technology enthusiasts to provide a one-week training on topics such as Web3,
                      distributed ledger technology, blockchain, Cardano wallets, and other practical foundations for their journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            id="impact"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="glass rounded-card p-8 scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.impactTitle")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ImpactStat value={20} suffix="+" label={t("onboarding.stats.cohorts")} />
              <ImpactStat value={400} suffix="+" label={t("onboarding.stats.trained")} />
              <ImpactStat value={20} suffix="+" label={t("onboarding.stats.resources")} />
              <ImpactStat value={1} label={t("onboarding.stats.hub")} />
            </div>

            <div className="mt-8 rounded-card border border-border bg-secondary/20 p-6 md:p-7">
              <h3 className="font-display text-xl font-semibold mb-2 text-center">
                {t("onboarding.testimonials.title")}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {t("onboarding.testimonials.subtitle")}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((item, idx) => {
                  const isNamePlaceholder = item.name.startsWith("TO_ADD_");
                  const isVideoPlaceholder = item.videoUrl.startsWith("TO_ADD_");

                  return (
                    <div
                      key={idx}
                      className="rounded-card border border-border/70 bg-background/60 p-4"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-secondary/40 mb-3 flex items-center justify-center text-xs text-muted-foreground text-center px-2">
                        <img
                          src={item.photo}
                          alt={isNamePlaceholder ? t("onboarding.testimonials.photoPlaceholder") : item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const fallback = target.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div style={{ display: "none" }}>
                          {t("onboarding.testimonials.photoPlaceholder")}
                        </div>
                      </div>

                      <p className="font-medium text-foreground text-center mb-3">
                        {isNamePlaceholder ? t("onboarding.testimonials.namePlaceholder") : item.name}
                      </p>

                      {isVideoPlaceholder ? (
                        <div className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm">
                          <PlayCircle className="h-4 w-4" />
                          {t("onboarding.testimonials.videoPlaceholder")}
                        </div>
                      ) : (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm"
                        >
                          <PlayCircle className="h-4 w-4" />
                          {t("onboarding.testimonials.watchVideo")}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            id="donate"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="glass rounded-card p-8 scroll-mt-28"
          >
            <div className="flex items-center justify-center gap-3 mb-6 text-center">
              <HandCoins className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">{t("onboarding.donateTitle")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 text-justify">
              {t("onboarding.donateJustification")}
            </p>

            <DonatePanel donationContext="onboarding_program" showTitle={false} />

            <div className="rounded-card border border-border bg-gradient-to-br from-secondary/40 to-secondary/20 p-6 md:p-7 mt-6">
              <h3 className="font-display text-xl font-semibold mb-2 text-center">
                {t("onboarding.ideaTitle")}
              </h3>
              <p className="text-muted-foreground mb-5 text-center leading-relaxed">
                {t("onboarding.ideaDesc")}
              </p>
              <div className="flex justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  {t("onboarding.ideaCta")}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OnboardingProgram;
