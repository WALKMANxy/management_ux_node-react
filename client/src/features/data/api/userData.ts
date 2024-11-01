// src/features/data/api/userData.ts

import { Admin, Agent, Client } from "../../../models/entityModels";
import { mapDataToAgents, mapDataToModels } from "../../../services/dataLoader";
import {
  generateErrorResponse,
  handleApiError,
} from "../../../services/errorHandling";
import {
  loadAgentsDataWithCache,
  loadClientsDataWithCache,
  loadMovementsDataWithCache,
} from "../../../utils/apiUtils";
import { getAdminById } from "./admins";
import { getAgentByClientEntityCode, getAgentById } from "./agents";
import { getClientByCodice, getClientsByAgent } from "./clients";
import { getFilteredMovements } from "./movements";

interface AdminData {
  adminData: Admin;
}

interface ClientData {
  clientData: Client;
}

interface AgentData {
  agentData: Agent;
}

// API Function to get Admin Data
export const getUserAdminDataApi = async (
  entityCode: string
): Promise<AdminData> => {
  try {
    const [data, clientDetails, agentDetails, adminDetails] = await Promise.all(
      [
        loadMovementsDataWithCache(),
        loadClientsDataWithCache(),
        loadAgentsDataWithCache(),
        getAdminById(entityCode),
      ]
    );

    const { clients } = await mapDataToModels(data, clientDetails);

    const { agents } = await mapDataToAgents(clients, agentDetails);

    const adminDetailsWithData: Admin = {
      ...adminDetails,
      agents,
      clients,
    };

    return {
      adminData: adminDetailsWithData,
    };
  } catch (error) {
    handleApiError(error, "getUserAdminData");
    throw generateErrorResponse(error);
  }
};

// API Function to get Client Data
export const getUserClientDataApi = async (
  entityCode: string
): Promise<ClientData> => {
  try {
    const [data, clientDetails, agentDetails] = await Promise.all([
      getFilteredMovements(),
      getClientByCodice(entityCode),
      getAgentByClientEntityCode(),
    ]);

    const { clients } = await mapDataToModels(data, [clientDetails]);

    if (clients.length === 0) {
      throw new Error("Client not found");
    }

    const clientData: Client = {
      ...clients[0],
      agentData: [agentDetails],
    };

    return {
      clientData,
    };
  } catch (error) {
    handleApiError(error, "getUserClientData");
    throw generateErrorResponse(error);
  }
};

// API Function to get Agent Data
export const getUserAgentDataApi = async (
  entityCode: string
): Promise<AgentData> => {
  try {
    const [data, clientDetails, agentDetails] = await Promise.all([
      getFilteredMovements(),
      getClientsByAgent(),
      getAgentById(entityCode),
    ]);

    const { clients } = await mapDataToModels(data, clientDetails);

    const { agents } = await mapDataToAgents(clients, [agentDetails]);

    if (agents.length === 0) {
      throw new Error("Agent not found");
    }

    const agentData: Agent = {
      ...agents[0],
      clients,
    };

    return {
      agentData,
    };
  } catch (error) {
    handleApiError(error, "getUserAgentData");
    throw generateErrorResponse(error);
  }
};
