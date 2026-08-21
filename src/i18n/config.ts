import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationFR from "./locales/fr/translation.json";
import translationEN from "./locales/en/translation.json";

const resources = {
  fr: {
    translation: translationFR,
  },
  en: {
    translation: translationEN,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
