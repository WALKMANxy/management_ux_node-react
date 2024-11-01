/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthState } from "../models/stateModels";

export const loadAuthState = (): AuthState | undefined => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState) as unknown;

    if (isAuthState(parsedState)) {
      return parsedState;
    } else {
      console.warn("Invalid auth state structure in localStorage");
      return undefined;
    }
  } catch (err) {
    console.error("Error loading auth state from localStorage:", err);
    return undefined;
  }
};

export const saveAuthState = (state: AuthState): void => {
  // console.debug("Saving auth state to localStorage:", state);
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("authState", serializedState);
  } catch (err) {
    console.error("Failed to save auth state to localStorage:", err);
  }
};

const isAuthState = (obj: any): obj is AuthState => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.isLoggedIn === "boolean" &&
    typeof obj.role === "string" &&
    (typeof obj.id === "string" || obj.id === null) &&
    (typeof obj.userId === "string" || obj.userId === null) &&
    (typeof obj.refreshToken === "string" || obj.refreshToken === null)
  );
};

export const setWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

export const cacheCityData = (
  lat: number,
  lon: number,
  city: string,
  ttl: number = 1000 * 60 * 60
) => {
  const cachedData = {
    lat,
    lon,
    city,
  };
  setWithExpiry("cityData", cachedData, ttl);
};

export const getCachedCityData = () => {
  return getWithExpiry("cityData");
};
