import dayjs from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/ru";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import minMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";
import { dayjsLocalizer } from "react-big-calendar";
import i18n from "../i18n";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(minMax);
dayjs.extend(utc);
dayjs.extend(localeData);

const currentLocale = i18n.language;
dayjs.locale(currentLocale);

export const localizer = dayjsLocalizer(dayjs);

const localeMap: { [key: string]: string } = {
  "en-US": "en",
  "fr-FR": "fr",
  "es-ES": "es",
  "de-DE": "de",
  "it-IT": "it",
  "ru-RU": "ru",
};

export const locale = localeMap[i18n.language] || "en";
