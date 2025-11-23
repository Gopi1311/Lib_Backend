import Joi from "joi";
import { Types } from "mongoose";
import { objectId, paginationSchema } from "./common";

export const addBorrowSchema = Joi.object({
  userId: objectId.required().messages({
    "any.invalid": "Invalid userId format",
    "any.required": "userId is required",
  }),

  bookId: objectId.required().messages({
    "any.invalid": "Invalid bookId format",
    "any.required": "bookId is required",
  }),

  days: Joi.number().integer().min(2).max(15).optional().messages({
    "number.min": "Borrow must be at least 2 day",
    "number.max": "Borrow cannot exceed 15 days",
  }),
});

export const updateBorrowStatusSchema = Joi.object({
  status: Joi.string().valid("issued", "returned", "late").required().messages({
    "string.empty": "Status is required",
    "any.only": "Invalid status. Allowed: issued, returned, late",
  }),
});

export const getBorrowQuerySchema = Joi.object({
  status: Joi.string().valid("issued", "returned", "late").optional(),
  ...paginationSchema,
});
