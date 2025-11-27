import { Router } from "express";
import { AdminController } from "../controller/AdminController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";
const router = Router();

router.get("/stats",requireAuth,requireRole(["admin"]),AdminController.fetchAdminStats );
router.get("/recent-activities",requireAuth,requireRole(["admin"]),AdminController.fetchRecentActivities);

export default router;
