import { Response } from "express";
/* import { emitToAdmins, emitToUser } from "../middlewares/webSocket";
 */import { AuthenticatedRequest } from "../models/types";
import { CalendarEventService } from "../services/calendarEventsService";
import { logger } from "../utils/logger";

export class CalendarEventController {
  // Create a new calendar event
  static async createEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { startDate, endDate, eventType, reason, note } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;

       // Debugging: Log incoming dates
    console.log("Incoming Start Date:", startDate);
    console.log("Incoming End Date:", endDate);

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

     /*  // Emit WebSocket event based on event type
      if (event.eventType === "absence") {
        emitToAdmins("calendarEvents:newEvent", event);
      } */

      return res.status(201).json(event);
    } catch (error) {
      logger.error(
        `Error creating calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to create calendar event" });
    }
  }

  // Get all events for a specific month (Admin)
  static async getEventsByMonthForAdmin(
    req: AuthenticatedRequest,
    res: Response
  ) {
    logger.debug("getEventsByMonthForAdmin called");

    try {
      // Log the incoming request details
      logger.debug(
        `Request received with query parameters: ${JSON.stringify(req.query)}`
      );

      const { year, month } = req.query;

      // Validate query parameters
      if (!year || !month) {
        logger.warn(
          `Missing year or month query parameters. Received - year: ${year}, month: ${month}`
        );
        return res.status(400).json({
          message: "Year and month query parameters are required.",
        });
      }

      logger.debug(
        `Attempting to fetch events for year: ${year}, month: ${month}`
      );

      // Fetch events
      const events = await CalendarEventService.getEventsByMonthForAdmin(
        Number(year),
        Number(month)
      );

      if (events && events.length > 0) {
        logger.info(
          `Fetched ${events.length} events for the admin in ${month}/${year}`
        );
      } else {
/*         logger.info(`No events found for the admin in ${month}/${year}`);
 */      }

      // Log the fetched events (limit the log size to avoid excessive output)
      logger.debug(
        `Fetched events: ${JSON.stringify(events, null, 2).substring(
          0,
          1000
        )}...`
      );

      return res.status(200).json(events);
    } catch (error) {
      logger.error(
        `Error fetching all calendar events by month: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      );

      // Log the stack trace if available
      if (error instanceof Error) {
        logger.error(error.stack);
      }

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
        return res.status(200);
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

      /* // Emit WebSocket event for status update to the event's user
      emitToUser(
        updatedEvent.userId.toString(),
        "calendarEvents:newStatusUpdate",
        updatedEvent
      ); */

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

  // Update an existing calendar event
  static async editEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { startDate, endDate, eventType, reason, note } = req.body;

      // Validate required fields (at least one field should be present)
      if (!startDate && !endDate && !eventType && !reason && !note) {
        logger.warn(`No fields provided for updating event ${eventId}`);
        return res.status(400).json({
          message:
            "At least one field (startDate, endDate, eventType, reason, note) must be provided for update.",
        });
      }

      // Update the event using the service
      const updatedEvent = await CalendarEventService.editEvent(eventId, {
        startDate,
        endDate,
        eventType,
        reason,
        note,
      });

      if (!updatedEvent) {
        logger.info(`Calendar event with ID ${eventId} not found for editing`);
        return res.status(404).json({ message: "Calendar event not found." });
      }

      logger.info(`Calendar event with ID ${eventId} updated successfully`);

     /*  // Emit WebSocket event for update
      emitToAdmins("calendarEvents:eventUpdated", updatedEvent);
      emitToUser(
        updatedEvent.userId.toString(),
        "calendarEvents:eventUpdated",
        updatedEvent
      );
 */
      return res.status(200).json(updatedEvent);
    } catch (error) {
      logger.error(
        `Error editing calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res.status(500).json({ message: "Failed to edit calendar event" });
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response) {
    try {
      const { eventId } = req.params;

      // Delete the event using the service
      const deletedEvent = await CalendarEventService.deleteEvent(eventId);

      if (!deletedEvent) {
        logger.info(`Calendar event with ID ${eventId} not found for deletion`);
        return res.status(404).json({ message: "Calendar event not found." });
      }

      logger.info(`Calendar event with ID ${eventId} deleted successfully`);

     /*  // Emit WebSocket event for deletion
      emitToAdmins("calendarEvents:eventDeleted", deletedEvent);
      emitToUser(
        deletedEvent.userId.toString(),
        "calendarEvents:eventDeleted",
        deletedEvent
      );
 */
      return res
        .status(200)
        .json({ message: "Calendar event deleted successfully." });
    } catch (error) {
      logger.error(
        `Error deleting calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      return res
        .status(500)
        .json({ message: "Failed to delete calendar event" });
    }
  }
}
