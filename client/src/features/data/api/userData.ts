// src/api/userDataApi.ts

import { Admin, Agent, Client } from "../../../models/entityModels";
import { mapDataToModels, mapDataToAgents } from "../../../services/dataLoader";
import { handleApiError, generateErrorResponse } from "../../../services/errorHandling";
import { loadAgentsDataWithCache, loadClientsDataWithCache, loadMovementsDataWithCache } from "../../../utils/apiUtils";
import { getAdminById } from "./admins";
import { getAgentByClientEntityCode, getAgentById } from "./agents";
import { getClientByCodice, getClientsByAgent } from "./clients";
import { getFilteredMovements } from "./movements";



// Define interfaces for the returned data
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
  entityCode: string,
): Promise<AdminData> => {
  try {
    const [data, clientDetails, agentDetails, adminDetails] = await Promise.all([
      loadMovementsDataWithCache(),
      loadClientsDataWithCache(),
      loadAgentsDataWithCache(),
      getAdminById(entityCode),
    ]);

    // Map clients and agents using the fetched data
    const { clients } = await mapDataToModels(data, clientDetails);

    const { agents } = await mapDataToAgents(
      clients,
      agentDetails /* visits, promos */
    );

    // Construct the admin details with additional data
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
  entityCode: string,
): Promise<ClientData> => {
  try {
    const [data, clientDetails, agentDetails] = await Promise.all([
      getFilteredMovements(),
      getClientByCodice(entityCode),
      getAgentByClientEntityCode(), // Fetch the agent associated with the client
    ]);

    // Updated to use the new return structure from mapDataToModels
    const { clients } = await mapDataToModels(data, [clientDetails]);

    if (clients.length === 0) {
      throw new Error("Client not found");
    }

    // Construct the clientData object without embedding alerts
    const clientData: Client = {
      ...clients[0], // Spread the original client data
      agentData: [agentDetails], // Add the agent data directly to clientData
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
  entityCode: string,
): Promise<AgentData> => {
  try {
    const [data, clientDetails, agentDetails] = await Promise.all([
      getFilteredMovements(),
      getClientsByAgent(),
      getAgentById(entityCode),
    ]);

    // Extract clients from mapDataToModels
    const { clients } = await mapDataToModels(data, clientDetails);

    // Extract agents, visits, and promos from mapDataToAgents
    const { agents } = await mapDataToAgents(clients, [agentDetails]);

    if (agents.length === 0) {
      throw new Error("Agent not found");
    }

    // Construct the agentData object without embedding alerts
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
