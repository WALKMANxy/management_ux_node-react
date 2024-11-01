// src/services/adminService.ts
import Admin, { IAdmin } from "../models/Admin";


export const getAllAdmins = async (): Promise<IAdmin[]> => {
  try {
    const admins = await Admin.find().exec();
    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw new Error("Error fetching admins");
  }
};


export const getAdminById = async (id: string): Promise<IAdmin | null> => {
  try {
    const admin = await Admin.findOne({ id }).exec();
    return admin;
  } catch (error) {
    console.error(`Error fetching admin with id ${id}:`, error);
    throw new Error("Error fetching admin by ID");
  }
};


export const createAdminService = async (adminData: { id: string; name: string; email: string }): Promise<IAdmin> => {
  try {
    const newAdmin = new Admin(adminData);
    await newAdmin.save();
    return newAdmin;
  } catch (error: any) {
    console.error("Error creating admin:", error);
    throw error;
  }
};


export const updateAdminService = async (
  id: string,
  updateData: { name?: string; email?: string }
): Promise<IAdmin | null> => {
  try {
    const updatedAdmin = await Admin.findOneAndUpdate({ id }, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    return updatedAdmin;
  } catch (error: any) {
    console.error(`Error updating admin with id ${id}:`, error);
    throw error;
  }
};


export const deleteAdminService = async (id: string): Promise<boolean> => {
  try {
    const result = await Admin.deleteOne({ id }).exec();
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting admin with id ${id}:`, error);
    throw new Error("Error deleting admin");
  }
};
