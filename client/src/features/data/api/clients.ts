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
    console.log("getClientsByAgent: Initiating API call to clients/by-agent");
    const response = await apiCall<serverClient[]>(`clients/by-agent`, "GET");
    console.log("getClientsByAgent: API call successful", response);
    return response;
  } catch (error) {
    console.error("getClientsByAgent: API call failed", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};