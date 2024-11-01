// src/features/data/api/clients.ts

import { serverClient } from "../../../models/dataSetTypes";
import { apiCall } from "../../../utils/apiUtils";


export const getClientByCodice = async (
  codice: string
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/codice/${codice}`, "GET");
};


export const getClientsByAgent = async (): Promise<serverClient[]> => {
  try {
    const response = await apiCall<serverClient[]>(`clients/by-agent`, "GET");
    return response;
  } catch (error) {
    console.error("getClientsByAgent: API call failed", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};


export const createClient = async (
  clientData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>("clients", "POST", clientData);
};


export const updateClient = async (
  codice: string,
  updatedData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/${codice}`, "PATCH", updatedData);
};


export const replaceClient = async (
  codice: string,
  clientData: serverClient
): Promise<serverClient> => {
  return apiCall<serverClient>(`clients/${codice}`, "PUT", clientData);
};


export const deleteClient = async (codice: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`clients/${codice}`, "DELETE");
};
