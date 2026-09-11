import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { fetchDocumentation } from "@/lib/api";
import { withTimeout } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

type DocumentationGridSectionProps = {
  showHeading?: boolean;
};

type DocItem = {
  title: string;
  desc: string;
};

const DocumentationGridSection = ({ showHeading = true }: DocumentationGridSectionProps) => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await withTimeout(fetchDocumentation(50));
        const mapped: DocItem[] = docs.map((doc) => ({
          title: doc.title,
          desc: doc.description,
        }));
        setDocs(mapped);
        setLoadError(false);
      } catch (error) {
        console.error("Failed to fetch documentation:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, []);

  return (
    <section id="documentation" className="scroll-mt-24 border-t border-border py-16">
      <div className="container mx-auto px-4">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              <span className="gradient-text">{t("docs.title")}</span>
            </h2>
            <p className="typo-lead mx-auto mt-3 max-w-2xl text-muted-foreground">{t("docs.subtitle")}</p>
          </motion.div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">{t("common.loading")}</div>
        ) : loadError ? (
          <div className="text-center text-muted-foreground py-12">
            <p>{t("docs.empty")}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>{t("docs.empty")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {docs.map((doc, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="glass rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-display text-lg font-semibold mb-2">{doc.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{doc.desc}</p>
              <Button variant="outline-glow" size="sm">
                {t("resources.access")}
              </Button>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default DocumentationGridSection;
