import { deDE, enUS, frFR, itIT, ruRU } from "@mui/x-date-pickers/locales";



export const localeMap = () =>
  ({
    en: {
      adapterLocale: "en",
      localeText:
        enUS.components.MuiLocalizationProvider.defaultProps.localeText,
    },
    fr: {
      adapterLocale: "fr",
      localeText:
        frFR.components.MuiLocalizationProvider.defaultProps.localeText,
    },
    it: {
      adapterLocale: "it",
      localeText:
        itIT.components.MuiLocalizationProvider.defaultProps.localeText,
    },
    ru: {
      adapterLocale: "ru",
      localeText:
        ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
    },
    de: {
      adapterLocale: "de",
      localeText:
        deDE.components.MuiLocalizationProvider.defaultProps.localeText,
    },
  } as const);
