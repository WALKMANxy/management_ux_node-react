import { serverClient } from "../../models/dataSetTypes";
import { apiCall } from "./apiUtils";

export const getClientByCodice = async (
  codice: string
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/codice/${codice}`, "GET");
};

// New function to get clients associated with an agent
export const getClientsByAgent = async (): Promise<serverClient[]> => {
  return apiCall<serverClient[]>(`clients/by-agent`, "GET");
};
