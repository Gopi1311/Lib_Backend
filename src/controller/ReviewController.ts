import { Request, Response } from "express";
import reviewService from "../services/ReviewService";
import { catchAsync } from "../utils/errors/catchAsync";

export class ReviewController {

  static addReview = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.addReview(req.body);
    res.status(201).json(result);
  });

  static updateReview = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.updateReview(req.params.id, req.body);
    res.status(200).json(result);
  });

  static deleteReview = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.deleteReview(req.params.id);
    res.status(200).json(result);
  });

  static getReviewsByBook = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.getReviewsByBook(
      req.params.bookId,
      req.query
    );
    res.status(200).json(result);
  });

  static getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.getAllReviews(req.query);
    res.status(200).json(result);
  });

  static getReviewsByUser = catchAsync(async (req: Request, res: Response) => {
    const result = await reviewService.getReviewsByUser(
      req.params.userId,
      req.query
    );
    res.status(200).json(result);
  });

}
