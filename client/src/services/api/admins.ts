// src/services/api/admins.ts

import { Admin } from "../../models/entityModels";
import { apiCall } from "./apiUtils"; // Assuming you have a utility file for common API call functions

export const loadAdminDetailsData = async (): Promise<Admin[]> => {
  return apiCall<Admin[]>("admins", "GET");
};

export const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "GET");
};
