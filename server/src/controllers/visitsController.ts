//src/controllers/visitsController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { VisitService } from "../services/visitService";

export class VisitController {
  static async getAllVisits(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as string;
      const clientId = req.query.clientId as string;

      if (!role) {
        res.status(400).json({ message: "Role is required." });
        return;
      }

      if (role === "client" && !clientId) {
        res
          .status(400)
          .json({ message: "clientId is required for role 'client'." });
        return;
      }

      // Fetch visits based on role and clientId
      const visits = await VisitService.getAllVisits({ role, clientId });

      // If role is 'client', strip out the notePrivate
      const processedVisits = visits.map((visit) => {
        const visitObj = visit.toObject();
        if (role === "client") {
          delete visitObj.notePrivate;
        }
        return visitObj;
      });

      res.json(processedVisits);
    } catch (err) {
      console.error("Error fetching visits:", err);
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
      // console.log("Creating visit:", req.body);
      // Convert date string to Date object
      const visitData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : null,
      };

      // console.log("Visit data:", visitData);

      const visit = await VisitService.createVisit(visitData);
      // console.log("Created visit:", visit);
      res.status(201).json(visit);
    } catch (err) {
      console.error("Error creating visit:", err);
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
      res.status(200).json(visit);
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
      res.status(200).json(visit);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
