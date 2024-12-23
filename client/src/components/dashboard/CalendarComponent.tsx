// src/components/dashboard/CalendarComponent.tsx
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { locale } from "../../services/localizer";
import { agentColorMap } from "../../utils/constants";
import { now } from "../../utils/dataUtils";
import ServerDay from "./ServerDay";

const CalendarComponent: React.FC = () => {
  const visits = useAppSelector(selectVisits);
  const currentUserDetails = useAppSelector(
    (state) => state.data.currentUserDetails
  );
  const clients = useAppSelector((state) => state.data.clients);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userRole = currentUserDetails?.role;

  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState<
    { date: number; color: string }[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const [openDialog, setOpenDialog] = useState(false);
  const [visitsOnSelectedDay, setVisitsOnSelectedDay] = useState<
    VisitWithAgent[]
  >([]);

  const updateHighlightedDays = useCallback(
    (month: Dayjs) => {
      const days = visits.reduce<{ date: number; color: string }[]>(
        (acc, visit) => {
          if (
            visit.pending !== true ||
            visit.completed !== false ||
            !visit.date ||
            !dayjs(visit.date).isSame(month, "month")
          ) {
            return acc;
          }

          const visitDay = dayjs(visit.date);
          const date = visitDay.date();
          const isPast = visitDay.isBefore(now, "day");

          // Check if the date is already processed
          const existing = acc.find((d) => d.date === date);
          if (existing && existing.color === "#FFA8B8") {
            return acc;
          }

          let color = "#ADD8E6";

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

          if (isPast) {
            color = "#FFA8B8"; // Override with fainter red for past pending visits
          }

          if (!existing) {
            acc.push({ date, color });
          } else if (!isPast) {
            acc = acc.map((d) =>
              d.date === date && d.color !== "#FFA8B8" ? { ...d, color } : d
            );
          }

          return acc;
        },
        []
      );

      setHighlightedDays(days);
    },
    [visits, currentUserDetails, clients]
  );

  useEffect(() => {
    updateHighlightedDays(currentMonth);
  }, [currentMonth, updateHighlightedDays]);

  // Ref to store the timeout ID
  const monthChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMonthChange = useCallback(
    (date: Dayjs) => {
      setIsLoading(true);
      setCurrentMonth(date);

      // Clear any existing timeout
      if (monthChangeTimeoutRef.current) {
        clearTimeout(monthChangeTimeoutRef.current);
      }

      // Simulate an async request with a timeout
      monthChangeTimeoutRef.current = setTimeout(() => {
        updateHighlightedDays(date);
        setIsLoading(false);
        monthChangeTimeoutRef.current = null;
      }, 500);
    },
    [updateHighlightedDays]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monthChangeTimeoutRef.current) {
        clearTimeout(monthChangeTimeoutRef.current);
      }
    };
  }, []);

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
      // No visits on this day; do nothing
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
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
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
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
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
            flexGrow: 1,
            minHeight: 0,
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
