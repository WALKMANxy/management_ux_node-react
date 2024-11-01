//src/components/dashboard/VisitItem.tsx
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { VisitWithAgent } from "../../features/promoVisits/promoVisitsSelectors";

interface VisitItemProps {
  visit: VisitWithAgent;
  lastTimeline: boolean;
}

export const VisitItem: React.FC<VisitItemProps> = ({
  visit,
  lastTimeline,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();


  const formatDateTime = (time: Date): string => {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(time);
  };


  const getVisitTypeTranslation = (type: string): string => {
    return t(`upcomingVisits.visitType.${type.toLowerCase()}`, type);
  };


  const getVisitReasonTranslation = (reason: string): string => {
    const key = reason.replace(/\s+/g, "").toLowerCase();
    return t(`upcomingVisits.visitReason.${key}`, reason);
  };

  return (
    <TimelineItem>
      {/* Opposite Content: Visit Date and Time */}
      <TimelineOppositeContent
        sx={{ m: "auto 0" }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        {formatDateTime(new Date(visit.date))}
      </TimelineOppositeContent>

      {/* Timeline Separator with Dot and Connector */}
      <TimelineSeparator>
        <TimelineDot color="primary">
        </TimelineDot>
        {!lastTimeline && <TimelineConnector />}
      </TimelineSeparator>

      {/* Timeline Content: Visit Details */}
      <TimelineContent sx={{ py: "12px", px: 2 }}>
        {/* Visit Type */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            wordBreak: "break-word",
          }}
        >
          {t("upcomingVisits.visitTypeLabel", "Visit Type")}:{" "}
          {visit.type
            ? getVisitTypeTranslation(visit.type)
            : t("upcomingVisits.na", "N/A")}
        </Typography>

        {/* Visit Reason */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            wordBreak: "break-word",
          }}
        >
          {t("upcomingVisits.visitReasonLabel", "Visit Reason")}:{" "}
          {visit.visitReason
            ? getVisitReasonTranslation(visit.visitReason)
            : t("upcomingVisits.na", "N/A")}
        </Typography>

        {/* Client ID */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            wordBreak: "break-word",
          }}
        >
          {t("upcomingVisits.clientId", "Client ID")}: {visit.clientId}
        </Typography>

      
      </TimelineContent>
    </TimelineItem>
  );
};

export default React.memo(VisitItem);
