import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import OpportunitiesSection from "@/components/OpportunitiesSection";

const Opportunities = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,184,0,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),transparent_30%)]" />
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-[#ffb800]/15 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <span className="inline-flex items-center rounded-full border border-[#ffb800]/40 bg-[#ffb800]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b77900] dark:text-[#f6c453]">
              Ynuka Labs
            </span>
            <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
              <span className="gradient-text">{t("opportunities.title")}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
              {t("opportunities.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <OpportunitiesSection showHeading={false} />
    </div>
  );
};

export default Opportunities;
