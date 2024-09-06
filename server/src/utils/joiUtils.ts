import Joi from 'joi';
import mongoose from 'mongoose';


// Define the schema for validation
export const messageSchema = Joi.object({
    chatId: Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('Invalid chat ID format.');
      }
      return value;
    }),
    message: Joi.object({
      content: Joi.string().max(2000).required(),
      sender: Joi.string().required(),
      messageType: Joi.string().valid('message', 'alert', 'promo', 'visit').required(),
      timestamp: Joi.date().default(Date.now),
    }).required(),
  });
  