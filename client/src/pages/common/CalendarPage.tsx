// pages/CalendarPage.tsx

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Fragment, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CalendarEventComponent from "../../components/calendarPage/CalendarEventComponent";
import { CustomToolbar } from "../../components/calendarPage/customToolbar";
import { EventForm } from "../../components/calendarPage/EventForm";
import { EventHistory } from "../../components/calendarPage/EventHistory";
import { selectUserRole } from "../../features/auth/authSlice";
import { useCalendar } from "../../hooks/useCalendar";
import { useCalendarWithHolidays } from "../../hooks/useCalendarWithHolidays";
import { CalendarEvent } from "../../models/dataModels";
import { localizer } from "../../utils/localizer";
import { showToast } from "../../utils/toastMessage";
import "./CalendarPage.css"; // Import the CSS file

const CalendarPage: React.FC = () => {
  const { t } = useTranslation();

  const {
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
    updateCurrentDate,
  } = useCalendar();

  const { holidayEvents, isHolidaysLoading, holidaysError } =
    useCalendarWithHolidays();

  const userRole = useSelector(selectUserRole);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State to hold the final events to display
  const [displayEvents, setDisplayEvents] = React.useState<CalendarEvent[]>([]);

  // Effect to handle merging based on error states
  useEffect(() => {
    console.log("Server Events:", serverEvents);
    console.log("Holiday Events:", holidayEvents);
    console.log("Server Error:", serverError);
    console.log("Holidays Error:", holidaysError);

    if (!serverError && !holidaysError && serverEvents && holidayEvents) {
      // Both fetches succeeded, merge the events
      setDisplayEvents([...serverEvents, ...holidayEvents]);
      console.log("Merged Events:", [...serverEvents, ...holidayEvents]);
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

  // Optional: Show a loading spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const dayPropGetter = (date: Date) => {
    const isHoliday = holidayEvents?.some(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString()
    );

    const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
    const isWeekend = day === 0 || day === 6;

    // Check if any events exist on this day and apply specific background colors
    const hasEventTypeEvent = serverEvents?.some(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString() &&
        event.eventType === "event"
    );

    const hasApprovedAbsence = serverEvents?.some(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString() &&
        event.eventType === "absence" &&
        event.status === "approved"
    );

    if (isHoliday) {
      return {
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.05)", // Very faint red background for holidays
        },
      };
    } else if (hasEventTypeEvent) {
      return {
        style: {
          backgroundColor: "rgba(0, 0, 255, 0.05)", // Very faint blue background for eventType: event
        },
      };
    } else if (hasApprovedAbsence) {
      return {
        style: {
          backgroundColor: "rgba(255, 0, 0, 0.1)", // Very faint red background for eventType: absence with approved status
        },
      };
    } else if (isWeekend && userRole !== "admin") {
      return {
        style: {
          cursor: "not-allowed", // Change the cursor to indicate it's non-clickable
        },
        className: "non-clickable-day", // Optional: Add a class for further customization if needed
      };
    }
    return {};
  };

  // Function to customize event styles based on event type
  const eventStyleGetter = (event: CalendarEvent): React.CSSProperties => {
    let backgroundColor = "";
    const color = "black"; // Default text color

    switch (event.eventType) {
      case "absence":
        if (event.status === "pending") {
          backgroundColor = "#BDBDBD"; // Gray background for pending absences
        } else if (event.status === "approved") {
          backgroundColor = "#FFA726"; // Orange background for approved absences
        } else {
          backgroundColor = "#FFEBEE"; // Light red for other absences
        }
        break;
      case "holiday":
        backgroundColor = "#E8F5E9"; // Light green for holidays
        break;
      case "event":
        backgroundColor = "#E3F2FD"; // Light blue for events
        break;
      default:
        backgroundColor = "";
        break;
    }

    return {
      backgroundColor,
      color, // Ensure the text is black by default
    };
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        paddingTop: theme.spacing(8), // Add padding to push down the calendar
      }}
    >
      {/* Toggle Button */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <IconButton
          onClick={toggleViewMode}
          color="primary"
          aria-label="toggle view"
        >
          {viewMode === "calendar" ? <ViewListIcon /> : <CalendarTodayIcon />}
        </IconButton>
      </Box>

      {viewMode === "calendar" ? (
        <Fragment>
          <Paper
            elevation={3}
            sx={{ padding: theme.spacing(2), borderRadius: 5 }}
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
              defaultDate={defaultDate}
              scrollToTime={scrollToTime}
              views={["month", "week", "day"]}
              step={60}
              showMultiDayTimes
              onNavigate={(newDate: Date) => {
                updateCurrentDate(newDate);
              }}
              defaultView="month"
              dayPropGetter={dayPropGetter} // Apply the dayPropGetter
              eventPropGetter={(event) => ({
                style: eventStyleGetter(event as CalendarEvent),
              })}
              components={{
                toolbar: CustomToolbar,
                event: CalendarEventComponent, // Use the custom event component
              }}
            />
          </Paper>

          {/* Floating Action Button for Mobile Users */}
          {isMobile && selectedDays.length > 0 && (
            <Fab
              color="primary"
              aria-label="add"
              className="fab-button"
              sx={{ position: "fixed", bottom: 16, right: 16 }}
              onClick={() => {
                if (selectedDays.length === 0) {
                  showToast.error("Please select at least one day.");
                  return;
                }
                // Open the form
                // Since `setOpenForm` is handled inside `useCalendar`, you might need to expose a method to open it here
                // For simplicity, ensure the form is open if not already
                // Assuming `openForm` can be toggled externally
                // Alternatively, ensure the FAB triggers a side-effect to open the form
              }}
            >
              <AddIcon />
            </Fab>
          )}
          <EventForm
            open={openForm}
            selectedDays={selectedDays}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isCreating} // Pass the loading state
          />
        </Fragment>
      ) : (
        <EventHistory events={displayEvents} userRole={userRole} />
      )}
    </Box>
  );
};

export default CalendarPage;
