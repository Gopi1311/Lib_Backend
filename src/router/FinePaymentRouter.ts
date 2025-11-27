import { Router } from "express";
import { FinePaymentController } from "../controller/FinePaymentController";
import { validate } from "../middleware/validate";
import {
  payFineSchema,
  finePaymentQuerySchema,
  finePaymentIdSchema,
} from "../validations/finePaymentValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.post(
  "/pay-fine",requireAuth,requireRole(["admin","member"]),
  validate(payFineSchema),
  FinePaymentController.payFine
);

router.get(
  "/history",requireAuth,requireRole(["admin"]),
  validate(finePaymentQuerySchema),
  FinePaymentController.getPaymentHistory
);

router.get(
  "/user/me",requireAuth,
  validate(finePaymentIdSchema),
  FinePaymentController.getPaymentsByUser
);

router.get(
  "/:id",requireAuth,
  validate(finePaymentIdSchema),
  FinePaymentController.getPaymentById
);

export default router;
