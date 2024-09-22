import { Router } from 'express';
import { validate } from '../middlewares/joiValidation';
import { createRequestSchema, updateRequestStatusSchema } from '../utils/joiUtils';
import { DayOffRequestController } from '../controllers/daysOffController';


const router = Router();

// Route to create a new day-off request
router.post(
  '/requests',
  validate(createRequestSchema), // Validate the request body using Joi
  DayOffRequestController.createRequest // Controller method to handle the request
);

// Route to get all requests for a specific month (Admin)
router.get(
  '/requests/admin',
  DayOffRequestController.getRequestsByMonthForAdmin // No validation needed, as query params can be directly checked in the controller
);

// Route to get requests by status and user ID for a specific month
router.get(
  '/requests/user',
  DayOffRequestController.getRequestsByStatusAndUser // No validation needed, as query params can be directly checked in the controller
);

// Route to update the status of a specific request by its ID
router.patch(
  '/requests/:requestId/status',
  validate(updateRequestStatusSchema), // Validate the request body using Joi
  DayOffRequestController.updateRequestStatus // Controller method to handle the request
);

export default router;
