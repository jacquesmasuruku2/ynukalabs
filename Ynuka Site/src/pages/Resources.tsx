import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import BlogPostsSection from "@/components/BlogPostsSection";
import DocumentationGridSection from "@/components/DocumentationGridSection";
import { fetchGalleryEvents } from "@/lib/api";

const RESOURCES_GALLERY_BASE_PATH = "/resources/gallery";
const NAVBAR_SCROLL_OFFSET = 96;
const PAGE_SHELL = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10";

type FlatGalleryImage = {
  key: string;
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
};

const Resources = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const fallbackGalleryImages: FlatGalleryImage[] = useMemo(
    () => [
      ...Array.from({ length: 6 }).map((_, i) => ({
        key: `onboarding-${i}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-summit-2022/photo-${i + 1}.jpg`,
        alt: `Formation Onboarding — photo ${i + 1}`,
        title: "Formation Onboarding",
        description: "Session de formation Web3 pour les nouveaux membres de la communauté.",
      })),
      ...Array.from({ length: 6 }).map((_, i) => ({
        key: `hackathon-${i}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-africa-tech-summit/photo-${i + 1}.jpg`,
        alt: `Hackathon & événement — photo ${i + 1}`,
        title: "Hackathon & événement",
        description: "Moments forts des hackathons et événements organisés avec la communauté.",
      })),
    ],
    []
  );

  const [galleryImages, setGalleryImages] = useState<FlatGalleryImage[]>(fallbackGalleryImages);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const dbImages = await fetchGalleryEvents(50);
        if (dbImages.length > 0) {
          setGalleryImages(
            dbImages.map((img) => ({
              key: img.id,
              imageUrl: img.imageUrl,
              alt: img.title || img.description || "Galerie Ynuka Labs",
              title: img.title,
              description: img.description,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch gallery events:", error);
        setGalleryImages(fallbackGalleryImages);
      }
    };

    loadGallery();
  }, [fallbackGalleryImages]);

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    const navbarOffset = NAVBAR_SCROLL_OFFSET;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const scrollToHash = () => {
      if (cancelled) return;
      const target = document.getElementById(decodeURIComponent(hash));
      if (target) {
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarOffset;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        return;
      }
      if (attempts++ < 30) {
        window.requestAnimationFrame(scrollToHash);
      }
    };

    const timer = window.setTimeout(scrollToHash, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="hero-gradient py-14 md:py-16">
        <div className={`${PAGE_SHELL} text-center`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 font-display text-4xl font-bold md:text-5xl">
              <span className="gradient-text">{t("resources.title")}</span>
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">{t("resources.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Blog */}
      <BlogPostsSection />

      {/* Contenus éducatifs */}
      <DocumentationGridSection />

      {/* Galerie */}
      <section id="gallery" className="scroll-mt-24 border-t border-border py-16 md:py-20">
        <div className={`${PAGE_SHELL} mb-10 text-center md:mb-12`}>
          <h2 className="mb-3 font-display text-3xl font-bold md:text-4xl">{t("resources.galleryTitle")}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-base leading-relaxed">
            {t("resources.gallerySubtitle")}
          </p>
        </div>

        <div className={PAGE_SHELL}>
          {galleryImages.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("blog.noContent")}</p>
          ) : (
            <div className="grid auto-rows-[140px] grid-cols-2 gap-2 sm:auto-rows-[160px] sm:gap-3 md:auto-rows-[180px] md:grid-cols-4 lg:auto-rows-[200px]">
              {galleryImages.map((img, imgIndex) => {
                const pattern = imgIndex % 6;
                const spanClass =
                  pattern === 0
                    ? "col-span-2 row-span-2"
                    : pattern === 3
                      ? "col-span-2 row-span-1 md:col-span-2"
                      : "col-span-1 row-span-1";

                return (
                  <motion.figure
                    key={img.key}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(imgIndex * 0.04, 0.28) }}
                    className={`group relative overflow-hidden rounded-card border border-[#0f2847]/10 bg-[#0f2847]/5 dark:border-white/10 ${spanClass}`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2847]/90 via-[#0f2847]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {(img.title || img.description) && (
                      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 px-3 py-3 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {img.title ? (
                          <p className="font-display text-sm font-bold leading-snug text-white">{img.title}</p>
                        ) : null}
                        {img.description ? (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/85">
                            {img.description}
                          </p>
                        ) : null}
                      </figcaption>
                    )}
                  </motion.figure>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Resources;
