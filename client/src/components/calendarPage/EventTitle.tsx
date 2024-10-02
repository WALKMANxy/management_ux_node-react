// src/components/calendarPage/EventTitle.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "../../models/dataModels";
import { getIconForReason } from "../../utils/calendarUtils";
import { Tooltip, Box } from "@mui/material";

interface EventTitleProps {
  event: CalendarEvent;
  entityName?: string;
}

/**
 * EventTitle Component
 * Displays the title of a calendar event with an associated icon.
 *
 * @param {EventTitleProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const EventTitle: React.FC<EventTitleProps> = ({ event, entityName }) => {
  const { t } = useTranslation();

  // Determine the display title based on event type and reason
  let title: React.ReactNode;

  if (event.eventType === "event") {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <Tooltip title={t(`eventTitle.tooltips.${event.reason}`, { defaultValue: t("eventTitle.tooltips.generic") })}>
          <span style={{ marginLeft: 4 }}>{t(`eventTitle.reasons.${event.reason}`, { defaultValue: t("eventTitle.reasons.generic") })}</span>
        </Tooltip>
      </Box>
    );
  } else if (event.eventType === "absence") {
    title = (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {getIconForReason(event.reason)}
        <Tooltip title={entityName ? `${entityName}` : t("eventTitle.tooltips.unknown")}>
          <span style={{ marginLeft: 4 }}>{entityName || t("eventTitle.unknown")}</span>
        </Tooltip>
      </Box>
    );
  } else {
    title = <span>{event.eventName}</span>;
  }

  return <span>{title}</span>;
};

export default React.memo(EventTitle);
