import { serverClient } from "../../../models/dataSetTypes";
import { apiCall } from "../../../utils/apiUtils";

export const getClientByCodice = async (
  codice: string
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/codice/${codice}`, "GET");
};

// New function to get clients associated with an agent
export const getClientsByAgent = async (): Promise<serverClient[]> => {
  try {
    const response = await apiCall<serverClient[]>(`clients/by-agent`, "GET");
    return response;
  } catch (error) {
    console.error("getClientsByAgent: API call failed", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};