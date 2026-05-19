import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { EcosystemValidatorsSection } from "@/components/EcosystemValidatorsSection";

const Validators = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
              <span className="gradient-text">{t("validators.title")}</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("validators.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <EcosystemValidatorsSection showHeading={false} />
    </div>
  );
};

export default Validators;
