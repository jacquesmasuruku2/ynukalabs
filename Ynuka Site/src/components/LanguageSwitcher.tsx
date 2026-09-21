import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || "fr").toLowerCase();

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
      className="typo-label rounded-lg border border-black/10 bg-white px-3 py-1.5 text-foreground transition-colors hover:border-[#ffb800]/50 hover:text-primary dark:border-white/20 dark:bg-transparent"
    >
      {currentLang.startsWith("en") ? "FR" : "EN"}
    </button>
  );
};

export default LanguageSwitcher;
