// src/components/Alerts/AlertsList.tsx
import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const AlertsList: React.FC = () => {
  const alerts = useSelector(selectAlerts);

  // Group alerts by issuer
  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.alertIssuedBy]) {
      acc[alert.alertIssuedBy] = [];
    }
    acc[alert.alertIssuedBy].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  return (
    <List>
      {Object.entries(groupedAlerts).map(([issuer, alerts]) => {
        const latestAlert = alerts[alerts.length - 1];
        const unreadCount = alerts.filter(
          (alert) => !alert.markedAsRead
        ).length;

        return (
          <ListItem
            key={issuer}
            sx={{
              backgroundColor:
                latestAlert.severity === "high"
                  ? "rgba(255, 0, 0, 0.1)"
                  : latestAlert.severity === "medium"
                  ? "rgba(255, 255, 0, 0.1)"
                  : "transparent",
            }}
          >
            <ListItemAvatar>
              <Avatar src={/* Add issuer avatar logic here */} />
            </ListItemAvatar>
            <ListItemText
              primary={issuer}
              secondary={`${latestAlert.message.slice(0, 20)}...`}
            />
            <Badge color="secondary" badgeContent={unreadCount} />
          </ListItem>
        );
      })}
    </List>
  );
};

export default AlertsList;
