import mongoose from "mongoose";
import { FinePayment } from "../models/FinedPayment";
import { Borrow } from "../models/Borrow";
import { User } from "../models/User";
import { getPagination } from "../utils/pagination";

class FinePaymentService {

  /* --------------------------------------------------
   * PAY FINE
   * -------------------------------------------------- */
  async payFine(data: any) {
    const { userId, borrowId, amount, method } = data;

    const user = await User.findById(userId).select("name email");
    if (!user) throw { status: 404, message: "User not found" };

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) throw { status: 404, message: "Borrow record not found" };

    if (borrow.fine <= 0) {
      throw { status: 400, message: "No outstanding fine for this borrow record." };
    }

    if (amount !== borrow.fine) {
      throw {
        status: 400,
        message: `Full fine amount required. Outstanding fine: ${borrow.fine}`,
      };
    }

    const payment = await FinePayment.create({
      userId,
      borrowId,
      amount,
      method,
      paymentDate: new Date(),
    });

    // Update Borrow record
    borrow.fine = 0;
    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    return {
      message: "Fine payment successful",
      payment,
    };
  }

  /* --------------------------------------------------
   * GET PAYMENTS BY USER
   * -------------------------------------------------- */
  async getPaymentsByUser(userId: string, query: any) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw { status: 400, message: "Invalid user ID" };
    }

    const { page, limit, skip, sort } = getPagination(query, "-paymentDate");

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

  /* --------------------------------------------------
   * GET ALL PAYMENT HISTORY
   * -------------------------------------------------- */
  async getPaymentHistory(query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-paymentDate");

    const total = await FinePayment.countDocuments();

    const payments = await FinePayment.find()
      .populate("userId", "name email phone role")
      .populate({
        path: "borrowId",
        select: "issueDate dueDate status fine",
        populate: [
          { path: "bookId", select: "title author" },
        ]
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

  /* --------------------------------------------------
   * GET PAYMENT BY ID
   * -------------------------------------------------- */
  async getPaymentById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid payment ID" };
    }

    const payment = await FinePayment.findById(id)
      .populate("userId", "name email")
      .populate("borrowId", "issueDate dueDate fine status")
      .lean();

    if (!payment) throw { status: 404, message: "Fine payment not found" };

    return payment;
  }
}

export default new FinePaymentService();
