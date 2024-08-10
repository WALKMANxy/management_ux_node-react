import { Agent } from "../../models/entityModels";
import { apiCall } from "./apiUtils";

export const getAgentById = async (id: string): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "GET");
};
