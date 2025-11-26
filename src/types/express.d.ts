import type { JwtPayload } from "../utils/jwt"; // adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // whatever you store in req.user
    }
  }
}

export {};
