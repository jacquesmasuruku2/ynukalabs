import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api.php?action=list&resource=opportunities`);
        const data = await response.json();
        setOpportunities(data.rows || []);
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
    <section id="opportunities" className="scroll-mt-24 py-16">
      <div className="container mx-auto px-4">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              <span className="gradient-text">{t("opportunities.title")}</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">{t("opportunities.subtitle")}</p>
          </motion.div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucune opportunité disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity, i) => (
              <motion.div
                key={opportunity.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="glass rounded-xl overflow-hidden hover:border-primary/30 transition-colors flex flex-col"
              >
                {opportunity.cover_url && (
                  <Link to={`/opportunities/${opportunity.id}`} className="block relative aspect-video overflow-hidden">
                    <img 
                      src={opportunity.cover_url} 
                      alt={getTitle(opportunity)} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full self-start">{opportunity.category}</span>
                  <h3 className="font-display text-lg font-semibold mt-4 mb-2">{getTitle(opportunity)}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{getExcerpt(opportunity)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(opportunity.created_at).toLocaleDateString()}</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-primary text-sm" asChild>
                      <Link to={`/opportunities/${opportunity.id}`}>
                        {t("opportunities.viewMore")} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OpportunitiesSection;
