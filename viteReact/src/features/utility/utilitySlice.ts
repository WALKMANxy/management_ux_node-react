import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Alert, Promo, Visit, GlobalVisits, GlobalPromos } from "../../models/dataModels";
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

    const findAgentForClient = (clientId: string): Agent | undefined => {
      return Object.values(agents).find(agent =>
        agent.clients.some(client => client.id === clientId)
      );
    };

    const processVisit = (visit: Visit): VisitWithAgent => {
      const agent = findAgentForClient(visit.clientId);
      return {
        ...visit,
        agentId: agent?.id || 'unknown',
        agentName: agent?.name || 'Unknown Agent',
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

export const selectPromos = createSelector(
  [
    (state: RootState) => state.data.currentUserPromos,
    (state: RootState) => state.data.agents,
  ],
  (currentUserPromos): Promo[] => {
    if (!currentUserPromos) return [];

    if (Array.isArray(currentUserPromos)) {
      // Client or Agent case
      return currentUserPromos;
    } else {
      // Admin case
      const globalPromos = currentUserPromos as GlobalPromos;
      return Object.values(globalPromos).flatMap(({ Promos }) => Promos);
    }
  }
);

export const selectAlerts = createSelector(
  [(state: RootState) => state.data.currentUserAlerts],
  (currentUserAlerts): Alert[] => {
    return currentUserAlerts || [];
  }
);