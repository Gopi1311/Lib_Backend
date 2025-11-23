import mongoose from "mongoose";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { getPagination } from "../utils/pagination";

class ReviewService {

  /* --------------------------------------------------
   * ADD REVIEW
   * -------------------------------------------------- */
  async addReview(data: any) {
    const { userId, bookId, rating, review } = data;

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "User not found" };

    const book = await Book.findById(bookId);
    if (!book) throw { status: 404, message: "Book not found" };

    const existing = await Review.findOne({ userId, bookId });
    if (existing) {
      throw { status: 400, message: "You already reviewed this book" };
    }

    const newReview = await Review.create({
      userId,
      bookId,
      rating,
      review,
    });

    return {
      message: "Review added successfully",
      review: newReview,
    };
  }

  /* --------------------------------------------------
   * UPDATE REVIEW
   * -------------------------------------------------- */
  async updateReview(id: string, data: any) {
    const { rating, review } = data;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, review },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      throw { status: 404, message: "Review not found" };
    }

    return {
      message: "Review updated successfully",
      updated: updatedReview,
    };
  }

  /* --------------------------------------------------
   * DELETE REVIEW
   * -------------------------------------------------- */
  async deleteReview(id: string) {
    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      throw { status: 404, message: "Review not found" };
    }

    return {
      message: "Review deleted successfully",
      deleted,
    };
  }

  /* --------------------------------------------------
   * GET REVIEWS BY BOOK
   * -------------------------------------------------- */
  async getReviewsByBook(bookId: string, query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-createdAt");

    const total = await Review.countDocuments({ bookId });

    const reviews = await Review.find({ bookId })
      .populate("userId", "name email")
      .select("rating review createdAt userId")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: reviews,
    };
  }

  /* --------------------------------------------------
   * GET ALL REVIEWS
   * -------------------------------------------------- */
  async getAllReviews(query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-createdAt");

    const total = await Review.countDocuments();

    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .select("rating review createdAt userId bookId")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: reviews,
    };
  }

  /* --------------------------------------------------
   * GET REVIEWS BY USER
   * -------------------------------------------------- */
  async getReviewsByUser(userId: string, query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-createdAt");

    const total = await Review.countDocuments({ userId });

    const reviews = await Review.find({ userId })
      .populate("bookId", "title author isbn")
      .select("rating review createdAt bookId")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: reviews,
    };
  }
}

export default new ReviewService();
