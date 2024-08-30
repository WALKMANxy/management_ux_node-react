// src/utils/activityUtils.ts

import { Alert, GlobalVisits } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { calculateRevenue } from "./dataUtils";

// Define the structure of an activity item
interface ActivityItem {
  id: string;
  type: "visits" | "sales" | "alerts";
  title: string;
  time: string;
  details: string;
  subDetails?: string;
}

export const generateActivityList = (
  clients: Record<string, Client>,
  globalVisits: GlobalVisits,
  alerts: Alert[]
): ActivityItem[] => {
  const activities: ActivityItem[] = [];

  // Process completed visits, limit to the first 5
  let visitCount = 0;
  Object.entries(globalVisits).forEach(([agentId, { Visits }]) => {
    for (const visit of Visits.filter((v) => v.completed).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )) {
      if (visitCount >= 5) break; // Limit to 5 visits
      activities.push({
        id: visit.id,
        type: "visits",
        title: `Visit - agent: ${agentId}`,
        time: visit.date.toLocaleDateString(),
        details: `${visit.reason} - Client: ${visit.clientId}`,
        subDetails: visit.notePublic ? visit.notePublic.slice(0, 50) + "..." : "",
      });
      visitCount++;
    }
  });

  // Initialize a counter for processed movements
  let movementCount = 0;

  // Process sales (movements), limit to the first 5
  Object.values(clients).forEach((client) => {
    for (const movement of client.movements) {
      if (movementCount >= 5) break; // Limit to 5 movements
      activities.push({
        id: movement.id,
        type: "sales",
        title: `Sale - agent: ${client.agent}`,
        time: movement.dateOfOrder,
        details: `Client: ${client.id} - Revenue: ${calculateRevenue([
          movement,
        ]).toFixed(2)}`,
        subDetails: `Order Date: ${movement.dateOfOrder}`,
      });
      movementCount++;
    }
  });

  // Initialize a counter for processed alerts
  let alertCount = 0;

  // Process alerts, limit to the first 5
  for (const alert of alerts) {
    if (alert.entityRole === "agent" && alertCount < 5) {
      activities.push({
        id: alert._id,
        type: "alerts",
        title: `Alert - agent: ${alert.entityCode}`,
        time: new Date(alert.createdAt).toLocaleDateString(),
        details: `${alert.alertReason} - Severity: ${alert.severity}`,
        subDetails: alert.message.slice(0, 25) + "...",
      });
      alertCount++;
    }
    if (alertCount >= 5) break; // Limit to 5 alerts
  }

  // Sort all activities by time (most recent first) and limit to 10 items
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);
};
