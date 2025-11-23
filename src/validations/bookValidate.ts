import Joi from "joi";

export const createBookSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Book title is required",
  }),

  author: Joi.string().trim().required().messages({
    "string.empty": "Author name is required",
  }),

  publisher: Joi.string().trim().required().messages({
    "string.empty": "Publisher is required",
  }),

  isbn: Joi.string().trim().required().messages({
    "string.empty": "ISBN is required",
  }),

  genre: Joi.string().trim().required().messages({
    "string.empty": "Genre is required",
  }),

  publicationYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": "Publication year must be a number",
      "number.min": "Invalid publication year",
      "number.max": "Publication year cannot be in the future",
    }),

  totalCopies: Joi.number().integer().min(1).required().messages({
    "number.min": "Total copies must be at least 1",
  }),

  availableCopies: Joi.number().integer().min(0).required().messages({
    "number.min": "Available copies cannot be negative",
  }),

  shelfLocation: Joi.string().trim().required().messages({
    "string.empty": "Shelf location is required",
  }),

  summary: Joi.string().trim().allow("").optional(),
});

// For update (partial update allowed except restricted fields)
export const updateBookSchema = Joi.object({
  title: Joi.string().trim().optional(),
  author: Joi.string().trim().optional(),
  publisher: Joi.string().trim().optional(),
  genre: Joi.string().trim().optional(),
  publicationYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .optional(),

  totalCopies: Joi.number().integer().min(1).optional(),

  shelfLocation: Joi.string().trim().optional(),
  summary: Joi.string().trim().optional(),

  // Explicitly disallow updating isbn & availableCopies
  isbn: Joi.forbidden(),
  availableCopies: Joi.forbidden(),
});
