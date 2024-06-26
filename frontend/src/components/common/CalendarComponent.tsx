import React from "react";
import Badge from "@mui/material/Badge";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { useSelector } from "react-redux";
import { selectVisits } from "../../features/calendar/calendarSlice";
import dayjs from "dayjs";
import { Paper } from "@mui/material";

function ServerDay(
  props: PickersDayProps<dayjs.Dayjs> & { highlightedDays?: number[] }
) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.indexOf(day.date()) >= 0;

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "📅" : undefined}
      color="secondary"
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

const CalendarComponent: React.FC = () => {
  const visits = useSelector(selectVisits);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState<number[]>([]);

  React.useEffect(() => {
    const days = visits.map((visit) => dayjs(visit.date).date());
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
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)',
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
