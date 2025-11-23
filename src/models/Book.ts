import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  genre: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },

    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },

    publisher: {
      type: String,
      required: [true, "Publisher is required"],
      trim: true,
    },

    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },

    genre: {
      type: String,
      required: [true, "Genre is required"],
    },

    publicationYear: {
      type: Number,
      required: [true, "Publication year is required"],
      min: [1000, "Invalid year"],
      max: [
        new Date().getFullYear(),
        "Publication year cannot be in the future",
      ],
    },

    totalCopies: {
      type: Number,
      required: [true, "Total copies count is required"],
      min: [1, "A book must have at least 1 copy"],
    },

    availableCopies: {
      type: Number,
      required: true,
      min: [0, "Available copies cannot be negative"],
    },

    shelfLocation: {
      type: String,
      required: [true, "Shelf location is required"],
      trim: true,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Book: Model<IBook> = mongoose.model<IBook>("Book", BookSchema);
