import { useEffect, useMemo, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Video, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchResourceSections } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const iconMap: Record<string, ElementType> = {
  bookOpen: BookOpen,
  bookopen: BookOpen,
  video: Video,
  fileText: FileText,
  filetext: FileText,
  file: FileText,
};

const Catalog = () => {
  const { t } = useTranslation();

  type ResourceItem = { title: string; desc: string; url?: string; fileType?: string };
  type ResourceSection = { icon: ElementType; category: string; items: ResourceItem[] };

  const hardcodedSections: ResourceSection[] = [
    {
      icon: BookOpen,
      category: t("resources.cat1"),
      items: [
        { title: t("resources.r1Title"), desc: t("resources.r1Desc") },
        { title: t("resources.r2Title"), desc: t("resources.r2Desc") },
        { title: t("resources.r3Title"), desc: t("resources.r3Desc") },
      ],
    },
    {
      icon: Video,
      category: t("resources.cat2"),
      items: [
        { title: t("resources.r4Title"), desc: t("resources.r4Desc") },
        { title: t("resources.r5Title"), desc: t("resources.r5Desc") },
        { title: t("resources.r6Title"), desc: t("resources.r6Desc") },
      ],
    },
    {
      icon: FileText,
      category: t("resources.cat3"),
      items: [
        { title: t("resources.r7Title"), desc: t("resources.r7Desc") },
        { title: t("resources.r8Title"), desc: t("resources.r8Desc") },
        { title: t("resources.r9Title"), desc: t("resources.r9Desc") },
      ],
    },
  ];

  const [sections, setSections] = useState<ResourceSection[]>([]);

  useEffect(() => {
    const loadResourceSections = async () => {
      try {
        const sections = await fetchResourceSections(50);
        const mapped: ResourceSection[] = sections
          .map((section) => {
            const Icon = iconMap[section.iconKey] ?? BookOpen;
            if (!section.category) return null;

            const mappedItems: ResourceItem[] = section.items
              .map((item: any) => {
                const title = String(item.title_fr ?? item.title ?? "");
                const desc = String(
                  item.description_fr ?? item.desc_fr ?? item.description ?? item.desc ?? ""
                );
                if (!title && !desc) return null;
                const url = String(item.url || "");
                const extension = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i)?.[1] || "";
                return { title, desc, url, fileType: String(item.fileType || extension).toUpperCase() };
              })
              .filter((x): x is ResourceItem => x !== null && x.title.length > 0);

            if (!mappedItems.length) return null;
            return { icon: Icon, category: section.category, items: mappedItems };
          })
          .filter((s): s is ResourceSection => s !== null);

        setSections(mapped);
      } catch (error) {
        console.error("Failed to fetch resource sections:", error);
      }
    };

    loadResourceSections();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("resources.title")}</span>
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">{t("resources.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4 space-y-16">
          {sections.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Aucune ressource disponible pour le moment.</p>
            </div>
          ) : (
            sections.map((section, si) => (
            <div key={si}>
              <div className="flex items-center gap-3 mb-8">
                <section.icon className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold">{section.category}</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {section.items.map((item, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                    className="glass rounded-card p-6 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="font-display font-semibold mb-2">
                      {item.url ? (
                        <a href={getCloudinaryDownloadUrl(item.url)} className="hover:text-primary">
                          {item.title}
                        </a>
                      ) : item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                    {item.url ? (
                      <div className="flex items-center justify-between gap-3">
                        {item.fileType && <span className="rounded border border-border px-2 py-1 text-xs font-semibold text-muted-foreground">{item.fileType}</span>}
                        <Button variant="link" asChild className="ml-auto p-0 h-auto text-primary">
                          <a href={getCloudinaryDownloadUrl(item.url)} download>
                            <Download className="mr-1 h-3 w-3" /> {t("resources.access")}
                          </a>
                        </Button>
                      </div>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>
            )))}
        </div>
      </section>
    </div>
  );
};

function getCloudinaryDownloadUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'res.cloudinary.com') {
      parsed.pathname = parsed.pathname.replace('/raw/upload/', '/raw/upload/fl_attachment/');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export default Catalog;
