// hooks/useCalendar.ts

import { useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SlotInfo } from "react-big-calendar";
import { useSelector } from "react-redux";
import { useAppSelector } from "../app/hooks";
import { selectUserRole } from "../features/auth/authSlice";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEditEventMutation,
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
  const [allServerEvents, setAllServerEvents] = useState<CalendarEvent[]>([]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const userRole = useSelector(selectUserRole);
  const user = useAppSelector(selectCurrentUser);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null); // State for editing

  // RTK Query Mutations
  const [createEvent, { isLoading: isCreating, error: creatingError }] =
    useCreateEventMutation();

  const [editEventMutation, { isLoading: isEditing, error: editingError }] =
    useEditEventMutation();

  const [deleteEventMutation, { isLoading: isDeleting, error: deletingError }] =
    useDeleteEventMutation();

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

  // Effect to merge new events with existing events
  useEffect(() => {
    if (serverEvents) {
      setAllServerEvents((prevEvents) => {
        const eventMap = new Map<string, CalendarEvent>();

        // Add existing events to the map
        prevEvents.forEach((event) => {
          const idKey = event._id
            ? event._id
            : `${event.startDate}-${event.reason}`;
          eventMap.set(idKey, event); // Use _id if available, else fallback to key
        });

        // Update the map with server events
        serverEvents.forEach((newEvent) => {
          const idKey = newEvent._id
            ? newEvent._id
            : `${newEvent.startDate}-${newEvent.reason}`;
          eventMap.set(idKey, newEvent); // Update or add the new event based on idKey
        });

        // Convert the map back to an array
        return Array.from(eventMap.values());
      });
    }
  }, [serverEvents]);

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const day = dayjs(slotInfo.start).day(); // 0 = Sunday, 6 = Saturday

      // Only non-admin users are restricted from selecting weekends
      if ((day === 0 || day === 6) && userRole !== "admin") {
        showToast.error("Weekends are not selectable.");
        return;
      }

      setSelectedDays([slotInfo.start, slotInfo.end]);
      setEditingEvent(null); // Add this line to reset editingEvent
      setOpenForm(true);
    },
    [userRole]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent, e: React.SyntheticEvent<Element, Event>) => {
      setAnchorEl(e.currentTarget as HTMLElement);
      setSelectedEvent(event);
    },
    []
  );

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleFormSubmit = async (data: CreateEventPayload) => {
    if (!user?._id) {
      showToast.error("User is not authenticated.");
      return;
    }
    try {
      if (editingEvent && editingEvent._id) {
        // Update existing event
        const payload = {
          eventId: editingEvent._id,
          data: {
            eventType: data.eventType,
            reason: data.reason as CalendarEvent["reason"],
            note: data.note?.trim() || undefined,
            // Optionally include startDate and endDate if editing dates is allowed
          },
        };

        await editEventMutation(payload).unwrap();
        showToast.success("Event updated successfully!");
        setEditingEvent(null);
      } else {
        // Create new event
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
      }
      setOpenForm(false);
      setSelectedDays([]);
    } catch (error: unknown) {
      if (error instanceof Error && error?.message) {
        showToast.error(`Failed to submit event: ${error.message}`);
      } else {
        showToast.error("Failed to submit event.");
      }
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = useCallback(
    async (event: CalendarEvent) => {
      if (!event._id) {
        showToast.error("Event ID is missing.");
        return;
      }
      try {
        await deleteEventMutation(event._id).unwrap();
        showToast.success("Event deleted successfully!");

        // Update local state to remove the deleted event
        setAllServerEvents((prevEvents) =>
          prevEvents.filter((e) => e._id !== event._id)
        );
      } catch (error: unknown) {
        if (error instanceof Error && error?.message) {
          showToast.error(`Failed to delete event: ${error.message}`);
        } else {
          showToast.error("Failed to delete event.");
        }
      }
    },
    [deleteEventMutation]
  );

  // Handle editing an event
  const handleEditEvent = useCallback((event: CalendarEvent) => {
    handlePopoverClose();
    setEditingEvent(event);
    setSelectedDays([new Date(event.startDate), new Date(event.endDate)]);
    setOpenForm(true);
    handlePopoverClose();
  }, []);

  const handleFormCancel = () => {
    setOpenForm(false);
    setSelectedDays([]);
    // Optional: Clear the editing event (if any)
    setEditingEvent(null); // Clear any currently editing event to reset the form
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
    serverEvents: allServerEvents,
    isServerLoading,
    serverError,
    handleSelectSlot,
    handleSelectEvent,
    handleFormSubmit,
    handleFormCancel,
    toggleViewMode,
    scrollToTime,
    isCreating,
    isEditing, // Loading state for editing
    isDeleting, // Loading state for deleting
    currentDate,
    setCurrentDate,
    anchorEl,
    setAnchorEl,
    editingError,
    deletingError,
    selectedEvent,
    handlePopoverClose,
    handleEditEvent, // Expose edit handler
    handleDeleteEvent, // Expose delete handler
    editingEvent,
  };
};
