// pages/CalendarPage.tsx

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css"; // Add animate.css
import React, { Fragment, memo, useEffect, useState } from "react";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CalendarEventComponent from "../../components/calendarPage/CalendarEventComponent";
import { CustomToolbar } from "../../components/calendarPage/CustomToolbar";
import { EventForm } from "../../components/calendarPage/EventForm";
import PopOverEvent from "../../components/calendarPage/PopOverEvent";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import { selectCurrentUser } from "../../features/users/userSlice";
import { useCalendar } from "../../hooks/useCalendar";
import { useCalendarWithHolidays } from "../../hooks/useCalendarWithHolidays";
import { CalendarEvent } from "../../models/dataModels";
import { localizer } from "../../services/localizer";
import { showToast } from "../../services/toastMessage";
import "./CalendarPage.css"; // Import the CSS file

const EventHistory = React.lazy(
  () => import("../../components/calendarPage/EventHistory")
);
const CalendarPage: React.FC = () => {
  const { t } = useTranslation();

  const {
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
    anchorEl,
    selectedEvent,
    handlePopoverClose,
    handleEditEvent, // Exposed edit handler
    handleDeleteEvent, // Exposed delete handler
    isEditing,
    editingEvent,
    handleEventPopoverClose,
    selectedDays,
  } = useCalendar();

  const { holidayEvents, isHolidaysLoading, holidaysError } =
    useCalendarWithHolidays(currentDate);

  const userRole = useSelector(selectCurrentUser)?.role;

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(
    null
  );

  // State to hold the final events to display
  const [displayEvents, setDisplayEvents] = React.useState<CalendarEvent[]>([]);

  // Effect to handle merging based on error states
  useEffect(() => {
    if (!serverError && !holidaysError && serverEvents && holidayEvents) {
      // Both fetches succeeded, merge the events
      setDisplayEvents([...serverEvents, ...holidayEvents]);
      /*       console.log("Merged Events:", [...serverEvents, ...holidayEvents]);
       */
    } else if (serverError && !holidaysError && holidayEvents) {
      // Server events failed, show only holiday events
      setDisplayEvents(holidayEvents);
      showToast.error(
        t("Failed to load server events. Showing holiday events only.")
      );
    } else if (!serverError && holidaysError && serverEvents) {
      // Holiday events failed, show only server events
      setDisplayEvents(serverEvents);
      showToast.error(
        t("Failed to load holiday events. Showing server events only.")
      );
    } else if (serverError && holidaysError) {
      // Both failed, show nothing
      setDisplayEvents([]);
      showToast.error(t("Failed to load events."));
    }
  }, [serverError, holidaysError, serverEvents, holidayEvents, t]);

  // Handle loading state
  const isLoading = isServerLoading || isHolidaysLoading;

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      await handleDeleteEvent(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleDeleteEventWithConfirmation = (event: CalendarEvent) => {
    handlePopoverClose();
    setConfirmDelete(event);
  };

  // Optional: Show a loading spinner
  if (isLoading) {
    return <Loader fadeout />;
  }

  const dayPropGetter = (date: Date) => {
    const isHoliday = holidayEvents?.some(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString()
    );

    const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
    const isWeekend = day === 0 || day === 6;

    // Check if any events exist on this day
    const hasEventTypeEvent = serverEvents?.some(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString() &&
        event.eventType === "event"
    );

    // Return styles for the day
    const styles = {
      holiday: isHoliday ? { backgroundColor: "rgba(255, 0, 0, 0.05)" } : {},
      event: hasEventTypeEvent
        ? { backgroundColor: "rgba(0, 0, 255, 0.05)" }
        : {},
      weekend:
        isWeekend && userRole !== "admin" ? { cursor: "not-allowed" } : {},
    };

    return {
      style: { ...styles.holiday, ...styles.event, ...styles.weekend },
    };
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        paddingBottom: 2,
      }}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: isMobile ? 0 : 4,
          px: isMobile ? 1 : null,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "black" }}>
          {viewMode === "history"
            ? t("calendar.HistoryTitle")
            : t("calendar.Title")}
        </Typography>
        <IconButton
          onClick={toggleViewMode}
          sx={{ color: "black" }} // Override color to black
          aria-label="toggle view"
        >
          {viewMode === "calendar" ? <ViewListIcon /> : <CalendarTodayIcon />}
        </IconButton>
      </Box>

      {viewMode === "calendar" ? (
        <Fragment>
          <Paper
            elevation={3}
            sx={{ p: 2, mt: isMobile ? 0 : -3, borderRadius: 5 }}
            className="animate__animated animate__animate_faster animate__fadeIn"
          >
            <Calendar
              localizer={localizer}
              events={displayEvents}
              startAccessor="startDate"
              endAccessor="endDate"
              titleAccessor={(event: CalendarEvent) => event.eventName}
              style={{ height: "80vh" }}
              selectable
              popup
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              dayLayoutAlgorithm="no-overlap"
              defaultDate={currentDate}
              scrollToTime={scrollToTime}
              views={["month", "week", "day"]}
              step={60}
              showMultiDayTimes
              defaultView="month"
              dayPropGetter={dayPropGetter} // Apply the dayPropGetter
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "transparent",
                },
              })}
              components={{
                toolbar: (toolbarProps) => (
                  <CustomToolbar
                    toolbar={toolbarProps}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                  />
                ),
                event: CalendarEventComponent, // Use the custom event component
              }}
            />
          </Paper>
        </Fragment>
      ) : (
        <Box
          sx={{
            pt: isMobile ? 2 : 0,
            px: isMobile ? 1.3 : 0,
          }}
        >
          <React.Suspense fallback={<Loader fadeout />}>
            <EventHistory
              events={displayEvents}
              userRole={userRole!}
              handleDeleteEvent={handleDeleteEventWithConfirmation}
            />
          </React.Suspense>
        </Box>
      )}

      <EventForm
        key={editingEvent ? editingEvent._id : "new-event"}
        open={openForm}
        selectedDays={selectedDays}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isSubmitting={isCreating || isEditing}
        initialData={editingEvent}
      />

      {/* PopOverEvent Component */}
      {selectedEvent && (
        <PopOverEvent
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          handleClose={handleEventPopoverClose}
          event={selectedEvent}
          userRole={userRole!}
          onEdit={handleEditEvent} // Connect to edit handler
          onDelete={handleDeleteEventWithConfirmation} // Connect to delete handler with confirmation
        />
      )}
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={t("confirmDialog.deleteEvent")}
        message={t(
          "Are you sure you want to delete this event? This action cannot be undone."
        )}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default memo(CalendarPage);
