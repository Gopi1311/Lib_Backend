import mongoose from "mongoose";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { getPagination } from "../utils/pagination";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

interface AddReviewFields {
  userId: string;
  bookId: string;
  rating: number;
  review: string;
}

interface UpdateReviewFields {
  rating?: number;
  review?: string;
}

class ReviewService {
  async addReview(data: unknown) {
    assertIsObject(data, "Invalid request body");

    const body = data as Partial<AddReviewFields>;
    const required = ["userId", "bookId", "rating", "review"] as const;

    for (const field of required) {
      if (body[field] == null) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    const { userId, bookId, rating, review } = body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // Validate book
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);

    // Check duplicate review
    const existing = await Review.findOne({ userId, bookId });
    if (existing) {
      throw new AppError("You already reviewed this book", 400);
    }

    try {
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
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async updateReview(id: string, data: unknown) {
    assertIsObject(data, "Invalid request body");

    const body = data as UpdateReviewFields;
    const updateData: UpdateReviewFields = {};

    if (body.rating != null) updateData.rating = body.rating;
    if (body.review != null) updateData.review = body.review;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No fields provided to update", 400);
    }

    try {
      const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedReview) {
        throw new AppError("Review not found", 404);
      }

      return {
        message: "Review updated successfully",
        updated: updatedReview,
      };
    } catch (err:unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }
  async deleteReview(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid review ID", 400);
    }

    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError("Review not found", 404);
    }

    return {
      message: "Review deleted successfully",
      deleted,
    };
  }

  async getReviewsByBook(bookId: string, query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const q = query as Record<string, unknown>;
    const { page, limit, skip, sort } = getPagination(q, "-createdAt");

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

  async getAllReviews(query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const q = query as Record<string, unknown>;
    const { page, limit, skip, sort } = getPagination(q, "-createdAt");

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

  async getReviewsByUser(userId: string, query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const q = query as Record<string, unknown>;
    const { page, limit, skip, sort } = getPagination(q, "-createdAt");

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
