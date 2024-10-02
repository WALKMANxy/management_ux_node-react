import { Types } from "mongoose";
import { CalendarEvent, ICalendarEvent } from "../models/CalendarEvent";
import { logger } from "../utils/logger";

export class CalendarEventService {
  // Create a new calendar event
  static async createEvent(
    data: Partial<ICalendarEvent>,
    userRole: string
  ): Promise<ICalendarEvent> {
    try {
      let status: "pending" | "approved" | "rejected" | "cancelled" = "pending";

      // If the eventType is not "absence", it's either "holiday" or "event", which should be auto-approved for admins
      if (userRole === "admin" && data.eventType !== "absence") {
        status = "approved";
      }


    // Debugging: Log the start and end dates
    console.log("Service Start Date:", data.startDate);
    console.log("Service End Date:", data.endDate);

      const newEvent = new CalendarEvent({
        ...data,
        status, // Set the status based on the event type and user role
        createdAt: new Date(), // Set the current date for createdAt
        updatedAt: new Date(), // Set the current date for updatedAt
      });
      return await newEvent.save();
    } catch (error) {
      logger.error(
        `Service error creating calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error("Error while creating calendar event");
    }
  }

  // Get all calendar events for a specific month (Admin)
  static async getEventsByMonthForAdmin(
    year: number,
    month: number
  ): Promise<ICalendarEvent[]> {
    try {
      /*  console.log("Service call to get events by month for admin.");
      console.log("Parameters received:", { year, month }); */

      // Calculate start and end of the month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      /*  console.log("Calculated start of month:", startOfMonth);
      console.log("Calculated end of month:", endOfMonth); */

      // Fetch events from the database
      /*       console.log("Querying the database for events...");
       */ const events = await CalendarEvent.find({
        startDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec();
      /*       console.log(`Fetched ${events.length} events from the database:`, events);
       */
      return events;
    } catch (error) {
      // Log the error with detailed information
      /*  console.error(
        `Error occurred while fetching events for ${month}/${year}:`,
        error
      ); */
      logger.error(
        `Service error fetching all calendar events by month: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error("Error while fetching calendar events by month");
    }
  }

  // Get calendar events by status and user ID for a specific month
  static async getEventsByStatusAndUser(
    userId: string,
    year: number,
    month: number
  ): Promise<ICalendarEvent[]> {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      return await CalendarEvent.find({
        $or: [
          { userId: new Types.ObjectId(userId) }, // Get events for the logged-in user
          { status: "approved" }, // Get all approved events for the current month
        ],
        startDate: { $gte: startOfMonth, $lte: endOfMonth },
      }).exec();
    } catch (error) {
      logger.error(
        `Service error fetching calendar events by status and user: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error(
        "Error while fetching calendar events by status and user"
      );
    }
  }

  // Update the status of a specific calendar event by its ID
  static async updateEventStatus(
    eventId: string,
    status: "pending" | "approved" | "rejected" | "cancelled"
  ): Promise<ICalendarEvent | null> {
    try {
      return await CalendarEvent.findByIdAndUpdate(
        eventId,
        { status, updatedAt: new Date() }, // Update the status and updatedAt timestamp
        { new: true }
      ).exec();
    } catch (error) {
      logger.error(
        `Service error updating calendar event status: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error("Error while updating calendar event status");
    }
  }

  // Edit an existing calendar event
  static async editEvent(
    eventId: string,
    data: Partial<ICalendarEvent>
  ): Promise<ICalendarEvent | null> {
    try {
      const updatedEvent = await CalendarEvent.findByIdAndUpdate(
        eventId,
        { ...data, updatedAt: new Date() },
        { new: true }
      ).exec();

      return updatedEvent;
    } catch (error) {
      logger.error(
        `Service error editing calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error("Error while editing calendar event");
    }
  }

  // Delete a calendar event by its ID
  static async deleteEvent(eventId: string): Promise<ICalendarEvent | null> {
    try {
      const deletedEvent = await CalendarEvent.findByIdAndDelete(
        eventId
      ).exec();
      return deletedEvent;
    } catch (error) {
      logger.error(
        `Service error deleting calendar event: ${
          error instanceof Error ? error.message : error
        }`
      );
      throw new Error("Error while deleting calendar event");
    }
  }
}
