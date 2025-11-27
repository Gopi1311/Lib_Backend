import bcrypt from "bcrypt";
import { User, IUser } from "../models/User";
import { AppError } from "../utils/errors/AppError";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export class AuthService {

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).lean<IUser & { _id: string }>();
    if (!user) throw new AppError("User not found", 401);

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) throw new AppError("Invalid email or password", 401);

    const payload = { id: user._id.toString(), role: user.role } as const;

    return {
      user,
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new AppError("Refresh token missing", 401);

    const payload = verifyRefreshToken(refreshToken);
    console.log("refresh token:",payload);
     const { exp, iat, ...cleanPayload } = payload;
    return {
      newAccessToken: generateAccessToken(cleanPayload),
    };
  }
}

export default new AuthService();
