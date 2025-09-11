import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationLT from "./locales/lt/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  lt: {
    translation: translationLT,
  },
};

i18n.use(initReactI18next).init(
  {
    resources,
    lng: "lt",
    fallbackLng: "lt",

    interpolation: {
      escapeValue: false,
    },
  },
  (err, t) => {
    if (err)
      return console.log("something went wrong with loading translations", err);
  }
);

export default i18n;
