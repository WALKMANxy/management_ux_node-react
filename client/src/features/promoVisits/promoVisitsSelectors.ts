//src/features/utility/utilitySlice.ts
import { createSelector } from "reselect";
import { RootState } from "../../app/store";
import { GlobalVisits, Promo, Visit } from "../../models/dataModels";
import { Agent } from "../../models/entityModels";

// Extend the Visit type to include agent information for admins
export type VisitWithAgent = Visit & { agentId?: string; agentName?: string };

export const selectVisits = createSelector(
  [
    (state: RootState) => state.data.currentUserVisits,
    (state: RootState) => state.data.agents,
    (state: RootState) => state.data.currentUserDetails,
  ],
  (currentUserVisits, agents, currentUserDetails): VisitWithAgent[] => {
    if (!currentUserVisits || !currentUserDetails) return [];

    // Precompute a mapping from clientId to agent
    const clientToAgentMap: Record<string, Agent> = {};
    Object.values(agents).forEach((agent) => {
      agent.clients.forEach((client) => {
        clientToAgentMap[client.id] = agent;
      });
    });

    const processVisit = (visit: Visit): VisitWithAgent => {
      const agent = clientToAgentMap[visit.clientId];
      return {
        ...visit,
        agentId: agent?.id || "unknown",
        agentName: agent?.name || "Unknown Agent",
      };
    };

    if (Array.isArray(currentUserVisits)) {
      // Client or Agent case
      return currentUserVisits.map(processVisit);
    } else {
      // Admin case
      const globalVisits = currentUserVisits as GlobalVisits;
      return Object.values(globalVisits).flatMap(({ Visits }) =>
        Visits.map(processVisit)
      );
    }
  }
);

// Selector to get a single visit by ID
export const selectVisitById = (visitId: string) =>
  createSelector([selectVisits], (visits) =>
    visits.find((visit) => visit._id === visitId)
  );

export const selectPromos = createSelector(
  [(state: RootState) => state.data.currentUserPromos],
  (currentUserPromos): Promo[] => {
    if (!currentUserPromos) return [];

    if (Array.isArray(currentUserPromos)) {
      // Client or Agent case
      return currentUserPromos;
    } else {
      return []; // Fallback
    }
  }
);
