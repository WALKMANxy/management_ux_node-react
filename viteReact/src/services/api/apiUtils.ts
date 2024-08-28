// src/services/api/apiUtils.ts
import axios, { AxiosRequestConfig } from "axios";
import { Alert, Movement, Promo, Visit } from "../../models/dataModels";
import { Admin, Agent, Client } from "../../models/entityModels";

export const baseUrl = process.env.VITE_API_BASE_URL || "";

if (!baseUrl || baseUrl === "") {
  throw new Error("One or more environment variables are not defined");
}

export const apiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH",
  data?: unknown
): Promise<T> => {
  try {
    const response = await axios({
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        "bypass-tunnel-reminder": "true",
      },
      data,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Handling 404 specifically for PUT and PATCH methods
      if (
        (method === "PUT" || method === "PATCH") &&
        error.response.status === 404
      ) {
        console.log(`Resource not found at ${endpoint}, cannot update.`);
        return Promise.reject({
          status: error.response.status,
          message: error.response.data.message || "Resource not found",
        });
      }
      const serverMessage = error.response.data.message || "An error occurred";
      console.error(
        `Error during ${method} request to ${endpoint}:`,
        serverMessage
      );
      throw new Error(serverMessage);
    }
    throw new Error("Network Error");
  }
};

export const authApiCall = async <T>(
  endpoint: string,
  method: "GET" | "POST",
  data?: unknown
): Promise<T & { message: string; statusCode: number }> => {
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

    const response = await axios(config);
    return {
      ...response.data,
      message: response.data.message || "Success",
      statusCode: response.status,
    };
  } catch (error: any) {
    console.error(`Error ${method} data from ${endpoint}:`, error);
    if (error.response) {
      return {
        ...error.response.data,
        message: error.response.data.message || "An error occurred",
        statusCode: error.response.status,
      };
    }
    throw new Error(`Failed to ${method.toLowerCase()} data from ${endpoint}`);
  }
};

export const loadJsonData = async (): Promise<Movement[]> =>
  apiCall<Movement[]>("movements", "GET");
export const loadClientDetailsData = async (): Promise<Client[]> =>
  apiCall<Client[]>("clients", "GET");
export const loadAgentDetailsData = async (): Promise<Agent[]> =>
  apiCall<Agent[]>("agents", "GET");
export const loadAdminDetailsData = async (): Promise<Admin[]> =>
  apiCall<Admin[]>("admins", "GET");
export const loadVisitsData = async (): Promise<Visit[]> =>
  apiCall<Visit[]>("visits", "GET");
export const loadPromosData = async (): Promise<Promo[]> =>
  apiCall<Promo[]>("promos", "GET");
export const loadAlertsData = async (): Promise<Alert[]> =>
  apiCall<Alert[]>("alerts", "GET");
