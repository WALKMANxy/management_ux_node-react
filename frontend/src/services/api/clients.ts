import { Client } from "../../models/entityModels";
import { apiCall } from "./apiUtils";

export const getClientByCodice = async (codice: string): Promise<Client> => {
  return apiCall<Client>(`clients/codice/${codice}`, "GET");
};
