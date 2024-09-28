// src/components/clientpage/AgentActivityOverview.tsx

import LoyaltyIcon from "@mui/icons-material/Loyalty";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { CardHeader, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import { Agent } from "../../models/entityModels";
import { ActivityItem, generateActivityList } from "../../utils/activityUtils"; // Import ActivityItem

// Props for the OrderItem component
interface OrderItemProps {
  item: ActivityItem;
  lastTimeline: boolean;
}

// Props for the AgentActivityOverview component
interface AgentActivityOverviewProps {
  selectedAgent: Agent;
}

const AgentActivityOverview: React.FC<AgentActivityOverviewProps> = ({
  selectedAgent,
}) => {
  const promos = useAppSelector(selectVisits); // Assuming 'selectVisits' fetches promotion-related visits
  const { t } = useTranslation(); // Initialize translation

  // Generate activity list using the utility function
  const activityList: ActivityItem[] = useMemo(
    () => generateActivityList(selectedAgent.clients, selectedAgent.id, promos),
    [selectedAgent.id, selectedAgent.clients, promos] // More granular dependencies
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `url('/funky-lines.png')`,
          backgroundSize: "cover",
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <CardHeader title={t("agentActivity.title", "Recent Activity")} />
      <Timeline
        position="alternate"
        sx={{
          m: 0,
          p: 3,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {activityList.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {t("agentActivity.noRecentActivities", "No recent activities.")}
          </Typography>
        ) : (
          activityList.map((item, index) => (
            <OrderItem
              key={item.id}
              item={item}
              lastTimeline={index === activityList.length - 1}
            />
          ))
        )}
      </Timeline>
    </Paper>
  );
};

const OrderItem: React.FC<OrderItemProps> = ({ item, lastTimeline }) => {
  const { type, title, time, details } = item;
  const { t } = useTranslation(); // Initialize translation

  /**
   * Determines the color of the TimelineDot based on the activity type.
   *
   * @param {string} type - The type of activity.
   * @returns {"primary" | "success" | "error" | "grey"} The color for the TimelineDot.
   */
  const getDotColor = (
    type: string
  ): "primary" | "success" | "error" | "grey" => {
    switch (type) {
      case "visits":
        return "primary";
      case "sales":
        return "success";
      case "alerts":
        return "error";
      default:
        return "grey";
    }
  };

  /**
   * Formats the date to exclude the time component.
   *
   * @param {string} time - The ISO date string.
   * @returns {string} The formatted date string (DD/MM/YYYY).
   */
  const formatDate = (time: number): string => {
    return dayjs(time).format("DD/MM/YYYY");
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: "auto 0" }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        {t("agentActivity.occurredAt", "Occurred at")} {formatDate(time)}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        <TimelineDot color={getDotColor(type)} aria-label={type}>
          {/* Optional: Add ARIA hidden if decorative */}
          <LoyaltyIcon aria-hidden="true" />
        </TimelineDot>
        {!lastTimeline && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2">{details}</Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

export default React.memo(AgentActivityOverview);
