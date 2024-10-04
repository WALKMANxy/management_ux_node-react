//src/features/data/dataQueries.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
/* import {
   GlobalPromos,
  GlobalVisits,
   Promo,
  Visit,
} from "../../models/dataModels"; */
import { Admin, Agent, Client } from "../../models/entityModels";
import { mapDataToAgents, mapDataToModels } from "../../services/dataLoader";
import {
  generateErrorResponse,
  handleApiError,
} from "../../services/errorHandling";
import {
  loadAgentsDataWithCache,
  loadClientsDataWithCache,
  loadMovementsDataWithCache,
} from "../../utils/apiUtils";
import { getAdminById } from "./api/admins";
import { getAgentByClientEntityCode, getAgentById } from "./api/agents";
import { getClientByCodice, getClientsByAgent } from "./api/clients";
import { getFilteredMovements } from "./api/movements";

export const dataApi = createApi({
  reducerPath: "dataApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getUserAdminData: builder.query<
      {
        adminData: Admin;
      },
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode }) => {
        try {
          const [data, clientDetails, agentDetails, adminDetails] =
            await Promise.all([
              loadMovementsDataWithCache(),
              loadClientsDataWithCache(),
              loadAgentsDataWithCache(),
              getAdminById(entityCode),
            ]);

          // Map clients and agents using the fetched data
          const { clients } = await mapDataToModels(data, clientDetails);

          const { agents } = await mapDataToAgents(
            clients,
            agentDetails /*  visits, promos */
          );

          // Construct the admin details with additional data
          const adminDetailsWithData: Admin = {
            ...adminDetails,
            agents,
            clients,
          };

          // Return admin data along with visits, promos, and alerts separately
          return {
            data: {
              adminData: adminDetailsWithData,
            },
          };
        } catch (error) {
          handleApiError(error, "getUserAdminData");
          return generateErrorResponse(error);
        }
      },
    }),

    getUserClientData: builder.query<
      { clientData: Client },
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode }) => {
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

          // Return clientData along with visits, promos, and alerts separately
          return {
            data: {
              clientData,
            },
          };
        } catch (error) {
          handleApiError(error, "getUserClientData");
          return generateErrorResponse(error);
        }
      },
    }),

    getUserAgentData: builder.query<
      { agentData: Agent },
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode }) => {
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

          // Return agentData along with visits, promos, and alerts separately
          return {
            data: {
              agentData,
            },
          };
        } catch (error) {
          handleApiError(error, "getUserAgentData");
          return generateErrorResponse(error);
        }
      },
    }),
  }),
});

export const {
  useGetUserAgentDataQuery,
  useGetUserClientDataQuery,
  useGetUserAdminDataQuery,
} = dataApi;
