import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IUser } from "./User";
import { IBook } from "./Book";

export interface IBorrow extends Document {
  userId: Types.ObjectId | IUser;      
  bookId: Types.ObjectId | IBook;     
  issueDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: "issued" | "returned" | "late";
  fine: number;
  createdAt: Date;
  updatedAt: Date;
}


const BorrowSchema = new Schema<IBorrow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    issueDate: {
      type: Date,
      default: () => new Date(),
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["issued", "returned", "late"],
      default: "issued",
    },

    fine: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Borrow: Model<IBorrow> = mongoose.model("Borrow", BorrowSchema);

