import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight } from "lucide-react";
import { fetchOpportunities } from "@/lib/api";
import { cn, stripHtml, withTimeout } from "@/lib/utils";
import ModernButton from "@/components/ui/ModernButton";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop";

export interface Opportunity {
  id: string;
  title: string;
  title_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  content: string | null;
  content_fr: string | null;
  created_at: string;
  cover_url: string | null;
  deadline?: string | null;
  status?: string | null;
  published?: boolean;
  href?: string;
}

function isOpportunityPast(opportunity: Opportunity) {
  if (opportunity.deadline) {
    const d = new Date(opportunity.deadline);
    if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) return true;
  }
  const status = String(opportunity.status || "").toLowerCase();
  return ["closed", "expired", "past", "ended", "inactive"].includes(status);
}

type OpportunitiesSectionProps = {
  showHeading?: boolean;
};

function OpportunityCard({
  opportunity,
  featured = false,
  title,
  excerpt,
  dateLabel,
  ctaLabel,
  isPast,
  liveLabel,
  pastLabel,
}: {
  opportunity: Opportunity;
  featured?: boolean;
  title: string;
  excerpt: string;
  dateLabel: string;
  ctaLabel: string;
  isPast: boolean;
  liveLabel: string;
  pastLabel: string;
}) {
  const img = opportunity.cover_url?.trim() ? opportunity.cover_url : FALLBACK_IMG;
  const to =
    opportunity.href ||
    (opportunity.id.startsWith("preview-") ? "/opportunities" : `/opportunities/${opportunity.id}`);

  return (
    <article
      className={cn(
        "flex h-full min-h-[300px] w-full flex-col overflow-hidden rounded-none border transition-colors md:min-h-[320px]",
        featured
          ? "border-[#ffb800]/45 bg-[#0f2847] text-white"
          : "border-black/[0.08] bg-white text-[#0f2847] dark:border-[#3b82f6]/30 dark:bg-[#152a48] dark:text-[#dbeafe]"
      )}
    >
      <Link to={to} className="flex h-full min-h-0 w-full flex-col">
        <div className="relative h-[112px] shrink-0 overflow-hidden md:h-[120px]">
          <img src={img} alt="" className="h-full w-full object-cover" aria-hidden />
          <div
            className={cn("absolute inset-0", featured ? "bg-[#0f2847]/25" : "bg-[#0f2847]/10")}
            aria-hidden
          />
          {opportunity.category ? (
            <span
              className={cn(
                "typo-meta absolute left-0 top-0 px-2.5 py-1",
                featured ? "bg-[#ffb800] text-[#0f2847]" : "bg-[#0f2847] text-white"
              )}
            >
              {opportunity.category}
            </span>
          ) : null}
          <span
            className={cn(
              "typo-meta absolute right-0 top-0 px-2.5 py-1",
              isPast
                ? featured
                  ? "bg-white text-[#0f2847]"
                  : "bg-[#0f2847] text-white"
                : "bg-[#ffb800] text-[#0f2847]"
            )}
          >
            {isPast ? pastLabel : liveLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-3.5 py-3 md:px-4 md:py-3.5">
          <h3
            className={cn(
              "line-clamp-2 min-h-[2.4rem] text-[0.95rem] font-bold leading-snug tracking-tight md:text-base",
              featured ? "text-white" : "text-[#0f2847] dark:text-[#93c5fc]"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-1.5 line-clamp-2 min-h-[2.5rem] text-[0.8rem] leading-relaxed",
              featured ? "text-white/75" : "text-[#315795] dark:text-[#93c5fc]/80"
            )}
          >
            {excerpt || "\u00a0"}
          </p>

          <div
            className={cn(
              "space-y-1 pt-3 text-[0.72rem]",
              featured ? "text-white/85" : "text-[#315795] dark:text-[#93c5fc]/85"
            )}
          >
            <p className="flex items-center gap-1.5">
              <Calendar
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  featured ? "text-[#ffb800]" : "text-[#0f2847] dark:text-[#ffb800]"
                )}
              />
              <span className="line-clamp-1">{dateLabel}</span>
            </p>
          </div>

          <div className="mt-auto pt-3">
            <span className="inline-flex w-full items-center justify-center bg-[#ffb800] px-3 py-2 text-[0.8rem] font-bold text-[#0f2847] hover:bg-[#e6a600]">
              {ctaLabel}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

const OpportunitiesSection = ({ showHeading = true }: OpportunitiesSectionProps) => {
  const { t, i18n } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const isFr = i18n.language === "fr";
  const locale = isFr ? "fr-FR" : "en-US";

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await withTimeout(fetchOpportunities(100));
        setOpportunities(data);
        setLoadError(false);
      } catch (error) {
        console.error("Failed to fetch opportunities:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  const getTitle = (p: Opportunity) => (isFr && p.title_fr ? p.title_fr : p.title);
  const getExcerpt = (p: Opportunity) =>
    stripHtml((isFr && p.excerpt_fr ? p.excerpt_fr : p.excerpt) || "");

  const fallbacks: Opportunity[] = [
    {
      id: "preview-1",
      title: t("opportunities.fallback1Title"),
      title_fr: t("opportunities.fallback1Title"),
      excerpt: t("opportunities.fallback1Excerpt"),
      excerpt_fr: t("opportunities.fallback1Excerpt"),
      category: t("opportunities.fallback1Category"),
      content: null,
      content_fr: null,
      created_at: "2026-09-01T00:00:00",
      cover_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      href: "/onboarding",
    },
    {
      id: "preview-2",
      title: t("opportunities.fallback2Title"),
      title_fr: t("opportunities.fallback2Title"),
      excerpt: t("opportunities.fallback2Excerpt"),
      excerpt_fr: t("opportunities.fallback2Excerpt"),
      category: t("opportunities.fallback2Category"),
      content: null,
      content_fr: null,
      created_at: "2026-08-15T00:00:00",
      cover_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
      href: "/validators",
    },
    {
      id: "preview-3",
      title: t("opportunities.fallback3Title"),
      title_fr: t("opportunities.fallback3Title"),
      excerpt: t("opportunities.fallback3Excerpt"),
      excerpt_fr: t("opportunities.fallback3Excerpt"),
      category: t("opportunities.fallback3Category"),
      content: null,
      content_fr: null,
      created_at: "2026-03-10T00:00:00",
      cover_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
      deadline: "2026-04-30",
      status: "closed",
      href: "/opportunities",
    },
  ];

  const byNewest = (a: Opportunity, b: Opportunity) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  const live = opportunities.filter((item) => !isOpportunityPast(item)).sort(byNewest);
  const past = opportunities.filter((item) => isOpportunityPast(item)).sort(byNewest);
  const ranked = [...live, ...past];
  const available = fallbacks.filter((item) => !ranked.some((opp) => opp.id === item.id));
  const paddingPool: Opportunity[] = [];
  if (showHeading) {
    if (live.length === 0) {
      paddingPool.push(...available.filter((item) => !isOpportunityPast(item)));
    }
    if (past.length === 0) {
      paddingPool.push(...available.filter((item) => isOpportunityPast(item)));
    }
    paddingPool.push(...available.filter((item) => !paddingPool.includes(item)));
  }
  const padding = paddingPool.slice(0, Math.max(0, 3 - ranked.length));
  const displayList = showHeading
    ? [
        ...live,
        ...padding.filter((item) => !isOpportunityPast(item)),
        ...past,
        ...padding.filter((item) => isOpportunityPast(item)),
      ].slice(0, 3)
    : ranked;

  const heading = showHeading ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10 text-left md:mb-12"
    >
      <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
        {t("opportunities.title")}
      </h2>
      <p className="mt-3 max-w-3xl text-justify text-base font-semibold leading-relaxed text-[#1e3a5f] dark:text-[#93c5fc] md:text-lg">
        {t("opportunities.subtitle")}
      </p>
    </motion.div>
  ) : null;

  const body = loading ? (
    <div className="flex min-h-[220px] items-center justify-center border border-dashed border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      {t("common.loading")}
    </div>
  ) : loadError && displayList.length === 0 ? (
    <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      <p className="text-lg font-medium">{t("common.loadError")}</p>
    </div>
  ) : displayList.length === 0 ? (
    <div className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
      <p className="text-lg font-medium">{t("opportunities.empty")}</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3 md:grid-rows-1 lg:gap-4">
      {displayList.map((opportunity, i) => {
        const featured = showHeading && displayList.length >= 3 ? i === 1 : false;
        return (
          <motion.div
            key={opportunity.id}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.08 }}
            className="flex h-full min-h-0 w-full"
          >
            <OpportunityCard
              opportunity={opportunity}
              featured={featured}
              title={getTitle(opportunity)}
              excerpt={getExcerpt(opportunity)}
              dateLabel={
                opportunity.created_at
                  ? new Date(opportunity.created_at).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
              ctaLabel={t("opportunities.viewMore")}
              isPast={isOpportunityPast(opportunity)}
              liveLabel={t("opportunities.liveLabel")}
              pastLabel={t("opportunities.pastLabel")}
            />
          </motion.div>
        );
      })}
    </div>
  );

  const cta = showHeading ? (
    <div className="mt-10 text-center">
      <ModernButton
        variant="primary"
        href="/opportunities"
        className="!rounded-none bg-[#ffb800] px-7 py-3 font-bold text-[#0f2847] hover:bg-[#e6a600]"
      >
        {t("opportunities.seeMore")}
        <ArrowRight className="ml-2 h-4 w-4" />
      </ModernButton>
    </div>
  ) : null;

  if (!showHeading) {
    return (
      <section id="opportunities" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
          {body}
        </div>
      </section>
    );
  }

  return (
    <ModernSectionWrapper className="py-16 md:py-20">
      <div id="opportunities" className="scroll-mt-24">
        {heading}
        {body}
        {cta}
      </div>
    </ModernSectionWrapper>
  );
};

export default OpportunitiesSection;
