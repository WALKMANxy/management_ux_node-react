// hooks/useCalendar.ts

import { useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { SlotInfo } from "react-big-calendar";
import { useSelector } from "react-redux";
import { useAppSelector } from "../app/hooks";
import { selectUserRole } from "../features/auth/authSlice";
import {
  useCreateEventMutation,
  useGetEventsByMonthForAdminQuery,
  useGetEventsByStatusAndUserQuery,
} from "../features/calendar/calendarQuery";
import { selectCurrentUser } from "../features/users/userSlice";
import { CalendarEvent } from "../models/dataModels";
import { CreateEventPayload } from "../models/propsModels";
import { showToast } from "../utils/toastMessage";

export const useCalendar = () => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "history">("calendar");
  const [openForm, setOpenForm] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Centralized currentDate

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const userRole = useSelector(selectUserRole);
  const user = useAppSelector(selectCurrentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // RTK Query Mutations
  const [createEvent, { isLoading: isCreating, error: creatingError }] =
    useCreateEventMutation();

  const {
    data: adminEventsData,
    isLoading: isAdminLoading,
    error: adminError,
  } = useGetEventsByMonthForAdminQuery(
    { year: currentYear, month: currentMonth },
    { skip: userRole !== "admin" }
  );

  const {
    data: userEventsData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetEventsByStatusAndUserQuery(
    { year: currentYear, month: currentMonth },
    { skip: userRole === "admin" }
  );

  const serverEvents: CalendarEvent[] | undefined = useMemo(() => {
    let events;

    if (userRole === "admin") {
      events = adminEventsData || [];
    } else {
      events = userEventsData || [];
    }

    return events;
  }, [adminEventsData, userEventsData, userRole]);

  const isServerLoading = isAdminLoading || isUserLoading;
  const serverError = adminError || userError;

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const day = dayjs(slotInfo.start).day(); // 0 = Sunday, 6 = Saturday

      // Only non-admin users are restricted from selecting weekends
      if ((day === 0 || day === 6) && userRole !== "admin") {
        showToast.error("Weekends are not selectable.");
        return;
      }

      setSelectedDays([slotInfo.start, slotInfo.end]);
      setOpenForm(true);
    },
    [userRole]
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    window.alert(event.reason); // You can enhance this to show more details in a modal
  }, []);

  const handleFormSubmit = async (data: CreateEventPayload) => {
    if (!user?._id) {
      showToast.error("User is not authenticated.");
      return;
    }
    try {
      const payload: CreateEventPayload = {
        userId: user._id,
        startDate: isMobile
          ? selectedDays.reduce(
              (earliest, date) =>
                dayjs(date).isBefore(earliest) ? date : earliest,
              selectedDays[0]
            )
          : selectedDays[0],
        endDate: isMobile
          ? selectedDays.reduce(
              (latest, date) => (dayjs(date).isAfter(latest) ? date : latest),
              selectedDays[0]
            )
          : selectedDays[1],
        eventType: data.eventType,
        reason: data.reason as CalendarEvent["reason"],
        note: data.note?.trim() || undefined,
      };

      await createEvent(payload).unwrap();
      showToast.success("Event created successfully!");
      setOpenForm(false);
      setSelectedDays([]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(`Failed to create event: ${error.message}`);
      } else {
        showToast.error("Failed to create event.");
      }
    }
  };

  const handleFormCancel = () => {
    setOpenForm(false);
    setSelectedDays([]);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "calendar" ? "history" : "calendar"));
  };

  const scrollToTime = useMemo(() => new Date(1970, 1, 1, 6), []);

  return {
    creatingError,
    selectedDays,
    viewMode,
    openForm,
    serverEvents,
    isServerLoading,
    serverError,
    handleSelectSlot,
    handleSelectEvent,
    handleFormSubmit,
    handleFormCancel,
    toggleViewMode,
    scrollToTime,
    isCreating,
    currentDate,
    setCurrentDate,
  };
};
