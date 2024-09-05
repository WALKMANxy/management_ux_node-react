// services/alertService.ts

import { FilterQuery } from "mongoose";
import { Alert, IAlert } from "../models/Alert";

export class AlertService {
  // Fetch all alerts with optional filtering
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

  // Fetch alerts by sender
  static async getAlertsBySender(senderId: string): Promise<IAlert[]> {
    try {
      return await Alert.find({ sender: senderId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching alerts by sender:", error);
      throw new Error("Failed to fetch alerts by sender");
    }
  }

  // Fetch alerts by receiver
  static async getAlertsByReceiver(receiverId: string): Promise<IAlert[]> {
    try {
      return await Alert.find({ receiver: receiverId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching alerts by receiver:", error);
      throw new Error("Failed to fetch alerts by receiver");
    }
  }

  // Fetch conversation between two users, paginated
  static async getConversationBetweenUsers(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IAlert[]> {
    try {
      const skip = (page - 1) * limit;
      return await Alert.find({
        $or: [
          { sender: userId1, receiver: userId2 },
          { sender: userId2, receiver: userId1 },
        ],
      })
        .sort({ createdAt: 1 }) // Sort by creation date in ascending order
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(
        `Error fetching conversation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Create a new alert
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

  // Update an existing alert
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

  // Delete an alert
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

  // Fetch an alert by its ID
  static async getAlertById(_id: string): Promise<IAlert | null> {
    try {
      const alert = await Alert.findById(_id);
      return alert;
    } catch (error) {
      console.error("Error fetching alert by ID:", error);
      throw new Error("Failed to fetch alert");
    }
  }

  // Update read status for a specific message and user
  static async updateReadStatus(
    alertId: string,
    userId: string
  ): Promise<IAlert | null> {
    try {
      const alert = await Alert.findOneAndUpdate(
        { _id: alertId, "markedAsRead.userId": userId },
        { $set: { "markedAsRead.$.read": true } },
        { new: true }
      );

      // If the user is not yet in the markedAsRead list, add them
      if (!alert) {
        return await Alert.findByIdAndUpdate(
          alertId,
          { $push: { markedAsRead: { userId, read: true } } },
          { new: true }
        );
      }

      return alert;
    } catch (error) {
      throw new Error(
        `Error updating read status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
