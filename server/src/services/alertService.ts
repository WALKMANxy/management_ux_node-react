// services/alertService.ts

import { FilterQuery } from "mongoose";
import { Alert, IAlert } from "../models/Alert";

export class AlertService {
  static async getAllAlerts(
    filter: FilterQuery<IAlert> = {}
  ): Promise<IAlert[]> {
    try {
      return await Alert.find(filter).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw new Error("Failed to fetch alerts");
    }
  }

  static async getAlertsByEntity(
    entityRole: string,
    entityCode: string
  ): Promise<IAlert[]> {
    try {
      return await Alert.find({ entityRole, entityCode }).sort({
        createdAt: -1,
      });
    } catch (error) {
      console.error("Error fetching alerts by entity:", error);
      throw new Error("Failed to fetch alerts by entity");
    }
  }

  static async getAlertsByIssuer(alertIssuedBy: string): Promise<IAlert[]> {
    try {
      return await Alert.find({ alertIssuedBy }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching alerts by issuer:", error);
      throw new Error("Failed to fetch alerts by issuer");
    }
  }

  static async createAlert(alertData: Partial<IAlert>): Promise<IAlert> {
    try {
      const alert = new Alert(alertData);
      await alert.save();
      return alert;
    } catch (error) {
      console.error("Error creating alert:", error);
      throw new Error("Failed to create alert");
    }
  }

  static async updateAlert(
    id: string,
    alertData: Partial<IAlert>
  ): Promise<IAlert | null> {
    try {
      const alert = await Alert.findByIdAndUpdate(id, alertData, {
        new: true,
        runValidators: true,
      });
      if (!alert) {
        throw new Error("Alert not found");
      }
      return alert;
    } catch (error) {
      console.error("Error updating alert:", error);
      throw new Error("Failed to update alert");
    }
  }

  static async deleteAlert(_id: string): Promise<void> {
    try {
      const result = await Alert.findByIdAndDelete(_id);
      if (!result) {
        throw new Error("Alert not found");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw new Error("Failed to delete alert");
    }
  }

  static async getAlertById(_id: string): Promise<IAlert | null> {
    try {
      const alert = await Alert.findById(_id);
      return alert;
    } catch (error) {
      console.error("Error fetching alert by ID:", error);
      throw new Error("Failed to fetch alert");
    }
  }
}
