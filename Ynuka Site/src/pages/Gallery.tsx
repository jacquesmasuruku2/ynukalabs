import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ZoomIn, X } from "lucide-react";
import { fetchGalleryEvents, type GalleryImageItem } from "@/lib/api";

const RESOURCES_GALLERY_BASE_PATH = "/assets-resources/gallery";

type FlatGalleryImage = {
  key: string;
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
  category: string;
};

const Gallery = () => {
  const { t } = useTranslation();

  const fallbackImages: FlatGalleryImage[] = useMemo(
    () => [
      ...Array.from({ length: 6 }).map((_, i) => ({
        key: `onboarding-${i}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-summit-2022/photo-${i + 1}.jpg`,
        alt: `Formation Onboarding — photo ${i + 1}`,
        title: "Formation Onboarding",
        description: "Session de formation Web3 pour les nouveaux membres de la communauté.",
        category: "Formation",
      })),
      ...Array.from({ length: 6 }).map((_, i) => ({
        key: `hackathon-${i}`,
        imageUrl: `${RESOURCES_GALLERY_BASE_PATH}/cardano-africa-tech-summit/photo-${i + 1}.jpg`,
        alt: `Hackathon & événement — photo ${i + 1}`,
        title: "Hackathon & événement",
        description: "Moments forts des hackathons et événements organisés avec la communauté.",
        category: "Événement",
      })),
    ],
    []
  );

  const [galleryImages, setGalleryImages] = useState<FlatGalleryImage[]>(fallbackImages);
  const [selectedImage, setSelectedImage] = useState<FlatGalleryImage | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const dbImages: GalleryImageItem[] = await fetchGalleryEvents(50);
        if (dbImages.length > 0) {
          setGalleryImages(
            dbImages.map((img) => ({
              key: img.id,
              imageUrl: img.imageUrl,
              alt: img.title || img.description || "Galerie Ynuka Labs",
              title: img.title,
              description: img.description,
              category: img.category,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch gallery events:", error);
        setGalleryImages(fallbackImages);
      }
    };

    loadGallery();
  }, [fallbackImages]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
              <span className="gradient-text">{t("resources.galleryTitle")}</span>
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">
              {t("resources.gallerySubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
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
                  <motion.button
                    key={img.key}
                    type="button"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(imgIndex * 0.04, 0.28) }}
                    onClick={() => setSelectedImage(img)}
                    className={`group relative overflow-hidden rounded-card border border-[#0f2847]/10 text-left dark:border-white/10 ${spanClass}`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2847]/90 via-[#0f2847]/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <ZoomIn className="absolute right-2 top-2 h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-90" />
                    {(img.title || img.description) && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 px-3 py-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {img.title ? (
                          <p className="font-display text-sm font-bold text-white">{img.title}</p>
                        ) : null}
                        {img.description ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-white/85">{img.description}</p>
                        ) : null}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-none bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-h-[90vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.alt}
                className="max-h-[75vh] w-full object-contain"
              />
              <div className="mt-3 text-center text-white">
                {selectedImage.title ? (
                  <p className="font-display text-lg font-bold">{selectedImage.title}</p>
                ) : null}
                {selectedImage.description ? (
                  <p className="mx-auto mt-1 max-w-2xl text-sm text-white/80">{selectedImage.description}</p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
