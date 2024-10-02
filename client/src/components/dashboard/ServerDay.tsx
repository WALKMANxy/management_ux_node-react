// src/components/ServerDay.tsx

import { Badge, Tooltip } from "@mui/material";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { Dayjs } from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

export interface HighlightedDay {
  date: number;
  color: string;
  label?: string; // Optional descriptive label for accessibility
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

  const { t } = useTranslation();

  const highlightedDay = highlightedDays.find(
    (highlight) => highlight.date === day.date()
  );

  const isSelected = !outsideCurrentMonth && Boolean(highlightedDay);

  const ariaLabel =
    highlightedDay?.label ||
    (isSelected
      ? t("calendarComponent.plannedVisit", "Planned Visit")
      : undefined);

  const handleClick = () => {
    if (isSelected) {
      onDayClick(day);
    }
  };

  return (
    <Tooltip title={ariaLabel || ""} disableHoverListener={!ariaLabel}>
      <Badge
        overlap="circular"
        badgeContent={isSelected ? "•" : undefined}
        aria-label={ariaLabel}
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          onClick={handleClick}
          sx={{
            backgroundColor: highlightedDay?.color
              ? highlightedDay.color
              : "transparent",
            cursor: isSelected ? "pointer" : "default",
            "&:hover": {
              backgroundColor: highlightedDay?.color
                ? `${highlightedDay.color}80` // Adding opacity on hover (assuming hex color)
                : "rgba(255, 235, 59, 0.3)",
            },
          }}
        />
      </Badge>
    </Tooltip>
  );
};

export default React.memo(ServerDay);
