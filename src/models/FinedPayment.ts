import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFinePayment extends Document {
  userId: Types.ObjectId;
  borrowId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  method: "cash" | "card" | "online";
  createdAt: Date;
  updatedAt: Date;
}

const FinePaymentSchema = new Schema<IFinePayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    borrowId: {
      type: Schema.Types.ObjectId,
      ref: "Borrow",
      required: [true, "Borrow record ID is required"],
      index: true,
    },

    amount: {  
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Amount must be more than 0"],
    },

    paymentDate: {
      type: Date,
      default: () => new Date(),
    },

    method: {
      type: String,
      enum: ["cash", "card", "online"],
      required: [true, "Payment method is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const FinePayment: Model<IFinePayment> = mongoose.model<IFinePayment>(
  "FinePayment",
  FinePaymentSchema
);
