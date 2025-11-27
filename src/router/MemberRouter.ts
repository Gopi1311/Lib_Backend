import { Router } from "express";
import { MemberController } from "../controller/MemberController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";
const router = Router();

router.get("/stats/me",requireAuth,requireRole(["member"]), MemberController.getStats);
router.get("/recent-activities/me",requireAuth,requireRole(["member"]), MemberController.getRecentActivities);

export default router;
  