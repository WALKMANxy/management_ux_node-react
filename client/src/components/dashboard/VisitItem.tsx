// src/components/VisitItem.tsx

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
  const theme = useTheme();

  /**
   * Formats a Date object into a localized date and time string.
   *
   * @param {Date} time - The date and time to format.
   * @returns {string} - The formatted date and time string.
   */
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

  /**
   * Generates a translation key for visit type.
   *
   * @param {string} type - The visit type.
   * @returns {string} - The translation key.
   */
  const getVisitTypeTranslation = (type: string): string => {
    return t(`upcomingVisits.visitType.${type.toLowerCase()}`, type);
  };

  /**
   * Generates a translation key for visit reason.
   *
   * @param {string} reason - The visit reason.
   * @returns {string} - The translation key.
   */
  const getVisitReasonTranslation = (reason: string): string => {
    // Remove spaces and convert to lowercase to match translation keys
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
          {/* Optional: Add an icon inside the dot */}
          {/* <YourIcon /> */}
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
            wordBreak: "break-word", // Prevent overflow
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

        {/* Optional: Additional Details or Actions */}
        {/* For example, a button to view visit details */}
        {/*
        <Button variant="outlined" size="small" sx={{ mt: 1 }}>
          {t("upcomingVisits.viewDetails", "View Details")}
        </Button>
        */}
      </TimelineContent>
    </TimelineItem>
  );
};

export default React.memo(VisitItem);
