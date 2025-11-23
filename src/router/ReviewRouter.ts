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

/* -----------------------------------------
 * 1️⃣ Create Review
 * ----------------------------------------- */
router.post(
  "/",
  validate(addReviewSchema),
  ReviewController.addReview
);

/* -----------------------------------------
 * 2️⃣ Get All Reviews
 * ----------------------------------------- */
router.get(
  "/all",
  ReviewController.getAllReviews
);

/* -----------------------------------------
 * 3️⃣ Get Reviews By Book
 * ----------------------------------------- */
router.get(
  "/book/:bookId",
  validate(reviewBookParamSchema),
  ReviewController.getReviewsByBook
);

/* -----------------------------------------
 * 4️⃣ Get Reviews By User
 * ----------------------------------------- */
router.get(
  "/user/:userId",
  validate(reviewUserParamSchema),
  ReviewController.getReviewsByUser
);

/* -----------------------------------------
 * 5️⃣ Update Review
 * ----------------------------------------- */
router.put(
  "/:id",
  validate(reviewIdParamSchema),
  validate(updateReviewSchema),
  ReviewController.updateReview
);

/* -----------------------------------------
 * 6️⃣ Delete Review
 * ----------------------------------------- */
router.delete(
  "/:id",
  validate(reviewIdParamSchema),
  ReviewController.deleteReview
);

export default router;
