import Joi from "joi";
import mongoose from "mongoose";

// Define the schema for validation
export const messageSchema = Joi.object({
  chatId: Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("Invalid chat ID format.");
    }
    return value;
  }),
  message: Joi.object({
    content: Joi.string().max(2000).required(),
    sender: Joi.string().required(),
    messageType: Joi.string()
      .valid("message", "alert", "promo", "visit")
      .required(),
    timestamp: Joi.date().default(Date.now),
  }).required(),
});

// Schema for creating a new CalendarEvent
export const createEventSchema = Joi.object({
  userId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  eventType: Joi.string().valid("holiday", "event", "absence").required(),
  reason: Joi.when("eventType", {
    switch: [
      {
        is: "absence",
        then: Joi.string()
          .valid("illness", "day_off", "unexpected_event", "medical_visit")
          .required(),
      },
      {
        is: "event",
        then: Joi.string()
          .valid(
            "company_meeting",
            "company_party",
            "conference",
            "expo",
            "generic",
            "company_holiday"
          )
          .required(),
      },
    ],
    otherwise: Joi.forbidden(), // Forbid reason if eventType doesn't match any known value
  }),
  note: Joi.string().optional(),
});

export const editEventSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  eventType: Joi.string().valid('absence', 'holiday', 'event').optional(),
  reason: Joi.string().optional(),
  note: Joi.string().allow('', null).optional(),
});

// Schema for updating the status of a CalendarEvent
export const updateEventStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected", "cancelled")
    .required(),
});
