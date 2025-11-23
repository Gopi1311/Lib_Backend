import { Router } from "express";
import { ReservationController } from "../controller/ReservationController";
import { validate } from "../middleware/validate";
import {
  reserveBookSchema,
  cancelReservationSchema,
  reservationQuerySchema,
} from "../validations/reservationValidate";

const router = Router();

router.get(
  "/",
  validate(reservationQuerySchema),
  ReservationController.getAllReservations
);

router.get(
  "/user/:id",
  validate(reservationQuerySchema),
  ReservationController.getUserReservations
);

router.post(
  "/",
  validate(reserveBookSchema),
  ReservationController.reserveBook
);

router.patch(
  "/:id/cancel",
  validate(cancelReservationSchema),
  ReservationController.cancelReservation
);

export default router;
