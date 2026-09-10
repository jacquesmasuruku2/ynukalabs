import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ZoomIn, X } from "lucide-react";
import { fetchGalleryEvents } from "@/lib/api";

const RESOURCES_GALLERY_BASE_PATH = "/assets-resources/gallery";

const Gallery = () => {
  const { t } = useTranslation();

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
  const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; alt: string } | null>(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const dbEvents = await fetchGalleryEvents(20);
        if (dbEvents.length > 0) {
          setGalleryEvents([...hardcodedGalleryEvents, ...dbEvents]);
        }
      } catch (error) {
        console.error("Failed to fetch gallery events:", error);
        setGalleryEvents(hardcodedGalleryEvents);
      }
    };

    loadGallery();
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

  const desktopGalleryGrid = useMemo(() => {
    const cols: FlatGalleryImage[][] = [[], [], [], []];
    galleryImages.forEach((img, i) => {
      cols[i % 4].push(img);
    });
    return cols;
  }, [galleryImages]);

  const mobileGalleryGrid = useMemo(() => {
    const cols: FlatGalleryImage[][] = [[], []];
    galleryImages.forEach((img, i) => {
      cols[i % 2].push(img);
    });
    return cols;
  }, [galleryImages]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("resources.galleryTitle")}</span>
            </h1>
            <p className="typo-lead mx-auto max-w-2xl text-muted-foreground">
              {t("resources.gallerySubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-16 bg-card/30">
        <div className="container mx-auto max-w-6xl px-4">
          {galleryImages.length === 0 ? (
            <p className="text-center text-muted-foreground">{t("blog.noContent")}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {galleryImages.map((img, imgIndex) => (
                  <motion.div
                    key={img.key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(imgIndex * 0.05, 0.35) }}
                    className="overflow-hidden rounded-sm border border-border/80 bg-background/40 hover:border-primary/30 transition-colors relative group cursor-pointer"
                    onClick={() => setSelectedImage({ imageUrl: img.imageUrl, alt: img.alt })}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="block h-auto w-full rounded-sm object-cover aspect-[4/3]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="hidden md:grid grid-cols-4 gap-4">
                {galleryImages.map((img, imgIndex) => (
                  <motion.div
                    key={img.key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(imgIndex * 0.05, 0.35) }}
                    className="overflow-hidden rounded-sm border border-border/80 bg-background/40 hover:border-primary/30 transition-colors relative group cursor-pointer"
                    onClick={() => setSelectedImage({ imageUrl: img.imageUrl, alt: img.alt })}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="block h-auto w-full rounded-sm object-cover aspect-[4/3]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.alt}
                className="w-full h-auto object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
