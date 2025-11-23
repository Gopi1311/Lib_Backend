import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
      index: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    review: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  ReviewSchema
);
