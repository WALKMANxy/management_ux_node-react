// src/services/api/apiUtils.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { Promo, Visit } from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";
import { Admin, Agent } from "../models/entityModels";

export const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

if (!baseUrl || baseUrl === "") {
  throw new Error("One or more environment variables are not defined");
}

export const apiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  data?: unknown
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axios({
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        "bypass-tunnel-reminder": "true",
      },
      data,
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response) {
        // Handling 404 specifically for PUT and PATCH methods
        if (
          (method === "PUT" || method === "PATCH") &&
          axiosError.response.status === 404
        ) {
          console.log(`Resource not found at ${endpoint}, cannot update.`);
          throw new Error(`Resource not found at ${endpoint}, cannot update.`);
        }
        const serverMessage =
          axiosError.response.data?.message || "An error occurred";
        console.error(
          `Error during ${method} request to ${endpoint}:`,
          serverMessage
        );
        throw new Error(serverMessage);
      }
    }
    throw new Error("Network Error");
  }
};

interface AuthApiResponse {
  message: string;
  statusCode: number;
}

export const authApiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  data?: unknown
): Promise<T & AuthApiResponse> => {
  try {
    const config: AxiosRequestConfig = {
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        "bypass-tunnel-reminder": "true",
      },
      data,
      withCredentials: true,
    };

    const response: AxiosResponse<T & Partial<AuthApiResponse>> = await axios(
      config
    );
    return {
      ...response.data,
      message: response.data.message || "Success",
      statusCode: response.status,
    };
  } catch (error: unknown) {
    console.error(`Error ${method} data from ${endpoint}:`, error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<Partial<AuthApiResponse>>;
      if (axiosError.response) {
        return {
          ...(axiosError.response.data as T),
          message: axiosError.response.data?.message || "An error occurred",
          statusCode: axiosError.response.status,
        };
      }
    }
    throw new Error(`Failed to ${method.toLowerCase()} data from ${endpoint}`);
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
