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
import { CardHeader, Paper, Typography, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import { Agent } from "../../models/entityModels";
import { ActivityItem, generateActivityList } from "../../utils/activityUtils";
import { formatDate, getDotColor } from "../../utils/dataUtils";

interface OrderItemProps {
  item: ActivityItem;
  lastTimeline: boolean;
}

interface AgentActivityOverviewProps {
  selectedAgent: Agent;
}

const AgentActivityOverview: React.FC<AgentActivityOverviewProps> = ({
  selectedAgent,
}) => {
  const promos = useAppSelector(selectVisits);
  const { t } = useTranslation();

  const isMobile = useMediaQuery("(max-width: 600px)");
  // Generate activity list using the utility function
  const activityList: ActivityItem[] = useMemo(
    () => generateActivityList(selectedAgent.clients, selectedAgent.id, promos),
    [selectedAgent.id, selectedAgent.clients, promos]
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
          p: isMobile ? 0 : 3,
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
  const { t } = useTranslation();

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
