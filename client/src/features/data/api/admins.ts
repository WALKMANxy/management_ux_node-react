//src/features/data/api/admins.ts
import { Admin } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";


export const loadAdminDetailsData = async (): Promise<Admin[]> => {
  return apiCall<Admin[]>("admins", "GET");
};


export const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "GET");
};


export const createAdmin = async (
  adminData:Admin
): Promise<Admin> => {
  return apiCall<Admin>("admins", "POST", adminData);
};


export const updateAdmin = async (
  id: string,
  updatedData: Partial<Admin>
): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "PATCH", updatedData);
};


export const replaceAdmin = async (
  id: string,
  adminData: Admin
): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "PUT", adminData);
};


export const deleteAdmin = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`admins/${id}`, "DELETE");
};
