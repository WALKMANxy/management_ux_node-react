// services/api.ts

import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  Agent,
  Client,
  MovementDetail,
  Admin,
  Promo,
  Visit,
  Alert,
  User,
} from "../models/models";
import {
  fetchData,
  loadAgentDetailsData,
  loadClientDetailsData,
  loadAdminDetailsData,
  loadJsonData,
  mapDataToAgents,
  mapDataToModels,
  mapDataToMovementDetails,
} from "../utils/dataLoader";
import { handleApiError, generateErrorResponse } from "../utils/errorHandling"; // Import error handling functions
const baseUrl = process.env.REACT_APP_API_BASE_URL || "/";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadClientDetailsData(),
              loadAgentDetailsData(),
              fetchData("visits"),
              fetchData("promos"),
              fetchData("alerts"),
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
      keepUnusedDataFor: 60 * 20,
    }),
    getClientById: builder.query<Client, string>({
      queryFn: async (clientId) => {
        try {
          const [data, clientDetails, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadClientDetailsData(),
              loadAgentDetailsData(),
              fetchData("visits"),
              fetchData("promos"),
              fetchData("alerts"),
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
      keepUnusedDataFor: 60 * 20,
    }),
    getAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const [data, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadAgentDetailsData(),
              fetchData("visits"),
              fetchData("promos"),
              fetchData("alerts"),
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
      keepUnusedDataFor: 60 * 20,
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
      keepUnusedDataFor: 60 * 20,
    }),
    getAgentById: builder.query<Agent, string>({
      queryFn: async (agentId) => {
        try {
          const [data, agentDetails, visits, promos, alerts] =
            await Promise.all([
              loadJsonData(),
              loadAgentDetailsData(),
              fetchData("visits"),
              fetchData("promos"),
              fetchData("alerts"),
            ]);
          const agents = await mapDataToAgents(
            data,
            agentDetails,
            visits,
            promos,
            alerts
          );
          const agent = agents.find((agent) => agent.id === agentId);
          if (!agent) {
            throw new Error("Agent not found");
          }
          return { data: agent };
        } catch (error) {
          handleApiError(error, "getAgentById");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getAdminData: builder.query<{ agents: Agent[]; clients: Client[] }, void>({
      queryFn: async () => {
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
            loadAdminDetailsData(), // Load admin details
            fetchData("visits"),
            fetchData("promos"),
            fetchData("alerts"),
          ]);
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
          return { data: { agents, clients, adminDetails } };
        } catch (error) {
          handleApiError(error, "getAdminData");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getAdminById: builder.query<Admin, string>({
      queryFn: async (adminId) => {
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
            loadAdminDetailsData(), // Load admin details
            fetchData("visits"),
            fetchData("promos"),
            fetchData("alerts"),
          ]);
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
          const admin = adminDetails.find((admin) => admin.id === adminId);
          if (!admin) {
            throw new Error("Admin not found");
          }
          return {
            data: {
              ...admin,
              agents,
              clients,
              GlobalVisits: {},
              GlobalPromos: {},
              adminAlerts: [],
            },
          };
        } catch (error) {
          handleApiError(error, "getAdminById");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getMovementDetails: builder.query<MovementDetail[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData();
          const movementDetails = mapDataToMovementDetails(data);
          return { data: movementDetails };
        } catch (error) {
          handleApiError(error, "getMovementDetails");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getVisits: builder.query<Visit[], void>({
      queryFn: async () => {
        try {
          const visits = await fetchData("visits");
          return { data: visits };
        } catch (error) {
          handleApiError(error, "getVisits");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),

    getPromos: builder.query<Promo[], void>({
      queryFn: async () => {
        try {
          const promos = await fetchData("promos");
          return { data: promos };
        } catch (error) {
          handleApiError(error, "getPromos");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),

    getAlerts: builder.query<Alert[], void>({
      queryFn: async () => {
        try {
          const alerts = await fetchData("alerts");
          return { data: alerts };
        } catch (error) {
          handleApiError(error, "getAlerts");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),

    registerUser: builder.mutation<void, { email: string; password: string }>({
      queryFn: async (credentials, queryApi, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: "auth/register",
          method: "POST",
          body: credentials,
        });

        if (result.error) {
          handleApiError(result.error, "registerUser");
          return {
            error: result.error as FetchBaseQueryError, // Properly type the error
          };
        }

        return { data: undefined };
      },
    }),

    loginUser: builder.mutation<
      { redirectUrl: string },
      { email: string; password: string }
    >({
      queryFn: async (credentials, queryApi, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: "auth/login",
          method: "POST",
          body: credentials,
        });

        if (result.error) {
          handleApiError(result.error, "loginUser");
          return {
            error: result.error as FetchBaseQueryError, // Properly type the error
          };
        }

        return { data: result.data as { redirectUrl: string } };
      },
    }),

    getUserRoleById: builder.query<User, string>({
      queryFn: async (id, queryApi, extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: `users/${id}`,
          method: "GET",
        });

        if (result.error) {
          handleApiError(result.error, "getUserRoleById");
          return {
            error: result.error as FetchBaseQueryError, // Properly type the error
          };
        }

        return { data: result.data as User };
      },
    }),
  }),
});

export const {
  useGetUserRoleByIdQuery,
  useLoginUserMutation,
  useRegisterUserMutation,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAgentByIdQuery, // New hook for fetching agent by ID
  useGetAdminDataQuery,
  useGetAdminByIdQuery, // New hook for fetching admin by ID
  useGetMovementDetailsQuery,
} = api;
