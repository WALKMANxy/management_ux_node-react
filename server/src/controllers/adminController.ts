// src/controllers/adminController.ts
import { Request, Response } from "express";
import {
  getAdminById,
  getAllAdmins,
  createAdminService,
  updateAdminService,
  deleteAdminService,
} from "../services/adminService";

// src/types/mongoError.ts
export interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: { [key: string]: any };
}

/**
 * Type guard to check if an error is a MongoDuplicateKeyError.
 * @param error - The error to check.
 * @returns True if the error is a MongoDuplicateKeyError, false otherwise.
 */
export const isMongoDuplicateKeyError = (
  error: unknown
): error is MongoDuplicateKeyError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === 11000
  );
};

/**
 * Fetch all admins and include empty agents and clients arrays.
 */
export const fetchAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await getAllAdmins();

    // Map admins to include empty agents and clients arrays
    const response = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error in fetchAllAdmins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Fetch a single admin by ID and include empty agents and clients arrays.
 */
export const fetchAdminById = async (req: Request, res: Response) => {
  try {
    const admin = await getAdminById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Include empty agents and clients arrays
    const response = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };

    res.json(response);
  } catch (error) {
    console.error(`Error in fetchAdminById for id ${req.params.id}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Create a new admin.
 */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { id, name, email } = req.body;

    // Validate input
    if (!id || !name || !email) {
      return res.status(400).json({ message: "id, name, and email are required" });
    }

    const newAdmin = await createAdminService({ id, name, email });

    res.status(201).json({
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
    });
  } catch (error) {
    console.error("Error in createAdmin:", error);

    if (isMongoDuplicateKeyError(error)) {
      // Determine which field caused the duplicate key error
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Admin with the given ${duplicatedField} already exists`,
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update an existing admin by ID.
 */
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id;
    const { name, email } = req.body;

    // At least one field must be provided for update
    if (!name && !email) {
      return res.status(400).json({ message: "At least one of name or email must be provided for update" });
    }

    const updatedAdmin = await updateAdminService(adminId, { name, email });

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
    });
  }catch (error) {
    console.error(`Error in updateAdmin for id ${req.params.id}:`, error);

    if (isMongoDuplicateKeyError(error)) {
      // Determine which field caused the duplicate key error
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already in use`,
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Delete an admin by ID.
 */
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id;
    const deleted = await deleteAdminService(adminId);

    if (!deleted) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteAdmin for id ${req.params.id}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
