import Badge from "@mui/material/Badge";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import React from "react";
import { ServerDayProps } from "../../models/propsModels";

const ServerDay: React.FC<ServerDayProps> = (props) => {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const highlightedDay = highlightedDays.find(
    (highlight) => highlight.date === day.date()
  );
  const isSelected = !outsideCurrentMonth && Boolean(highlightedDay);

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "•" : undefined}
      sx={{
        ".MuiBadge-badge": {
          backgroundColor: highlightedDay?.color || "transparent", // Set badge color
        },
      }}
      aria-label={isSelected ? "This day has an event" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        sx={{
          backgroundColor: highlightedDay?.color || "transparent", // Set day background color
        }}
      />
    </Badge>
  );
};

export default ServerDay;
