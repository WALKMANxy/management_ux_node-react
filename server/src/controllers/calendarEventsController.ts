import { Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { logger } from "../utils/logger";
import { emitToAdmins, emitToUser } from "../middlewares/webSocket";
import { CalendarEventService } from "../services/calendarEventsService";

export class CalendarEventController {
  // Create a new calendar event
  static async createEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate, eventType, reason, note } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!startDate || !endDate || !eventType || !reason) {
        logger.warn(`Missing required fields in calendar event creation`);
        return res.status(400).json({
          message: "Start date, end date, event type, and reason are required.",
        });
      }

      // Event creation based on user role and event type
      const event = await CalendarEventService.createEvent(
        {
          userId: userId!,
          startDate,
          endDate,
          eventType,
          reason,
          note,
        },
        userRole!
      );

      logger.info(`Calendar event created successfully for user ${userId}`);

      // Emit WebSocket event based on event type
      if (event.eventType === "absence") {
        emitToAdmins("calendarEvents:newEvent", event);
      }

      return res.status(201).json(event);
    } catch (error) {
      logger.error(
        `Error creating calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res.status(500).json({ message: "Failed to create calendar event" });
    }
  }

  // Get all events for a specific month (Admin)
  static async getEventsByMonthForAdmin(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        logger.warn(`Missing year or month query parameters`);
        return res.status(400).json({
          message: "Year and month query parameters are required.",
        });
      }

      const events = await CalendarEventService.getEventsByMonthForAdmin(
        Number(year),
        Number(month)
      );

      logger.info(
        `Fetched all calendar events for the admin in ${month}/${year}`
      );
      return res.status(200).json(events);
    } catch (error) {
      logger.error(
        `Error fetching all calendar events by month: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to fetch calendar events" });
    }
  }

   // Get events by status and user ID for a specific month
   static async getEventsByStatusAndUser(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { year, month } = req.query;
      const userId = req.user?.id;

      if (!year || !month) {
        logger.warn(`Missing year or month query parameters`);
        return res.status(400).json({
          message: "Year and month query parameters are required.",
        });
      }

      const events = await CalendarEventService.getEventsByStatusAndUser(
        userId!,
        Number(year),
        Number(month)
      );

      if (!events || events.length === 0) {
        logger.info(
          `No calendar events found for user ${userId} in ${month}/${year}`
        );
        return res
          .status(200)
      }

      logger.info(
        `Fetched calendar events by status and user for user ${userId} in ${month}/${year}`
      );
      return res.status(200).json(events);
    } catch (error) {
      logger.error(
        `Error fetching calendar events by status and user: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to fetch calendar events" });
    }
  }

  // Update the status of a specific calendar event by its ID
  static async updateEventStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { status } = req.body;

      if (
        !status ||
        !["pending", "approved", "rejected", "cancelled"].includes(status)
      ) {
        logger.warn(`Invalid status provided: ${status}`);
        return res.status(400).json({
          message:
            "Valid status is required: 'pending', 'approved', 'cancelled' or 'rejected'.",
        });
      }

      const updatedEvent = await CalendarEventService.updateEventStatus(
        eventId,
        status
      );

      if (!updatedEvent) {
        logger.info(`Calendar event with ID ${eventId} not found`);
        return res.status(200).json({ message: "Calendar event not found." });
      }

      logger.info(`Calendar event with ID ${eventId} updated to ${status}`);

      // Emit WebSocket event for status update to the event's user
      emitToUser(updatedEvent.userId.toString(), "calendarEvents:newStatusUpdate", updatedEvent);

      return res.status(200).json(updatedEvent);
    } catch (error) {
      logger.error(
        `Error updating calendar event status: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to update calendar event status" });
    }
  }
}