import React from "react";
import { Badge } from "@mui/material";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { Dayjs } from "dayjs";

export interface HighlightedDay {
  date: number;
  color: string;
}

export interface ServerDayProps extends PickersDayProps<Dayjs> {
  highlightedDays?: HighlightedDay[];
  onDayClick: (day: Dayjs) => void;
}

const ServerDay: React.FC<ServerDayProps> = (props) => {
  const {
    highlightedDays = [],
    day,
    outsideCurrentMonth,
    onDayClick, // Destructure onDayClick here
    ...other
  } = props;

  const highlightedDay = highlightedDays.find(
    (highlight) => highlight.date === day.date()
  );

  const isSelected = !outsideCurrentMonth && Boolean(highlightedDay);

  const handleClick = () => {
    if (isSelected) {
      onDayClick(day);
    }
  };

  return (
    <Badge
      overlap="circular"
      badgeContent={isSelected ? "•" : undefined}
      
      aria-label={isSelected ? "This day has an event" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        onClick={handleClick}
        sx={{
          backgroundColor: isSelected
            ? "rgba(63, 81, 181, 0.2)"
            : "rgba(255, 235, 59, 0.1)",
          cursor: isSelected ? "pointer" : "default",
          "&:hover": {
            backgroundColor: isSelected
              ? "rgba(63, 81, 181, 0.5)"
              : "rgba(255, 235, 59, 0.3)",
          },
        }}
      />
    </Badge>
  );

};

export default ServerDay;
