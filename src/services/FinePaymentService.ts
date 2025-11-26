import mongoose from "mongoose";
import { FinePayment } from "../models/FinedPayment";
import { Borrow } from "../models/Borrow";
import { getPagination } from "../utils/pagination";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

class FinePaymentService {
  async payFine(data: unknown) {
    assertIsObject(data, "Invalid request body");

    const body = data as {
      borrowId?: string;
      amount?: number;
      method?: string;
    };

    const required = ["borrowId", "amount", "method"] as const;
    for (const field of required) {
      if (!body[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    const { borrowId, amount } = body;
    const method = body.method as "cash" | "card" | "online";

    const role = "admin";

    if (method === "cash" && role !== "admin") {
      throw new AppError("Only admin can accept cash payments", 403);
    }

    if (!["cash", "card", "online"].includes(method)) {
      throw new AppError("Invalid payment method", 400);
    }

    const borrow = await Borrow.findById(borrowId).populate(
      "userId",
      "_id name email"
    );

    if (!borrow) throw new AppError("Borrow record not found", 404);

    const userId =
      typeof borrow.userId === "object" && "_id" in borrow.userId
        ? borrow.userId._id
        : borrow.userId;

    if (borrow.fine <= 0) {
      throw new AppError("No outstanding fine for this borrow record.", 400);
    }

    if (amount !== borrow.fine) {
      throw new AppError(
        `Full fine amount required. Outstanding fine: ${borrow.fine}`,
        400
      );
    }

    try {
      const payment = await FinePayment.create({
        userId,
        borrowId,
        amount,
        method,
        paymentDate: new Date(),
      });

      // Update borrow status
      borrow.fine = 0;
      borrow.status = "returned";
      borrow.returnDate = new Date();
      await borrow.save();

      return { message: "Fine payment successful", payment };
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async getPaymentsByUser(userId: string, query: unknown) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    assertIsObject(query, "Invalid query parameters");

    const { page, limit, skip, sort } = getPagination(
      query as Record<string, unknown>,
      "-paymentDate"
    );

    const total = await FinePayment.countDocuments({ userId });

    const payments = await FinePayment.find({ userId })
      .populate({
        path: "borrowId",
        select: "issueDate dueDate status fine",
        populate: [{ path: "bookId", select: "title author" }],
      })
      .select("amount method paymentDate borrowId")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: payments,
    };
  }

  async getPaymentHistory(query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const { page, limit, skip, sort } = getPagination(
      query as Record<string, unknown>,
      "-paymentDate"
    );

    const total = await FinePayment.countDocuments();

    const payments = await FinePayment.find()
      .populate("userId", "name email phone role")
      .populate({
        path: "borrowId",
        select: "issueDate dueDate status fine",
        populate: [{ path: "bookId", select: "title author" }],
      })
      .select("userId borrowId amount method paymentDate")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: payments,
    };
  }

  async getPaymentById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid payment ID", 400);
    }

    const payment = await FinePayment.findById(id)
      .populate("userId", "name email")
      .populate("borrowId", "issueDate dueDate fine status")
      .lean();

    if (!payment) {
      throw new AppError("Fine payment not found", 404);
    }

    return payment;
  }
}

export default new FinePaymentService();
