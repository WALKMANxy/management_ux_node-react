// api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Admin, Agent, Client } from "../models/entityModels";
import { mapDataToAgents, mapDataToModels } from "../utils/dataLoader";
import { generateErrorResponse, handleApiError } from "../utils/errorHandling";
import { getAdminById } from "./api/admins";
import { getAgentByClientEntityCode, getAgentById } from "./api/agents";
import { getAlertsByEntityRoleAndEntityCode } from "./api/alerts";
import {
  loadAgentDetailsData,
  loadAlertsData,
  loadClientDetailsData,
  loadJsonData,
  loadPromosData,
  loadVisitsData,
} from "./api/apiUtils";
import { getClientByCodice, getClientsByAgent } from "./api/clients";
import { getFilteredMovements } from "./api/movements";

export const dataApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Client", "Agent", "Admin"],
  endpoints: (builder) => ({
    getUserAdminData: builder.query<Admin, string>({
      queryFn: async (entityCode) => {
        const entityRole = "admin"; // Set the role to 'admin' for this query

        try {
          const [
            data,
            clientDetails,
            agentDetails,
            adminDetails,
            visits,
            promos,
            alerts,
          ] = await Promise.all([
            loadJsonData(),
            loadClientDetailsData(),
            loadAgentDetailsData(),
            getAdminById(entityCode), // Fetch the specific admin details by entityCode
            loadVisitsData(),
            loadPromosData(),
            loadAlertsData(),
            getAlertsByEntityRoleAndEntityCode({ entityRole, entityCode }), // Fetch alerts for the admin
          ]);

          // Map clients and agents using the fetched data
          const clients = await mapDataToModels(
            data,
            clientDetails,
            agentDetails,
            visits,
            promos,
            alerts
          );
          const agents = await mapDataToAgents(
            data,
            agentDetails,
            visits,
            promos,
            alerts
          );

          // Construct the admin details with additional data
          const adminDetailsWithData: Admin = {
            ...adminDetails,
            agents,
            clients,
            GlobalVisits: {},
            GlobalPromos: {},
            adminAlerts: alerts.filter(
              (alert) =>
                alert.entityRole === "admin" && alert.entityCode === entityCode
            ), // Filter alerts specific to the admin
          };

          // Populate GlobalVisits and GlobalPromos for the admin
          agents.forEach((agent) => {
            adminDetailsWithData.GlobalVisits[agent.id] = {
              Visits: agent.AgentVisits || [],
            };
            adminDetailsWithData.GlobalPromos[agent.id] = {
              Promos: agent.AgentPromos || [],
            };
          });

          return { data: adminDetailsWithData };
        } catch (error) {
          handleApiError(error, "getAdminById");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, error, id) => [
        { type: "Admin", id },
        { type: "Client", id: "LIST" },
        { type: "Agent", id: "LIST" },
      ],
    }),
    getUserClientData: builder.query<Client, string>({
      queryFn: async (entityCode) => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              getFilteredMovements(),
              getClientByCodice(entityCode),
              getAgentByClientEntityCode(),
              loadVisitsData(),
              loadPromosData(),
              getAlertsByEntityRoleAndEntityCode({
                entityRole: "client",
                entityCode,
              }),
            ]);

          const clients = await mapDataToModels(
            data,
            [clientDetails], // Wrap clientDetails in an array as it's a single client
            [agentDetails], // Wrap agentDetails in an array
            visits,
            promos,
            alerts
          );

          if (clients.length === 0) {
            throw new Error("Client not found");
          }

          const clientData: Client = {
            ...clients[0],
            clientAlerts: alerts,
          };

          return { data: clientData };
        } catch (error) {
          handleApiError(error, "getUserClientData");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),

    getUserAgentData: builder.query<Agent, string>({
      queryFn: async (entityCode) => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              getFilteredMovements(),
              getClientsByAgent(),
              getAgentById(entityCode),
              loadVisitsData(),
              loadPromosData(),
              getAlertsByEntityRoleAndEntityCode({
                entityRole: "agent",
                entityCode,
              }),
            ]);

          const clients = await mapDataToModels(
            data,
            clientDetails,
            [agentDetails], // Wrap agentDetails in an array
            visits,
            promos,
            [] // Empty alerts for clients
          );

          const agents = await mapDataToAgents(
            data,
            [agentDetails], // Wrap agentDetails in an array
            visits,
            promos,
            alerts
          );

          if (agents.length === 0) {
            throw new Error("Agent not found");
          }

          const agentData: Agent = {
            ...agents[0],
            clients,
            agentAlerts: alerts,
          };

          return { data: agentData };
        } catch (error) {
          handleApiError(error, "getUserAgentData");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Agent", id }],
    }),
  }),
});

export const {
  useGetUserAgentDataQuery,
  useGetUserClientDataQuery,
  useGetUserAdminDataQuery,
} = dataApi;
