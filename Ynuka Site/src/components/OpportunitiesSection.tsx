import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchOpportunities } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

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
}

type OpportunitiesSectionProps = {
  showHeading?: boolean;
};

const OpportunitiesSection = ({ showHeading = true }: OpportunitiesSectionProps) => {
  const { t, i18n } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const isFr = i18n.language === "fr";

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const data = await fetchOpportunities(100);
        setOpportunities(data);
      } catch (error) {
        console.error("Failed to fetch opportunities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunities();
  }, []);

  const getTitle = (p: Opportunity) => (isFr && p.title_fr ? p.title_fr : p.title);
  const getExcerpt = (p: Opportunity) => (isFr && p.excerpt_fr ? p.excerpt_fr : p.excerpt);

  return (
    <section id="opportunities" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container mx-auto px-4">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center rounded-full border border-[#ffb800]/40 bg-[#ffb800]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b77900] dark:text-[#f6c453]">
              Opportunities
            </span>
            <h2 className="mt-5 font-display text-3xl font-black md:text-4xl lg:text-5xl">
              <span className="gradient-text">{t("opportunities.title")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
              {t("opportunities.subtitle")}
            </p>
          </motion.div>
        )}
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            Loading...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            <p className="text-lg font-medium">Aucune opportunité disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opportunity, i) => (
              <motion.article
                key={opportunity.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffb800]/40 hover:shadow-[0_18px_45px_rgba(255,184,0,0.12)] dark:border-slate-700 dark:bg-slate-900"
              >
                {opportunity.cover_url && (
                  <Link to={`/opportunities/${opportunity.id}`} className="block overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={opportunity.cover_url}
                        alt={getTitle(opportunity)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    </div>
                  </Link>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-flex w-fit rounded-full bg-[#ffb800]/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b77900] dark:text-[#f6c453]">
                    {opportunity.category}
                  </span>

                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
                    {getTitle(opportunity)}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {getExcerpt(opportunity)}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-[#ffb800]" />
                      {new Date(opportunity.created_at).toLocaleDateString()}
                    </span>

                    <Button variant="link" className="h-auto p-0 text-sm font-semibold text-[#0f172a] hover:text-[#b77900] dark:text-white dark:hover:text-[#f6c453]" asChild>
                      <Link to={`/opportunities/${opportunity.id}`}>
                        {t("opportunities.viewMore")} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OpportunitiesSection;
