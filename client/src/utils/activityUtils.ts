// src/utils/activityUtils.ts

import {  GlobalVisits } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { calculateRevenue, currencyFormatter } from "./dataUtils";

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
  clients: Client[], // Accept clients directly from the selected agent
  agentId: string, // Accept agentId for filtering visits and alerts
  globalVisits: GlobalVisits,
): ActivityItem[] => {
  const activities: ActivityItem[] = [];

  // Process completed visits, limit to the first 5
  let visitCount = 0;
/*   console.log("Initial globalVisits:", globalVisits);
 */  Object.entries(globalVisits).forEach(([visitAgentId, { Visits }]) => {
    // Filter visits to include only those with the selected agentId
    if (visitAgentId === agentId) {
/*       console.log(`Processing visits for agent ${visitAgentId}:`, Visits);
 */      for (const visit of Visits.filter((v) => v.completed).sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      )) {
        if (visitCount >= 5) break; // Limit to 5 visits
/*         console.log("Adding visit to activities:", visit);
 */        activities.push({
          id: visit.id,
          type: "visits",
          title: `Visit - agent: ${visitAgentId}`,
          time: visit.date.toLocaleDateString(),
          details: `${visit.reason} - Client: ${visit.clientId}`,
          subDetails: visit.notePublic
            ? visit.notePublic.slice(0, 50) + "..."
            : "",
        });
        visitCount++;
      }
    }
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
    /* console.log(
      "Adding movement to activities:",
      movement,
      "Calculated revenue:",
      revenue
    ); */
    activities.push({
      id: movement.id,
      type: "sales",
      title: "Sale",
      time: movement.dateOfOrder,
      details: `Client: ${movement.client.id}, ${movement.client.name}  - Revenue: ${currencyFormatter(revenue)}`,
      subDetails: `Order Date: ${movement.dateOfOrder}`,
    });
  });



  // Sort all activities by time (most recent first) and limit to 10 items
  const sortedActivities = activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

/*   console.log("Final sorted activities:", sortedActivities);
 */  return sortedActivities;
};
