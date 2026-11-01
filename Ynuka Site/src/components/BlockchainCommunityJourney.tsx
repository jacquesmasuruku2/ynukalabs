import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { FacebookLogo } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { socialLinks } from "@/data/socialLinks";

const transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

const external = (href: string) => ({ href, target: "_blank", rel: "noopener noreferrer" });

export function BlockchainCommunityJourney() {
  const { t } = useTranslation();
  const telegram = socialLinks.find((item) => item.ariaLabel === "Telegram");
  const x = socialLinks.find((item) => item.ariaLabel === "X");
  const pageUrl = typeof window === "undefined" ? "https://ynukalabs.com" : window.location.origin;
  const whatsappUrl =
    (import.meta.env.VITE_COMMUNITY_WHATSAPP_URL as string | undefined)?.trim() ||
    `https://wa.me/?text=${encodeURIComponent(t("blockchainJourney.socialMessage"))}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;

  const steps = [
    {
      number: "01",
      title: t("blockchainJourney.step1Title", { defaultValue: "Proposer une idée" }),
      description: t("blockchainJourney.step1Text", {
        defaultValue:
          "Chaque membre peut partager ses idées et proposer des initiatives pour faire avancer la communauté.",
      }),
      action: t("blockchainJourney.step1Action", { defaultValue: "Soumettre une idée" }),
      to: "/contact",
    },
    {
      number: "02",
      title: t("blockchainJourney.step2Title", { defaultValue: "Débattre & échanger" }),
      description: t("blockchainJourney.step2Text", {
        defaultValue:
          "Discutons, confrontons nos idées et améliorons nos initiatives dans un esprit d’ouverture et de collaboration.",
      }),
      action: t("blockchainJourney.step2Action", { defaultValue: "Participer aux échanges" }),
      to: "/events",
    },
    {
      number: "03",
      title: t("blockchainJourney.step3Title", { defaultValue: "Venir aux événements" }),
      description: t("blockchainJourney.step3Text", {
        defaultValue:
          "Ateliers, meetups et rencontres en présentiel : le meilleur moyen de découvrir l’énergie de la communauté et de créer des liens.",
      }),
      action: t("blockchainJourney.step3Action", { defaultValue: "Découvrir nos événements" }),
      to: "/events",
    },
    {
      number: "04",
      title: t("blockchainJourney.step4Title", { defaultValue: "Construire ensemble" }),
      description: t("blockchainJourney.step4Text", {
        defaultValue:
          "Éducateurs, organisations, builders ou partenaires stratégiques : unissons nos forces pour accélérer l’éducation Web3 et développer des solutions locales durables.",
      }),
      action: t("blockchainJourney.step4Action", { defaultValue: "Collaborer avec Ynuka Labs" }),
      to: "/contact",
      showSocials: true,
    },
  ];

  return (
    <section id="community" className="relative scroll-mt-28 py-14 text-white md:py-20 bg-transparent">
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Compact Glassmorphic Card (no extra empty space) */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={transition}
            className="flex flex-col lg:col-span-5 lg:sticky lg:top-28"
          >
            <div className="relative flex flex-col rounded-3xl border border-white/10 bg-[#0d1627]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-9">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#38bdf8]">
                  {t("blockchainJourney.eyebrow")}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white leading-[1.15] sm:text-3xl lg:text-[2.25rem]">
                  {t("blockchainJourney.title")}
                </h2>
                <div className="mt-4 space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-300/90">
                  <p>{t("blockchainJourney.subtitle")}</p>
                  <p className="text-slate-400">
                    {t("blockchainJourney.subtitle2")}
                  </p>
                  <p className="font-semibold text-white/95 pt-0.5">
                    {t("blockchainJourney.subtitle3")}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-1">
                <a
                  href={telegram?.href || "https://t.me/CardanoGomaCommunity"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-xs sm:text-sm font-bold text-[#0f2847] shadow-lg transition-all hover:bg-white hover:scale-[1.02] active:scale-95"
                >
                  <span>{t("blockchainJourney.ctaOpen")}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Numbered Items cleanly spaced without divider line clutter */}
          <div className="flex flex-col space-y-6 sm:space-y-7 lg:col-span-7">
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...transition, delay: index * 0.08 }}
                className="relative"
              >
                <div className="grid grid-cols-[2.5rem_1fr] items-start gap-3 sm:gap-4">
                  <span className="pt-0.5 font-mono text-sm font-semibold text-slate-500 sm:text-base">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-300/80">
                      {step.description}
                    </p>

                    {step.action && step.to && (
                      <div className="mt-2.5">
                        <Link
                          to={step.to}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] transition-colors hover:text-white sm:text-sm"
                        >
                          <span>{step.action}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    )}

                    {step.showSocials && (
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {telegram && (
                          <a
                            {...external(telegram.href)}
                            aria-label="Telegram"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-[#38bdf8]/50 hover:bg-white/15 hover:text-white"
                          >
                            <Send className="h-3.5 w-3.5 text-[#38bdf8]" />
                            <span>Telegram</span>
                          </a>
                        )}
                        <a
                          {...external(whatsappUrl)}
                          aria-label="WhatsApp"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-emerald-400/50 hover:bg-white/15 hover:text-white"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                        {x && (
                          <a
                            {...external(x.href)}
                            aria-label="X"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-slate-400/50 hover:bg-white/15 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5 text-slate-300" />
                            <span>X</span>
                          </a>
                        )}
                        <a
                          {...external(facebookUrl)}
                          aria-label="Facebook"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-blue-400/50 hover:bg-white/15 hover:text-white"
                        >
                          <FacebookLogo weight="fill" className="h-3.5 w-3.5 text-blue-400" />
                          <span>Facebook</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
