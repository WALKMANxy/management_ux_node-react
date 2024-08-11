import { Request, Response } from "express";
import { getAllAdmins, getAdminById } from "../services/adminService";

export const fetchAllAdmins = (req: Request, res: Response) => {
  try {
    const admins = getAllAdmins();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAdminById = (req: Request, res: Response) => {
  try {
    const admin = getAdminById(req.params.id);
    if (!admin) {
      return res.status(200).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
