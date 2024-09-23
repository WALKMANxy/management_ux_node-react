import { useEffect, useState } from "react";
import { CalendarEvent, Holiday } from "../models/dataModels";
import { useGetHolidaysQuery } from "../features/calendar/calendarQuery";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

interface UseCalendarWithHolidaysReturnType {
    holidayEvents: CalendarEvent[] | undefined;
    isHolidaysLoading: boolean;
    holidaysError: FetchBaseQueryError | SerializedError | undefined;
  }
  export const useCalendarWithHolidays = (): UseCalendarWithHolidaysReturnType => {
    const { data: holidays, isLoading: isHolidaysLoading, error: holidaysError } = useGetHolidaysQuery();
    const [holidayEvents, setHolidayEvents] = useState<CalendarEvent[] | undefined>(undefined);

    useEffect(() => {
      if (holidays) {
        const holidayEventsMapped: CalendarEvent[] = holidays.map((holiday: Holiday) => ({
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
        }));

        setHolidayEvents(holidayEventsMapped);
      }
    }, [holidays]);

    return {
      holidayEvents,
      isHolidaysLoading,
      holidaysError,
    };
  };
