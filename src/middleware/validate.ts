import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error ,value} = schema.validate(req.body, {
      abortEarly: false, 
      allowUnknown: false, 
      stripUnknown: true,  
    });

    if (error) {
      return res.status(400).json({
        error: error.details.map((d) => d.message),
      });
    }
      req.body = value; 
    next();
  };
};