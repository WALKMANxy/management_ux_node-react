import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Promo, Visit } from "../../models/dataModels";
import { Admin } from "../../models/entityModels";

// Extend the Visit type to include agent information for admins
export type VisitWithAgent = Visit & { agentId?: string; agentName?: string };

export const selectVisits = createSelector(
  [(state: RootState) => state.data.currentUserData],
  (currentUserData): VisitWithAgent[] => {
    if (!currentUserData) return [];

    if ("visits" in currentUserData) {
      // Client case
      return currentUserData.visits;
    } else if ("AgentVisits" in currentUserData) {
      // Agent case
      return currentUserData.AgentVisits;
    } else if ("GlobalVisits" in currentUserData) {
      // Admin case
      const adminData = currentUserData as Admin;

      return Object.entries(adminData.GlobalVisits).flatMap(
        ([agentId, { Visits }]) =>
          Visits.map((visit) => ({
            ...visit,
            agentId,
            agentName:
              adminData.agents.find((agent) => agent.id === agentId)?.name ??
              "Unknown Agent",
          }))
      );
    }

    return [];
  }
);

export const selectPromos = createSelector(
  [(state: RootState) => state.data.currentUserData],
  (currentUserData): Promo[] => {
    if (!currentUserData) return [];

    if ("promos" in currentUserData) {
      // Client case
      return currentUserData.promos;
    } else if ("AgentPromos" in currentUserData) {
      // Agent case
      return currentUserData.AgentPromos;
    } else if ("GlobalPromos" in currentUserData) {
      // Admin case
      const adminData = currentUserData as Admin;

      return Object.entries(adminData.GlobalPromos).flatMap(
        ([, { Promos }]) => Promos
      );
    }

    return [];
  }
);
