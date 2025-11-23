import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL);
    console.log("🚀 MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  }
};
