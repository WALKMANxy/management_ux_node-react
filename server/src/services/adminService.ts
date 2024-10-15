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

/**
 * Create a new admin in the database.
 * @param adminData - The data for the new admin.
 * @returns Promise resolving to the created Admin document.
 */
export const createAdminService = async (adminData: { id: string; name: string; email: string }): Promise<IAdmin> => {
  try {
    const newAdmin = new Admin(adminData);
    await newAdmin.save();
    return newAdmin;
  } catch (error: any) {
    console.error("Error creating admin:", error);
    throw error; // Let the controller handle specific error responses
  }
};

/**
 * Update an existing admin by ID.
 * @param id - The ID of the admin to update.
 * @param updateData - The data to update.
 * @returns Promise resolving to the updated Admin document or null if not found.
 */
export const updateAdminService = async (
  id: string,
  updateData: { name?: string; email?: string }
): Promise<IAdmin | null> => {
  try {
    const updatedAdmin = await Admin.findOneAndUpdate({ id }, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure the update respects schema validations
    }).exec();
    return updatedAdmin;
  } catch (error: any) {
    console.error(`Error updating admin with id ${id}:`, error);
    throw error; // Let the controller handle specific error responses
  }
};

/**
 * Delete an admin by ID.
 * @param id - The ID of the admin to delete.
 * @returns Promise resolving to true if deleted, false if not found.
 */
export const deleteAdminService = async (id: string): Promise<boolean> => {
  try {
    const result = await Admin.deleteOne({ id }).exec();
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting admin with id ${id}:`, error);
    throw new Error("Error deleting admin");
  }
};
