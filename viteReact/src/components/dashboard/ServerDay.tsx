// src/components/common/ServerDay.tsx
import React from 'react';
import Badge from "@mui/material/Badge";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { ServerDayProps } from '../../models/propsModels';



const ServerDay: React.FC<ServerDayProps> = (props) => {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected = !outsideCurrentMonth && highlightedDays.includes(day.date());

  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? '•' : undefined}
      color="secondary"
      aria-label={isSelected ? "This day has an event" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
};

export default ServerDay;