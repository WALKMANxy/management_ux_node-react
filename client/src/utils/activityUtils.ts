// src/utils/activityUtils.ts
import { VisitWithAgent } from "../features/promoVisits/promoVisitsSelectors";
import { Client } from "../models/entityModels";
import { calculateRevenue, currencyFormatter } from "./dataUtils";
import { t } from "i18next";

export interface ActivityItem {
  id: string;
  type: "visits" | "sales" | "alerts";
  title: string;
  time: number; 
  details: string;
  subDetails?: string;
}

export const generateActivityList = (
  clients: Client[],
  agentId: string,
  visits: VisitWithAgent[]
): ActivityItem[] => {

  // Process completed visits for the agent, limit to the first 5
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
      title: t("activityOverview.title", { type: "Visit", agent: visit.agentName || visit.agentId }),
      time: visit.timestamp,
      details: t("activityOverview.details", { reason: visit.visitReason, clientId: visit.clientId }),
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
        title: t("activityOverview.saleTitle"),
        time: movement.timestamp,
        details: t("activityOverview.saleDetails", {
          clientId: movement.client.id,
          clientName: movement.client.name,
          revenue: currencyFormatter(revenue),
        }),
        subDetails: t("activityOverview.orderDate", {
          orderDate: new Date(movement.dateOfOrder).toLocaleDateString(),
        }),
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
