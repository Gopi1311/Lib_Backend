import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface JWTPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (payload: JWTPayload) =>
  jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES,
  });  

export const generateRefreshToken = (payload: JWTPayload) =>
  jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES,
  });

export const verifyAccessToken = (token: string): JWTPayload =>
  jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;

export const verifyRefreshToken = (token: string): JWTPayload =>
  jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
