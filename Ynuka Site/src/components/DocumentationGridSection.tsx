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
  id: string;
  title: string;
  desc: string;
  fileType: string;
  downloadUrl: string;
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
          id: doc.id,
          title: doc.title,
          desc: doc.description,
          fileType: doc.fileType,
          downloadUrl: doc.downloadUrl,
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
    <section id="education" className="scroll-mt-24 border-t border-border py-16">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
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
          <div className="py-12 text-center text-muted-foreground">{t("common.loading")}</div>
        ) : loadError ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{t("docs.empty")}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>{t("docs.empty")}</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {docs.map((doc, i) => (
            <motion.div
              key={doc.id || i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="glass flex min-w-0 flex-col rounded-card border border-border p-5 transition-colors hover:border-primary/40 sm:p-6"
            >
              <div className="mb-3 flex min-h-7 items-start justify-between gap-3">
                <h3 className="min-w-0 break-words font-display text-lg font-semibold">{doc.title}</h3>
                {doc.fileType && <span className="shrink-0 rounded-md border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200">{doc.fileType}</span>}
              </div>
              <p className="mb-5 flex-1 break-words text-sm text-muted-foreground">{doc.desc}</p>
              {doc.downloadUrl && (
                <Button asChild className="w-full justify-center sm:w-auto sm:self-start">
                  <a href={doc.downloadUrl} download>
                    <span>{doc.fileType ? t("resources.downloadFile", { type: doc.fileType }) : t("resources.download")}</span>
                  </a>
                </Button>
              )}
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default DocumentationGridSection;
