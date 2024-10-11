// src/services/api/clients.ts

import { serverClient } from "../../../models/dataSetTypes";
import { apiCall } from "../../../utils/apiUtils";

/**
 * Fetch a client by CODICE.
 * @param codice - The CODICE of the client to fetch.
 * @returns Promise resolving to a serverClient object.
 */
export const getClientByCodice = async (
  codice: string
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/codice/${codice}`, "GET");
};

/**
 * Fetch clients associated with an agent.
 * @returns Promise resolving to an array of serverClient objects.
 */
export const getClientsByAgent = async (): Promise<serverClient[]> => {
  try {
    const response = await apiCall<serverClient[]>(`clients/by-agent`, "GET");
    return response;
  } catch (error) {
    console.error("getClientsByAgent: API call failed", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

/**
 * Create a new client.
 * @param clientData - The data of the client to create.
 * @returns Promise resolving to the created serverClient object.
 */
export const createClient = async (
  clientData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>("clients", "POST", clientData);
};

/**
 * Update an existing client by CODICE.
 * @param codice - The CODICE of the client to update.
 * @param updatedData - The partial data to update the client.
 * @returns Promise resolving to the updated serverClient object.
 */
export const updateClient = async (
  codice: string,
  updatedData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/${codice}`, "PATCH", updatedData);
};

/**
 * Replace an entire client by CODICE.
 * @param codice - The CODICE of the client to replace.
 * @param clientData - The complete data for the client.
 * @returns Promise resolving to the replaced serverClient object.
 */
export const replaceClient = async (
  codice: string,
  clientData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/${codice}`, "PUT", clientData);
};

/**
 * Delete a client by CODICE.
 * @param codice - The CODICE of the client to delete.
 * @returns Promise resolving to a success message.
 */
export const deleteClient = async (codice: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`clients/${codice}`, "DELETE");
};
