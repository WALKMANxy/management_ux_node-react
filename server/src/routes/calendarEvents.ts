//src/routes/calendarEvents.ts
import { Router } from "express";
import { CalendarEventController } from "../controllers/calendarEventsController";
import { authenticateUser } from "../middlewares/authentication";
import { validate } from "../middlewares/joiValidation";
import {
  createEventSchema,
  editEventSchema,
  updateEventStatusSchema,
} from "../utils/joiUtils";

const router = Router();

router.use(authenticateUser);

// Route to create a new calendar event
router.post(
  "/events",
  validate(createEventSchema),
  CalendarEventController.createEvent
);

// Route to get all events for a specific month (Admin)
router.get("/events/admin", CalendarEventController.getEventsByMonthForAdmin);

// Route to get events by status and user ID for a specific month
router.get("/events/user", CalendarEventController.getEventsByStatusAndUser);

// Route to update the status of a specific event by its ID
router.patch(
  "/events/:eventId/status",
  validate(updateEventStatusSchema),
  CalendarEventController.updateEventStatus
);

// Route to edit an existing calendar event
router.patch(
  "/events/:eventId",
  validate(editEventSchema),
  CalendarEventController.editEvent
);

// Route to delete a calendar event
router.delete("/events/:eventId", CalendarEventController.deleteEvent);

export default router;
