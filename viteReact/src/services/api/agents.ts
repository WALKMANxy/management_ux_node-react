import { Agent } from "../../models/entityModels";
import { apiCall } from "./apiUtils";

export const getAgentById = async (id: string): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "GET");
};

// New function to get an agent by client entity code
export const getAgentByClientEntityCode = async (): Promise<Agent> => {
  return apiCall<Agent>(`agents/by-client`, "GET");
};
