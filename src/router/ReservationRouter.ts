import { Router } from "express";
import { ReservationController } from "../controller/ReservationController";
import { validate } from "../middleware/validate";
import {
  reserveBookSchema,
  cancelReservationSchema,
  reservationQuerySchema,
} from "../validations/reservationValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.get(
  "/",requireAuth,requireRole(["admin"]),
  validate(reservationQuerySchema),
  ReservationController.getAllReservations
);

router.get(
  "/user/me",requireAuth,requireRole(["member"]),
  validate(reservationQuerySchema),
  ReservationController.getUserReservations
);

router.post(
  "/",requireAuth,requireRole(["admin","member"]),
  validate(reserveBookSchema),
  ReservationController.reserveBook
);

router.patch(
  "/:id/cancel",requireAuth,requireRole(["admin","member"]),
  validate(cancelReservationSchema),
  ReservationController.cancelReservation
);
export default router;
