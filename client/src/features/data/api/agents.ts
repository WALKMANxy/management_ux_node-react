// src/services/api/agents.ts

import { Agent } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";

/**
 * Fetch an agent by ID.
 * @param id - The ID of the agent to fetch.
 * @returns Promise resolving to an Agent object.
 */
export const getAgentById = async (id: string): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "GET");
};

/**
 * Fetch an agent by client entity code.
 * @returns Promise resolving to an Agent object.
 */
export const getAgentByClientEntityCode = async (): Promise<Agent> => {
  return apiCall<Agent>(`agents/by-client-entity-code`, "GET");
};

/**
 * Create a new agent.
 * @param agentData - The data of the agent to create.
 * @returns Promise resolving to the created Agent object.
 */
export const createAgent = async (
  agentData: Agent
): Promise<Agent> => {
  return apiCall<Agent>("agents", "POST", agentData);
};

/**
 * Update an existing agent by ID.
 * @param id - The ID of the agent to update.
 * @param updatedData - The partial data to update the agent.
 * @returns Promise resolving to the updated Agent object.
 */
export const updateAgent = async (
  id: string,
  updatedData: Partial<Agent>
): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "PATCH", updatedData);
};

/**
 * Replace an entire agent by ID.
 * @param id - The ID of the agent to replace.
 * @param agentData - The complete data for the agent.
 * @returns Promise resolving to the replaced Agent object.
 */
export const replaceAgent = async (
  id: string,
  agentData:Agent
): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "PUT", agentData);
};

/**
 * Delete an agent by ID.
 * @param id - The ID of the agent to delete.
 * @returns Promise resolving to a success message.
 */
export const deleteAgent = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`agents/${id}`, "DELETE");
};
