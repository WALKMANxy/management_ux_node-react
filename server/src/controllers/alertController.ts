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

  fetchAlertsBySender = async (req: Request, res: Response) => {
    try {
      const { senderId } = req.params;
      const alerts = await AlertService.getAlertsBySender(senderId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  fetchAlertsByReceiver = async (req: Request, res: Response) => {
    try {
      const { receiverId } = req.params;
      const alerts = await AlertService.getAlertsByReceiver(receiverId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  getConversation = async (req: Request, res: Response) => {
    try {
      const { userId1, userId2, page, limit } = req.query;

      if (!userId1 || !userId2) {
        res.status(400).json({ message: "User IDs are required." });
        return;
      }

      const conversation = await AlertService.getConversationBetweenUsers(
        String(userId1),
        String(userId2),
        Number(page) || 1,
        Number(limit) || 20
      );

      res.json(conversation);
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
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
