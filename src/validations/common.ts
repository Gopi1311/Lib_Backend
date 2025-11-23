import Joi from "joi";
import { Types } from "mongoose";

export const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

export const paginationSchema = {
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).optional(),
  sort: Joi.string().optional(),
};

export const userIdSchema = objectId.optional();
export const bookIdSchema = objectId.optional();
export const borrowIdSchema = objectId.optional();
