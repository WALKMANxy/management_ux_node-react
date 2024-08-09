// src/services/api/apiUtils.ts
import axios, { AxiosRequestConfig } from 'axios';
import { Agent, Alert, Promo, Visit } from '../../models/models';


export const baseUrl = process.env.REACT_APP_API_BASE_URL || '';

if (!baseUrl || baseUrl === '') {
  throw new Error('One or more environment variables are not defined');
}

export const apiCall = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH',
  data?: any
): Promise<T> => {
  try {
    const response = await axios({
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        'bypass-tunnel-reminder': 'true',
      },
      data,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const serverMessage = error.response?.data?.message || 'An error occurred';
    console.error(`Error during ${method} request to ${endpoint}:`, serverMessage);
    throw new Error(serverMessage);
  }
};

export const authApiCall = async <T>(
  endpoint: string,
  method: 'GET' | 'POST',
  data?: any
): Promise<T & { message: string; statusCode: number }> => {
  try {
    const config: AxiosRequestConfig = {
      url: `${baseUrl}/${endpoint}`,
      method,
      headers: {
        'bypass-tunnel-reminder': 'true',
      },
      data,
      withCredentials: true,
    };

    const response = await axios(config);
    return {
      ...response.data,
      message: response.data.message || 'Success',
      statusCode: response.status,
    };
  } catch (error: any) {
    console.error(`Error ${method} data from ${endpoint}:`, error);
    if (error.response) {
      return {
        ...error.response.data,
        message: error.response.data.message || 'An error occurred',
        statusCode: error.response.status,
      };
    }
    throw new Error(`Failed to ${method.toLowerCase()} data from ${endpoint}`);
  }
};


export const loadJsonData = async (): Promise<any[]> =>
  apiCall<any[]>("movements", "GET");
export const loadClientDetailsData = async (): Promise<any[]> =>
  apiCall<any[]>("clients", "GET");
export const loadAgentDetailsData = async (): Promise<Agent[]> =>
  apiCall<Agent[]>("agents", "GET");
export const loadAdminDetailsData = async (): Promise<any[]> =>
  apiCall<any[]>("admins", "GET");
export const loadVisitsData = async (): Promise<Visit[]> =>
  apiCall<Visit[]>("visits", "GET");
export const loadPromosData = async (): Promise<Promo[]> =>
  apiCall<Promo[]>("promos", "GET");
export const loadAlertsData = async (): Promise<Alert[]> =>
  apiCall<Alert[]>("alerts", "GET");
