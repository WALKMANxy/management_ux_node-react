// src/components/calendarPage/EventTitle.tsx
import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "../../models/dataModels";
import { getIconForReason } from "../../utils/calendarUtils";

interface EventTitleProps {
  event: CalendarEvent;
  entityName?: string;
}


const EventTitle: React.FC<EventTitleProps> = ({ event, entityName }) => {
  const { t } = useTranslation();

  let title: React.ReactNode;

  if (event.eventType === "event") {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <span style={{ marginLeft: 4 }}>
          {t(`eventTitle.reasons.${event.reason}`)}
        </span>
      </Box>
    );
  } else if (event.eventType === "absence") {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <span style={{ marginLeft: 4 }}>
          {entityName || t("eventTitle.unknown")}
        </span>
      </Box>
    );
  } else if (["holiday", "visit", "generic"].includes(event.eventType)) {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <span style={{ marginLeft: 4 }}>
          {t(`eventTypes.${event.eventType}`, {
            defaultValue: t("eventTypes.generic"),
          })}
        </span>
      </Box>
    );
  } else {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <span style={{ marginLeft: 4 }}>{event.eventName}</span>
      </Box>
    );
  }

  return <span>{title}</span>;
};

export default React.memo(EventTitle);
