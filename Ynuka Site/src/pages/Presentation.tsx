import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calendar, Star, Zap, GraduationCap, ServerCog, Code2, FileText, ClipboardList, Leaf, Users, X, MessageCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import { teamMembers, type TeamMember } from "@/data/teamMembers";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";
import "@/styles/AboutDesign.css";

// Custom LinkedIn icon since it's not available in lucide-react
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FALLBACK_ABOUT_HERO_BG = "/assets-about/about.jpg";

function teamMembersWithValidImages(members: TeamMember[]): TeamMember[] {
  return members.filter(
    (m) =>
      Boolean(m.image?.trim()) &&
      !m.image.startsWith("TO_ADD_") &&
      !m.image.startsWith("http://TO_ADD")
  );
}

const Presentation = () => {
  const { t } = useTranslation();

  const [team, setTeam] = useState<TeamMember[]>(teamMembers);

  const heroTeamMembers = useMemo(() => teamMembersWithValidImages(team), [team]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const services = useMemo(() => [
    {
      title: t("about.service1Title"),
      description: t("about.service1Desc"),
      icon: <GraduationCap className="w-8 h-8" />,
      color: "#0f6be8",
    },
    {
      title: t("about.service2Title"),
      description: t("about.service2Desc"),
      icon: <ServerCog className="w-8 h-8" />,
      color: "#ffb800",
    },
    {
      title: t("about.service3Title"),
      description: t("about.service3Desc"),
      icon: <Code2 className="w-8 h-8" />,
      color: "#22c55e",
    },
    {
      title: t("about.service4Title"),
      description: t("about.service4Desc"),
      icon: <FileText className="w-8 h-8" />,
      color: "#60a5fa",
    },
    {
      title: t("about.service5Title"),
      description: t("about.service5Desc"),
      icon: <ClipboardList className="w-8 h-8" />,
      color: "#a78bfa",
    },
    {
      title: t("about.service6Title"),
      description: t("about.service6Desc"),
      icon: <Leaf className="w-8 h-8" />,
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

  useEffect(() => {
    setHeroSlideIndex(0);
  }, [heroTeamMembers.length]);

  useEffect(() => {
    if (heroTeamMembers.length < 2) return;
    const id = window.setInterval(() => {
      setHeroSlideIndex((i) => (i + 1) % heroTeamMembers.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroTeamMembers.length]);

  const heroCount = heroTeamMembers.length;
  const heroBgUrl =
    heroCount > 0
      ? heroTeamMembers[heroSlideIndex % heroCount].image
      : FALLBACK_ABOUT_HERO_BG;
  const heroLeft = heroCount > 0 ? heroTeamMembers[heroSlideIndex % heroCount] : null;
  const heroRight =
    heroCount > 1
      ? heroTeamMembers[(heroSlideIndex + 1) % heroCount]
      : heroCount === 1
        ? heroTeamMembers[0]
        : null;

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/team-members?populate=image&pagination[pageSize]=100"
        );
        const items = res.data || [];

        const mapped: TeamMember[] = items
          .map((item) => {
            const it = item as { id?: string | number; attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const imageUrl = mediaToUrl(attrs.image) ?? "";

            return {
              name: String(attrs.name ?? ""),
              role: String(attrs.role ?? ""),
              image: imageUrl,
              social: {
                x: String(attrs.social_x ?? attrs.x ?? ""),
                telegram: String(attrs.social_telegram ?? attrs.telegram ?? ""),
                linkedin: String(attrs.social_linkedin ?? attrs.linkedin ?? ""),
              },
            } satisfies TeamMember;
          })
          .filter((m) => m.name && m.role);

        if (mapped.length) setTeam(mapped);
      } catch {
        // fallback: teamMembers local
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-slate-950/60 to-transparent" />
          <div
            key={heroBgUrl}
            className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: `url('${heroBgUrl}')`,
            }}
          />
        </div>

        <Container size="lg" className="relative px-4 sm:px-6 md:px-8">
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            {/* Right: text */}
            <div className="lg:col-span-6 lg:order-2 order-2">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-100">
                  <Star className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-300" />
                  <span className="whitespace-nowrap">{t("about.heroBadge")}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-[42px] font-bold leading-tight text-white">
                  {t("about.heroTitle")} <span className="text-blue-400">{t("about.heroTitleHighlight")}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-blue-50/90 max-w-xl text-justify">
                  {t("about.heroDesc")}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
                  <a
                    href="/community"
                    className="btn-primary rounded-2xl w-full sm:w-auto text-center text-sm sm:text-base"
                    style={{
                      background: "#ffb800",
                      color: "#111111",
                    }}
                  >
                    <Zap className="w-4 sm:w-5 h-4 sm:h-5 inline" />
                    <span className="hidden sm:inline ml-1">{t("about.joinCommunity")}</span>
                    <span className="inline sm:hidden">{t("about.joinCommunity").split(" ")[0]}</span>
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 inline ml-1" />
                  </a>
                  <a href="/events" className="btn-secondary rounded-2xl w-full sm:w-auto text-center text-sm sm:text-base shadow-md shadow-black/20">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 inline" />
                    <span className="hidden sm:inline ml-1">{t("about.viewEvents")}</span>
                    <span className="inline sm:hidden">{t("about.viewEvents").split(" ")[0]}</span>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Left: overlapping portraits */}
            <div className="lg:col-span-6 lg:order-1 order-1 w-full flex justify-center lg:justify-start px-2 sm:px-0">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[560px] aspect-square sm:aspect-auto sm:h-80 md:h-96 lg:h-[520px]">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="hidden sm:block absolute left-0 top-0 w-32 sm:w-40 md:w-48 lg:w-[320px] h-40 sm:h-52 md:h-64 lg:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                >
                  <img
                    src={heroLeft?.image ?? FALLBACK_ABOUT_HERO_BG}
                    alt={heroLeft ? `Portrait — ${heroLeft.name}` : "Équipe Ynuka Labs"}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:left-[45%] md:left-[50%] lg:left-[230px] top-1/2 sm:top-auto sm:top-[60%] md:top-[65%] lg:top-[300px] -translate-y-1/2 sm:translate-y-0 w-28 sm:w-36 md:w-44 lg:w-[300px] h-28 sm:h-36 md:h-44 lg:h-[200px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                >
                  <img
                    src={heroRight?.image ?? FALLBACK_ABOUT_HERO_BG}
                    alt={heroRight ? `Portrait — ${heroRight.name}` : "Équipe Ynuka Labs"}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </motion.div>

                <div className="absolute -left-12 -bottom-12 w-32 sm:w-40 md:w-48 lg:w-48 h-32 sm:h-40 md:h-48 lg:h-48 rounded-full bg-blue-500/15 blur-2xl hidden sm:block" />
              </div>
            </div>
          </div>
        </Container>
      </section>

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
              <span className="service-popup-icon">{selectedService.icon}</span>
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

      {/* Team Section */}
      <section className="about-section py-12">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">
              Notre{" "}
              <span style={{ color: "var(--accent-logo-blue)" }}>Équipe</span>
            </h2>
          </motion.div>

          <div className="team-grid">
            {team.map((member, i) => {
              const hasX = member.social.x.startsWith("http");
              const hasTelegram = member.social.telegram.startsWith("http");
              const hasLinkedIn = member.social.linkedin.startsWith("http");
              const hasAnySocial = hasX || hasTelegram || hasLinkedIn;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    opacity: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
                    y: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  viewport={{ once: true }}
                  className="team-card"
                >
                  <div className="team-media">
                    <div className="team-avatar">
                      {member.image && !member.image.startsWith("TO_ADD_") ? (
                        <img src={member.image} alt={member.name} loading="lazy" />
                      ) : (
                        <div className="team-avatar-placeholder">
                          <Users
                            className="w-10 h-10"
                            style={{ color: "var(--accent-logo-blue)" }}
                          />
                        </div>
                      )}
                    </div>

                    {hasAnySocial && (
                      <div className="team-overlay-socials">
                        {hasX && (
                          <a
                            href={member.social.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte X de ${member.name}`}
                          >
                            <X className="w-4 h-4" />
                          </a>
                        )}
                        {hasLinkedIn && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte LinkedIn de ${member.name}`}
                          >
                            <LinkedinIcon className="w-4 h-4" />
                          </a>
                        )}
                        {hasTelegram && (
                          <a
                            href={member.social.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-social-link"
                            aria-label={`Compte Telegram de ${member.name}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="team-meta">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Presentation;
