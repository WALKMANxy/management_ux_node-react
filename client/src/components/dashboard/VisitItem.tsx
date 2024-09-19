import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { VisitWithAgent } from "../../features/data/dataSelectors";

// Helper component for individual visit items
interface VisitItemProps {
  visit: VisitWithAgent;
  lastTimeline: boolean;
}

export const VisitItem: React.FC<VisitItemProps> = ({
  visit,
  lastTimeline,
}) => {
  const { t } = useTranslation();

  // Function to format date and time
  const formatDateTime = (time: Date): string => {
    const date = new Date(time);
    return (
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: "auto 0" }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        {formatDateTime(visit.date)}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color="primary" />
        {!lastTimeline && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ py: "12px", px: 2 }}>
        <Typography variant="subtitle2">
          {t("upcomingVisits.visitType")}: {visit.type}
        </Typography>
        <Typography variant="body2">
          {t("upcomingVisits.visitReason")}: {visit.visitReason}
        </Typography>
        <Typography variant="body2">
          {t("upcomingVisits.clientId")}: {visit.clientId}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};
