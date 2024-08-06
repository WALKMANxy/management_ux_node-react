// services/api.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Admin,
  Agent,
  Alert,
  Client,
  MovementDetail,
  Promo,
  User,
  Visit,
} from "../models/models";

import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import {
  mapDataToAgents,
  mapDataToModels,
  mapDataToMovementDetails,
} from "../utils/dataLoader";
import { generateErrorResponse, handleApiError } from "../utils/errorHandling"; // Import error handling functions


const baseUrl = process.env.REACT_APP_API_BASE_URL || "";

if (!baseUrl || baseUrl === "") {
  throw new Error("One or more environment variables are not defined");
}

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const appUrl = process.env.REACT_APP_APP_URL || "";

// Generic API call function
const apiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  data?: any
): Promise<T> => {
  try {
    const token = Cookies.get("token"); // Extract the token from cookies

    const response = await axios({
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        "bypass-tunnel-reminder": "true",
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error(`Error during ${method} request to ${endpoint}:`, error);
    throw new Error(`Failed to ${method} data from ${endpoint}`);
  }
};

// Using apiCall for specific data fetching functions
const loadJsonData = async (): Promise<any[]> =>
  apiCall<any[]>("movements", "GET");
const loadClientDetailsData = async (): Promise<any[]> =>
  apiCall<any[]>("clients", "GET");
const loadAgentDetailsData = async (): Promise<Agent[]> =>
  apiCall<Agent[]>("agents", "GET");
const loadVisitsData = async (): Promise<Visit[]> =>
  apiCall<Visit[]>("visits", "GET");
const loadPromosData = async (): Promise<Promo[]> =>
  apiCall<Promo[]>("promos", "GET");
const loadAlertsData = async (): Promise<Alert[]> =>
  apiCall<Alert[]>("alerts", "GET");
const loadAdminDetailsData = async (): Promise<any[]> =>
  apiCall<any[]>("admins", "GET");

// Specific function to get user role by ID
const getUserById = async (id: string): Promise<User> => {
  return apiCall<User>(`users/${id}`, "GET");
};

// Specific function to get client by codice
const getClientByCodice = async (codice: string): Promise<Client> => {
  return apiCall<Client>(`clients/codice/${codice}`, "GET");
};

// Specific function to get alerts by target type and target ID
const getAlertsByTargetTypeAndTargetId = async ({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: string;
}): Promise<Alert[]> => {
  return apiCall<Alert[]>(`alerts/target/${targetType}/${targetId}`, "GET");
};

const getAgentById = async (id: string): Promise<Agent> => {
  return apiCall<Agent>(`agents/${id}`, "GET");
};

const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "GET");
};

const getAllUsers = async (): Promise<User[]> => {
  return apiCall<User[]>(`users`, "GET");
};

const updateUserById = async (
  id: string,
  updatedData: Partial<User>
): Promise<User> => {
  return apiCall<User>(`users/${id}`, "PATCH", updatedData);
};

// Specific function to create a promo
// Specific function to create a promo
const createPromo = async (promoData: {
  clientsId: string[];
  type: string;
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
  promoIssuedBy: string;
}): Promise<Promo> => {
  return apiCall<Promo>("promos", "POST", promoData);
};

// Specific function to update a promo
const updatePromoById = async (
  id: string,
  promoData: Partial<Promo>
): Promise<Promo> => {
  return apiCall<Promo>(`promos/${id}`, "PATCH", promoData);
};


// Specific function to create a visit
const createVisit = async (visitData: {
  clientId: string;
  type: string;
  visitReason: string;
  date: string;
  notePublic?: string;
  notePrivate?: string;
  visitIssuedBy: string;
}): Promise<Visit> => {
  return apiCall<Visit>("visits", "POST", visitData);
};

// Specific function to update a visit by ID
const updateVisitById = async (
  id: string,
  visitData: Partial<Visit>
): Promise<Visit> => {
  return apiCall<Visit>(`visits/${id}`, "PATCH", visitData);
};

// Specific function to create an alert
const createAlert = async (alertData: {
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  alertIssuedBy: string;
  targetType: "admin" | "agent" | "client";
  targetId: string;
}): Promise<Alert> => {
  return apiCall<Alert>("alerts", "POST", alertData);
};

// Specific function to update an alert
const updateAlertById = async (
  id: string,
  alertData: Partial<Alert>
): Promise<Alert> => {
  return apiCall<Alert>(`alerts/${id}`, "PATCH", alertData);
};





// Generic function to make API calls
const authApiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  data?: any
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      url: `${baseUrl}/${endpoint}`,
      method: method,
      data,
      withCredentials: true, // Ensure cookies are sent with the request
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} data from ${endpoint}:`, error);
    throw new Error(`Failed to ${method.toLowerCase()} data from ${endpoint}`);
  }
};


// Specific function for registering a user
const registerUser = async (credentials: {
  email: string;
  password: string;
}): Promise<void> => {
  return authApiCall<void>("auth/register", "POST", credentials);
};


// Specific function for logging in a user
const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ redirectUrl: string }> => {
  try {
    const response = await axios.post<{ redirectUrl: string }>(
      `${baseUrl}/auth/login`,
      credentials,
      {
        withCredentials: true, // Important to include cookies in the request
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login");
  }
};

// Specific function to request a password reset
const requestPasswordReset = async (email: string): Promise<void> => {
  return authApiCall<void>("auth/request-password-reset", "POST", { email });
};

// Specific function to reset password
const resetPassword = async (token: string, passcode: string, newPassword: string): Promise<void> => {
  const data = { passcode, newPassword };
  return authApiCall<void>(`auth/reset-password?token=${token}`, "POST", data);
};


// Function to initiate Google OAuth flow
export const initiateGoogleOAuth = () => {
  window.location.href = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${appUrl}/oauth2/callback&response_type=code&scope=email%20profile`;
};

// Function to link Google account to an existing user
export const linkGoogleAccount = async (code: string) => {
  try {
    const token = Cookies.get("token"); // Get the JWT token if user is logged in
    const response = await axios.get(`${baseUrl}/auth/link-google`, {
      params: { code },
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error linking Google account:", error);
    throw new Error("Failed to link Google account");
  }
};

// Handle the OAuth callback and retrieve the user's session
export const handleOAuthCallback = async (code: string) => {
  try {
    const response = await axios.get(`${appUrl}/oauth2/callback`, {
      params: { code },
      withCredentials: true, // Ensure cookies are sent back in the response
    });
    return response.data;
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    throw new Error("Failed to process OAuth callback");
  }
};

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
    getAgentById: builder.query<Agent, string>({
      queryFn: async (agentId) => {
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

    requestPasswordReset: builder.mutation<void, string>({
      queryFn: async (email) => {
        try {
          await requestPasswordReset(email);
          return { data: undefined };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    resetPassword: builder.mutation<void, { token: string; passcode: string; newPassword: string }>({
      queryFn: async ({ token, passcode, newPassword }) => {
        try {
          await resetPassword(token, passcode, newPassword);
          return { data: undefined };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
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

    getOnlyAgentById: builder.query<Agent, string>({
      queryFn: async (id) => {
        try {
          const result = await getAgentById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getOnlyAdminById: builder.query<Admin, string>({
      queryFn: async (id) => {
        try {
          const result = await getAdminById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
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

    registerUser: builder.mutation<void, { email: string; password: string }>({
      queryFn: async (credentials) => {
        try {
          await registerUser(credentials);
          return { data: undefined };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),
    loginUser: builder.mutation<
      { redirectUrl: string },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          const result = await loginUser(credentials);
          return { data: result };
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

    createAlert: builder.mutation<Alert, {
      alertReason: string;
      message: string;
      severity: "low" | "medium" | "high";
      alertIssuedBy: string;
      targetType: "admin" | "agent" | "client";
      targetId: string;
    }>({
      queryFn: async (alertData) => {
        try {
          const result = await createAlert(alertData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updateAlertById: builder.mutation<Alert, { id: string; alertData: Partial<Alert> }>({
      queryFn: async ({ id, alertData }) => {
        try {
          const result = await updateAlertById(id, alertData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    createPromo: builder.mutation<Promo, {
      clientsId: string[];
      type: string;
      name: string;
      discount: string;
      startDate: string;
      endDate: string;
      promoIssuedBy: string;
    }>({
      queryFn: async (promoData) => {
        try {
          const result = await createPromo(promoData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updatePromoById: builder.mutation<Promo, { id: string; promoData: Partial<Promo> }>({
      queryFn: async ({ id, promoData }) => {
        try {
          const result = await updatePromoById(id, promoData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),


    createVisit: builder.mutation<Visit, {
      clientId: string;
      type: string;
      visitReason: string;
      date: string;
      notePublic?: string;
      notePrivate?: string;
      visitIssuedBy: string;
    }>({
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

    getAlertsByTargetTypeAndTargetId: builder.query<
      Alert[],
      { targetType: string; targetId: string }
    >({
      queryFn: async ({ targetType, targetId }) => {
        try {
          const result = await getAlertsByTargetTypeAndTargetId({
            targetType,
            targetId,
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
  useGetOnlyAgentByIdQuery,
  useGetOnlyAdminByIdQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
  useGetUserRoleByIdQuery,
  useLoginUserMutation,
  useRegisterUserMutation,
  useGetClientByCodiceQuery,
  useGetAlertsByTargetTypeAndTargetIdQuery,
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAgentByIdQuery, // New hook for fetching agent by ID
  useGetAdminDataQuery,
  useGetAdminByIdQuery, // New hook for fetching admin by ID
  useGetMovementDetailsQuery,
} = api;
