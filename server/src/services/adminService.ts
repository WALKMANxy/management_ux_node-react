// src/services/adminService.ts

import Admin, { IAdmin } from "../models/Admin";

/**
 * Fetch all admins from the database.
 * @returns Promise resolving to an array of Admin documents.
 */
export const getAllAdmins = async (): Promise<IAdmin[]> => {
  try {
    const admins = await Admin.find().exec();
    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw new Error("Error fetching admins");
  }
};

/**
 * Fetch a single admin by ID from the database.
 * @param id - The ID of the admin to fetch.
 * @returns Promise resolving to an Admin document or null if not found.
 */
export const getAdminById = async (id: string): Promise<IAdmin | null> => {
  try {
    const admin = await Admin.findOne({ id }).exec();
    return admin;
  } catch (error) {
    console.error(`Error fetching admin with id ${id}:`, error);
    throw new Error("Error fetching admin by ID");
  }
};
