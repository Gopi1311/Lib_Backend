import Joi from "joi";
import { objectId, paginationSchema } from "../validations/common";
// 1️⃣ Reserve a book
export const reserveBookSchema = Joi.object({
  userId: objectId.required().messages({
    "any.invalid": "Invalid user ID format",
    "any.required": "User ID is required",
  }),

  bookId: objectId.required().messages({
    "any.invalid": "Invalid book ID format",
    "any.required": "Book ID is required",
  }),
});

// 2️⃣ Cancel reservation
export const cancelReservationSchema = Joi.object({
  // empty body, but required for validation consistency
}).unknown(false); // No body fields allowed

// 3️⃣ Optional: Query params for filtering reservation list
export const reservationQuerySchema = Joi.object({
  status: Joi.string().valid("active", "cancelled", "completed").optional(),

  userId: objectId.optional(),
  bookId: objectId.optional(),
  ...paginationSchema,
});
