import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError";
import mongoose from "mongoose";

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  console.error("🔥 Error:", err);

  // Handle AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  //Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      status: "fail",
      message: `Invalid ${err.path}: '${err.value}'`,
    });
  }
  //  Mongoose DocumentNotFoundError
  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return res.status(404).json({
      status: "fail",
      message: "Document not found",
    });
  }

  // Handle Duplicate Key Error
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 11000
  ) {
    return res.status(409).json({
      status: "fail",
      message: "Duplicate value exists",
    });
  }

  // Unknown error → 500
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
}
