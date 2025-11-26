import { Router } from "express";
import { MemberController } from "../controller/MemberController";
const router = Router();

router.get("/stats/:id", MemberController.getStats);
router.get("/recent-activities/:id", MemberController.getRecentActivities);

export default router;
