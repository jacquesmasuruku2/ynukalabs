import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Users,
  Calendar,
  Send,
  Link,
  Share2,
} from "lucide-react";
import Container from "@/components/ui/Container";
import "@/styles/AboutDesign.css";
import { teamMembers, type TeamMember } from "@/data/teamMembers";
import { fetchPartners, fetchTeamMembers } from "@/lib/api";

const FALLBACK_ABOUT_HERO_BG = "/about/about.jpg";

function teamMembersWithValidImages(members: TeamMember[]): TeamMember[] {
  return members.filter(
    (m) =>
      Boolean(m.image?.trim()) &&
      !m.image.startsWith("TO_ADD_") &&
      !m.image.startsWith("http://TO_ADD")
  );
}

function classifyTeamDepts(role: string) {
  const r = role.toLowerCase();
  const depts: Array<"administration" | "developers" | "trainers" | "members"> = [];
  if (/leader|marketing|logistic|communication|design|media|manager|admin|\bit\b/.test(r)) {
    depts.push("administration");
  }
  if (/developer|software|writter|writer/.test(r)) {
    depts.push("developers");
  }
  if (/trainer|formateur/.test(r)) {
    depts.push("trainers");
  }
  if (/advicer|advisor/.test(r) && !depts.includes("trainers") && !depts.includes("administration")) {
    depts.push("administration");
  }
  if (depts.length === 0) {
    depts.push("members");
  }
  return depts;
}

const About = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [activeInterv, setActiveInterv] = useState(0);
  const [activeTeamDept, setActiveTeamDept] = useState<
    "all" | "administration" | "developers" | "trainers" | "members"
  >("members");

  const [team, setTeam] = useState<TeamMember[]>(teamMembers);

  type AboutPartner = { name: string; logo: string; url: string };
  const hardcodedAboutPartners: AboutPartner[] = [
    { name: "Wada", logo: "/partners/wada.jpg", url: "https://wada.org/" },
    { name: "Catalyst", logo: "/partners/Catalyst.jpg", url: "https://projectcatalyst.io/" },
    { name: "Ekival", logo: "/partners/Ekival.png", url: "https://ekival.com/" },
    { name: "ISDR-GL", logo: "/partners/partner1.png", url: "https://isdrgl.com" },
    { name: "Gender Chain", logo: "/partners/genderchain.png", url: "https://www.linkedin.com/company/genderchain" },
    { name: "Coxygen Global", logo: "/partners/coxygen-global.png", url: "https://coxygen.global" },
    { name: "Safrochain", logo: "/partners/safrochain.png", url: "https://safrochain.com/" },
  ];
  const [partnersList, setPartnersList] = useState<AboutPartner[]>(hardcodedAboutPartners);

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);

  const heroTeamMembers = useMemo(() => teamMembersWithValidImages(team), [team]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

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
  const missionImage = "/onboarding/onboarding-2.jpg";
  const visionImage = "/assets-about/vision-computer.jpg";

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const items = await fetchTeamMembers(100);
        const mapped: TeamMember[] = items
          .map((item) => ({
            slug: item.slug || String(item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            name: item.name || "",
            role: item.role || "",
            image: item.image || "",
            description: item.description || "",
            social: {
              x: item.social?.x || "",
              telegram: item.social?.telegram || "",
              linkedin: item.social?.linkedin || "",
            },
          }))
          .filter((m) => m.name && m.role);

        if (mapped.length) setTeam(mapped);
      } catch {
        // fallback: teamMembers local
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const items = await fetchPartners(50);
        const mapped: AboutPartner[] = items
          .map((item) => {
            const name = item.name || "";
            const url = item.website_url || "";
            const logoUrl = item.logo_url || "";
            if (!name || !url || !logoUrl) return null;
            return { name, url, logo: logoUrl };
          })
          .filter((p): p is AboutPartner => p !== null);

        if (mapped.length) setPartnersList(mapped);
      } catch {
        // fallback: hardcodedAboutPartners
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    const navbarOffset = 96;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;

    const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarOffset;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [location.hash]);
  const interventionDomains = useMemo(() => {
    const asPoints = (key: string) => {
      const points = t(key, { returnObjects: true });
      return Array.isArray(points) ? (points as string[]) : [];
    };
    return [
      {
        title: t("about.interv1Title"),
        description: t("about.interv1Desc"),
        points: asPoints("about.interv1Points"),
      },
      {
        title: t("about.interv2Title"),
        description: t("about.interv2Desc"),
        points: asPoints("about.interv2Points"),
      },
      {
        title: t("about.interv3Title"),
        description: t("about.interv3Desc"),
        points: asPoints("about.interv3Points"),
      },
      {
        title: t("about.interv4Title"),
        description: t("about.interv4Desc"),
        points: asPoints("about.interv4Points"),
      },
    ];
  }, [t, i18n.language]);

  const services = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((n) => {
      const points = [1, 2, 3, 4]
        .map((p) => t(`about.service${n}Point${p}`))
        .filter((point) => point && !point.startsWith("about."));
      return {
        title: t(`about.service${n}Title`),
        description: t(`about.service${n}Desc`),
        intro: t(`about.service${n}Intro`),
        points,
      };
    });
  }, [t, i18n.language]);

  const toggleService = (serviceIndex: number) => {
    setSelectedServiceIndex((prev) => (prev === serviceIndex ? null : serviceIndex));
  };

  const teamDepartments = useMemo(
    () => [
      { id: "administration" as const, label: t("about.teamDeptAdmin") },
      { id: "developers" as const, label: t("about.teamDeptDevs") },
      { id: "trainers" as const, label: t("about.teamDeptTrainers") },
      { id: "members" as const, label: t("about.teamDeptMembers") },
    ],
    [t, i18n.language]
  );

  const displayedTeam = useMemo(() => {
    if (activeTeamDept === "all" || activeTeamDept === "members") return team;
    return team.filter((m) => classifyTeamDepts(m.role).includes(activeTeamDept));
  }, [team, activeTeamDept]);

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      {/* Hero Section */}
      <section id="presentation" className="relative scroll-mt-28 overflow-hidden py-8 sm:py-12 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-slate-950/60 to-transparent" />
          <div
            key={heroBgUrl}
            className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity duration-700"
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
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-100">
                  <span className="whitespace-nowrap">{t("about.heroBadge")}</span>
                </div>

                <h1 className="typo-page-title font-bold text-white">
                  {t("about.title")} <span className="text-blue-400">{t("about.titleHighlight")}</span>
                </h1>

                <p className="typo-lead max-w-xl text-justify text-blue-50/90">
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
                    <span className="hidden sm:inline">{t("about.joinCommunity")}</span>
                    <span className="inline sm:hidden">{t("about.joinCommunity")}</span>
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 inline ml-1" />
                  </a>
                  <a href="/events" className="btn-secondary rounded-2xl w-full sm:w-auto text-center text-sm sm:text-base">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 inline" />
                    <span className="hidden sm:inline ml-1">{t("about.viewEvents")}</span>
                    <span className="inline sm:hidden">{t("about.viewEvents")}</span>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Left: overlapping portraits */}
            <div className="lg:col-span-6 lg:order-1 order-1 w-full flex justify-center lg:justify-start px-2 sm:px-0">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[560px] aspect-square sm:aspect-auto sm:h-80 md:h-96 lg:h-[520px]">
                <motion.div
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="hidden sm:block absolute left-0 top-0 w-32 sm:w-40 md:w-48 lg:w-[320px] h-40 sm:h-52 md:h-64 lg:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/5"
                >
                  <img
                    src={heroLeft?.image ?? FALLBACK_ABOUT_HERO_BG}
                    alt={heroLeft ? `Portrait — ${heroLeft.name}` : "Équipe Ynuka Labs"}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.05 }}
                  className="absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:left-[45%] md:left-[50%] lg:left-[230px] top-1/2 sm:top-auto sm:top-[60%] md:top-[65%] lg:top-[300px] -translate-y-1/2 sm:translate-y-0 w-28 sm:w-36 md:w-44 lg:w-[300px] h-28 sm:h-36 md:h-44 lg:h-[200px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-white/5"
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

      {/* Notre histoire — frise gauche étirée sur la hauteur du récit */}
      <section className="relative overflow-hidden bg-[#0f2847] py-16 text-white md:py-20" id="historique">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#ffb800]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <Container size="lg" className="relative z-10">
          <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true }}
              className="flex h-full flex-col lg:col-span-4"
            >
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.15rem] lg:leading-[1.1]">
                {t("about.historyTitle")}{" "}
                <span className="text-[#ffb800]">{t("about.historyTitleHighlight")}</span>
              </h2>

              <ol className="mt-8 flex min-h-0 flex-1 flex-col justify-between border-l-2 border-white/25 pl-6 md:mt-10 md:pl-7">
                {[
                  { year: t("about.historyYear2021"), label: t("about.historyLabel2021") },
                  { year: t("about.historyYear2022"), label: t("about.historyLabel2022") },
                  { year: t("about.historyYearImpact"), label: t("about.historyLabelImpact") },
                  { year: t("about.historyYear2026"), label: t("about.historyLabel2026") },
                ].map((item) => (
                  <li key={item.year} className="relative py-1 first:pt-0 last:pb-0">
                    <span
                      className="absolute -left-[1.7rem] top-2 h-3.5 w-3.5 rounded-full bg-[#ffb800] ring-[5px] ring-[#0f2847] md:-left-[1.85rem] md:top-2.5 md:h-4 md:w-4"
                      aria-hidden
                    />
                    <p className="font-display text-3xl font-bold leading-none tracking-tight text-[#ffb800] md:text-4xl lg:text-[2.75rem]">
                      {item.year}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-white/80 md:text-base">
                      {item.label}
                    </p>
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              viewport={{ once: true }}
              className="flex h-full flex-col justify-between lg:col-span-8"
            >
              <div className="space-y-5 md:space-y-6">
                <p className="text-justify text-base font-medium leading-relaxed text-white/90 md:text-lg md:leading-[1.8]">
                  {t("about.historyP1")}
                </p>
                <p className="text-justify text-base leading-relaxed text-white/75 md:text-[1.05rem] md:leading-[1.8]">
                  {t("about.historyP2")}
                </p>
                <p className="text-justify text-base leading-relaxed text-white/75 md:text-[1.05rem] md:leading-[1.8]">
                  {t("about.historyP3")}
                </p>
              </div>

              <blockquote className="mt-8 border-l-[3px] border-[#ffb800] bg-white/[0.06] px-5 py-5 md:mt-10 md:px-6 md:py-6">
                <p className="text-justify font-display text-lg font-semibold italic leading-relaxed text-white md:text-xl md:leading-[1.7]">
                  {t("about.historyP4")}
                </p>
              </blockquote>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Mission & Vision — coins opposés marine/jaune + textes italiques */}
      <section className="about-section" id="mission-vision">
        <Container size="lg" className="space-y-10 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-6">
              <div className="mv-frame mv-frame--mission">
                <span className="mv-corner mv-corner--tl" aria-hidden />
                <span className="mv-corner mv-corner--br" aria-hidden />
                <div className="mv-frame-media">
                  <img src={missionImage} alt="" loading="lazy" />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center lg:col-span-6">
              <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
                Notre <span className="text-[#ffb800]">Mission</span>
              </h2>
              <p className="mv-copy">{t("about.missionDesc")}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            viewport={{ once: true }}
            className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-6">
              <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
                Notre <span className="text-[#ffb800]">Vision</span>
              </h2>
              <p className="mv-copy">{t("about.visionDesc")}</p>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6">
              <div className="mv-frame mv-frame--vision">
                <span className="mv-corner mv-corner--tr" aria-hidden />
                <span className="mv-corner mv-corner--bl" aria-hidden />
                <div className="mv-frame-media">
                  <img src={visionImage} alt="" loading="lazy" />
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Domaines d'intervention — axe à gauche, sous-points à droite */}
      <section className="about-section scroll-mt-28" id="domaines">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-10"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("about.interventionTitle")}{" "}
              <span className="text-[#ffb800]">{t("about.interventionTitleHighlight")}</span>
            </h2>
          </motion.div>

          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="flex flex-col justify-center gap-2 lg:col-span-5">
              {interventionDomains.map((domain, i) => {
                const active = i === activeInterv;
                return (
                  <button
                    key={domain.title}
                    type="button"
                    onClick={() => setActiveInterv(i)}
                    className={`group relative w-full rounded-none border-l-[3px] px-4 py-3.5 text-left transition-all duration-300 md:px-5 md:py-4 ${
                      active
                        ? "border-[#ffb800] bg-[#0f2847] text-white"
                        : "border-transparent bg-transparent text-[#0f2847] hover:border-[#ffb800]/50 hover:bg-[#0f2847]/[0.04] dark:text-[#dbeafe]"
                    }`}
                  >
                    <span
                      className={`mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${
                        active ? "text-[#ffb800]" : "text-[#0f2847]/45 dark:text-white/40"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-base font-bold leading-snug md:text-lg">
                      {domain.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              <div className="relative flex h-full min-h-[280px] flex-col justify-center overflow-hidden bg-[#0f2847] px-6 py-8 text-white md:min-h-[320px] md:px-8 md:py-10">
                <div
                  className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[#ffb800]/15 blur-3xl"
                  aria-hidden
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInterv}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35 }}
                    className="relative z-10"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#ffb800]">
                      {String(activeInterv + 1).padStart(2, "0")} — {interventionDomains[activeInterv]?.title}
                    </p>
                    <p className="mt-4 text-justify text-base font-medium leading-relaxed text-white/85 md:text-[1.05rem] md:leading-[1.75]">
                      {interventionDomains[activeInterv]?.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {(interventionDomains[activeInterv]?.points ?? []).map((point, pi) => (
                        <motion.li
                          key={`${activeInterv}-${point}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.12 + pi * 0.12 }}
                          className="flex gap-3 text-[0.95rem] font-semibold leading-snug text-white md:text-base"
                        >
                          <span
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffb800]"
                            aria-hidden
                          />
                          <span>{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Services — liste éditoriale + détail déroulant */}
      <section className="about-section scroll-mt-28" id="services">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              {t("about.servicesTitle")}{" "}
              <span className="text-[#ffb800]">{t("about.servicesHighlight")}</span>
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-14 bg-[#ffb800]" aria-hidden />
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#0f2847]/70 dark:text-[#93c5fc]/85 md:text-lg md:leading-[1.7]">
              {t("about.servicesDesc")}
            </p>
          </motion.div>

          <div className="overflow-hidden rounded-card border border-[#0f2847]/12 bg-white/40 dark:border-white/10 dark:bg-white/[0.02]">
            {services.map((service, i) => {
              const open = selectedServiceIndex === i;
              const contactHref = `/contact?subject=${encodeURIComponent(
                `${t("about.serviceContactCta")}: ${service.title}`
              )}`;
              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  viewport={{ once: true }}
                  className={`border-b border-[#0f2847]/10 last:border-b-0 dark:border-white/10 ${
                    open ? "bg-[#0f2847] text-white" : "bg-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleService(i)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-4 px-4 py-5 text-left transition-colors md:gap-6 md:px-6 md:py-6"
                  >
                    <span
                      className={`mt-0.5 font-display text-sm font-bold tabular-nums md:text-base ${
                        open ? "text-[#ffb800]" : "text-[#ffb800]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-lg font-bold tracking-tight md:text-xl ${
                          open ? "text-white" : "text-[#0f2847] dark:text-white"
                        }`}
                      >
                        {service.title}
                      </h3>
                      {!open && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#0f2847]/65 dark:text-[#93c5fc]/75 md:text-[0.95rem]">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 transition-transform duration-300 ${
                        open
                          ? "rotate-180 text-[#ffb800]"
                          : "text-[#0f2847]/45 dark:text-white/45"
                      }`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key={`service-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-6 px-4 pb-7 md:grid-cols-12 md:gap-8 md:px-6 md:pb-8 md:pl-16">
                          <div className="md:col-span-5">
                            <p className="text-justify text-[0.95rem] font-medium italic leading-relaxed text-white/85 md:text-base md:leading-[1.7]">
                              {service.intro}
                            </p>
                            <motion.a
                              href={contactHref}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: 0.35 }}
                              className="mt-6 inline-flex items-center gap-2 border border-[#ffb800] bg-[#ffb800] px-4 py-2.5 text-sm font-bold text-[#111111] transition hover:brightness-105"
                            >
                              {t("about.serviceContactCta")}
                              <ArrowRight className="h-4 w-4" aria-hidden />
                            </motion.a>
                          </div>
                          <ul className="space-y-2.5 md:col-span-7">
                            {service.points.map((point, pi) => (
                              <motion.li
                                key={point}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35, delay: 0.08 + pi * 0.08 }}
                                className="flex gap-3 border-l-2 border-[#ffb800] bg-white/[0.06] px-3 py-2.5 text-sm font-semibold leading-snug text-white md:text-[0.95rem]"
                              >
                                <span className="text-[#ffb800]" aria-hidden>
                                  →
                                </span>
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Team — grille légère + départements (inspiration capture) */}
      <section className="about-section scroll-mt-28" id="team">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="mx-auto mb-10 max-w-3xl text-center md:mb-12"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              {t("about.teamTitle")}{" "}
              <span className="text-[#ffb800]">{t("about.teamTitleHighlight")}</span>
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-14 bg-[#ffb800]" aria-hidden />
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#0f2847]/70 dark:text-[#93c5fc]/85 md:text-lg md:leading-[1.7]">
              {t("about.teamIntro")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-9 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
            {[
              ...displayedTeam.slice(0, 3).map((member) => ({ kind: "member" as const, member })),
              { kind: "departments" as const },
              ...displayedTeam.slice(3).map((member) => ({ kind: "member" as const, member })),
            ].map((item, i) => {
              if (item.kind === "departments") {
                return (
                  <motion.aside
                    key="team-departments"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                    viewport={{ once: true }}
                    className="flex min-h-[14rem] flex-col self-stretch md:min-h-0"
                  >
                    <div className="flex h-full flex-col border border-[#0f2847] bg-[#0f2847] px-4 py-5 text-left text-white sm:px-5 sm:py-6">
                      <p className="border-b border-[#ffb800]/80 pb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#ffb800]">
                        {t("about.teamDepartments")}
                      </p>
                      <ul className="mt-4 flex flex-1 flex-col justify-center gap-3.5">
                        {teamDepartments.map((dept) => {
                          const active = activeTeamDept === dept.id;
                          return (
                            <li key={dept.id}>
                              <button
                                type="button"
                                onClick={() => setActiveTeamDept(dept.id)}
                                className={`group/dept inline-flex w-full items-center gap-2 text-left text-[0.82rem] font-semibold leading-snug transition sm:text-sm ${
                                  active
                                    ? "text-[#ffb800]"
                                    : "text-white/80 hover:text-white"
                                }`}
                              >
                                <ArrowUpRight
                                  className={`h-3.5 w-3.5 shrink-0 transition ${
                                    active ? "text-[#ffb800]" : "text-[#ffb800]/70 group-hover/dept:text-[#ffb800]"
                                  }`}
                                  aria-hidden
                                />
                                <span>{dept.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </motion.aside>
                );
              }

              const member = item.member;
              const hasImage =
                Boolean(member.image?.trim()) &&
                !member.image.startsWith("TO_ADD_") &&
                !member.image.startsWith("http://TO_ADD");
              const hasX = member.social.x.startsWith("http");
              const hasTelegram = member.social.telegram.startsWith("http");
              const hasLinkedIn = member.social.linkedin.startsWith("http");
              const hasAnySocial = hasX || hasTelegram || hasLinkedIn;

              return (
                <motion.article
                  key={member.slug || member.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.24) }}
                  viewport={{ once: true }}
                  className="group flex flex-col text-center"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-card bg-[#e8eef5]">
                    {hasImage ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                        className="h-full w-full object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Users className="h-8 w-8 text-[#0f2847]/35" aria-hidden />
                      </div>
                    )}
                    {hasAnySocial && (
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-[#0f2847]/55 to-transparent px-2 pb-2.5 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                        {hasX && (
                          <a
                            href={member.social.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/95 p-1.5 text-[#0f2847]"
                            aria-label={`X — ${member.name}`}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {hasLinkedIn && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/95 p-1.5 text-[#0f2847]"
                            aria-label={`LinkedIn — ${member.name}`}
                          >
                            <Link className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {hasTelegram && (
                          <a
                            href={member.social.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-white/95 p-1.5 text-[#0f2847]"
                            aria-label={`Telegram — ${member.name}`}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-snug text-[#0f2847] dark:text-white md:text-[0.95rem]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#0f2847]/55 dark:text-[#93c5fc]/70 md:text-[0.8rem]">
                    {member.role}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Partenaires — marquee + CTA */}
      <section id="partners" className="about-section scroll-mt-28">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              <span>{t("partners.title")}</span>{" "}
              <span className="text-[#ffb800]">{t("partners.titleHighlight")}</span>
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-14 bg-[#ffb800]" aria-hidden />
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#0f2847]/70 dark:text-[#93c5fc]/85 md:text-lg md:leading-[1.7]">
              {t("partners.subtitle")}
            </p>
          </motion.div>

          <div className="relative overflow-hidden py-4 md:py-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--dark-bg,white)] to-transparent sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--dark-bg,white)] to-transparent sm:w-16" />
            <div className="flex w-max animate-scroll gap-5 md:gap-6 pr-5 md:pr-6">
              {[...partnersList, ...partnersList].map((partner, i) => (
                <div key={`${partner.name}-${i}`} className="flex-shrink-0">
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb800] focus-visible:ring-offset-2"
                    aria-label={`${t("partners.visit")} — ${partner.name}`}
                  >
                    <div className="flex h-[96px] w-[190px] items-center justify-center border border-[#0f2847]/10 bg-white px-4 py-3 md:h-[104px] md:w-[210px] dark:border-white/10">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-[64px] w-full object-contain"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const fallback = img.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.hidden = false;
                        }}
                      />
                      <span
                        hidden
                        className="px-2 text-center text-sm font-bold leading-snug text-[#0f2847]"
                      >
                        {partner.name}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-8 flex flex-col items-center gap-2 text-center md:mt-10"
          >
            <a
              href={`/contact?subject=${encodeURIComponent(t("partners.becomeCta"))}`}
              className="inline-flex items-center gap-2 border border-[#ffb800] bg-[#ffb800] px-5 py-2.5 text-sm font-bold text-[#111111] transition hover:brightness-105"
            >
              {t("partners.becomeCta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <p className="text-xs font-medium text-[#0f2847]/55 dark:text-[#93c5fc]/70">
              {t("partners.becomeCtaHint")}
            </p>
          </motion.div>
        </Container>
      </section>

    </div>
  );
};

export default About;
