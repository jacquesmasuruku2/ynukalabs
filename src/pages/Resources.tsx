import { useEffect, useMemo, useState, type ElementType } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Video, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogPostsSection from "@/components/BlogPostsSection";
import DocumentationGridSection from "@/components/DocumentationGridSection";
import ToolsGridSection from "@/components/ToolsGridSection";
import { mediaArrayToUrls, strapiFetch } from "@/lib/strapi";

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

const RESOURCES_GALLERY_BASE_PATH = "/resources/gallery";

/** Décalage pour navbar fixe (aligné Blockchains / About) */
const NAVBAR_SCROLL_OFFSET = 96;

const Resources = () => {
  const { t } = useTranslation();
  const location = useLocation();

  type ResourceItem = { title: string; desc: string };
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

  const [sections, setSections] = useState<ResourceSection[]>(hardcodedSections);

  type GalleryImage = { alt: string; imageUrl: string };
  type GalleryEvent = {
    title: string;
    subtitle: string;
    date: string;
    description: string;
    images: GalleryImage[];
  };

  const hardcodedGalleryEvents: GalleryEvent[] = [
    {
      title: "Images Onboarding Program",
      subtitle: "Nos images de l'Onboarding Program",
      date: "2022-2025",
      description:
        "Voici les images de l'Onboarding Program de Ynuka Labs Web3 qui est un programme de formation sur le Web3 pour les nouveaux membres de la communauté.",
      images: Array.from({ length: 6 }).map((_, i) => ({
        alt: `Wada Burkina Faso Hub — photo ${i + 1}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-summit-2022/photo-${i + 1}.jpg`,
      })),
    },
    {
      title: "Hackathons et Evénements",
      subtitle: "Les Hackathons et les événements de Ynuka Labs Web3",
      date: "2026",
      description:
        "Voici les images des Hackathons et des événements de Ynuka Labs Web3 et les projets Cardano, Ynuka Labs et les autres projets de la communauté a participé à des Hackathons et des événements organisés localement à Goma et à Nairobi, Kenya.",
      images: Array.from({ length: 6 }).map((_, i) => ({
        alt: `Inauguration — photo ${i + 1}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-africa-tech-summit/photo-${i + 1}.jpg`,
      })),
    },
  ];

  const [galleryEvents, setGalleryEvents] = useState<GalleryEvent[]>(hardcodedGalleryEvents);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/gallery-events?populate[images]=*&pagination[pageSize]=20"
        );
        const items = res.data || [];
        const mapped: GalleryEvent[] = items
          .map((item) => {
            const it = item as { attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const title = String(attrs.title ?? "");
            if (!title) return null;

            const subtitle = String(attrs.subtitle ?? "");
            const date = String(attrs.date ?? "");
            const description = String(attrs.description ?? "");

            const urls = mediaArrayToUrls(attrs.images);
            const images: GalleryImage[] = urls.map((u, i) => ({
              alt: `${title} - photo ${i + 1}`,
              imageUrl: u,
            }));

            return { title, subtitle, date, description, images };
          })
          .filter((e): e is GalleryEvent => e !== null && e.images.length > 0);

        if (mapped.length) setGalleryEvents(mapped);
      } catch {
        // fallback already set
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    const fetchResourceSections = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/resource-sections?populate=items&pagination[pageSize]=50"
        );
        const items = res.data || [];

        const mapped: ResourceSection[] = items
          .map((item) => {
            const it = item as { attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;

            const iconKey = String(attrs.iconKey ?? attrs.icon ?? "");
            const Icon = iconMap[iconKey] ?? BookOpen;

            const category = String(attrs.category_fr ?? attrs.category ?? "");
            if (!category) return null;

            const rel = attrs.items as unknown;
            const relItems = (rel as { data?: unknown[] } | undefined)?.data;
            const rawItems = Array.isArray(relItems) ? relItems : [];

            const mappedItems: ResourceItem[] = rawItems
              .map((r) => {
                const rit = r as { attributes?: Record<string, unknown> };
                const rattrs = (rit.attributes ?? {}) as Record<string, unknown>;
                const title = String(rattrs.title_fr ?? rattrs.title ?? "");
                const desc = String(
                  rattrs.description_fr ?? rattrs.desc_fr ?? rattrs.description ?? rattrs.desc ?? ""
                );
                if (!title && !desc) return null;
                return { title, desc };
              })
              .filter((x): x is ResourceItem => x !== null && x.title.length > 0);

            if (!mappedItems.length) return null;
            return { icon: Icon, category, items: mappedItems };
          })
          .filter((s): s is ResourceSection => s !== null);

        if (mapped.length) setSections(mapped);
      } catch {
        // fallback: hardcodedSections
      }
    };

    fetchResourceSections();
  }, []);

  type FlatGalleryImage = { alt: string; imageUrl: string; key: string };

  const galleryImages: FlatGalleryImage[] = useMemo(() => {
    const out: FlatGalleryImage[] = [];
    galleryEvents.forEach((event, eventIndex) => {
      event.images.forEach((img, imgIndex) => {
        out.push({
          alt: img.alt,
          imageUrl: img.imageUrl,
          key: `${event.title}-${eventIndex}-${imgIndex}-${img.imageUrl}`,
        });
      });
    });
    return out;
  }, [galleryEvents]);

  /** Masonry : répartition en 4 colonnes (effet décalé comme la maquette) */
  const galleryColumns = useMemo(() => {
    const cols: FlatGalleryImage[][] = [[], [], [], []];
    galleryImages.forEach((img, i) => {
      cols[i % 4].push(img);
    });
    return cols;
  }, [galleryImages]);

  const galleryColumnOffset = [
    "pt-8 md:pt-14 lg:pt-[3.75rem]",
    "pt-0",
    "pt-0 md:pt-2",
    "pt-10 md:pt-16 lg:pt-[5.5rem]",
  ] as const;

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_SCROLL_OFFSET;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="py-12 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("resources.title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("resources.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <BlogPostsSection />
      <DocumentationGridSection />
      <ToolsGridSection />

      <section id="catalog" className="scroll-mt-24 border-t border-border py-16">
        <div className="container mx-auto px-4 space-y-16">
          {sections.map((section, si) => (
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
                    className="glass rounded-xl p-6 hover:border-primary/30 transition-colors"
                  >
                    <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      <Download className="mr-1 h-3 w-3" /> {t("resources.access")}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" className="scroll-mt-24 border-t border-border py-16 bg-card/30">
        <div className="container mx-auto px-4 mb-10 text-center md:mb-12">
          <h2 className="font-display text-3xl font-bold md:text-4xl mb-3">{t("resources.galleryTitle")}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-base leading-relaxed">
            {t("resources.gallerySubtitle")}
          </p>
        </div>

        <div className="container mx-auto max-w-6xl px-4">
          {galleryImages.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("blog.noContent")}</p>
          ) : (
            <div className="flex flex-row gap-2 overflow-x-auto pb-4 snap-x snap-mandatory sm:gap-3 md:gap-4 md:overflow-visible md:snap-none">
              {galleryColumns.map((colImages, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex min-w-[42vw] shrink-0 snap-start flex-col gap-2 sm:min-w-[38vw] sm:gap-3 md:min-w-0 md:flex-1 ${galleryColumnOffset[colIndex]}`}
                >
                  {colImages.map((img, imgIndex) => (
                    <motion.div
                      key={img.key}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.45, delay: Math.min(imgIndex * 0.05, 0.35) }}
                      className="overflow-hidden rounded-none border border-border/80 bg-background/40 hover:border-primary/30 transition-colors"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.alt}
                        className="block h-auto w-full rounded-none object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Resources;
