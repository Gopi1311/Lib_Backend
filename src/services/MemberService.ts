import { Borrow } from "../models/Borrow";
import { Reservation } from "../models/Reservation";
import { FinePayment } from "../models/FinedPayment";
import timeAgo from "../utils/timeAgo";
import mongoose from "mongoose";

class MemberService {
  async fetchMemberStats(userId: string) {
    const activeBorrows = await Borrow.countDocuments({
      userId,
      status: { $ne: "returned" },
    });

    const reservations = await Reservation.countDocuments({
      userId,
      status: "active",
    });

    const fineRow =
      (
        await FinePayment.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
      )[0]?.total || 0;

    const totalBorrowed = await Borrow.countDocuments({ userId });

    return {
      activeBorrows,
      reservations,
      fines: fineRow,
      totalBorrowed,
    };
  }

  async fetchMemberRecentActivities(userId: string) {
    const borrowRows = await Borrow.find({ userId })
      .populate("bookId", "title")
      .sort({ updatedAt: -1 })
      .lean();

    const borrowActivities = borrowRows.map((b) => {
      const date =
        b.status === "returned" && b.returnDate ? b.returnDate : b.issueDate;

      return {
        type: b.status === "returned" ? "return" : "borrow",
        book: (b.bookId as any)?.title || "Unknown Book",
        date,
        time: timeAgo(new Date(date)),
      };
    });

    const reservationRows = await Reservation.find({ userId })
      .populate("bookId", "title")
      .sort({ updatedAt: -1 })
      .lean();

    const reservationActivities = reservationRows.map((r) => ({
      type: "reservation",
      book: (r.bookId as any)?.title || "Unknown Book",
      date: r.createdAt,
      time: timeAgo(new Date(r.createdAt)),
    }));

    return [...borrowActivities, ...reservationActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }
}

export default new MemberService();
