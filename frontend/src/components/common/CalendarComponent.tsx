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
  );
};

export default CalendarComponent;
