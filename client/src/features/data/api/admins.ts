// src/services/api/admins.ts

import { Admin } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";

/**
 * Fetch all admins.
 * @returns Promise resolving to an array of Admin objects.
 */
export const loadAdminDetailsData = async (): Promise<Admin[]> => {
  return apiCall<Admin[]>("admins", "GET");
};

/**
 * Fetch an admin by ID.
 * @param id - The ID of the admin to fetch.
 * @returns Promise resolving to an Admin object.
 */
export const getAdminById = async (id: string): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "GET");
};

/**
 * Create a new admin.
 * @param adminData - The data of the admin to create.
 * @returns Promise resolving to the created Admin object.
 */
export const createAdmin = async (
  adminData:Admin
): Promise<Admin> => {
  return apiCall<Admin>("admins", "POST", adminData);
};

/**
 * Update an existing admin by ID.
 * @param id - The ID of the admin to update.
 * @param updatedData - The partial data to update the admin.
 * @returns Promise resolving to the updated Admin object.
 */
export const updateAdmin = async (
  id: string,
  updatedData: Partial<Admin>
): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "PATCH", updatedData);
};

/**
 * Replace an entire admin by ID.
 * @param id - The ID of the admin to replace.
 * @param adminData - The complete data for the admin.
 * @returns Promise resolving to the replaced Admin object.
 */
export const replaceAdmin = async (
  id: string,
  adminData: Admin
): Promise<Admin> => {
  return apiCall<Admin>(`admins/${id}`, "PUT", adminData);
};

/**
 * Delete an admin by ID.
 * @param id - The ID of the admin to delete.
 * @returns Promise resolving to a success message.
 */
export const deleteAdmin = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`admins/${id}`, "DELETE");
};
