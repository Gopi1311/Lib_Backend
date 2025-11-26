import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors/AppError";
import { JWTPayload } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  console.log("token: ",token);

  if (!token) {
    throw new AppError("Not authenticated", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
};
