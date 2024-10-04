// src/services/api/apiUtils.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Promo, Visit } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";
import { Admin, Agent } from "../models/entityModels";
import { showToast } from "../services/toastMessage";
import { getAccessToken } from "../services/tokenService";
import { getCachedDataSafe, setCachedDataSafe, StoreName } from "./cacheUtils";

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
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "bypass-tunnel-reminder": "true",
  },
  timeout: 10000, // Set a timeout to prevent hanging requests
});

// Request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if the request is for the logout endpoint
    if (config.url === "/auth/logout") {
      // Skip adding the access token for logout requests
      return config;
    }

    // Otherwise, attach the access token as usual
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      data,
    };

    const response: AxiosResponse<T> = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Log error for debugging purposes
    console.error(`Error during ${method} request to ${endpoint}:`, error);

    // If the error is an AxiosError, you can retrieve the server error response.
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const serverMessage =
        axiosError.message ||
        axiosError.response?.statusText ||
        "An error occurred while processing the request";

      // Throwing a new error so that it's easier to handle in the calling function
      throw new Error(serverMessage);
    }

    // If it's not an AxiosError, re-throw the original error or a generic one
    throw new Error(
      error instanceof Error ? error.message : "Unexpected error occurred"
    );
  }
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
   */ const cachedData = await getCachedDataSafe<serverMovement[]>("movements");
  if (cachedData) {
    /*     console.log("loadMovementsDataWithCache: Retrieved from cache");
     */ return cachedData;
  }

  /*   console.log("loadMovementsDataWithCache: Cache not found; fetching from API");
   */ try {
    const data = await apiCall<serverMovement[]>("movements", "GET");
    /*     console.log("loadMovementsDataWithCache: Fetched from API");
     */ await setCachedDataSafe("movements", data);
    /*     console.log("loadMovementsDataWithCache: Cached successfully");
     */ return data;
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
