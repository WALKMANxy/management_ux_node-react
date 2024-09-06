// src/services/api/admins.ts

import { Admin } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";


export const loadAdminDetailsData = async (): Promise<Admin[]> => {
  return apiCall<Admin[]>("admins", "GET");
};

export const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "GET");
};
