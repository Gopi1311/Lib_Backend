import { Router } from "express";
import { BorrowBookController } from "../controller/BorrowBookController";
import { validate } from "../middleware/validate";
import {
  addBorrowSchema,
  updateBorrowStatusSchema,
} from "../validations/borrowValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();
router.get("/history",requireAuth,requireRole(["admin"]), BorrowBookController.getBorrowHistory);
router.get("/outstanding",requireAuth,requireRole(["admin"]), BorrowBookController.getOutStandingFine);
router.get("/user/outstanding/me",requireAuth,requireRole(["member"]),BorrowBookController.getOutStandingFineByUser)
router.get("/details/:id",requireAuth, BorrowBookController.getBorrowDetailsById);
router.get("/user/me",requireAuth,requireRole(["member"]), BorrowBookController.getBorrowDetailsByUser);

router.post(
  "/", requireAuth,requireRole(["admin"]),
  validate(addBorrowSchema), 
  BorrowBookController.addBorrowBook
);

router.patch(
  "/:id",requireAuth,requireRole(["admin"]),
  validate(updateBorrowStatusSchema),
  BorrowBookController.updateBorrowStatus
);

export default router;  
