// api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Alert,
  GlobalPromos,
  GlobalVisits,
  Promo,
  Visit,
} from "../models/dataModels";
import { Admin, Agent, Client } from "../models/entityModels";
import {
  mapDataToAgents,
  mapDataToModels,
  mapVisitsPromosToAdmin,
} from "../utils/dataLoader";
import { generateErrorResponse, handleApiError } from "../utils/errorHandling";
import { getAdminById } from "./api/admins";
import { getAgentById } from "./api/agents";
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
  reducerPath: "dataApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getUserAdminData: builder.query<
      {
        adminData: Admin;
        globalVisits: GlobalVisits;
        globalPromos: GlobalPromos;
        alerts: Alert[];
      },
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
          const { clients } = await mapDataToModels(
            data,
            clientDetails,
            visits,
            promos
          );

          const {
            agents,
            visits: aggregatedVisits,
            promos: aggregatedPromos,
          } = await mapDataToAgents(clients, agentDetails, visits, promos);

          // Use mapVisitsPromosToAdmin to aggregate visits and promos for admin
          const { globalVisits, globalPromos } = mapVisitsPromosToAdmin(
            agents,
            aggregatedVisits,
            aggregatedPromos
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
              globalVisits,
              globalPromos,
              alerts, // Directly returning alerts as they're already filtered
            },
          };
        } catch (error) {
          handleApiError(error, "getUserAdminData");
          return generateErrorResponse(error);
        }
      },
    }),

    getUserClientData: builder.query<
      { clientData: Client; visits: Visit[]; promos: Promo[]; alerts: Alert[] },
      { entityCode: string; userId: string }
    >({
      queryFn: async ({ entityCode, userId }) => {
        try {
          const [
            data,
            clientDetails,
            visits,
            promos,
            roleBasedAlerts,
            issuerAlerts,
          ] = await Promise.all([
            getFilteredMovements(),
            getClientByCodice(entityCode),
            loadVisitsData(),
            loadPromosData(),
            getAlertsByEntityRoleAndEntityCode({
              entityRole: "client",
              entityCode,
            }),
            getAlertsByIssuer(userId),
          ]);

          const alerts = [...roleBasedAlerts, ...issuerAlerts];

          // Updated to use the new return structure from mapDataToModels
          const {
            clients,
            visits: filteredVisits,
            promos: filteredPromos,
          } = await mapDataToModels(data, [clientDetails], visits, promos);

          if (clients.length === 0) {
            throw new Error("Client not found");
          }

          // Construct the clientData object without embedding alerts
          const clientData: Client = clients[0];

          // Return clientData along with visits, promos, and alerts separately
          return {
            data: {
              clientData,
              visits: filteredVisits,
              promos: filteredPromos,
              alerts, // Directly returning alerts as they're already filtered
            },
          };
        } catch (error) {
          handleApiError(error, "getUserClientData");
          return generateErrorResponse(error);
        }
      },
    }),

    getUserAgentData: builder.query<
      { agentData: Agent; visits: Visit[]; promos: Promo[]; alerts: Alert[] },
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

          // Extract clients from mapDataToModels
          const { clients } = await mapDataToModels(
            data,
            clientDetails,
            visits,
            promos
          );

          // Extract agents, visits, and promos from mapDataToAgents
          const {
            agents,
            visits: aggregatedVisits,
            promos: aggregatedPromos,
          } = await mapDataToAgents(clients, [agentDetails], visits, promos);

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
              visits: aggregatedVisits,
              promos: aggregatedPromos,
              alerts, // Directly returning alerts as they're already filtered
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
