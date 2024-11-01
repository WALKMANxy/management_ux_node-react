// src/features/data/api/agents.ts

import { Agent } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";


export const getAgentById = async (id: string): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "GET");
};


export const getAgentByClientEntityCode = async (): Promise<Agent> => {
  return apiCall<Agent>(`agents/by-client-entity-code`, "GET");
};


export const createAgent = async (
  agentData: Agent
): Promise<Agent> => {
  return apiCall<Agent>("agents", "POST", agentData);
};


export const updateAgent = async (
  id: string,
  updatedData: Partial<Agent>
): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "PATCH", updatedData);
};


export const replaceAgent = async (
  id: string,
  agentData:Agent
): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "PUT", agentData);
};


export const deleteAgent = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`agents/${id}`, "DELETE");
};
