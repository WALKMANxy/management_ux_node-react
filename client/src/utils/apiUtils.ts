// src/services/api/apiUtils.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Promo, Visit } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";
import { Admin, Agent } from "../models/entityModels";
import { getCachedDataSafe, setCachedDataSafe, StoreName } from "./cacheUtils";
import { showToast } from "./toastMessage";

// Initialize baseUrl and ensure it's defined
export const baseUrl: string = import.meta.env.VITE_API_BASE_URL?.trim() || "";
if (!baseUrl) {
  throw new Error("Environment variable VITE_API_BASE_URL is not defined.");
}

export type DataType =
  | serverClient
  | serverMovement
  | Admin
  | Agent
  | Visit
  | Promo;

export interface AuthApiResponse {
  message: string;
  statusCode: number;
}

// Create an Axios instance with default configurations
const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "bypass-tunnel-reminder": "true",
  },
  withCredentials: true,
  timeout: 10000, // Set a timeout to prevent hanging requests
});

// Centralized error handling using Axios interceptors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response) {
      const { status, data } = error.response;
      const endpoint = error.config?.url || "Unknown Endpoint";

      // Handle 404 for PUT and PATCH methods
      if (
        (error.config?.method === "put" || error.config?.method === "patch") &&
        status === 404
      ) {
        showToast.error(`Resource not found at ${endpoint}, cannot update.`);
        return Promise.reject(
          new Error(`Resource not found at ${endpoint}, cannot update.`)
        );
      }

      const serverMessage = data?.message || "An error occurred";
      console.error(
        `Error during ${error.config?.method?.toUpperCase()} request to ${endpoint}:`,
        serverMessage
      );
      return Promise.reject(new Error(serverMessage));
    } else if (error.request) {
      // Network error
      showToast.error("Network Error");
      console.error("Network Error:", error.message);
      return Promise.reject(new Error("Network Error"));
    } else {
      // Other errors
      console.error("Axios Error:", error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);

/**
 * Generic API call function
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param data - Request payload
 * @returns Response data of type T
 */
export const apiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  data?: unknown
): Promise<T> => {
  const config: AxiosRequestConfig = {
    url: endpoint,
    method,
    data,
  };

  const response: AxiosResponse<T> = await axiosInstance(config);
  return response.data;
};

/**
 * Authenticated API call function
 * @param endpoint - API endpoint
 * @param method - HTTP method (restricted to GET and POST)
 * @param data - Request payload
 * @returns Response data combined with AuthApiResponse
 */
export const authApiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  data?: unknown
): Promise<T & AuthApiResponse> => {
  const config: AxiosRequestConfig = {
    url: endpoint,
    method,
    data,
  };

  try {
    const response: AxiosResponse<T & Partial<AuthApiResponse>> =
      await axiosInstance(config);
    return {
      ...response.data,
      message: response.data.message || "Success",
      statusCode: response.status,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Partial<AuthApiResponse>>;
      if (axiosError.response) {
        const { data, status } = axiosError.response;
        return {
          ...(data as T),
          message: data?.message || "An error occurred",
          statusCode: status,
        };
      }
    }
    throw new Error(`Failed to ${method.toLowerCase()} data from ${endpoint}`);
  }
};

/**
 * Helper function to fetch fresh data and update the cache
 * @param storeName - The name of the Dexie table
 * @param endpoint - API endpoint
 * @param method - HTTP method
 */
const fetchAndUpdateCache = async (
  storeName: StoreName,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH"
) => {
  try {
    const data = await apiCall<DataType>(endpoint, method);
    await setCachedDataSafe(storeName, data);
  } catch (error) {
    console.error(`Failed to update cache for ${storeName}:`, error);
    // Optionally, notify the user or handle the error as needed
  }
};

/**
 * Loads movements data with caching
 */
export const loadMovementsDataWithCache = async (): Promise<
  serverMovement[]
> => {
/*   console.log("loadMovementsDataWithCache: Attempting to retrieve from cache");
 */  const cachedData = await getCachedDataSafe<serverMovement[]>("movements");
  if (cachedData) {
/*     console.log("loadMovementsDataWithCache: Retrieved from cache");
 */    return cachedData;
  }

/*   console.log("loadMovementsDataWithCache: Cache not found; fetching from API");
 */  try {
    const data = await apiCall<serverMovement[]>("movements", "GET");
/*     console.log("loadMovementsDataWithCache: Fetched from API");
 */    await setCachedDataSafe("movements", data);
/*     console.log("loadMovementsDataWithCache: Cached successfully");
 */    return data;
  } catch (error) {
    console.error(
      "loadMovementsDataWithCache: Failed to load movements data",
      error
    );
    showToast.error("Failed to load movements data.");
    throw error;
  }
};

/**
 * Loads clients data with caching
 */
export const loadClientsDataWithCache = async (): Promise<serverClient[]> => {
  const cachedData = await getCachedDataSafe<serverClient[]>("clients");
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await apiCall<serverClient[]>("clients", "GET");
    await setCachedDataSafe("clients", data);
    return data;
  } catch (error) {
    showToast.error("Failed to load clients data.");
    throw error;
  }
};

/**
 * Loads agents data with caching
 */
export const loadAgentsDataWithCache = async (): Promise<Agent[]> => {
  const cachedData = await getCachedDataSafe<Agent[]>("agents");
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await apiCall<Agent[]>("agents", "GET");
    await setCachedDataSafe("agents", data);
    return data;
  } catch (error) {
    showToast.error("Failed to load agents data.");
    throw error;
  }
};

/**
 * Loads admins data with caching
 */
export const loadAdminsDataWithCache = async (): Promise<Admin[]> => {
  const cachedData = await getCachedDataSafe<Admin[]>("admins");
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await apiCall<Admin[]>("admins", "GET");
    await setCachedDataSafe("admins", data);
    return data;
  } catch (error) {
    showToast.error("Failed to load admins data.");
    throw error;
  }
};

/**
 * Loads visits data with caching using Stale-While-Revalidate
 */
export const loadVisitsDataWithCache = async (): Promise<Visit[]> => {
  const cachedData = await getCachedDataSafe<Visit[]>("visits");
  if (cachedData) {
    // Fetch fresh data in the background to update the cache
    fetchAndUpdateCache("visits", "visits", "GET");
    return cachedData;
  }

  try {
    const data = await apiCall<Visit[]>("visits", "GET");
    await setCachedDataSafe("visits", data);
    return data;
  } catch (error) {
    showToast.error("Failed to load visits data.");
    throw error;
  }
};

/**
 * Loads promos data with caching using Stale-While-Revalidate
 */
export const loadPromosDataWithCache = async (): Promise<Promo[]> => {
  const cachedData = await getCachedDataSafe<Promo[]>("promos");
  if (cachedData) {
    // Fetch fresh data in the background to update the cache
    fetchAndUpdateCache("promos", "promos", "GET");
    return cachedData;
  }

  try {
    const data = await apiCall<Promo[]>("promos", "GET");
    await setCachedDataSafe("promos", data);
    return data;
  } catch (error) {
    showToast.error("Failed to load promos data.");
    throw error;
  }
};

export const loadJsonData = async (): Promise<serverMovement[]> =>
  apiCall<serverMovement[]>("movements", "GET");
export const loadClientDetailsData = async (): Promise<serverClient[]> =>
  apiCall<serverClient[]>("clients", "GET");
export const loadAgentDetailsData = async (): Promise<Agent[]> =>
  apiCall<Agent[]>("agents", "GET");
export const loadAdminDetailsData = async (): Promise<Admin[]> =>
  apiCall<Admin[]>("admins", "GET");
export const loadVisitsData = async (): Promise<Visit[]> =>
  apiCall<Visit[]>("visits", "GET");
export const loadPromosData = async (): Promise<Promo[]> =>
  apiCall<Promo[]>("promos", "GET");
