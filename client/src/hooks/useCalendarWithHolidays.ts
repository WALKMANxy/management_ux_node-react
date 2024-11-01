//src/hooks/useCalendarWithHolidays.ts
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { useGetHolidaysQuery } from "../features/calendar/calendarQuery";
import { CalendarEvent, Holiday } from "../models/dataModels";
import { showToast } from "../services/toastMessage";

export const useCalendarWithHolidays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const { t } = useTranslation();
  const {
    data: holidays,
    isLoading: isHolidaysLoading,
    error: holidaysError,
  } = useGetHolidaysQuery({ year });

  const holidayEvents = useMemo(() => {
    if (holidays) {
      return holidays.map(
        (holiday: Holiday): CalendarEvent => ({
          _id: uuidv4(),
          userId: "holiday",
          startDate: new Date(holiday.date),
          endDate: new Date(holiday.date),
          eventType: "holiday",
          eventName: holiday.localName,
          reason: "public_holiday",
          note: holiday.name,
          status: "approved",
          createdAt: new Date(holiday.date),
          updatedAt: new Date(holiday.date),
        })
      );
    }
    return [];
  }, [holidays]);

  useEffect(() => {
    if (holidaysError) {
      showToast.error(t("calendarWithHolidays.holidaysFetchError"));
    }
  }, [holidaysError, t]);

  return {
    holidayEvents,
    isHolidaysLoading,
    holidaysError,
  };
};
