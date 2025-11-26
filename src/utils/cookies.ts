import type { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";

export const accessTokenCookie: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  maxAge: 2 * 60 * 1000, 
};

export const refreshTokenCookie: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};
