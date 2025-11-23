import Joi from "joi";
import { objectId, paginationSchema } from "../validations/common";

// 1️⃣ Create Fine Payment (POST /)
export const payFineSchema = Joi.object({
  userId: objectId.required().messages({
    "any.required": "User ID is required",
    "any.invalid": "Invalid User ID format",
  }),

  borrowId: objectId.required().messages({
    "any.required": "Borrow ID is required",
    "any.invalid": "Invalid Borrow ID format",
  }),

  amount: Joi.number().min(1).required().messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),

  method: Joi.string().valid("cash", "card", "online").required().messages({
    "any.only": "Method must be one of: cash, card, online",
    "any.required": "Payment method is required",
  }),
});

// 2️⃣ Validate query params for history & list
export const finePaymentQuerySchema = Joi.object({
  ...paginationSchema,
  userId: objectId.optional(),
});

// 3️⃣ Validate ID params (GET /:id)
export const finePaymentIdSchema = Joi.object({
  id: objectId.required().messages({
    "any.invalid": "Invalid payment ID format",
  }),
});
