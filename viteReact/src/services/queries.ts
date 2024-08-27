// api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Admin, Agent, Client } from "../models/entityModels";
import { mapDataToAgents, mapDataToModels } from "../utils/dataLoader";
import { generateErrorResponse, handleApiError } from "../utils/errorHandling";
import { getAdminById } from "./api/admins";
import { getAgentByClientEntityCode, getAgentById } from "./api/agents";
import {
  getAlertsByEntityRoleAndEntityCode,
  getAlertsByIssuer,
} from "./api/alerts";
import {
  loadAgentDetailsData,
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
    getUserAdminData: builder.query<
      Admin,
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode, userId }) => {
        const entityRole = "admin"; // Set the role to 'admin' for this query

        try {
          const [
            data,
            clientDetails,
            agentDetails,
            adminDetails,
            visits,
            promos,
            roleBasedAlerts,
            issuerAlerts,
          ] = await Promise.all([
            loadJsonData(),
            loadClientDetailsData(),
            loadAgentDetailsData(),
            getAdminById(entityCode),
            loadVisitsData(),
            loadPromosData(),
            getAlertsByEntityRoleAndEntityCode({ entityRole, entityCode }),
            getAlertsByIssuer(userId),
          ]);

          const alerts = [...roleBasedAlerts, ...issuerAlerts];

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
            adminAlerts: alerts,
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
          handleApiError(error, "getUserAdminData");
          return generateErrorResponse(error);
        }
      },
    }),
    getUserClientData: builder.query<
      Client,
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode, userId }) => {
        try {
          const [
            data,
            clientDetails,
            agentDetails,
            visits,
            promos,
            roleBasedAlerts,
            issuerAlerts,
          ] = await Promise.all([
            getFilteredMovements(),
            getClientByCodice(entityCode),
            getAgentByClientEntityCode(),
            loadVisitsData(),
            loadPromosData(),
            getAlertsByEntityRoleAndEntityCode({
              entityRole: "client",
              entityCode,
            }),
            getAlertsByIssuer(userId),
          ]);

          const alerts = [...roleBasedAlerts, ...issuerAlerts];

          const clients = await mapDataToModels(
            data,
            [clientDetails],
            [agentDetails],
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
    }),

    getUserAgentData: builder.query<
      Agent,
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode, userId }) => {
        try {
          const [
            data,
            clientDetails,
            agentDetails,
            visits,
            promos,
            roleBasedAlerts,
            issuerAlerts,
          ] = await Promise.all([
            getFilteredMovements(),
            getClientsByAgent(),
            getAgentById(entityCode),
            loadVisitsData(),
            loadPromosData(),
            getAlertsByEntityRoleAndEntityCode({
              entityRole: "agent",
              entityCode,
            }),
            getAlertsByIssuer(userId),
          ]);

          const alerts = [...roleBasedAlerts, ...issuerAlerts];

          const clients = await mapDataToModels(
            data,
            clientDetails,
            [agentDetails],
            visits,
            promos,
            []
          );

          const agents = await mapDataToAgents(
            data,
            [agentDetails],
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
    }),
  }),
});

export const {
  useGetUserAgentDataQuery,
  useGetUserClientDataQuery,
  useGetUserAdminDataQuery,
} = dataApi;
