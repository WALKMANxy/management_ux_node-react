import { Paper } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { selectVisits } from "../../features/utility/utilitySlice";
import { Visit } from "../../models/dataModels";
import { Agent } from "../../models/entityModels";
import { ServerDayProps } from "../../models/propsModels";
import { agentColorMap } from "../../utils/constants";
import ServerDay from "./ServerDay"; // Import the ServerDay component

type VisitWithAgent = Visit & { agentId?: string; agentName?: string };

const CalendarComponent: React.FC = () => {
  const visits = useSelector(selectVisits);
  const currentUserData = useSelector(
    (state: RootState) => state.data.currentUserData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState<
    { date: number; color: string }[]
  >([]);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  const updateHighlightedDays = useCallback(
    (month: Dayjs) => {
      const days = visits
        .filter(
          (visit: VisitWithAgent) =>
            visit?.date && dayjs(visit.date).isSame(month, "month")
        )
        .map((visit: VisitWithAgent) => {
          let color = "#ADD8E6"; // Default pastel blue

          if (currentUserData) {
            if ("GlobalVisits" in currentUserData) {
              // Admin view, color by agent
              color = visit.agentId
                ? agentColorMap[visit.agentId] ?? color
                : color;
            } else if ("AgentVisits" in currentUserData) {
              // Agent view, color by client
              const agentData = currentUserData as Agent;
              const client = agentData.clients.find(
                (c) => c.id === visit.clientId
              );
              color = client?.colour ?? color;
            }
            // Clients have a single default color, no change needed
          }

          return { date: dayjs(visit.date).date(), color };
        });

      setHighlightedDays(days);
    },
    [visits, currentUserData]
  );

  useEffect(() => {
    updateHighlightedDays(currentMonth);
  }, [currentMonth, updateHighlightedDays]);

  const handleMonthChange = (date: Dayjs) => {
    setIsLoading(true);
    setCurrentMonth(date);

    // Simulate an async request to fetch data for the new month
    setTimeout(() => {
      updateHighlightedDays(date);
      setIsLoading(false);
    }, 500);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)",
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
            day: ServerDay,
          }}
          slotProps={{
            day: {
              highlightedDays,
            } as ServerDayProps,
          }}
          fixedWeekNumber={6}
          displayWeekNumber
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default CalendarComponent;
