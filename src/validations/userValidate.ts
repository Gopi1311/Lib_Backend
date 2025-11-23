import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),

  role: Joi.string().valid("member", "librarian", "admin").default("member"),

  phone: Joi.string().allow("").optional(),

  address: Joi.string().allow("").optional(),

  membershipId: Joi.forbidden(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().optional(),

  // Email cannot be updated
  email: Joi.forbidden(),

  // Password cannot be updated here
  password: Joi.forbidden(),

  // Admin can change role
  role: Joi.string().valid("member", "librarian", "admin").optional(),

  phone: Joi.string().allow("").optional(),

  address: Joi.string().allow("").optional(),

  // Backend will keep existing membershipId
  membershipId: Joi.forbidden(),
});

