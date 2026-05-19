import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || "en").toLowerCase();

  const toggle = () => {
    const nextLang = currentLang.startsWith("en") ? "fr" : "en";
    // Persist pour que toutes les pages gardent la même langue (et au refresh).
    if (typeof window !== "undefined") window.localStorage.setItem("lang", nextLang);
    i18n.changeLanguage(nextLang);
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
