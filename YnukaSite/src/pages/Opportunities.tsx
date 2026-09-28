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

        <div className="relative mx-auto w-full max-w-[1200px] px-4 text-left sm:px-6 md:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl lg:text-[2.75rem]">
              {t("opportunities.title")}
            </h1>
            <p className="mt-3 max-w-3xl text-justify text-base font-semibold leading-relaxed text-[#1e3a5f] dark:text-[#93c5fc] md:text-lg">
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
