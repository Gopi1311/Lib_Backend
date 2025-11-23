import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReservation extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  reservedDate: Date;
  expiryDate: Date;
  status: "active" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
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

    reservedDate: {
      type: Date,
      default: () => new Date(),
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Reservation: Model<IReservation> = mongoose.model<IReservation>(
  "Reservation",
  ReservationSchema
);
