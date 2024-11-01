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
  timeout: 20000,
});

// Request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url === "/auth/logout") {
      return config;
    }
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
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
    console.error(`Error during ${method} request to ${endpoint}:`, error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const serverMessage =
        axiosError.message ||
        axiosError.response?.statusText ||
        "An error occurred while processing the request";
      console.error(serverMessage);
      throw error;
    }

    throw new Error(
      error instanceof Error ? error.message : "Unexpected error occurred"
    );
  }
};

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
    let message = "An error occurred";
    let statusCode = 500;
    let responseData = {} as T;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const { data, status } = error.response;
        responseData = data as T;
        message = data?.message || message;
        statusCode = status;
      } else {
        message = error.message || message;
      }
    } else if (error instanceof Error) {
      message = error.message || message;
    }

    return {
      ...responseData,
      message,
      statusCode,
    };
  }
};

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
  }
};

export const loadMovementsDataWithCache = async (): Promise<
  serverMovement[]
> => {
  // console.log("loadMovementsDataWithCache: Attempting to retrieve from cache");
  const cachedData = await getCachedDataSafe<serverMovement[]>("movements");
  if (cachedData) {
    // console.log("loadMovementsDataWithCache: Retrieved from cache");
    return cachedData;
  }

  // console.log("loadMovementsDataWithCache: Cache not found; fetching from API");
  try {
    const data = await apiCall<serverMovement[]>("movements", "GET");
    // console.log("loadMovementsDataWithCache: Fetched from API");
    await setCachedDataSafe("movements", data);
    // console.log("loadMovementsDataWithCache: Cached successfully");

    return data;
  } catch (error) {
    console.error(
      "loadMovementsDataWithCache: Failed to load movements data",
      error
    );
    showToast.error("Failed to load movements data.");
    throw error;
  }
};

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

export const loadVisitsDataWithCache = async (): Promise<Visit[]> => {
  const cachedData = await getCachedDataSafe<Visit[]>("visits");
  if (cachedData) {
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

export const loadPromosDataWithCache = async (): Promise<Promo[]> => {
  const cachedData = await getCachedDataSafe<Promo[]>("promos");
  if (cachedData) {
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
