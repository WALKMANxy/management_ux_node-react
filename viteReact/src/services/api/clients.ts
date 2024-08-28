import { Client } from "../../models/entityModels";
import { apiCall } from "./apiUtils";

export const getClientByCodice = async (codice: string): Promise<Client> => {
  return apiCall<Client>(`clients/codice/${codice}`, "GET");
};

// New function to get clients associated with an agent
export const getClientsByAgent = async (): Promise<Client[]> => {
  return apiCall<Client[]>(`clients/by-agent`, "GET");
};
