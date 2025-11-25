import { Router } from "express";
import { BorrowBookController } from "../controller/BorrowBookController";
import { validate } from "../middleware/validate";
import {
  addBorrowSchema,
  updateBorrowStatusSchema,
} from "../validations/borrowValidate";

const router = Router();
router.get("/history", BorrowBookController.getBorrowHistory);
router.get("/outstanding", BorrowBookController.getOutStandingFine);
router.get("/user/outstanding/:id",BorrowBookController.getOutStandingFineByUser)
router.get("/details/:id", BorrowBookController.getBorrowDetailsById);
router.get("/user/:id", BorrowBookController.getBorrowDetailsByUser);

router.post(
  "/", 
  validate(addBorrowSchema), 
  BorrowBookController.addBorrowBook
);

router.patch(
  "/:id",
  validate(updateBorrowStatusSchema),
  BorrowBookController.updateBorrowStatus
);

export default router;  
