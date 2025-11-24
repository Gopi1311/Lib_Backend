import mongoose from "mongoose";
import { FinePayment } from "../models/FinedPayment";
import { Borrow } from "../models/Borrow";
import { User } from "../models/User";
import { getPagination } from "../utils/pagination";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

interface PayFineFields {
  userId: string;
  borrowId: string;
  amount: number;
  method: string;
}

class FinePaymentService {
  async payFine(data: unknown) {
    assertIsObject(data, "Invalid request body");
    const body = data as Partial<PayFineFields>;

    // Required field validation
    const required = ["userId", "borrowId", "amount", "method"] as const;
    for (const field of required) {
      if (!body[field]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    const { userId, borrowId, amount, method } = body;

    // Validate user
    const user = await User.findById(userId).select("name email");
    if (!user) throw new AppError("User not found", 404);

    // Validate borrow
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) throw new AppError("Borrow record not found", 404);

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
      // Create payment
      const payment = await FinePayment.create({
        userId,
        borrowId,
        amount,
        method,
        paymentDate: new Date(),
      });

      // Update borrow record
      borrow.fine = 0;
      borrow.status = "returned";
      borrow.returnDate = new Date();
      await borrow.save();

      return {
        message: "Fine payment successful",
        payment,
      };
    } catch (err:unknown) {
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

    const pagination = getPagination(
      query as Record<string, unknown>,
      "-paymentDate"
    );
    const { page, limit, skip, sort } = pagination;

    const total = await FinePayment.countDocuments({ userId });

    const payments = await FinePayment.find({ userId })
      .populate("borrowId", "issueDate dueDate status fine")
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

    const pagination = getPagination(
      query as Record<string, unknown>,
      "-paymentDate"
    );

    const { page, limit, skip, sort } = pagination;

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
