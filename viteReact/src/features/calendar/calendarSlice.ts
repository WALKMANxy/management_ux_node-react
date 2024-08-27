import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Visit } from "../../models/dataModels";
import { Client, Agent, Admin } from "../../models/entityModels";

// Extend the Visit type to include agent information
type VisitWithAgent = Visit & { agentId?: string; agentName?: string };

export const selectVisits = createSelector(
  [(state: RootState) => state.data.currentUserData],
  (currentUserData): VisitWithAgent[] => {
    if (!currentUserData) return [];

    if ((currentUserData as Client).visits) {
      // Client case
      return (currentUserData as Client).visits;
    } else if ((currentUserData as Agent).AgentVisits) {
      // Agent case
      return (currentUserData as Agent).AgentVisits;
    } else if ((currentUserData as Admin).GlobalVisits) {
      // Admin case
      const adminData = currentUserData as Admin;

      // Map over each agent's visits and include the agent's ID and name with each visit
      return Object.entries(adminData.GlobalVisits).flatMap(
        ([agentId, { Visits }]) =>
          Visits.map((visit) => ({
            ...visit,
            agentId,
            agentName: adminData.agents.find((agent) => agent.id === agentId)
              ?.name || "Unknown Agent", // Add agent name based on agentId
          }))
      );
    }

    return [];
  }
);
