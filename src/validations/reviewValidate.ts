import Joi from "joi";
import { objectId } from "./common";

// 1️⃣ Add Review Schema
export const addReviewSchema = Joi.object({
  userId: objectId.required().messages({
    "any.required": "User ID is required",
    "any.invalid": "Invalid User ID format",
  }),

  bookId: objectId.required().messages({
    "any.required": "Book ID is required",
    "any.invalid": "Invalid Book ID format",
  }),

  rating: Joi.number().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),

  review: Joi.string().allow("").trim().optional(),
});

// 2️⃣ Update Review Schema
export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
  }),

  review: Joi.string().allow("").trim(),
}).min(1); // ensure at least one field is updated

// 3️⃣ Validate :id params
export const reviewIdParamSchema = Joi.object({
  id: objectId.required().messages({
    "any.invalid": "Invalid review ID",
  }),
});

// 4️⃣ Validate bookId for /reviews/book/:bookId
export const reviewBookParamSchema = Joi.object({
  bookId: objectId.required().messages({
    "any.invalid": "Invalid book ID",
  }),
});

// 5️⃣ Validate userId for /reviews/user/:userId
export const reviewUserParamSchema = Joi.object({
  userId: objectId.required().messages({
    "any.invalid": "Invalid user ID",
  }),
});
