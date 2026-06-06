import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { strapiFetch } from "@/lib/strapi";

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
  icon: typeof BookOpen | typeof FileText | typeof Code;
  title: string;
  desc: string;
};

const iconMap: Record<string, typeof BookOpen | typeof FileText | typeof Code> = {
  bookOpen: BookOpen,
  bookopen: BookOpen,
  fileText: FileText,
  filetext: FileText,
  code: Code,
};

const DocumentationGridSection = ({ showHeading = true }: DocumentationGridSectionProps) => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/resource-items?filters[type][$eq]=documentation&pagination[pageSize]=50"
        );
        const items = res.data || [];
        const mapped: DocItem[] = items
          .map((item) => {
            const it = item as { attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const title = String(attrs.title_fr ?? attrs.title ?? "");
            const desc = String(attrs.description_fr ?? attrs.description ?? "");
            const iconKey = String(attrs.iconKey ?? "bookOpen");
            const Icon = iconMap[iconKey] ?? BookOpen;
            if (!title) return null;
            return { icon: Icon, title, desc };
          })
          .filter((x): x is DocItem => x !== null);
        setDocs(mapped);
      } catch (error) {
        console.error("Failed to fetch documentation:", error);
        // No fallback - only database data will be displayed
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
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
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">{t("docs.subtitle")}</p>
          </motion.div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>Aucune documentation disponible pour le moment.</p>
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
              <doc.icon className="h-8 w-8 text-primary mb-4" />
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
