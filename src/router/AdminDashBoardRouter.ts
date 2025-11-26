import { Router } from "express";
import { AdminController } from "../controller/AdminController";
const router = Router();

router.get("/stats",AdminController.fetchAdminStats );
router.get("/recent-activities",AdminController.fetchRecentActivities);

export default router;
