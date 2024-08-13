// api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Admin, Agent, Client } from "../../models/entityModels";
import { mapDataToAgents, mapDataToModels } from "../../utils/dataLoader";
import {
  generateErrorResponse,
  handleApiError,
} from "../../utils/errorHandling";
import { getAgentById } from "./agents";
import { getAlertsByEntityRoleAndEntityCode } from "./alerts";
import {
  loadAgentDetailsData,
  loadAlertsData,
  loadClientDetailsData,
  loadJsonData,
  loadPromosData,
  loadVisitsData,
} from "./apiUtils";
import { getAdminById } from "./admins";

export const superApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Client", "Agent", "Admin"],
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadClientDetailsData(),
              loadAgentDetailsData(),
              loadVisitsData(),
              loadPromosData(),
              loadAlertsData(),
            ]);
          const clients = await mapDataToModels(
            data,
            clientDetails,
            agentDetails,
            visits,
            promos,
            alerts
          );

          return { data: clients };
        } catch (error) {
          handleApiError(error, "getClients");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Client" as const, id })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }],
    }),
    getClientById: builder.query<Client, string>({
      queryFn: async (clientId) => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadClientDetailsData(),
              loadAgentDetailsData(),
              loadVisitsData(),
              loadPromosData(),
              loadAlertsData(),
            ]);
          const clients = await mapDataToModels(
            data,
            clientDetails,
            agentDetails,
            visits,
            promos,
            alerts
          );
          const client = clients.find((client) => client.id === clientId);
          if (!client) {
            throw new Error("Client not found");
          }
          return { data: client };
        } catch (error) {
          handleApiError(error, "getClientById");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),
    getAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const [data, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadAgentDetailsData(),
              loadVisitsData(),
              loadPromosData(),
              loadAlertsData(),
            ]);
          const agents = await mapDataToAgents(
            data,
            agentDetails,
            visits,
            promos,
            alerts
          );
          return { data: agents };
        } catch (error) {
          handleApiError(error, "getAgents");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Agent" as const, id })),
              { type: "Agent", id: "LIST" },
            ]
          : [{ type: "Agent", id: "LIST" }],
    }),
    getAgentDetails: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const agentDetails = await loadAgentDetailsData();
          return { data: agentDetails };
        } catch (error) {
          handleApiError(error, "getAgentDetails");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Agent" as const, id })),
              { type: "Agent", id: "LIST" },
            ]
          : [{ type: "Agent", id: "LIST" }],
    }),
    getAgentDetailsById: builder.query<Agent, string>({
      queryFn: async (entityCode) => {
        try {
          const entityRole = "agent"; // Set the role to 'agent' for this query
          const [data, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              getAgentById(entityCode),
              loadVisitsData(),
              loadPromosData(),
              loadAlertsData(),
              getAlertsByEntityRoleAndEntityCode({ entityRole, entityCode }),
            ]);
          const agents = await mapDataToAgents(
            data,
            [agentDetails],
            visits,
            promos,
            alerts
          );
          const agent = agents.find((agent) => agent.id === entityCode);
          if (!agent) {
            throw new Error("Agent not found");
          }
          return { data: agent };
        } catch (error) {
          handleApiError(error, "getAgentById");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, error, id) => [{ type: "Agent", id }],
    }),
    getAdminById: builder.query<Admin, string>({
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
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAgentDetailsByIdQuery,
  useGetAdminByIdQuery,
} = superApi;
