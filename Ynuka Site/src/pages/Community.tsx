import type { ElementType } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MessageCircle, Send, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

type VoiceTestimonial = { name: string; role: string; text: string; image: string };

function VoiceTestimonialCard({ tm, index }: { tm: VoiceTestimonial; index: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [needsToggle, setNeedsToggle] = useState(false);

  useLayoutEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => {
      if (expanded) return;
      setNeedsToggle(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tm.text, expanded]);

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.15 }}
      className="glass rounded-xl p-6 flex flex-col"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-[#ffb800]/40 shrink-0">
        <img src={tm.image} alt={tm.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <blockquote
        ref={quoteRef}
        className={cn(
          "text-sm text-muted-foreground text-justify mb-3 grow",
          !expanded && "line-clamp-3"
        )}
      >
        &ldquo;{tm.text}&rdquo;
      </blockquote>
      {needsToggle && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-medium text-[#ffb800] hover:underline mb-4 text-left w-fit"
        >
          {expanded ? t("community.readLess") : t("community.readMore")}
        </button>
      )}
      <div className="mt-auto pt-1">
        <p className="font-display font-semibold">{tm.name}</p>
        <p className="text-xs text-[#ffb800] font-medium mt-0.5">{tm.role}</p>
      </div>
    </motion.div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Contenu principal (réutilisé sur la page Écosystème /blockchains#community) */
export function CommunityPageBody() {
  const { t } = useTranslation();

  const whatsappUrl =
    (import.meta.env.VITE_COMMUNITY_WHATSAPP_URL as string | undefined)?.trim() || "https://wa.me/";

  type JoinCardVariant = "whatsapp" | "discord" | "telegram" | "events";
  type JoinItem = {
    icon: ElementType<{ className?: string }>;
    title: string;
    desc: string;
    href: string;
    variant: JoinCardVariant;
  };

  const joinItems: JoinItem[] = [
    { icon: WhatsAppIcon, title: t("community.whatsapp"), desc: t("community.whatsappDesc"), href: whatsappUrl, variant: "whatsapp" },
    { icon: MessageCircle, title: t("community.discord"), desc: t("community.discordDesc"), href: "#", variant: "discord" },
    { icon: Send, title: t("community.telegram"), desc: t("community.telegramDesc"), href: "#", variant: "telegram" },
    { icon: Users, title: t("community.attend"), desc: t("community.attendDesc"), href: "/events", variant: "events" },
  ];

  const joinCardStyles: Record<
    JoinCardVariant,
    { card: string; iconWrap: string; title: string; desc: string; btn: string }
  > = {
    whatsapp: {
      card: "bg-gradient-to-br from-[#25D366] to-[#128C7E] border border-white/25 text-white",
      iconWrap: "bg-white/15 border border-white/35 text-white",
      title: "text-white",
      desc: "text-white/90",
      btn: "border-white/45 text-white hover:bg-white/15 hover:text-white hover:border-white/55",
    },
    discord: {
      card: "bg-white border border-slate-200/95 text-slate-900 shadow-md dark:bg-white dark:border-slate-200",
      iconWrap: "bg-[#5865F2]/12 border border-[#5865F2]/30 text-[#5865F2]",
      title: "text-slate-900",
      desc: "text-slate-600",
      btn: "border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900",
    },
    telegram: {
      card: "bg-gradient-to-br from-[#37aee2] to-[#0088cc] border border-white/25 text-white",
      iconWrap: "bg-white/15 border border-white/35 text-white",
      title: "text-white",
      desc: "text-white/90",
      btn: "border-white/45 text-white hover:bg-white/15 hover:text-white hover:border-white/55",
    },
    events: {
      card: "bg-gradient-to-br from-[#ffb800] to-[#e6a600] border border-[#111111]/12 text-[#111111]",
      iconWrap: "bg-[#111111]/12 border border-[#111111]/22 text-[#111111]",
      title: "text-[#111111]",
      desc: "text-[#111111]/88",
      btn: "border-[#111111]/45 text-[#111111] hover:bg-[#111111]/10 hover:text-[#111111]",
    },
  };

  const testimonials: VoiceTestimonial[] = [
    {
      name: "Sarah M.",
      role: "Web3 Developer",
      text: t("community.test1"),
      image: "/onboarding/testimonials/testimonial-1.png",
    },
    {
      name: "Jean-Pierre K.",
      role: "Student",
      text: t("community.test2"),
      image: "/onboarding/onboarding-1.jpg",
    },
    {
      name: "Amina B.",
      role: "Entrepreneur",
      text: t("community.test3"),
      image: "/onboarding/onboarding-3.jpg",
    },
  ];

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">{t("community.title")}</span>{" "}
              <span className="text-[#ffb800]">{t("community.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("community.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] gap-6 md:gap-7 lg:gap-8 lg:items-center gap-y-8">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-[420px] sm:max-w-[480px] mx-auto lg:max-w-none lg:mx-0 rounded-[20px] overflow-hidden shadow-xl aspect-[4/5] max-h-[460px] lg:max-h-[440px]"
            >
              <img
                src="/onboarding/onboarding-2.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>

            <div className="flex justify-center lg:justify-start w-full min-w-0">
              <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-3.5 sm:gap-y-3.5 w-full max-w-[400px] lg:max-w-none">
                {joinItems.map((item, i) => {
                  const Icon = item.icon;
                  const shiftUp = i === 1 || i === 3;
                  const st = joinCardStyles[item.variant];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.08 }}
                      className={cn(
                        "rounded-[10px] p-4 md:p-5 min-h-[190px] flex flex-col shadow-[0_12px_26px_rgba(0,0,0,0.15)]",
                        shiftUp && "md:-translate-y-[34px]",
                        st.card
                      )}
                    >
                      <div
                        className={cn(
                          "inline-flex w-10 h-10 rounded-full items-center justify-center mb-3 shrink-0",
                          st.iconWrap
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3
                        className={cn(
                          "font-display font-semibold text-[15px] md:text-[17px] leading-snug mb-2",
                          st.title
                        )}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={cn(
                          "text-[13px] md:text-[13.5px] leading-relaxed flex-1 mb-3",
                          st.desc
                        )}
                      >
                        {item.desc}
                      </p>
                      <Button
                        variant="outline-glow"
                        size="sm"
                        className={cn("mt-auto w-full text-xs", st.btn)}
                        asChild
                      >
                        <a
                          href={item.href}
                          {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {t("community.getStarted")} <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-navy text-[hsl(42_28%_96%)]">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-white">
              {t("community.ambassadorTitle")}
            </h2>
            <p className="text-white/85 text-lg max-w-2xl mx-auto mb-4">{t("community.ambassadorSubtitle")}</p>
            <p className="text-white/75 mb-8 leading-relaxed">{t("community.ambassadorDesc")}</p>
            <Button
              size="lg"
              className="!bg-[#ffb800] !text-[#111111] hover:brightness-105 border-0 font-semibold shadow-md"
            >
              {t("community.applyNow")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-[#ffb800]">
              {t("community.voicesTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("community.voicesSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <VoiceTestimonialCard key={`${tm.name}-${i}`} tm={tm} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const Community = () => (
  <div className="pt-20">
    <CommunityPageBody />
  </div>
);

export default Community;
