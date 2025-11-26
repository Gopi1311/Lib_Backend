import { Request, Response } from "express";
import authService from "../services/AuthService";
import { catchAsync } from "../utils/errors/catchAsync";
import { accessTokenCookie, refreshTokenCookie } from "../utils/cookies";
import { AppError } from "../utils/errors/AppError";

export class AuthController {
  /* ------------------------ LOGIN ------------------------ */
  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
      throw new AppError("Email and password required", 400);
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password
    );
    res
      .cookie("accessToken", accessToken, accessTokenCookie)
      .cookie("refreshToken", refreshToken, refreshTokenCookie)
      .status(200)
      .json({
        message: "Logged in successfully",
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          accessToken,
          refreshToken
        },
      });
  });

  /* ---------------------- REFRESH TOKEN ---------------------- */
  static refresh = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    const { newAccessToken } = await authService.refresh(token);
    res
      .cookie("accessToken", newAccessToken, accessTokenCookie)
      .json({ message: "Token refreshed" });
  });

  /* ------------------------ LOGOUT ------------------------ */
  static logout = catchAsync(async (_req: Request, res: Response) => {
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ message: "Logged out successfully" });
  });
}
