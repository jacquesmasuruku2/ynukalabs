import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fr from "./fr.json";

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("lang");
  if (saved === "fr" || saved === "en") return saved;
  return "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
