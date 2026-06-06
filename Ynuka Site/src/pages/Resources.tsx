import { useEffect, useState, type ElementType } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BookOpen, Video, FileText, Download, ExternalLink } from "lucide-react";
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
    description: string;
    driveUrl: string;
    images: GalleryImage[];
  };

  const hardcodedGalleryEvents: GalleryEvent[] = [
    {
      title: "Images Onboarding Program",
      subtitle: "Nos images de l'Onboarding Program",
      description:
        "Voici les images de l'Onboarding Program de Ynuka Labs Web3 qui est un programme de formation sur le Web3 pour les nouveaux membres de la communauté.",
      driveUrl: "",
      images: Array.from({ length: 6 }).map((_, i) => ({
        alt: `Wada Burkina Faso Hub — photo ${i + 1}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-summit-2022/photo-${i + 1}.jpg`,
      })),
    },
    {
      title: "Hackathons et Evénements",
      subtitle: "Les Hackathons et les événements de Ynuka Labs Web3",
      description:
        "Voici les images des Hackathons et des événements de Ynuka Labs Web3 et les projets Cardano, Ynuka Labs et les autres projets de la communauté a participé à des Hackathons et des événements organisés localement à Goma et à Nairobi, Kenya.",
      driveUrl: "",
      images: Array.from({ length: 6 }).map((_, i) => ({
        alt: `Inauguration — photo ${i + 1}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-africa-tech-summit/photo-${i + 1}.jpg`,
      })),
    },
  ];

  const [galleryEvents, setGalleryEvents] = useState<GalleryEvent[]>(hardcodedGalleryEvents);

  useEffect(() => {
    const fetchGallery = async () => {
      // 1) API PHP — blocs galerie (admin panel)
      try {
        const phpApi = `${window.location.origin}/php/api.php?action=gallery_public`;
        const res = await fetch(phpApi);
        if (res.ok) {
          const data = (await res.json()) as {
            blocks?: Array<{
              title?: string;
              subtitle?: string;
              description?: string;
              drive_url?: string;
              images?: Array<{ image_url?: string; alt?: string }>;
            }>;
          };
          const mapped: GalleryEvent[] = (data.blocks ?? [])
            .map((block) => {
              const title = String(block.title ?? "").trim();
              if (!title) return null;
              const images: GalleryImage[] = (block.images ?? [])
                .slice(0, 6)
                .map((img, i) => ({
                  alt: String(img.alt ?? `${title} — photo ${i + 1}`),
                  imageUrl: String(img.image_url ?? ""),
                }))
                .filter((img) => img.imageUrl.length > 0);
              if (!images.length) return null;
              return {
                title,
                subtitle: String(block.subtitle ?? ""),
                description: String(block.description ?? ""),
                driveUrl: String(block.drive_url ?? ""),
                images,
              };
            })
            .filter((e): e is GalleryEvent => e !== null);
          if (mapped.length) {
            setGalleryEvents(mapped);
            return;
          }
        }
      } catch {
        // try Strapi fallback
      }

      // 2) Strapi legacy
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
            const description = String(attrs.description ?? "");
            const driveUrl = String(attrs.driveUrl ?? attrs.drive_url ?? "");

            const urls = mediaArrayToUrls(attrs.images);
            const images: GalleryImage[] = urls.slice(0, 6).map((u, i) => ({
              alt: `${title} - photo ${i + 1}`,
              imageUrl: u,
            }));

            return { title, subtitle, description, driveUrl, images };
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

        <div className="container mx-auto max-w-6xl px-4 space-y-16">
          {galleryEvents.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("blog.noContent")}</p>
          ) : (
            galleryEvents.map((event, eventIndex) => (
              <motion.article
                key={`${event.title}-${eventIndex}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: eventIndex * 0.08 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">{event.title}</h3>
                  {event.subtitle && (
                    <p className="mt-1 text-sm font-medium text-primary">{event.subtitle}</p>
                  )}
                  {event.description && (
                    <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
                  {event.images.map((img, imgIndex) => (
                    <motion.div
                      key={`${event.title}-img-${imgIndex}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: imgIndex * 0.06 }}
                      className="overflow-hidden border border-border/80 bg-background/40 aspect-[4/3] hover:border-primary/30 transition-colors"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>

                {event.driveUrl && (
                  <div className="flex justify-center md:justify-start">
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={event.driveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {t("resources.gallerySeeMore")}
                      </a>
                    </Button>
                  </div>
                )}
              </motion.article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Resources;
