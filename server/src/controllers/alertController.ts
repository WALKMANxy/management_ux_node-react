// controllers/AlertController.ts

import { Request, Response } from "express";
import { IAlert } from "../models/Alert";
import { AlertService } from "../services/alertService";

export type EmitAlertFunction = (alert: IAlert) => void;

export class AlertController {
  private emitAlert: EmitAlertFunction;

  constructor(emitAlert: EmitAlertFunction) {
    this.emitAlert = emitAlert;
  }

  fetchAllAlerts = async (req: Request, res: Response) => {
    try {
      const alerts = await AlertService.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  fetchAlertsByEntity = async (req: Request, res: Response) => {
    try {
      const { entityRole, entityCode } = req.params;
      const alerts = await AlertService.getAlertsByEntity(
        entityRole,
        entityCode
      );
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  fetchAlertsByIssuer = async (req: Request, res: Response) => {
    try {
      const { alertIssuedBy } = req.params;
      const alerts = await AlertService.getAlertsByIssuer(alertIssuedBy);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  createNewAlert = async (req: Request, res: Response) => {
    try {
      const alert = await AlertService.createAlert(req.body);
      this.emitAlert(alert);
      res.status(201).json({ message: "Alert created successfully", alert });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  updateExistingAlert = async (req: Request, res: Response) => {
    try {
      const alert = await AlertService.updateAlert(req.params.id, req.body);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      this.emitAlert(alert);
      res.status(200).json({ message: "Alert updated successfully", alert });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
