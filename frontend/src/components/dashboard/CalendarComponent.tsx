import { Paper } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import React from "react";
import { useSelector } from "react-redux";
import { selectVisits } from "../../features/calendar/calendarSlice";
import ServerDay from "./ServerDay";

const CalendarComponent: React.FC = () => {
  const visits = useSelector(selectVisits);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState<number[]>([]);

  React.useEffect(() => {
    //console.log("Visits in CalendarComponent:", visits);
    const days = visits
      .filter((visit) => visit && visit.date) // Filter out undefined visits
      .map((visit) => dayjs(visit.date).date());
    setHighlightedDays(days);
  }, [visits]);

  const handleMonthChange = (date: dayjs.Dayjs) => {
    setIsLoading(true);
    // Simulate an async request
    setTimeout(() => {
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
          opacity: 0.1, // Adjust this value to make the pattern more or less transparent
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
            } as any,
          }}
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default CalendarComponent;
