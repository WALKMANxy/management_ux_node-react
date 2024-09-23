import { useEffect, useState } from "react";
import { useGetHolidaysQuery } from "../features/calendar/calendarQuery";
import { CalendarEvent, Holiday } from "../models/dataModels";

export const useCalendarWithHolidays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const {
    data: holidays,
    isLoading: isHolidaysLoading,
    error: holidaysError,
  } = useGetHolidaysQuery({ year });
  const [holidayEvents, setHolidayEvents] = useState<
    CalendarEvent[] | undefined
  >(undefined);

  useEffect(() => {
    if (holidays) {
      const holidayEventsMapped: CalendarEvent[] = holidays.map(
        (holiday: Holiday) => ({
          userId: "holiday", // Assign a special ID for holidays
          startDate: new Date(holiday.date),
          endDate: new Date(holiday.date),
          eventType: "holiday",
          eventName: holiday.localName,
          reason: "public_holiday",
          note: holiday.name, // Optional: Store the English name as a note
          status: "approved", // Holidays are always approved
          createdAt: new Date(holiday.date),
          updatedAt: new Date(holiday.date),
        })
      );

      setHolidayEvents(holidayEventsMapped);
    }
  }, [holidays]);

  return {
    holidayEvents,
    isHolidaysLoading,
    holidaysError,
  };
};
