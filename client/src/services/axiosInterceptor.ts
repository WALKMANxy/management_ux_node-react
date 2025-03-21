// src/services/api/apiUtils.ts
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import store from "../app/store";
import { handleLogout } from "../features/auth/authThunks";
import { axiosInstance } from "../utils/apiUtils";
import { refreshAccessToken } from "./sessionService";
import { getAccessToken } from "./tokenService";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Custom type for request with retry flag
interface RequestWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function onAccessTokenFetched(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestWithRetry;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const success = await refreshAccessToken();
        if (!success) {
          throw new Error("Refresh token expired or invalid.");
        }

        const newToken = getAccessToken();
        if (originalRequest && originalRequest.headers && newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        onAccessTokenFetched(newToken!);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // Notify all subscribers that refresh failed
        refreshSubscribers.forEach((callback) => callback(""));
        refreshSubscribers = [];

        // Log out the user
        store.dispatch(handleLogout());
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const { data } = error.response;
      const endpoint = error.config?.url || "Unknown Endpoint";

      const serverMessage =
        typeof data === "object" && data !== null && "message" in data
          ? (data.message as string)
          : "An error occurred";
      console.error(
        `Error during ${error.config?.method?.toUpperCase()} request to ${endpoint}:`,
        serverMessage
      );
      return Promise.reject(new Error(serverMessage));
    } else if (error.request) {
      // Network error
      console.error("Network Error:", error.message);
      return Promise.reject(new Error("Network Error"));
    } else {
      // Other errors
      console.error("Axios Error:", error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);
