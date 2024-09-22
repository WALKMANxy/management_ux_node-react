import { Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { DayOffRequestService } from "../services/daysOffService";
import { logger } from "../utils/logger";
import { emitToAdmins, emitToUser } from "../middlewares/webSocket";

export class DayOffRequestController {
  // Create a new day-off request
  static async createRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate, reason, note } = req.body;
      const userId = req.user?.id;

      if (!startDate || !endDate || !reason) {
        logger.warn(`Missing required fields in day-off request creation`);
        return res
          .status(400)
          .json({ message: "Start date, end date, and reason are required." });
      }

      const request = await DayOffRequestService.createRequest({
        userId: userId!,
        startDate,
        endDate,
        reason,
        note,
      });

      logger.info(`Day-off request created successfully for user ${userId}`);

      // Emit WebSocket event for new request to admins
      emitToAdmins('requests:newRequest', request);

      return res.status(201).json(request);
    } catch (error) {
      logger.error(
        `Error creating day-off request: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to create day-off request" });
    }
  }

  // Get all requests for a specific month (Admin)
  static async getRequestsByMonthForAdmin(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        logger.warn(`Missing year or month query parameters`);
        return res
          .status(400)
          .json({ message: "Year and month query parameters are required." });
      }

      const requests = await DayOffRequestService.getRequestsByMonthForAdmin(
        Number(year),
        Number(month)
      );

      logger.info(
        `Fetched all day-off requests for the admin in ${month}/${year}`
      );
      return res.status(200).json(requests);
    } catch (error) {
      logger.error(
        `Error fetching all day-off requests by month: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to fetch day-off requests" });
    }
  }

  // Get requests by status and user ID for a specific month
  static async getRequestsByStatusAndUser(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { year, month } = req.query;
      const userId = req.user?.id;

      if (!year || !month) {
        logger.warn(`Missing year or month query parameters`);
        return res
          .status(400)
          .json({ message: "Year and month query parameters are required." });
      }

      const requests = await DayOffRequestService.getRequestsByStatusAndUser(
        userId!,
        Number(year),
        Number(month)
      );

      if (!requests || requests.length === 0) {
        logger.info(
          `No day-off requests found for user ${userId} in ${month}/${year}`
        );
        return res
          .status(404)
          .json({
            message: "No day-off requests found for the specified month.",
          });
      }

      logger.info(
        `Fetched day-off requests by status and user for user ${userId} in ${month}/${year}`
      );
      return res.status(200).json(requests);
    } catch (error) {
      logger.error(
        `Error fetching day-off requests by status and user: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to fetch day-off requests" });
    }
  }

  // Update the status of a specific request by its ID
  static async updateRequestStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      if (
        !status ||
        !["pending", "approved", "rejected", "cancelled"].includes(status)
      ) {
        logger.warn(`Invalid status provided: ${status}`);
        return res
          .status(400)
          .json({
            message:
              "Valid status is required: 'pending', 'approved', 'cancelled' or 'rejected'.",
          });
      }

      const updatedRequest = await DayOffRequestService.updateRequestStatus(
        requestId,
        status
      );

      if (!updatedRequest) {
        logger.info(`Day-off request with ID ${requestId} not found`);
        return res.status(404).json({ message: "Day-off request not found." });
      }

      logger.info(`Day-off request with ID ${requestId} updated to ${status}`);

      // Emit WebSocket event for status update to the request's user
      emitToUser(updatedRequest.userId.toString(), 'requests:newStatusUpdate', updatedRequest);

      return res.status(200).json(updatedRequest);
    } catch (error) {
      logger.error(
        `Error updating day-off request status: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to update day-off request status" });
    }
  }
}
