import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = currentLang.startsWith("fr") ? "fr" : "en";
    }
  }, [currentLang]);

  const toggle = async () => {
    const nextLang = currentLang.startsWith("en") ? "fr" : "en";
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", nextLang);
    }
    await i18n.changeLanguage(nextLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLang;
    }
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors tracking-wider uppercase"
    >
      {currentLang.startsWith("en") ? "FR" : "EN"}
    </button>
  );
};

export default LanguageSwitcher;
