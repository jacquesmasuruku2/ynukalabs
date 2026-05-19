import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  Users,
  Calendar,
  Send,
  Rocket,
  Award,
  Star,
  Zap,
  Globe,
  Heart,
  Linkedin,
  Twitter,
  GraduationCap,
  ServerCog,
  Code2,
  FileText,
  ClipboardList,
  Leaf,
} from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import ModernCard from "@/components/ui/ModernCard";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";
import Container from "@/components/ui/Container";
import "@/styles/AboutDesign.css";
import { teamMembers, type TeamMember } from "@/data/teamMembers";
import { mediaToUrl, strapiFetch } from "@/lib/strapi";

const FALLBACK_ABOUT_HERO_BG = "/about/about.jpg";

function teamMembersWithValidImages(members: TeamMember[]): TeamMember[] {
  return members.filter(
    (m) =>
      Boolean(m.image?.trim()) &&
      !m.image.startsWith("TO_ADD_") &&
      !m.image.startsWith("http://TO_ADD")
  );
}

const About = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const objectives = [
    {
      title: "Onboarding & Éducation Web3",
      description:
        "Initier et certifier au moins 500 jeunes par an aux technologies de la Blockchain et du Web3, en leur fournissant les compétences techniques nécessaires.",
      icon: "",
    },
    {
      title: "Innovation Environnementale",
      description:
        "Digitaliser la reforestation à travers le projet Mtidano, en utilisant les NFTs pour tracer, financer et garantir la survie d'arbres plantés.",
      icon: "",
    },
    {
      title: "Pionnier du Développement Durable",
      description:
        "Développer des fermes pilotes utilisant des méthodes d'agriculture durable et maraîchère pour accroître la production locale.",
      icon: "",
    },
    {
      title: "Infrastructure & Décentralisation",
      description:
        "Opérer des nœuds validateurs robustes sur les réseaux Cardano, Apex Fusion et Safrochain pour la gouvernance blockchain.",
      icon: "",
    },
  ];

  const [team, setTeam] = useState<TeamMember[]>(teamMembers);

  type AboutPartner = { name: string; logo: string; url: string };
  const hardcodedAboutPartners: AboutPartner[] = [
    { name: "Apex Fusion", logo: "/partners/apex.png", url: "https://apexfusion.com/" },
    { name: "Wada", logo: "/partners/wada.jpg", url: "https://wada.org/" },
    { name: "Catalyst", logo: "/partners/Catalyst.jpg", url: "https://projectcatalyst.io/" },
    { name: "Ekival", logo: "/partners/Ekival.png", url: "https://ekival.com/" },
    { name: "ISDR-GL", logo: "/partners/partner1.png", url: "https://isdrgl.com" },
  ];
  const [partnersList, setPartnersList] = useState<AboutPartner[]>(hardcodedAboutPartners);

  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number | null>(null);
  const popupCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerButtonRef = useRef<HTMLButtonElement | null>(null);

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
  const missionVisuals = useMemo(() => {
    const fallback = Array.from({ length: 4 }, () => FALLBACK_ABOUT_HERO_BG);
    const picked = heroTeamMembers.slice(0, 4).map((m) => m.image || FALLBACK_ABOUT_HERO_BG);
    return [...picked, ...fallback].slice(0, 4);
  }, [heroTeamMembers]);

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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await strapiFetch<{ data: unknown[] }>(
          "/api/partners?populate=logo&pagination[pageSize]=50"
        );
        const items = res.data || [];
        const mapped: AboutPartner[] = items
          .map((item) => {
            const it = item as { attributes?: Record<string, unknown> };
            const attrs = (it.attributes ?? {}) as Record<string, unknown>;
            const name = String(attrs.name ?? "");
            const url = String(attrs.url ?? "");
            const logoUrl = mediaToUrl(attrs.logo) ?? "";
            if (!name || !url || !logoUrl) return null;
            return { name, url, logo: logoUrl };
          })
          .filter((p): p is AboutPartner => p !== null);

        if (mapped.length) setPartnersList(mapped);
      } catch {
        // fallback: hardcodedAboutPartners
      }
    };

    fetchPartners();
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
  const interventionDomains = [
    {
      title: "Education",
      description:
        "Programmes d'apprentissage, coaching et accompagnement pour développer les competences pratiques des jeunes et professionnels.",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "#0f6be8",
    },
    {
      title: "Nouvelles Technologies",
      description:
        "Blockchain, Web3, developpement logiciel et solutions numeriques pour accelerer l'innovation locale et regionale.",
      icon: <Code2 className="w-8 h-8" />,
      color: "#60a5fa",
    },
    {
      title: "Environnement",
      description:
        "Actions technologiques et communautaires en faveur de la durabilite, de l'agriculture responsable et de la resilience ecologique.",
      icon: <Leaf className="w-8 h-8" />,
      color: "#34d399",
    },
  ];

  const services = [
    {
      title: "Formation sur les nouvelles technologies",
      description:
        "Programmes pratiques et sessions intensives sur Web3, blockchain, outils numériques, IA et compétences digitales adaptées aux besoins locaux.",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "#0f6be8",
    },
    {
      title: "Opérateur de stake pools",
      description:
        "Exploitation et maintenance de nœuds validateurs et stake pools avec supervision continue, bonnes pratiques de sécurité et performance réseau.",
      icon: <ServerCog className="w-8 h-8" />,
      color: "#ffb800",
    },
    {
      title: "Developpement des solutions Web2 et Web3",
      description:
        "Conception de solutions digitales complètes : applications web, plateformes métiers, intégration blockchain et développement de contrats intelligents.",
      icon: <Code2 className="w-8 h-8" />,
      color: "#22c55e",
    },
    {
      title: "Services de secrétariat",
      description:
        "Services professionnels de bureau : impressions, saisie, scan, photocopie de documents, mise en page, préparation de dossiers et archivage.",
      icon: <FileText className="w-8 h-8" />,
      color: "#60a5fa",
    },
    {
      title: "Conception et planification des projets",
      description:
        "Accompagnement stratégique pour transformer une idée en projet exécutable : cadrage, planification, budget, feuille de route et suivi d'impact.",
      icon: <ClipboardList className="w-8 h-8" />,
      color: "#a78bfa",
    },
    {
      title: "Innovation verte et agriculture durable",
      description:
        "Intégration de solutions technologiques au service de l'agriculture durable pour renforcer la productivité locale et la résilience communautaire.",
      icon: <Leaf className="w-8 h-8" />,
      color: "#34d399",
    },
  ];

  const serviceDetails = [
    {
      intro:
        "Un parcours progressif pour aider les apprenants a passer de zero a une pratique autonome des outils technologiques.",
      points: [
        "Bootcamps de 4 a 8 semaines avec exercices hebdomadaires",
        "Parcours Web3, IA, no-code et outils de productivite numerique",
        "Coaching individuel pour portfolio et orientation professionnelle",
        "Evaluation finale avec mini-projet concret",
      ],
    },
    {
      intro:
        "Une exploitation fiable des infrastructures blockchain pour les projets qui recherchent stabilite et disponibilite.",
      points: [
        "Mise en place de nœuds validateurs et monitoring en temps reel",
        "Configuration de la securite reseau et alertes automatiques",
        "Rapports de performance mensuels avec indicateurs cles",
        "Maintenance preventive et support technique continu",
      ],
    },
    {
      intro:
        "Des produits digitaux sur mesure, de la conception a la mise en production avec accompagnement de l'equipe cliente.",
      points: [
        "Applications web et tableaux de bord metiers",
        "Integration d'API, authentification et paiements",
        "Developpement de smart contracts et interfaces Web3",
        "Documentation technique et transfert de competences",
      ],
    },
    {
      intro:
        "Un service administratif modernise pour gagner du temps et fiabiliser les flux documentaires.",
      points: [
        "Saisie, impression et mise en forme de documents officiels",
        "Numerisation, scan et classement digital des archives",
        "Preparation de dossiers administratifs complets",
        "Assistance ponctuelle ou abonnement de support bureau",
      ],
    },
    {
      intro:
        "Une methodologie pratique pour transformer une idee en plan d'action realiste et executable.",
      points: [
        "Etude des besoins et cadrage du projet",
        "Planification par phases, budget et jalons",
        "Suivi des risques et strategie d'attenuation",
        "Pilotage avec tableaux de bord de progression",
      ],
    },
    {
      intro:
        "Un appui terrain pour des initiatives vertes qui combinent impact social, environnemental et innovation numerique.",
      points: [
        "Conception d'initiatives d'agriculture durable locale",
        "Utilisation d'outils numeriques pour le suivi des cultures",
        "Formation des equipes communautaires aux bonnes pratiques",
        "Mesure d'impact environnemental et social simplifiee",
      ],
    },
  ];

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
    const section = document.getElementById("services");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    "/onboarding/onboarding-1.jpg",
    "/onboarding/onboarding-2.jpg",
    "/onboarding/onboarding-3.jpg",
    "/onboarding/onboarding-4.jpg",
    "/onboarding/onboarding-5.jpg",
    "/onboarding/onboarding-6.jpg",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--dark-bg)" }}>
      {/* Hero Section */}
      <section id="presentation" className="relative overflow-hidden py-16 md:py-24">
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

        <Container size="lg" className="relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Right: text */}
            <div className="lg:col-span-6 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100">
                  <Star className="h-4 w-4 text-blue-300" />
                  <span>Centre d'Innovation Hybride</span>
                </div>

                <h1 className="text-3xl md:text-[42px] font-bold leading-tight text-white whitespace-nowrap">
                  À propos de <span className="text-blue-400">Ynuka Labs</span>
                </h1>

                <p className="text-base md:text-lg leading-relaxed text-blue-50/90 max-w-xl text-justify">
                  Ynuka Labs est un centre d'innovation engagé dans l'éducation et l'incubation des
                  talents en Afrique Centrale. Notre approche conjugue rigueur académique et
                  expérimentation terrain pour former des builders capables de concevoir, déployer et
                  améliorer des solutions Web3 responsables. En reliant la blockchain à des pratiques
                  durables, nous transformons le potentiel de la jeunesse en résultats mesurables :
                  apprentissage structuré, projets incubés et impact concret au bénéfice des communautés.
                </p>

                <div className="flex items-center gap-4 pt-2 flex-nowrap">
                  <a
                    href="/community"
                    className="btn-primary rounded-2xl"
                    style={{
                      background: "#ffb800",
                      color: "#111111",
                    }}
                  >
                    <Zap className="w-5 h-5" />
                    Rejoindre la communauté
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href="/events" className="btn-secondary rounded-2xl shadow-md shadow-black/20">
                    <Calendar className="w-5 h-5" />
                    Voir les événements
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Left: overlapping portraits */}
            <div className="lg:col-span-6 lg:order-1 flex justify-start">
              <div className="relative w-full max-w-[560px] h-[520px]">
                <motion.div
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="absolute left-0 top-0 w-[320px] h-[360px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
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
                  className="absolute left-[230px] top-[300px] w-[300px] h-[200px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                >
                  <img
                    src={heroRight?.image ?? FALLBACK_ABOUT_HERO_BG}
                    alt={heroRight ? `Portrait — ${heroRight.name}` : "Équipe Ynuka Labs"}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="absolute left-[335px] top-[230px] z-20 rounded-xl bg-white px-5 py-3 shadow-2xl border border-white/70"
                >
                  <img
                    src="/logo.PNG"
                    alt="Logo Ynuka Labs"
                    className="block h-16 w-16 object-contain"
                    loading="lazy"
                  />
                </motion.div>

                <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <Container size="lg">
          <div className="mission-vision-layout">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="mission-vision-text"
            >
              <h2 className="mission-title">
                Notre <span style={{ color: "var(--accent-logo-blue)" }}>Mission</span>
              </h2>
              <p className="mission-paragraph">
                Transformer le potentiel de la jeunesse de Goma en impact reel par l'innovation
                hybride. Nous eduquons, accompagnons et outillons les talents locaux aux
                technologies de la Blockchain et aux pratiques de l'agriculture durable.
              </p>
              <h3 className="mission-subtitle">
                Notre <span style={{ color: "var(--accent-logo-blue)" }}>Vision</span>
              </h3>
              <p className="mission-paragraph">
                Faire de la RDC le premier epicentre africain de la "Blockchain for Good". Nous
                voulons faire de Goma Hub le moteur d'une economie decentralisee, verte et
                prospere en Afrique Centrale.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              viewport={{ once: true }}
              className="mission-visual-grid"
            >
              {missionVisuals.map((src, i) => (
                <div key={`${src}-${i}`} className={`mission-visual-card mission-visual-${i + 1}`}>
                  <img src={src} alt={`Equipe Ynuka Labs ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Objectives Section */}
      <section className="about-section">
        <Container size="lg">
          <div className="objectives-showcase">
            <div className="objective-main">
              <p className="objective-kicker">Nos objectifs</p>
              <h2 className="objective-main-title">
                Objectif <span style={{ color: "var(--accent-logo-blue)" }}>Principal</span>
              </h2>
              <p className="objective-main-description">
                Propulser la RDC comme le premier pôle d'innovation hybride en Afrique Centrale,
                en formant une nouvelle génération de leaders capables de transformer l'économie
                numérique (Web3/Blockchain) et la résilience écologique (Agriculture Durable).
              </p>
            </div>

            <div className="objectives-right">
              <div className="objectives-grid">
              {objectives.map((objective, i) => (
                <div
                  key={i}
                  className={`objective-card ${i === 0 || i === 3 ? "objective-card--blue" : "objective-card--light"}`}
                >
                  <div className="objective-icon">
                    {i === 0 && <GraduationCap className="h-6 w-6" />}
                    {i === 1 && <Leaf className="h-6 w-6" />}
                    {i === 2 && <Rocket className="h-6 w-6" />}
                    {i === 3 && <ServerCog className="h-6 w-6" />}
                  </div>
                  <h4 className="objective-title">{objective.title}</h4>
                  <p className="objective-description">{objective.description}</p>
                </div>
              ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Intervention Domains Section */}
      <section className="about-section">
        <Container size="lg">
          <div className="intervention-shell">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="intervention-header-row"
            >
              <div>
                <p className="intervention-kicker">
                  <span className="intervention-kicker-dark">Nos domaines</span>{" "}
                  <span className="intervention-kicker-blue">d'interventions</span>
                </p>
              </div>
            </motion.div>

            <div className="intervention-grid">
              {interventionDomains.map((domain, i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 * i }}
                  viewport={{ once: true }}
                  className="intervention-card"
                >
                  <span className="intervention-icon" style={{ color: "var(--accent-logo-blue)" }}>
                    {domain.icon}
                  </span>
                  <div className="intervention-card-inner">
                    <h3 className="intervention-card-title">{domain.title}</h3>
                    <p className="intervention-card-description">{domain.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="about-section" id="services">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2 className="section-title">
              Nos <span style={{ color: "var(--accent-logo-blue)" }}>Services</span>
            </h2>
            <p className="section-subtitle">
              Des services concrets, pensés pour les jeunes, les porteurs de projets,
              les institutions et les entrepreneurs qui veulent créer un impact réel.
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
                      initial={{ opacity: 0, y: 36 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.65,
                        delay: 0.12 * absoluteIndex,
                        ease: "easeOut",
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
                        En savoir plus
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
            transition={{ duration: 0.24, ease: "easeOut" }}
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
              aria-label="Fermer les details du service"
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
                Retourner aux services
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Section */}
      <section className="about-section scroll-mt-24" id="team">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.08 * i },
                    y: { duration: 0.6, delay: 0.08 * i },
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
                            <Twitter className="w-4 h-4" />
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
                            <Linkedin className="w-4 h-4" />
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
                            <Send className="w-4 h-4" />
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

      {/* Partenaires — même fond que mission / vision / objectifs */}
      <section id="partners" className="about-section scroll-mt-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl font-bold mb-10 md:mb-12 text-foreground tracking-tight"
          >
            <span className="block sm:inline">{t("partners.title")}</span>{" "}
            <span className="block sm:inline font-extrabold text-[#ffb800]">{t("partners.titleHighlight")}</span>
          </motion.h2>

          <div className="relative overflow-hidden py-6 md:py-8">
            <div className="flex w-max animate-scroll gap-5 md:gap-6 pr-5 md:pr-6">
              {[...partnersList, ...partnersList].map((partner, i) => (
                <div key={`${partner.name}-${i}`} className="flex-shrink-0">
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`${t("partners.visit")} — ${partner.name}`}
                  >
                    <div className="bg-white rounded-2xl border border-white/95 p-4 md:p-5 h-[100px] w-[200px] md:h-[108px] md:w-[220px] flex items-center justify-center shadow-[0_12px_40px_rgba(15,55,80,0.12)]">
                      <img
                        src={partner.logo}
                        alt=""
                        className="max-h-[72px] w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact (ancre #contact) */}
      <section id="contact" className="about-section scroll-mt-24">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="section-header text-center mb-10"
          >
            <h2 className="section-title">
              {t("contact.title")}
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t("contact.subtitle")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="content-card text-center"
            style={{
              margin: "20px auto",
              width: "calc(100% - 24px)",
              maxWidth: "920px",
              background:
                "linear-gradient(135deg, #2a3166, #242b5c)",
              border: "none",
            }}
          >
            <h3
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#ffb800",
                marginBottom: "16px",
                fontFamily: "var(--font-heading)",
              }}
            >
              Rejoignez Notre Mission
            </h3>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "32px",
                fontFamily: "var(--font-body)",
                maxWidth: "600px",
                margin: "0 auto 32px",
              }}
            >
              Ensemble, transformons la RD Congo en un pôle d'innovation
              blockchain et de développement durable. Votre contribution fait la
              différence.
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/contact"
                className="btn-primary"
                style={{
                  background: "var(--light-primary)",
                  color: "var(--accent-logo-blue)",
                }}
              >
                <Heart className="w-5 h-5" />
                Nous Contacter
              </a>
              <a
                href="/community"
                className="btn-primary"
                style={{
                  background: "#ffb800",
                  color: "#111111",
                }}
              >
                <Users className="w-5 h-5" />
                Rejoindre la communauté
              </a>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default About;
