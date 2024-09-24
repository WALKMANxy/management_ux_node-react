import { Router } from 'express';
import { validate } from '../middlewares/joiValidation';
import { createEventSchema, editEventSchema, updateEventStatusSchema } from '../utils/joiUtils';
import { CalendarEventController } from '../controllers/calendarEventsController';

const router = Router();

// Route to create a new calendar event
router.post(
  '/events',
  validate(createEventSchema), // Validate the request body using Joi
  CalendarEventController.createEvent // Controller method to handle the request
);

// Route to get all events for a specific month (Admin)
router.get(
  '/events/admin',
  CalendarEventController.getEventsByMonthForAdmin // No validation needed, as query params can be directly checked in the controller
);

// Route to get events by status and user ID for a specific month
router.get(
  '/events/user',
  CalendarEventController.getEventsByStatusAndUser // No validation needed, as query params can be directly checked in the controller
);

// Route to update the status of a specific event by its ID
router.patch(
  '/events/:eventId/status',
  validate(updateEventStatusSchema), // Validate the request body using Joi
  CalendarEventController.updateEventStatus // Controller method to handle the request
);

// Route to edit an existing calendar event
router.patch(
  '/events/:eventId',
  validate(editEventSchema), // Validate the request body using Joi
  CalendarEventController.editEvent // Controller method to handle the request
);

// Route to delete a calendar event
router.delete(
  '/events/:eventId',
  CalendarEventController.deleteEvent // Controller method to handle the request
);

export default router;
