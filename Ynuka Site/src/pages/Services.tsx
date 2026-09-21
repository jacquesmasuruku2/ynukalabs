import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Container from "@/components/ui/Container";
import "@/styles/AboutDesign.css";

const Services = () => {
  const { t } = useTranslation();

  const services = useMemo(() => [
    {
      title: t("about.service1Title"),
      description: t("about.service1Desc"),
      color: "#0f6be8",
    },
    {
      title: t("about.service2Title"),
      description: t("about.service2Desc"),
      color: "#ffb800",
    },
    {
      title: t("about.service3Title"),
      description: t("about.service3Desc"),
      color: "#22c55e",
    },
    {
      title: t("about.service4Title"),
      description: t("about.service4Desc"),
      color: "#60a5fa",
    },
    {
      title: t("about.service5Title"),
      description: t("about.service5Desc"),
      color: "#a78bfa",
    },
    {
      title: t("about.service6Title"),
      description: t("about.service6Desc"),
      color: "#34d399",
    },
  ], [t]);

  const serviceDetails = useMemo(() => [
    {
      intro: t("about.service1Intro"),
      points: [
        t("about.service1Point1"),
        t("about.service1Point2"),
        t("about.service1Point3"),
        t("about.service1Point4"),
      ],
    },
    {
      intro: t("about.service2Intro"),
      points: [
        t("about.service2Point1"),
        t("about.service2Point2"),
        t("about.service2Point3"),
        t("about.service2Point4"),
      ],
    },
    {
      intro: t("about.service3Intro"),
      points: [
        t("about.service3Point1"),
        t("about.service3Point2"),
        t("about.service3Point3"),
        t("about.service3Point4"),
      ],
    },
    {
      intro: t("about.service4Intro"),
      points: [
        t("about.service4Point1"),
        t("about.service4Point2"),
        t("about.service4Point3"),
        t("about.service4Point4"),
      ],
    },
    {
      intro: t("about.service5Intro"),
      points: [
        t("about.service5Point1"),
        t("about.service5Point2"),
        t("about.service5Point3"),
        t("about.service5Point4"),
      ],
    },
    {
      intro: t("about.service6Intro"),
      points: [
        t("about.service6Point1"),
        t("about.service6Point2"),
        t("about.service6Point3"),
        t("about.service6Point4"),
      ],
    },
  ], [t]);

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
  const popupCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const selectedService =
    selectedServiceIndex !== null
      ? {
          ...services[selectedServiceIndex],
          details: serviceDetails[selectedServiceIndex],
        }
      : null;

  const openServiceDetails = (serviceIndex: number, triggerButton?: HTMLButtonElement | null) => {
    if (triggerButton) {
      lastTriggerButtonRef.current = triggerButton;
    }
    setSelectedServiceIndex(serviceIndex);
    document.body.style.overflow = "hidden";
  };

  const closeServiceDetails = () => {
    setSelectedServiceIndex(null);
    document.body.style.overflow = "";
    window.setTimeout(() => {
      lastTriggerButtonRef.current?.focus();
    }, 0);
  };

  const backToServices = () => {
    closeServiceDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (selectedServiceIndex === null) return;

    popupCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeServiceDetails();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedServiceIndex]);

  const serviceImages = [
    "/assets-onboarding/onboarding-1.jpg",
    "/assets-onboarding/onboarding-2.jpg",
    "/assets-onboarding/onboarding-3.jpg",
    "/assets-onboarding/onboarding-4.jpg",
    "/assets-onboarding/onboarding-5.jpg",
    "/assets-onboarding/onboarding-6.jpg",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      {/* Services Section */}
      <section className="about-section py-12">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">
              {t("about.servicesTitle")} <span style={{ color: "var(--accent-logo-blue)" }}>{t("about.servicesHighlight")}</span>
            </h2>
            <p className="section-subtitle">
              {t("about.servicesDesc")}
            </p>
          </motion.div>

          <div className="services-two-columns">
            {[services.slice(0, 3), services.slice(3, 6)].map((column, columnIndex) => (
              <div key={columnIndex} className="services-column">
                {column.map((service, itemIndex) => {
                  const absoluteIndex = columnIndex * 3 + itemIndex;
                  const shortDescription =
                    service.description.length > 110
                      ? `${service.description.slice(0, 110)}...`
                      : service.description;

                  return (
                    <motion.article
                      key={absoluteIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: absoluteIndex * 0.08,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      viewport={{ once: true, amount: 0.35 }}
                      className="service-compact-card"
                    >
                      <div className="service-compact-media">
                        <img
                          src={serviceImages[absoluteIndex % serviceImages.length]}
                          alt={service.title}
                          loading="lazy"
                        />
                      </div>
                      <div className="service-compact-content">
                        <h3 className="service-compact-title">{service.title}</h3>
                        <p className="service-compact-description">{shortDescription}</p>
                      </div>
                      <button
                        type="button"
                        className="service-compact-button"
                        onClick={(event) =>
                          openServiceDetails(
                            absoluteIndex,
                            event.currentTarget as HTMLButtonElement
                          )
                        }
                        aria-haspopup="dialog"
                        aria-expanded={selectedServiceIndex === absoluteIndex}
                        aria-controls={
                          selectedServiceIndex === absoluteIndex ? "service-popup-dialog" : undefined
                        }
                      >
                        {t("about.learnMore")}
                      </button>
                    </motion.article>
                  );
                })}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {selectedService && (
        <div className="service-popup-overlay" onClick={closeServiceDetails}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="service-popup-card"
            id="service-popup-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="service-popup-close"
              onClick={closeServiceDetails}
              aria-label={t("about.closeServiceDetails")}
              ref={popupCloseButtonRef}
            >
              ×
            </button>

            <div className="service-popup-header">
              <h3 id="service-popup-title" className="service-popup-title">
                {selectedService.title}
              </h3>
            </div>

            <p className="service-popup-intro">{selectedService.details.intro}</p>

            <ul className="service-popup-list">
              {selectedService.details.points.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>

            <div className="service-popup-actions">
              <button type="button" className="service-popup-return" onClick={backToServices}>
                {t("about.backToServices")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Services;
