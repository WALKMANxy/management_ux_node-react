import { Request, Response } from "express";
import {
  createAlert,
  getAlertsByEntity,
  getAllAlerts,
  updateAlert,
} from "../services/alertService";

export const fetchAllAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await getAllAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAlertsByEntity = async (req: Request, res: Response) => {
  try {
    const { entityRole, entityCode } = req.params;
    const alerts = await getAlertsByEntity(entityRole, entityCode);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createNewAlert = async (req: Request, res: Response) => {
  try {
    const alert = await createAlert(req.body);
    res.status(201).json({ message: "Alert created successfully", alert });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateExistingAlert = async (req: Request, res: Response) => {
  try {
    const alert = await updateAlert(req.params.id, req.body);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.status(200).json({ message: "Alert updated successfully", alert });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
