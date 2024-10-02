// src/utils/activityUtils.ts

import { VisitWithAgent } from "../features/promoVisits/promoVisitsSelectors";
import { Client } from "../models/entityModels";
import { calculateRevenue, currencyFormatter } from "./dataUtils";

// Define the structure of an activity item
export interface ActivityItem {
  id: string;
  type: "visits" | "sales" | "alerts";
  title: string;
  time: number; // Use timestamp for efficient sorting
  details: string;
  subDetails?: string;
}

export const generateActivityList = (
  clients: Client[], // Accept clients directly from the selected agent
  agentId: string, // Accept agentId for filtering visits and alerts
  visits: VisitWithAgent[] // Use visits from the selectVisits selector
): ActivityItem[] => {

  // Process completed visits for the agent, limit to the first 5
  /* console.log("Generating activity list for agent", agentId);
  console.log("Visits:", visits); */
  const agentVisits = visits
    .filter((visit) => visit.agentId === agentId && visit.completed)
    .map((visit) => ({
      ...visit,
      timestamp:
        typeof visit.date === "string"
          ? new Date(visit.date).getTime()
          : visit.date.getTime(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map<ActivityItem>((visit) => ({
      id: visit._id || "",
      type: "visits",
      title: `Visit - Agent: ${visit.agentName || visit.agentId}`,
      time: visit.timestamp,
      details: `${visit.visitReason} - Client: ${visit.clientId}`,
      subDetails: visit.notePublic
        ? visit.notePublic.length > 50
          ? `${visit.notePublic.slice(0, 50)}...`
          : visit.notePublic
        : undefined,
    }));

  // Process sales (movements), limit to the first 5 based on the most recent dateOfOrder
  const recentMovements = clients
    .flatMap((client) =>
      client.movements.map((movement) => ({
        ...movement,
        client,
        timestamp: new Date(movement.dateOfOrder).getTime(),
      }))
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .map<ActivityItem>((movement) => {
      const revenue = calculateRevenue([movement]);
      return {
        id: movement.id,
        type: "sales",
        title: "Sale",
        time: movement.timestamp,
        details: `Client: ${movement.client.id}, ${movement.client.name} - Revenue: ${currencyFormatter(
          revenue
        )}`,
        subDetails: `Order Date: ${new Date(
          movement.dateOfOrder
        ).toLocaleDateString()}`,
      };
    });

 // Merge the two sorted arrays (agentVisits and recentMovements) and limit to 10 items
 const mergedActivities: ActivityItem[] = [];
 let i = 0;
 let j = 0;

 while (
   mergedActivities.length < 10 &&
   (i < agentVisits.length || j < recentMovements.length)
 ) {
   if (
     i < agentVisits.length &&
     (j >= recentMovements.length ||
       agentVisits[i].time >= recentMovements[j].time)
   ) {
     mergedActivities.push(agentVisits[i]);
     i++;
   } else if (j < recentMovements.length) {
     mergedActivities.push(recentMovements[j]);
     j++;
   }
 }

 return mergedActivities;
};
