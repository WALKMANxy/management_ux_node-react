// src/components/CalendarComponent.tsx

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectAgent,
  selectClient,
  selectVisit,
} from "../../features/data/dataSlice";
import {
  selectVisits,
  VisitWithAgent,
} from "../../features/promoVisits/promoVisitsSelectors";
import { ServerDayProps } from "../../models/propsModels";
import { agentColorMap } from "../../utils/constants";
import ServerDay from "./ServerDay";

const CalendarComponent: React.FC = () => {
  const visits = useAppSelector(selectVisits);
  const currentUserDetails = useAppSelector(
    (state) => state.data.currentUserDetails
  );
  const clients = useAppSelector((state) => state.data.clients);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation

  const userRole = currentUserDetails?.role; // Extract userRole

  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState<
    { date: number; color: string }[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const [openDialog, setOpenDialog] = useState(false);
  const [visitsOnSelectedDay, setVisitsOnSelectedDay] = useState<
    VisitWithAgent[]
  >([]);

  /**
   * Updates the highlighted days based on the current month and user role.
   */
  const updateHighlightedDays = useCallback(
    (month: Dayjs) => {
      const now = dayjs(); // Current date and time

      // Create a map to ensure one color per date, prioritizing red
      const dateColorMap: { [date: number]: string } = {};

      visits
        .filter(
          (visit: VisitWithAgent) =>
            visit.pending === true &&
            visit.completed === false &&
            visit.date &&
            dayjs(visit.date).isSame(month, "month")
        )
        .forEach((visit: VisitWithAgent) => {
          const visitDay = dayjs(visit.date);
          const date = visitDay.date();

          // Check if the visit is in the past
          const isPast = visitDay.isBefore(now, "day");

          if (isPast) {
            // Prioritize a fainter red color for past pending visits
            dateColorMap[date] = "#FFA8B8"; // Slightly less faint pastel red
            return;
          }

          // If not past, assign color based on role
          let color = "#ADD8E6"; // Default pastel blue

          if (currentUserDetails) {
            if (currentUserDetails.role === "admin") {
              // Admin view: color by agent
              color = visit.agentId
                ? agentColorMap[String(visit.agentId)] ?? color
                : color;
            } else if (currentUserDetails.role === "agent") {
              // Agent view: color by client
              const client = clients[visit.clientId];
              color = client?.colour ?? color;
            }
            // Clients have a single default color; no change needed
          }

          // Only set the color if it hasn't been set to red
          if (!dateColorMap[date]) {
            dateColorMap[date] = color;
          }
        });

      // Convert the map to an array
      const days = Object.entries(dateColorMap).map(([date, color]) => ({
        date: Number(date),
        color,
      }));

      setHighlightedDays(days);
    },
    [visits, currentUserDetails, clients]
  );

  /**
   * Updates highlighted days whenever the current month changes.
   */
  useEffect(() => {
    updateHighlightedDays(currentMonth);
  }, [currentMonth, updateHighlightedDays]);

  /**
   * Handles the change of month in the calendar.
   * Simulates an async request to fetch data for the new month.
   */
  const handleMonthChange = (date: Dayjs) => {
    setIsLoading(true);
    setCurrentMonth(date);

    // Simulate an async request with a timeout
    setTimeout(() => {
      updateHighlightedDays(date);
      setIsLoading(false);
    }, 500);
  };

  /**
   * Handles clicks on a specific day in the calendar.
   * Navigates to the visit details or opens a dialog if multiple visits exist.
   */
  const handleDayClick = (day: Dayjs) => {
    // Find all visits on the clicked day
    const visitsForDay = visits.filter(
      (visit: VisitWithAgent) =>
        visit.date &&
        dayjs(visit.date).isSame(day, "day") &&
        visit.pending === true &&
        visit.completed === false
    );

    if (visitsForDay.length === 0) {
      // No visits on this day; do nothing or optionally show a message
      return;
    } else if (visitsForDay.length === 1) {
      // Only one visit; navigate directly to /visits and select the visit
      const visit = visitsForDay[0];
      if (visit._id) {
        handleVisitSelect(visit);
      }
    } else {
      // Multiple visits; open a dialog to choose which visit to view
      setVisitsOnSelectedDay(visitsForDay);
      setOpenDialog(true);
    }
  };

  /**
   * Handles the selection of a specific visit from the dialog.
   */
  const handleVisitSelect = (visit: VisitWithAgent) => {
    if (userRole === "admin") {
      if (visit.agentId) {
        dispatch(selectAgent(visit.agentId));
      }
      dispatch(selectClient(visit.clientId));
      dispatch(selectVisit(visit._id!));
    } else if (userRole === "agent") {
      dispatch(selectClient(visit.clientId));
      dispatch(selectVisit(visit._id!));
    } else if (userRole === "client") {
      dispatch(selectVisit(visit._id!));
    }
    navigate("/visits");
  };

  /**
   * Closes the dialog without selecting a visit.
   */
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "white",
        flexGrow: 1, // Allow the component to grow and shrink based on available space
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // Allow the component to shrink without constraints
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `url('/funky-lines.png')`,
          backgroundSize: "cover",
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          loading={isLoading}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: (props) => (
              <ServerDay
                {...props}
                onDayClick={handleDayClick}
                highlightedDays={highlightedDays}
              />
            ),
          }}
          slotProps={{
            day: {
              highlightedDays,
            } as ServerDayProps,
          }}
          sx={{
            width: "auto",
            flexGrow: 1, // Allow the calendar to grow and shrink based on available space
            minHeight: 0, // Allow the calendar to shrink without constraints
          }}
        />
      </LocalizationProvider>

      {/* Dialog for selecting a visit when multiple visits exist on a day */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="select-visit-dialog-title"
      >
        <DialogTitle id="select-visit-dialog-title">
          {t("calendarComponent.selectVisit", "Select a Visit")}
        </DialogTitle>
        <DialogContent>
          {visitsOnSelectedDay.length > 0 ? (
            <List>
              {visitsOnSelectedDay.map((visit) => (
                <ListItem
                  button
                  key={visit._id}
                  onClick={() => handleVisitSelect(visit)}
                >
                  <ListItemText
                    primary={`${visit.type} - ${visit.visitReason}`}
                    secondary={`${t(
                      "calendarComponent.clientId",
                      "Client ID"
                    )}: ${visit.clientId} | ${t(
                      "calendarComponent.date",
                      "Date"
                    )}: ${dayjs(visit.date).format("DD/MM/YYYY HH:mm")}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>
              {t("calendarComponent.noVisitsAvailable", "No visits available.")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            {t("calendarComponent.close", "Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CalendarComponent;
