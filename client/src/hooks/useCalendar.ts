// src/hooks/useCalendar.ts
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SlotInfo } from "react-big-calendar";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectUserRole } from "../features/auth/authSlice";
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useEditEventMutation,
  useGetEventsByMonthQuery,
  useUpdateEventStatusMutation,
} from "../features/calendar/calendarQuery";
import { selectClient, selectVisit } from "../features/data/dataSlice";
import { selectVisits } from "../features/promoVisits/promoVisitsSelectors";
import { selectCurrentUser } from "../features/users/userSlice";
import { CalendarEvent, Visit } from "../models/dataModels";
import { CreateEventPayload } from "../models/propsModels";
import { showToast } from "../services/toastMessage";

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

export const useCalendar = () => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "history">("calendar");
  const [openForm, setOpenForm] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [allServerEvents, setAllServerEvents] = useState<CalendarEvent[]>([]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] =
    React.useState<CalendarEvent | null>(null);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const userRole = useSelector(selectUserRole);
  const user = useAppSelector(selectCurrentUser);
  const visits = useSelector(selectVisits);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { t } = useTranslation();

  // RTK Query Mutations
  const [createEvent, { isLoading: isCreating, error: creatingError }] =
    useCreateEventMutation();

  const [editEventMutation, { isLoading: isEditing, error: editingError }] =
    useEditEventMutation();

  const [deleteEventMutation, { isLoading: isDeleting, error: deletingError }] =
    useDeleteEventMutation();

  const [updateEventStatus, { isLoading }] = useUpdateEventStatusMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    data: adminEventsData,
    isLoading: isAdminLoading,
    error: adminError,
  } = useGetEventsByMonthQuery({
    year: currentYear,
    month: currentMonth,
  });

  const serverEvents: CalendarEvent[] | undefined = useMemo(() => {
    return adminEventsData || [];
  }, [adminEventsData]);

  const isServerLoading = isAdminLoading;
  const serverError = adminError;

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
          eventMap.set(idKey, event);
        });

        // Update the map with server events
        serverEvents.forEach((newEvent) => {
          const idKey = newEvent._id
            ? newEvent._id
            : `${newEvent.startDate}-${newEvent.reason}`;
          eventMap.set(idKey, newEvent);
        });

        // Convert the map back to an array
        return Array.from(eventMap.values());
      });
    }
  }, [serverEvents]);

  const mapVisitToCalendarEvent = useCallback(
    (visit: Visit): CalendarEvent => {
      return {
        _id: visit._id,
        userId: visit.visitIssuedBy,
        startDate: new Date(visit.date),
        endDate: new Date(visit.date),
        eventType: "visit",
        eventName: t("calendarHook.visitEventName", {
          clientId: visit.clientId,
        }),
        reason: visit.visitReason as CalendarEvent["reason"],
        note: visit.notePublic,
        status: visit.pending
          ? "pending"
          : visit.completed
          ? "approved"
          : "pending",
        createdAt: new Date(visit.createdAt),
        updatedAt: new Date(),
        visitClientId: visit.clientId,
      };
    },
    [t]
  );

  // Map visits to CalendarEvents
  const visitEvents: CalendarEvent[] = useMemo(() => {
    if (visits && visits.length > 0) {
      return visits.map((visit) => mapVisitToCalendarEvent(visit));
    }
    return [];
  }, [visits, mapVisitToCalendarEvent]);

  // Handle selecting a slot (date range)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const day = dayjs(slotInfo.start).day(); // 0 = Sunday, 6 = Saturday
      const now = dayjs();

      // Check if the selected slot is in the past
      if (dayjs(slotInfo.start).isBefore(now, "day")) {
        showToast.error(t("calendarHook.pastDateError"));
        return;
      }

      // Only non-admin users are restricted from selecting weekends
      if ((day === 0 || day === 6) && userRole !== "admin") {
        showToast.error(t("calendarHook.weekendsNotSelectable"));
        return;
      }

      setSelectedDays([slotInfo.start, slotInfo.end]);
      setEditingEvent(null);
      setOpenForm(true);
    },
    [userRole, t]
  );

  // Handle selecting an event
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

  const handleEventPopoverClose = (event: React.MouseEvent | Event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleFormSubmit = async (data: CreateEventPayload) => {
    if (!user?._id) {
      showToast.error(t("calendarHook.userNotAuthenticated"));
      return;
    }

    // Debugging: Log the start and end dates before submission
    /* console.log("Submitting Event:");
    console.log("Start Date (before submission):", data.startDate);
    console.log("End Date (before submission):", data.endDate); */

    try {
      if (editingEvent && editingEvent._id) {
        // Update existing event
        const payload = {
          eventId: editingEvent._id,
          data: {
            eventType: data.eventType,
            reason: data.reason as CalendarEvent["reason"],
            note: data.note?.trim() || undefined,
            startDate: data.startDate,
            endDate: data.endDate,
          },
        };

        await editEventMutation(payload).unwrap();
        showToast.success(t("calendarHook.eventUpdatedSuccess"));
        setEditingEvent(null);
      } else {
        // Create new event
        const payload: CreateEventPayload = {
          userId: user._id,
          startDate: data.startDate,
          endDate: data.endDate,
          eventType: data.eventType,
          reason: data.reason as CalendarEvent["reason"],
          note: data.note?.trim() || undefined,
        };

        console.log("Creating Event Payload:", payload);

        await createEvent(payload).unwrap();
        showToast.success(t("calendarHook.eventCreatedSuccess"));
      }
      setOpenForm(false);
      setSelectedDays([]);
    } catch (error: unknown) {
      if (error instanceof Error && error?.message) {
        showToast.error(
          t("calendarHook.eventSubmitFailedWithError", { error: error.message })
        );
      } else {
        showToast.error(t("calendarHook.eventSubmitFailed"));
      }
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = useCallback(
    async (event: CalendarEvent) => {
      if (!event._id) {
        showToast.error(t("calendarHook.eventIdMissing"));
        return;
      }
      try {
        await deleteEventMutation(event._id).unwrap();
        showToast.success(t("calendarHook.eventDeletedSuccess"));

        // Update local state to remove the deleted event
        setAllServerEvents((prevEvents) =>
          prevEvents.filter((e) => e._id !== event._id)
        );
      } catch (error: unknown) {
        if (error instanceof Error && error?.message) {
          showToast.error(
            t("calendarHook.eventDeleteFailedWithError", {
              error: error.message,
            })
          );
        } else {
          showToast.error(t("calendarHook.eventDeleteFailed"));
        }
      }
    },
    [deleteEventMutation, t]
  );

  // Handle editing an event
  const handleEditEvent = useCallback((event: CalendarEvent) => {
    handlePopoverClose();
    setEditingEvent(event);
    setSelectedDays([new Date(event.startDate), new Date(event.endDate)]);
    setOpenForm(true);
    console.log("Opening form for editing event", event);
  }, []);

  const handleFormCancel = () => {
    setOpenForm(false);
    setSelectedDays([]);
    setEditingEvent(null);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const newMode = prev === "calendar" ? "history" : "calendar";

      return newMode;
    });
  };

  const scrollToTime = useMemo(() => new Date(1970, 1, 1, 6), []);

  // Combine serverEvents and visitEvents
  const combinedEvents: CalendarEvent[] = useMemo(() => {
    return [...allServerEvents, ...visitEvents];
  }, [allServerEvents, visitEvents]);

  const handleApprove = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "approved" }).unwrap();
      showToast.success(t("eventHistory.toast.approveSuccess"));

      // Update local state to reflect the status change
      setAllServerEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, status: "approved" } : event
        )
      );
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `${t("eventHistory.toast.approveFailure")}: ${
          apiError.data?.message ||
          apiError.message ||
          t("eventHistory.toast.genericError")
        }`
      );
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "rejected" }).unwrap();
      showToast.success(t("eventHistory.toast.rejectSuccess"));

      // Update local state to reflect the status change
      setAllServerEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, status: "rejected" } : event
        )
      );
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `${t("eventHistory.toast.rejectFailure")}: ${
          apiError.data?.message ||
          apiError.message ||
          t("eventHistory.toast.genericError")
        }`
      );
    }
  };

  const handleGoToVisit = (event: CalendarEvent) => {
    if (event.eventType === "visit") {
      dispatch(selectClient(event.visitClientId!));
      dispatch(selectVisit(event._id!));
      navigate("/visits");
    }
  };

  return {
    handleGoToVisit,
    isLoading,
    handleEventPopoverClose,
    handleApprove,
    handleReject,
    creatingError,
    selectedDays,
    viewMode,
    openForm,
    serverEvents: combinedEvents,
    isServerLoading,
    serverError,
    handleSelectSlot,
    handleSelectEvent,
    handleFormSubmit,
    handleFormCancel,
    toggleViewMode,
    scrollToTime,
    isCreating,
    isEditing,
    isDeleting,
    currentDate,
    setCurrentDate,
    anchorEl,
    setAnchorEl,
    editingError,
    deletingError,
    selectedEvent,
    handlePopoverClose,
    handleEditEvent,
    handleDeleteEvent,
    editingEvent,
  };
};
