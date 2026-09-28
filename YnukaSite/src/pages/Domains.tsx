import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Container from "@/components/ui/Container";
import "@/styles/AboutDesign.css";

const Domains = () => {
  const { t, i18n } = useTranslation();
  const [activeDomain, setActiveDomain] = useState(0);

  const domains = useMemo(() => {
    const asPoints = (key: string) => {
      const points = t(key, { returnObjects: true });
      return Array.isArray(points) ? (points as string[]) : [];
    };

    return [1, 2, 3, 4].map((index) => ({
      title: t(`about.interv${index}Title`),
      description: t(`about.interv${index}Desc`),
      points: asPoints(`about.interv${index}Points`),
    }));
  }, [t, i18n.language]);

  return (
    <main className="min-h-screen pt-20" style={{ background: "var(--dark-bg)" }}>
      <section className="about-section py-12 md:py-16">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 md:mb-10"
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("about.interventionTitle")} {" "}
              <span className="text-[#ffb800]">{t("about.interventionTitleHighlight")}</span>
            </h1>
          </motion.div>

          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="flex flex-col justify-center gap-2 lg:col-span-5">
              {domains.map((domain, index) => {
                const isActive = index === activeDomain;
                return (
                  <button
                    key={domain.title}
                    type="button"
                    onClick={() => setActiveDomain(index)}
                    aria-pressed={isActive}
                    className={`group relative w-full rounded-none border-l-[3px] px-4 py-3.5 text-left transition-all duration-300 md:px-5 md:py-4 ${
                      isActive
                        ? "border-[#ffb800] bg-[#0f2847] text-white"
                        : "border-transparent bg-transparent text-[#0f2847] hover:border-[#ffb800]/50 hover:bg-[#0f2847]/[0.04] dark:text-[#dbeafe]"
                    }`}
                  >
                    <span
                      className={`mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${
                        isActive ? "text-[#ffb800]" : "text-[#0f2847]/45 dark:text-white/40"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
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
                    key={activeDomain}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.35 }}
                    className="relative z-10"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#ffb800]">
                      {String(activeDomain + 1).padStart(2, "0")} — {domains[activeDomain]?.title}
                    </p>
                    <p className="mt-4 text-justify text-base font-medium leading-relaxed text-white/85 md:text-[1.05rem] md:leading-[1.75]">
                      {domains[activeDomain]?.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {(domains[activeDomain]?.points ?? []).map((point, pointIndex) => (
                        <motion.li
                          key={`${activeDomain}-${point}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.12 + pointIndex * 0.12 }}
                          className="flex gap-3 text-[0.95rem] font-semibold leading-snug text-white md:text-base"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffb800]" aria-hidden />
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
    </main>
  );
};

export default Domains;