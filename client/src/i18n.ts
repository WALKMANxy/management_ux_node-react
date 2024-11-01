/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

const translationFiles = import.meta.glob("./locales/**/**.json");

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((lng: string, ns: string, callback: any) => {
      const language = lng.split("-")[0];
      const filePath = `./locales/${language}/${ns}.json`;
      const loader = translationFiles[filePath];

      if (loader) {
        loader()
          .then((resources: any) => {
            callback(null, resources.default || resources);
          })
          .catch((error: any) => {
            callback(error, null);
          });
      } else {
        callback(new Error(`Translation file not found: ${filePath}`), null);
      }
    })
  )
  .init({
    fallbackLng: "en",
    debug: false,
    ns: ["translation"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: [
        "localStorage",
        "querystring",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["localStorage"],
    },
  });

export default i18n;
