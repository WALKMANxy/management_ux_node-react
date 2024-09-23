// pages/CalendarPage.tsx

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  CircularProgress,
  Fab,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Fragment, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSelector } from "react-redux";
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
    if (!serverError && !holidaysError && serverEvents && holidayEvents) {
      // Both fetches succeeded, merge the events
      setDisplayEvents([...serverEvents, ...holidayEvents]);
    } else if (serverError && !holidaysError && holidayEvents) {
      // Server events failed, show only holiday events
      setDisplayEvents(holidayEvents);
      showToast.error(
        "Failed to load server events. Showing holiday events only."
      );
    } else if (!serverError && holidaysError && serverEvents) {
      // Holiday events failed, show only server events
      setDisplayEvents(serverEvents);
      showToast.error(
        "Failed to load holiday events. Showing server events only."
      );
    } else if (serverError && holidaysError) {
      // Both failed, show nothing
      setDisplayEvents([]);
      showToast.error("Failed to load events.");
    }
  }, [serverError, holidaysError, serverEvents, holidayEvents]);

  // Effect to reset state after loading is complete (if needed)
  useEffect(() => {
    if (!isServerLoading && !isHolidaysLoading) {
      // Logic after both loadings are done can go here if needed
    }
  }, [isServerLoading, isHolidaysLoading]);

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
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
          <Calendar
            localizer={localizer}
            events={displayEvents}
            startAccessor="startDate"
            endAccessor="endDate"
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
            defaultView="month"
          />

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
