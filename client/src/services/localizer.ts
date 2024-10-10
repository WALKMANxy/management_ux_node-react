import dayjs from "dayjs";
import "dayjs/locale/en"; // Import English locale (and others as needed)
import "dayjs/locale/fr"; // Import French locale (and others as needed)
import "dayjs/locale/de"; // Import German locale (and others as needed)
import "dayjs/locale/es"; // Import Spanish locale (and others as needed)
import "dayjs/locale/it"; // Import Italian locale (and others as needed)
import "dayjs/locale/ru"; // Import Russian locale (and others as needed)
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import minMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import { dayjsLocalizer } from "react-big-calendar";
import i18n from "../i18n";

// Extend Day.js with necessary plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(minMax);
dayjs.extend(utc);
dayjs.extend(localeData);

// Dynamically set the locale based on i18n's current language
const currentLocale = i18n.language;
dayjs.locale(currentLocale);

// Create the localizer
export const localizer = dayjsLocalizer(dayjs);

const localeMap: { [key: string]: string } = {
    "en-US": "en",
    "fr-FR": "fr",
    "es-ES": "es",
    "de-DE": "de",
    "it-IT": "it",
    "ru-RU": "ru",
    // Add other mappings as needed
  };

  export const locale = localeMap[i18n.language] || "en";
