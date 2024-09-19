import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { VisitService } from "../services/visitService";

export class VisitController {
  static async getAllVisits(_req: Request, res: Response): Promise<void> {
    try {
      const visits = await VisitService.getAllVisits();
      res.json(visits);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async createVisit(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Convert date string to Date object
      const visitData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : null, // Ensure the date is a Date object
      };

      const visit = await VisitService.createVisit(visitData);
      res.status(201).json({ message: "Visit created successfully", visit });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }



  static async replaceVisit(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const visit = await VisitService.replaceVisit(req.params.id, req.body);
      if (!visit) {
        res.status(200).json({ message: "Visit not found" });
        return;
      }
      res.status(200).json({ message: "Visit updated successfully", visit });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async updateVisit(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const visit = await VisitService.updateVisit(req.params.id, req.body);
      if (!visit) {
        res.status(200).json({ message: "Visit not found" });
        return;
      }
      res.status(200).json({ message: "Visit updated successfully", visit });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
