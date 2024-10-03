// src/controllers/adminController.ts
import { Request, Response } from "express";
import { getAdminById, getAllAdmins } from "../services/adminService";

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
      return res.status(200).json({ message: "Admin not found" });
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
