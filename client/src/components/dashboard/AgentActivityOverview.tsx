// AgentActivityOverview.tsx

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
import React, { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { selectAlerts } from "../../features/data/dataSelectors";
import { Alert, GlobalVisits, Visit } from "../../models/dataModels";
import { Agent } from "../../models/entityModels";
import { generateActivityList } from "../../utils/activityUtils";

// Define the structure of an activity item
interface ActivityItem {
  id: string;
  type: "visits" | "sales" | "alerts";
  title: string;
  time: string;
  details: string;
  subDetails?: string;
}

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
  // Fetch global visits and alerts from the store
  const globalVisits: GlobalVisits = useAppSelector(
    (state: RootState) => state.data.currentUserVisits
  ) as Record<string, { Visits: Visit[] }>;
  const alerts: Alert[] = useAppSelector(selectAlerts);

  // Generate activity list using the utility function
  const activityList: ActivityItem[] = useMemo(
    () =>
      generateActivityList(
        selectedAgent.clients,
        selectedAgent.id,
        globalVisits,
        alerts
      ),
    [selectedAgent, globalVisits, alerts]
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
      <CardHeader title="Recent Activity" />
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
        {activityList.map((item, index) => (
          <OrderItem
            key={item.id}
            item={item}
            lastTimeline={index === activityList.length - 1}
          />
        ))}
      </Timeline>
    </Paper>
  );
};

const OrderItem: React.FC<OrderItemProps> = ({ item, lastTimeline }) => {
  const { type, title, time, details, subDetails } = item;

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

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: "auto 0" }}
        align="right"
        variant="body2"
        color="text.secondary"
      >
        {time}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={getDotColor(type)} />
        {!lastTimeline && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2">{details}</Typography>
        {subDetails && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {subDetails}
          </Typography>
        )}
      </TimelineContent>
    </TimelineItem>
  );
};

export default AgentActivityOverview;
