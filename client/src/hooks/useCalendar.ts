// hooks/useCalendar.ts

import { useMediaQuery, useTheme } from "@mui/material";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
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

interface UseCalendarReturnType {
  selectedDays: Date[];
  viewMode: "calendar" | "history";
  openForm: boolean;
  serverEvents: CalendarEvent[] | undefined;
  isServerLoading: boolean;
  serverError: FetchBaseQueryError | SerializedError | undefined;
  creatingError: FetchBaseQueryError | SerializedError | undefined;
  handleSelectSlot: (slotInfo: SlotInfo) => void;
  handleSelectEvent: (event: CalendarEvent) => void;
  handleFormSubmit: (data: CreateEventPayload) => void;
  handleFormCancel: () => void;
  toggleViewMode: () => void;
  defaultDate: Date;
  scrollToTime: Date;
  isCreating: boolean;
}

export const useCalendar = (): UseCalendarReturnType => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "history">("calendar");
  const [openForm, setOpenForm] = useState(false);

  const userRole = useSelector(selectUserRole);
  const user = useAppSelector(selectCurrentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();

  // RTK Query Mutations
  const [createEvent, { isLoading: isCreating, error: creatingError }] =
    useCreateEventMutation();

  // Fetch events based on user role
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
    if (userRole === "admin") {
      return adminEventsData?.events || [];
    } else {
      return userEventsData?.events || [];
    }
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

      if (isMobile) {
        // For mobile, allow multiple selections
        const isAlreadySelected = selectedDays.some((date) =>
          dayjs(date).isSame(slotInfo.start, "day")
        );

        if (isAlreadySelected) {
          // Deselect the day
          setSelectedDays((prev) =>
            prev.filter((date) => !dayjs(date).isSame(slotInfo.start, "day"))
          );
        } else {
          // Select the day
          setSelectedDays((prev) => [...prev, slotInfo.start]);
        }

        // Open the form only when the user clicks the FAB
      } else {
        // For desktop, open the form immediately
        setSelectedDays([slotInfo.start, slotInfo.end]);
        setOpenForm(true);
      }
    },
    [userRole, isMobile, selectedDays]
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
        note: data.note,
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

  const defaultDate = useMemo(() => new Date(), []);
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
    defaultDate,
    scrollToTime,
    isCreating,
  };
};
