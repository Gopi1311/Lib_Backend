import { Router } from "express";
import { ReviewController } from "../controller/ReviewController";
import { validate } from "../middleware/validate";

import {
  addReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  reviewBookParamSchema,
  reviewUserParamSchema,
} from "../validations/reviewValidate";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/roles";

const router = Router();

router.post("/",requireAuth,requireRole(["member"]), validate(addReviewSchema), ReviewController.addReview);

router.get("/all",requireAuth,requireRole(["admin"]), ReviewController.getAllReviews);

router.get(
  "/book/:bookId",requireAuth,requireRole(["admin","member"]),
  validate(reviewBookParamSchema),
  ReviewController.getReviewsByBook
);

router.get(
  "/user/me",requireAuth,requireRole(["member"]),
  validate(reviewUserParamSchema),
  ReviewController.getReviewsByUser
);

router.put(
  "/:id",requireAuth,requireRole(["member"]),
  validate(reviewIdParamSchema),
  validate(updateReviewSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",requireAuth,requireRole(["member"]),
  validate(reviewIdParamSchema),
  ReviewController.deleteReview
);

export default router;
