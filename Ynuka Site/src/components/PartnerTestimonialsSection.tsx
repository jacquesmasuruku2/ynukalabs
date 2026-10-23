import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  roleKey?: string;
  quote: string;
  quoteKey?: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "sarah",
    name: "Sarah J. Christopher",
    role: "Participante Atelier Web3",
    roleKey: "participantRole",
    quote:
      "Ynuka Labs m'a apporté les compétences et le réseau pour lancer ma première DApp. La communauté et l'accompagnement ici sont tout simplement incroyables.",
    quoteKey: "test1",
    avatar: "/team/rachel.jpg",
  },
  {
    id: "catalyst",
    name: "Project Catalyst",
    role: "Partenaire Innovation Décentralisée",
    roleKey: "catalystRole",
    quote:
      "Une collaboration remarquable qui s'inscrit dans une dynamique d'innovation décentralisée et de solutions concrètes pour les communautés locales.",
    quoteKey: "catalyst",
    avatar: "/partners/Catalyst.jpg",
  },
  {
    id: "martin",
    name: "Martin A. Wright",
    role: "Développeur & Participant Bootcamp",
    roleKey: "developerRole",
    quote:
      "Avant les ateliers Ynuka Labs, la blockchain me paraissait inaccessible. Aujourd'hui, je développe et déploie des smart contracts en toute autonomie.",
    quoteKey: "test2",
    avatar: "/team/martin.jpg",
  },
  {
    id: "wada",
    name: "Wada Network",
    role: "Partenaire Écosystème Afrique",
    roleKey: "wadaRole",
    quote:
      "Un partenaire engagé et visionnaire pour l'adoption concrète de la blockchain et des technologies émergentes à travers le continent.",
    quoteKey: "wada",
    avatar: "/partners/wada.jpg",
  },
  {
    id: "carol",
    name: "Carol D. Story",
    role: "Porteuse de Projet Incubation",
    roleKey: "incubatedRole",
    quote:
      "Le programme d'accompagnement m'a aidée à transformer une simple idée en une solution financée et déployée sur le terrain. Une aventure humaine unique.",
    quoteKey: "test3",
    avatar: "/team/Jacques.jpg",
  },
];

export function PartnerTestimonialsSection() {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const total = TESTIMONIALS.length;
  const prevIndex = (activeIndex - 1 + total) % total;
  const nextIndex = (activeIndex + 1) % total;

  const currentItem = TESTIMONIALS[activeIndex];
  const prevItem = TESTIMONIALS[prevIndex];
  const nextItem = TESTIMONIALS[nextIndex];

  const getQuote = (item: TestimonialItem) => {
    if (item.quoteKey) {
      const translated = t(`blockchainTestimonials.${item.quoteKey}`, { defaultValue: "" });
      if (translated && translated !== `blockchainTestimonials.${item.quoteKey}`) {
        return translated;
      }
    }
    return item.quote;
  };

  const isEn = i18n.language?.startsWith("en");

  return (
    <section className="relative overflow-hidden py-12 md:py-18 bg-transparent text-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
        {/* Header : ligne courte + titre en lettres espacées */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <div className="h-[2px] w-12 bg-white/70 mb-4 rounded-full" aria-hidden="true" />
          <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-[0.25em] text-white">
            {isEn ? "WHAT THEY SAY ABOUT US" : "CE QU'ILS DISENT DE NOUS"}
          </h2>
        </div>

        {/* 3 Columns Carousel Display */}
        <div className="relative mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center">
            {/* Left Item (Prev) - Hidden on very small screens, clickable on md+ */}
            <div
              onClick={() => setActiveIndex(prevIndex)}
              className="hidden md:flex md:col-span-3 flex-col items-center opacity-40 hover:opacity-80 transition-all duration-300 cursor-pointer select-none"
            >
              {/* Quote text without background */}
              <div className="flex items-start gap-2.5 min-h-[90px] px-2 text-left">
                <svg
                  className="h-5 w-5 shrink-0 fill-current text-white/30 mt-0.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-xs leading-relaxed text-slate-300 line-clamp-4">
                  {getQuote(prevItem)}
                </p>
              </div>

              {/* Connector dot */}
              <div className="flex flex-col items-center justify-center my-3" aria-hidden="true">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
              </div>

              {/* Avatar & Author Info */}
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 rounded-full ring-1 ring-white/20 overflow-hidden bg-slate-800">
                  <img
                    src={prevItem.avatar}
                    alt={prevItem.name}
                    className="h-full w-full object-cover grayscale-[20%]"
                  />
                </div>
                <h4 className="mt-2 font-display text-xs font-semibold text-slate-300 truncate max-w-[160px]">
                  {prevItem.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                  {prevItem.role}
                </p>
              </div>
            </div>

            {/* Center Active Item */}
            <div className="md:col-span-6 flex flex-col items-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Active Blue Speech Bubble Card */}
                  <div className="relative w-full rounded-2xl bg-[#0f2249] px-6 py-6 sm:px-7 sm:py-7 shadow-[0_16px_40px_-10px_rgba(26,100,245,0.45)]">
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      <svg
                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 fill-current text-white/50"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-white">
                        {getQuote(currentItem)}
                      </p>
                    </div>
                  </div>

                  {/* Connector dot */}
                  <div className="flex flex-col items-center justify-center my-3.5" aria-hidden="true">
                    <div className="h-2 w-2 rounded-full bg-[#0e2350] shadow-[0_0_10px_#38bdf8]" />
                  </div>

                  {/* Active Avatar & Author */}
                  <div className="flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-full ring-2 ring-[#0e2350] ring-offset-2 ring-offset-transparent shadow-lg overflow-hidden bg-white/10">
                      <img
                        src={currentItem.avatar}
                        alt={currentItem.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="mt-2.5 font-display text-sm sm:text-base font-bold text-white tracking-tight">
                      {currentItem.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-300/80 font-medium">
                      {currentItem.role}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Item (Next) - Hidden on very small screens, clickable on md+ */}
            <div
              onClick={() => setActiveIndex(nextIndex)}
              className="hidden md:flex md:col-span-3 flex-col items-center opacity-40 hover:opacity-80 transition-all duration-300 cursor-pointer select-none"
            >
              {/* Quote text without background */}
              <div className="flex items-start gap-2.5 min-h-[90px] px-2 text-left">
                <svg
                  className="h-5 w-5 shrink-0 fill-current text-white/30 mt-0.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-xs leading-relaxed text-slate-300 line-clamp-4">
                  {getQuote(nextItem)}
                </p>
              </div>

              {/* Connector dot */}
              <div className="flex flex-col items-center justify-center my-3" aria-hidden="true">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
              </div>

              {/* Avatar & Author Info */}
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 rounded-full ring-1 ring-white/20 overflow-hidden bg-slate-800">
                  <img
                    src={nextItem.avatar}
                    alt={nextItem.name}
                    className="h-full w-full object-cover grayscale-[20%]"
                  />
                </div>
                <h4 className="mt-2 font-display text-xs font-semibold text-slate-300 truncate max-w-[160px]">
                  {nextItem.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                  {nextItem.role}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination Dots at bottom */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Témoignage ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  activeIndex === i
                    ? "h-2.5 w-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)] scale-110"
                    : "h-2 w-2 border border-white/60 bg-transparent hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default PartnerTestimonialsSection;
