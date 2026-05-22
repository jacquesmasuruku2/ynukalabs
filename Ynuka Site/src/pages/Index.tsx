import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, Calendar, Rocket, Trees, ChevronRight, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { strapiFetch } from "@/lib/strapi";
import CustomButton from "@/components/ui/CustomButton";
import EventCard from "@/components/ui/EventCard";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/SectionHeading";

const heroVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

const fadeInUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const Index = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const stats = [
    { icon: Users, value: "500+", label: t("stats.members") },
    { icon: Calendar, value: "30+", label: t("stats.events") },
    { icon: Rocket, value: "15+", label: t("stats.projects") },
    { icon: Trees, value: "10000+", label: t("stats.treesPlanted") },
  ];

  const upcomingEvents = [
    { 
      title: t("events.event1Title"), 
      date: "25 Mars 2026", 
      type: "Workshop", 
      location: "Goma Innovation Center",
      time: "14:00 - 18:00"
    },
    { 
      title: t("events.event2Title"), 
      date: "10 Avril 2026", 
      type: "Hackathon", 
      location: "Virunga Tech Park",
      time: "09:00 - 20:00"
    },
    { 
      title: t("events.event3Title"), 
      date: "20 Avril 2026", 
      type: "Meetup", 
      location: "Goma Hub HQ",
      time: "17:00 - 19:00"
    },
  ];

  const projects = [
    { name: "KivuPay", category: "DeFi", description: t("projects.proj1Desc") },
    { name: "EduChain", category: "Education", description: t("projects.proj2Desc") },
    { name: "VolcanoDAO", category: "Social Impact", description: t("projects.proj3Desc") },
  ];

  const partners = [
    {
      name: "Apex Fusion",
      logo: "/partners/apex.png",
      description: "Apex Fusion",
      url: "https://apexfusion.com/",
    },
    {
      name: "Wada",
      logo: "/partners/wada.jpg",
      description:
        "Organisation et d'un incubateur communautaire axé sur l'adoption de la blockchain Cardano et de l'intelligence artificielle en Afrique.",
      url: "https://wada.org/",
    },
    {
      name: "Catalyst",
      logo: "/partners/Catalyst.jpg",
      description:
        "Project Catalyst is the world’s largest decentralized innovation engine for solving real-world challenges.",
      url: "https://projectcatalyst.io/",
    },
    {
      name: "Ekival",
      logo: "/partners/Ekival.png",
      description:
        "Solution pour le global pair à pair transfert d'argent et de cryptomonnaies",
      url: "https://ekival.com/",
    },
    {
      name: "ISDR-GL",
      logo: "/partners/partner1.png",
      description: "ISDR-GL - Development Rural",
      url: "https://isdrgl.com",
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    try {
      await strapiFetch("/api/newsletter-subscribers", {
        method: "POST",
        body: JSON.stringify({
          data: { email: newsletterEmail, active: true, subscribed_at: new Date().toISOString() },
        }),
      });

      toast({ title: t("home.subscribeSuccess") });
      setNewsletterEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.toLowerCase().includes("unique")) {
        toast({ title: t("home.alreadySubscribed") });
      } else {
        toast({ title: t("admin.error"), variant: "destructive" });
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <SectionWrapper padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="relative z-10">
          <motion.div {...heroVariants} className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("hero.badge")}
            </motion.div>
            
            <motion.h1 
              {...heroVariants}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-display"
            >
              {t("hero.title1")}{" "}
              <span className="gradient-text">{t("hero.title2")}</span>{" "}
              {t("hero.title3")}
            </motion.h1>
            
            <motion.p 
              {...heroVariants}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
            >
              {t("hero.subtitle")}
            </motion.p>
            
            <motion.div 
              {...heroVariants}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <CustomButton size="lg" asChild>
                <Link to="/community">
                  {t("hero.joinBtn")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CustomButton>
              <CustomButton variant="outline" size="lg" asChild>
                <Link to="/events">{t("hero.eventsBtn")}</Link>
              </CustomButton>
            </motion.div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Stats Section */}
      <SectionWrapper background="gray" padding="md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              {...fadeInUpVariants} 
              transition={{ ...fadeInUpVariants.transition, delay: i * 0.1 }} 
              className="text-center"
            >
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground font-display">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* About Preview */}
      <SectionWrapper padding="xl">
        <motion.div {...fadeInUpVariants} className="max-w-3xl mx-auto text-center">
          <SectionHeading 
            title={t("home.whatTitle")} 
            subtitle={t("home.whatSubtitle")} 
          />
          <p className="text-muted-foreground mb-8 text-lg">{t("home.whatDesc")}</p>
          <CustomButton variant="outline" asChild>
            <Link to="/about">
              {t("home.learnMore")} <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CustomButton>
        </motion.div>
      </SectionWrapper>

      {/* Events Section */}
      <SectionWrapper background="gray" padding="xl">
        <SectionHeading 
          title={t("home.upcomingTitle")} 
          subtitle={t("home.upcomingSubtitle")} 
        />
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event, i) => (
            <EventCard key={i} delay={i * 0.15}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {event.type}
                </span>
                <span className="text-xs text-muted-foreground">{event.time}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-display">{event.title}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </p>
              </div>
              <CustomButton variant="outline" size="sm" className="w-full">
                {t("home.register")} <ArrowRight className="ml-1 h-3 w-3" />
              </CustomButton>
            </EventCard>
          ))}
        </div>
        <div className="text-center mt-8">
          <CustomButton variant="outline" asChild>
            <Link to="/events">{t("home.viewAllEvents")}</Link>
          </CustomButton>
        </div>
      </SectionWrapper>

      {/* Projects Section */}
      <SectionWrapper padding="xl">
        <SectionHeading 
          title={t("home.projectsTitle")} 
          subtitle={t("home.projectsSubtitle")} 
        />
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <EventCard key={i} delay={i * 0.15}>
              <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                {project.category}
              </span>
              <h3 className="text-xl font-semibold mt-4 mb-2 font-display">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </EventCard>
          ))}
        </div>
        <div className="text-center mt-8">
          <CustomButton variant="outline" asChild>
            <Link to="/projects">{t("home.viewAllProjects")}</Link>
          </CustomButton>
        </div>
      </SectionWrapper>

      {/* Partners — fond #A5CEDD, texte blanc (référence design) */}
      <section className="py-16 lg:py-20 bg-[#A5CEDD]">
        <div className="section-wrapper">
          <motion.h2
            {...fadeInUpVariants}
            className="font-display text-3xl md:text-4xl font-bold text-center text-white tracking-tight mb-10 md:mb-12"
          >
            {t("home.partnersTitle")}
          </motion.h2>
          <div className="relative overflow-hidden py-6">
            <div className="flex w-max animate-scroll gap-5 md:gap-6 pr-5 md:pr-6">
              {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="flex flex-col items-center min-w-[200px] max-w-[220px] flex-shrink-0"
                >
                  <div className="w-full bg-white rounded-2xl border border-white/95 p-4 md:p-5 shadow-[0_12px_40px_rgba(15,55,80,0.12)] flex items-center justify-center min-h-[100px] mb-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-16 w-auto object-contain"
                      style={{ maxWidth: 160 }}
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center text-sm text-white/90 mb-2 font-medium px-1">
                    {partner.description}
                  </div>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-white/85 underline underline-offset-4 flex items-center gap-1 text-xs font-medium"
                  >
                    <span>Visit website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <SectionWrapper padding="xl" background="accent">
        <motion.div {...fadeInUpVariants} className="max-w-xl mx-auto text-center">
          <SectionHeading 
            title={t("home.newsletterTitle")} 
            subtitle={t("home.newsletterSubtitle")} 
          />
          <form className="flex flex-col sm:flex-row gap-3 mt-6" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t("home.emailPlaceholder")}
              className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent shadow-sm"
            />
            <CustomButton type="submit" disabled={subscribing} loading={subscribing}>
              {subscribing ? "..." : t("home.subscribe")}
            </CustomButton>
          </form>
        </motion.div>
      </SectionWrapper>
    </div>
  );
};

export default Index;
