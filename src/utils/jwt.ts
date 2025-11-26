import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/env";

const ACCESS_SECRET =config.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = config.JWT_REFRESH_SECRET as string;

export interface JWTPayload {
  id: string;
  role: string;
}

const accessTokenOptions: SignOptions = {
  expiresIn: "15m",
};

const refreshTokenOptions: SignOptions = {
  expiresIn: "7d",
};

export const generateAccessToken = (payload: JWTPayload) =>
  jwt.sign(payload, ACCESS_SECRET, accessTokenOptions);

export const generateRefreshToken = (payload: JWTPayload) =>
  jwt.sign(payload, REFRESH_SECRET, refreshTokenOptions);

export const verifyAccessToken = (token: string): JWTPayload =>
  jwt.verify(token, ACCESS_SECRET) as JWTPayload;

export const verifyRefreshToken = (token: string): JWTPayload =>
  jwt.verify(token, REFRESH_SECRET) as JWTPayload;
