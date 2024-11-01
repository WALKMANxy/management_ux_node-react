//src/components/calendarPage/CalendarEventComponent.tsx
import { useMediaQuery, useTheme } from "@mui/material";
import Paper from "@mui/material/Paper";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectUserRole } from "../../features/auth/authSlice";
import { selectUserById } from "../../features/users/userSlice";
import { CalendarEvent } from "../../models/dataModels";
import {
  getBackgroundColorForEvent,
  getIconForReason,
} from "../../utils/calendarUtils";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

const CalendarEventComponent: React.FC<CalendarEventComponentProps> = ({
  event,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useAppSelector((state) => selectUserById(state, event.userId));
  const userRole = useAppSelector(selectUserRole);
  const entityName = user?.entityName || t("calendarEvent.unknown");

  const backgroundColor = getBackgroundColorForEvent(event, userRole);

  // Determine the title based on event type and reason
  let title: React.ReactNode;

  if (event.eventType === "event") {
    title = (
      <span>
        {getIconForReason(event.reason)}{" "}
        {t(`calendarEvent.reasons.${event.reason}`)}
      </span>
    );
  } else if (event.eventType === "absence") {
    title = (
      <span>
        {getIconForReason(event.reason)} {entityName}
      </span>
    );
  } else {
    title = event.eventName;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        padding: "8px",
        margin: "4px",
        display: "flex",
        alignItems: "center",
        height: isMobile ? "25px" : "35px",
        backgroundColor: backgroundColor,
      }}
    >
      <span>{title}</span>
    </Paper>
  );
};

export default CalendarEventComponent;
