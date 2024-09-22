import { Types } from "mongoose";
import { DayOffRequest, IDayOffRequest } from "../models/DaysOffRequest";
import { logger } from "../utils/logger";

export class DayOffRequestService {

  // Create a new day-off request
  static async createRequest(data: Partial<IDayOffRequest>): Promise<IDayOffRequest> {
    try {
      const newRequest = new DayOffRequest({
        ...data,
        status: "pending", // Explicitly set the status to "pending"
        createdAt: new Date(), // Set the current date for createdAt
        updatedAt: new Date(), // Set the current date for updatedAt
      });
      return await newRequest.save();
    } catch (error) {
      logger.error(`Service error creating day-off request: ${error instanceof Error ? error.message : error}`);
      throw new Error("Error while creating day-off request");
    }
  }

  // Get all requests for a specific month (Admin)
  static async getRequestsByMonthForAdmin(
    year: number,
    month: number
  ): Promise<IDayOffRequest[]> {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      return await DayOffRequest.find({
        startDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec();
    } catch (error) {
      logger.error(`Service error fetching all day-off requests by month: ${error instanceof Error ? error.message : error}`);
      throw new Error("Error while fetching day-off requests by month");
    }
  }

  // Get requests by status and user ID for a specific month
  static async getRequestsByStatusAndUser(
    userId: string,
    year: number,
    month: number
  ): Promise<IDayOffRequest[]> {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      return await DayOffRequest.find({
        $or: [
          { userId: new Types.ObjectId(userId) }, // Get requests for the logged-in user
          { status: "approved" }, // Get all approved requests for the current month
        ],
        startDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec();
    } catch (error) {
      logger.error(`Service error fetching day-off requests by status and user: ${error instanceof Error ? error.message : error}`);
      throw new Error("Error while fetching day-off requests by status and user");
    }
  }

  // Update the status of a specific request by its ID
  static async updateRequestStatus(
    requestId: string,
    status: "pending" | "approved" | "rejected"| "cancelled"
  ): Promise<IDayOffRequest | null> {
    try {
      return await DayOffRequest.findByIdAndUpdate(
        requestId,
        { status, updatedAt: new Date() }, // Update the status and updatedAt timestamp
        { new: true }
      ).exec();
    } catch (error) {
      logger.error(`Service error updating day-off request status: ${error instanceof Error ? error.message : error}`);
      throw new Error("Error while updating day-off request status");
    }
  }
}
