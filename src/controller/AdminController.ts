import { Request, Response } from "express";
import adminStatsService from "../services/AdminService";
import { catchAsync } from "../utils/errors/catchAsync";

export class AdminController {
  
  static fetchAdminStats = catchAsync(
    async (req: Request, res: Response) => {
      const stats = await adminStatsService.fetchAdminStats();
      res.status(200).json(stats);
    }
  );

  static fetchRecentActivities = catchAsync(
    async (req: Request, res: Response) => {
      const activities = await adminStatsService.fetchRecentActivities();
      res.status(200).json({ recentActivities: activities });
    }
  );
}
 