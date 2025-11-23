import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "member" | "librarian" | "admin";
  phone: string;
  address: string;
  membershipId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["member", "librarian", "admin"],
      default: "member",
    },

    phone: {
      type: String,
      required: false,
      trim: true,
    },

    address: {
      type: String,
      required: false,
      trim: true,
    },
    membershipId: {
      type: String,
      unique: true,
      required: function (this: IUser): boolean {
        return this.role === "member";
      },
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
