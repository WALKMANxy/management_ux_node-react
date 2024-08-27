// services/api.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Alert, MovementDetail, Promo, Visit } from "../models/dataModels";

import { Admin, Agent, Client, User } from "../models/entityModels";

import {
  mapDataToAgents,
  mapDataToModels,
  mapDataToMovementDetails,
} from "../utils/dataLoader";
import { generateErrorResponse, handleApiError } from "../utils/errorHandling"; // Import error handling functions
import { getAdminById } from "./api/admins";
import { getAgentById } from "./api/agents";
import {
  createAlert,
  getAlertsByEntityRoleAndEntityCode,
  updateAlertById,
} from "./api/alerts";
import {
  baseUrl,
  loadAdminDetailsData,
  loadAgentDetailsData,
  loadAlertsData,
  loadClientDetailsData,
  loadJsonData,
  loadPromosData,
  loadVisitsData,
} from "./api/apiUtils";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "./api/auth";
import { getClientByCodice } from "./api/clients";
import { createPromo, updatePromoById } from "./api/promos";
import { getAllUsers, getUserById, updateUserById } from "./api/users";
import { createVisit, updateVisitById } from "./api/visits";

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
      keepUnusedDataFor: 60 * 20,
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
      keepUnusedDataFor: 60 * 20,
    }),
    getAdminData: builder.query<Admin, string>({
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
            loadAdminDetailsData(), // Load admin details
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

          // Find the specific admin using the entityCode
          const admin = adminDetails.find((admin) => admin.id === entityCode);
          if (!admin) {
            throw new Error("Admin not found");
          }

          // Construct the admin details with additional data
          const adminDetailsWithData: Admin = {
            ...admin,
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
          handleApiError(error, "getAdminData");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
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
          const visits = await loadVisitsData(); // Use loadVisitsData instead of fetchData
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
          const promos = await loadPromosData(); // Use loadPromosData instead of fetchData
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
          const alerts = await loadAlertsData(); // Use loadAlertsData instead of fetchData
          return { data: alerts };
        } catch (error) {
          handleApiError(error, "getAlerts");
          return generateErrorResponse(error);
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),

    getClientByCodice: builder.query<Client, string>({
      queryFn: async (codice) => {
        try {
          const result = await getClientByCodice(codice);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const result = await getUserById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getAllUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          const result = await getAllUsers();
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updateUserById: builder.mutation<
      User,
      { id: string; updatedData: Partial<User> }
    >({
      queryFn: async ({ id, updatedData }) => {
        try {
          const result = await updateUserById(id, updatedData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    registerUser: builder.mutation<
      { message: string; statusCode: number },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          const { message, statusCode } = await registerUser(credentials);
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    loginUser: builder.mutation<
      { redirectUrl: string; id: string; message: string; statusCode: number },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          const { redirectUrl, id, message, statusCode } = await loginUser(
            credentials
          );
          return { data: { redirectUrl, id, message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    requestPasswordReset: builder.mutation<
      { message: string; statusCode: number },
      string
    >({
      queryFn: async (email) => {
        try {
          const { message, statusCode } = await requestPasswordReset(email);
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    resetPassword: builder.mutation<
      { message: string; statusCode: number },
      { token: string; passcode: string; newPassword: string }
    >({
      queryFn: async ({ token, passcode, newPassword }) => {
        try {
          const { message, statusCode } = await resetPassword(
            token,
            passcode,
            newPassword
          );
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getUserRoleById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const result = await getUserById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    createAlert: builder.mutation<
      Alert,
      {
        alertReason: string;
        message: string;
        severity: "low" | "medium" | "high";
        alertIssuedBy: string;
        entityRole: "admin" | "agent" | "client";
        entityCode: string;
      }
    >({
      queryFn: async (alertData) => {
        try {
          const result = await createAlert(alertData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updateAlertById: builder.mutation<
      Alert,
      { id: string; alertData: Partial<Alert> }
    >({
      queryFn: async ({ id, alertData }) => {
        try {
          const result = await updateAlertById(id, alertData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    createPromo: builder.mutation<
      Promo,
      {
        clientsId: string[];
        type: string;
        name: string;
        discount: string;
        startDate: string;
        endDate: string;
        promoIssuedBy: string;
      }
    >({
      queryFn: async (promoData) => {
        try {
          const result = await createPromo(promoData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updatePromoById: builder.mutation<
      Promo,
      { id: string; promoData: Partial<Promo> }
    >({
      queryFn: async ({ id, promoData }) => {
        try {
          const result = await updatePromoById(id, promoData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    createVisit: builder.mutation<
      Visit,
      {
        clientId: string;
        type: string;
        visitReason: string;
        date: string;
        notePublic?: string;
        notePrivate?: string;
        visitIssuedBy: string;
      }
    >({
      queryFn: async (visitData) => {
        try {
          const result = await createVisit(visitData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updateVisitById: builder.mutation<
      Visit,
      { id: string; visitData: Partial<Visit> }
    >({
      queryFn: async ({ id, visitData }) => {
        try {
          const result = await updateVisitById(id, visitData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getAlertsByEntityRoleAndEntityCode: builder.query<
      Alert[],
      {
        entityRole: "admin" | "agent" | "client"; // New field
        entityCode: string;
      }
    >({
      queryFn: async ({ entityRole, entityCode }) => {
        try {
          const result = await getAlertsByEntityRoleAndEntityCode({
            entityRole,
            entityCode,
          });
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),
  }),
});

export const {
  useGetPromosQuery,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertByIdMutation,
  useCreateVisitMutation,
  useUpdateVisitByIdMutation,
  useCreatePromoMutation,
  useUpdatePromoByIdMutation,
  useGetVisitsQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
  useGetUserRoleByIdQuery,
  useLoginUserMutation,
  useRegisterUserMutation,
  useGetClientByCodiceQuery,
  useGetAlertsByEntityRoleAndEntityCodeQuery,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAgentDetailsByIdQuery,
  useGetAdminDataQuery,
  useGetAdminByIdQuery,
  useGetMovementDetailsQuery,
} = api;
