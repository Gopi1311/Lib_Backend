import { Request, Response } from "express";
import memberService from "../services/MemberService";
import { catchAsync } from "../utils/errors/catchAsync";


export class MemberController {
  static getStats = catchAsync(async (req:Request, res:Response) => {
   
    const stats = await memberService.fetchMemberStats(req.user.id);
    res.status(200).json(stats);
  });

  static getRecentActivities = catchAsync(async (req:Request, res:Response) => {
    const activities = await memberService.fetchMemberRecentActivities(req.user.id);
    res.status(200).json({ activities });
  });
}
