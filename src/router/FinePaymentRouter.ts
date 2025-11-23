import { Router } from "express";
import { FinePaymentController } from "../controller/FinePaymentController";
import { validate } from "../middleware/validate";
import {
  payFineSchema,
  finePaymentQuerySchema,
  finePaymentIdSchema,
} from "../validations/finePaymentValidate";

const router = Router();

router.post(
  "/pay-fine",
  validate(payFineSchema),
  FinePaymentController.payFine
);

router.get(
  "/history",
  validate(finePaymentQuerySchema),
  FinePaymentController.getPaymentHistory
);

router.get(
  "/user/:id",
  validate(finePaymentIdSchema),
  FinePaymentController.getPaymentsByUser
);

router.get(
  "/:id",
  validate(finePaymentIdSchema),
  FinePaymentController.getPaymentById
);

export default router;
