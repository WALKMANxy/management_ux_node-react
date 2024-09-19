// src/utils/activityUtils.ts

import { Client } from "../models/entityModels";
import { calculateRevenue, currencyFormatter } from "./dataUtils";
import { VisitWithAgent } from "../features/data/dataSelectors";

// Define the structure of an activity item
export interface ActivityItem {
  id: string;
  type: "visits" | "sales" | "alerts";
  title: string;
  time: string;
  details: string;
  subDetails?: string;
}

export const generateActivityList = (
  clients: Client[], // Accept clients directly from the selected agent
  agentId: string, // Accept agentId for filtering visits and alerts
  visits: VisitWithAgent[] // Use visits from the selectVisits selector
): ActivityItem[] => {
  const activities: ActivityItem[] = [];


  // Process completed visits for the agent, limit to the first 5
  /* console.log("Generating activity list for agent", agentId);
  console.log("Visits:", visits); */
  const agentVisits = visits
    .filter((visit) => visit.agentId === agentId && visit.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  /* console.log("Filtered visits:", agentVisits);
  console.log("Type of visit.date" + typeof agentVisits[0].date); */

  agentVisits.forEach((visit) => {
    console.log("Adding visit to activity list:", visit);
    activities.push({
      id: visit._id !== undefined ? visit._id : "",
      type: "visits",
      title: `Visit - Agent: ${visit.agentName || visit.agentId}`,
      time: visit.date ? visit.date.toString() : "",
      details: `${visit.visitReason} - Client: ${visit.clientId}`,
      subDetails: visit.notePublic ? visit.notePublic.slice(0, 50) + "..." : "",
    });
  });

  // Process sales (movements), limit to the first 5 based on the most recent dateOfOrder
  const recentMovements = clients
    .flatMap((client) =>
      client.movements.map((movement) => ({ ...movement, client }))
    )
    .sort(
      (a, b) =>
        new Date(b.dateOfOrder).getTime() - new Date(a.dateOfOrder).getTime()
    )
    .slice(0, 5);

  recentMovements.forEach((movement) => {
    const revenue = calculateRevenue([movement]);
    activities.push({
      id: movement.id,
      type: "sales",
      title: "Sale",
      time: new Date(movement.dateOfOrder).toISOString(),
      details: `Client: ${movement.client.id}, ${movement.client.name} - Revenue: ${currencyFormatter(
        revenue
      )}`,
      subDetails: `Order Date: ${new Date(movement.dateOfOrder).toLocaleDateString()}`,
    });
  });

  // Sort all activities by time (most recent first) and limit to 10 items
  const sortedActivities = activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return sortedActivities;
};
