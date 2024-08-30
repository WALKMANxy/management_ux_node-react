// AgentActivityOverview.tsx

import { Timeline } from "@mui/icons-material";
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { Card, CardHeader, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { selectAlerts } from "../../features/data/dataSelectors";
import { Alert, GlobalVisits, Visit } from "../../models/dataModels";
import { Client } from "../../models/entityModels";
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

const AgentActivityOverview: React.FC = () => {
  // Fetch clients, visits, and alerts from the store
  const clients: Record<string, Client> = useAppSelector(
    (state: RootState) => state.data.clients
  );
  const globalVisits: GlobalVisits = useAppSelector(
    (state: RootState) => state.data.currentUserVisits
  ) as Record<string, { Visits: Visit[] }>;
  const alerts: Alert[] = useAppSelector(selectAlerts);

  // Generate activity list using the utility function
  const activityList: ActivityItem[] = useMemo(
    () => generateActivityList(clients, globalVisits, alerts),
    [clients, globalVisits, alerts]
  );

  return (
    <Card>
      <CardHeader title="Agent Activity Overview" />
      <Timeline
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
    </Card>
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
      <TimelineSeparator>
        <TimelineDot color={getDotColor(type)} />
        {!lastTimeline && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {time}
        </Typography>
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
