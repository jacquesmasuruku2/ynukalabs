import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ToolsGridSection from "@/components/ToolsGridSection";

const Tools = () => {
  const { t } = useTranslation();

  return (
    <div>
      <section className="py-20 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">{t("tools.title")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("tools.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <ToolsGridSection showHeading={false} />
    </div>
  );
};

export default Tools;
