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

const router = Router();

router.post("/", validate(addReviewSchema), ReviewController.addReview);

router.get("/all", ReviewController.getAllReviews);

router.get(
  "/book/:bookId",
  validate(reviewBookParamSchema),
  ReviewController.getReviewsByBook
);

router.get(
  "/user/:userId",
  validate(reviewUserParamSchema),
  ReviewController.getReviewsByUser
);

router.put(
  "/:id",
  validate(reviewIdParamSchema),
  validate(updateReviewSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  validate(reviewIdParamSchema),
  ReviewController.deleteReview
);

export default router;
