import React from 'react';
import { Timeline } from "@mui/icons-material";
import { timelineItemClasses, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from "@mui/lab";
import { Card, CardHeader, Typography } from "@mui/material";

// Define the structure of an activity item
interface ActivityItem {
  id: string;
  type: 'visits' | 'sales' | 'alerts' | string;
  title: string;
  time: string;
}

// Props for the AgentActivityOverview component
interface AgentActivityOverviewProps {
  list: ActivityItem[];
}

// Props for the OrderItem component
interface OrderItemProps {
  item: ActivityItem;
  lastTimeline: boolean;
}

const AgentActivityOverview: React.FC<AgentActivityOverviewProps> = ({ list }) => {
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
        {list.map((item, index) => (
          <OrderItem key={item.id} item={item} lastTimeline={index === list.length - 1} />
        ))}
      </Timeline>
    </Card>
  );
};

const OrderItem: React.FC<OrderItemProps> = ({ item, lastTimeline }) => {
  const { type, title, time } = item;

  const getDotColor = (type: string): "primary" | "success" | "error" | "grey" => {
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
      </TimelineContent>
    </TimelineItem>
  );
};

export default AgentActivityOverview;