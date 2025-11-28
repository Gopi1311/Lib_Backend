import { User } from "../models/User";
import { Book } from "../models/Book";
import { Borrow } from "../models/Borrow";
import { Reservation } from "../models/Reservation";
import { FinePayment } from "../models/FinedPayment";
import timeAgo from "../utils/timeAgo";

class AdminService {
  /* ------------------ FETCH ADMIN STATS ------------------ */
  async fetchAdminStats() {
    const totalBooks =
      (
        await Book.aggregate([
          { $group: { _id: null, totalCopies: { $sum: "$totalCopies" } } },
        ])
      )[0]?.totalCopies || 0;

    const totalCustomers = await User.countDocuments({
      role: { $ne: "admin" },
    });

    const activeBorrows = await Borrow.countDocuments({
      status: { $ne: "returned" },
    });

    const pendingReservations = await Reservation.countDocuments({
      status: "active",
    });

    const totalFines =
      (
        await FinePayment.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
      )[0]?.total || 0;

    return {
      totalBooks,
      totalCustomers,
      activeBorrows,
      pendingReservations,
      totalFines,
    };
  }

  /* ------------------ RECENT ACTIVITIES ------------------ */
  async fetchRecentActivities() {
    /* ---------- BORROW + RETURN ---------- */
    const borrowRows = await Borrow.find()
      .populate("userId", "name")
      .populate("bookId", "title")
      .sort({ updatedAt: -1 })
      .lean();

    const borrowActivities = borrowRows.map((b) => {
      const activityDate =
        b.status === "returned" && b.returnDate ? b.returnDate : b.issueDate;

      return {
        type: b.status === "returned" ? "return" : "borrow",
        user: (b.userId as any)?.name || "Unknown User",
        book: (b.bookId as any)?.title || "Unknown Book",
        date: activityDate,
        time: timeAgo(new Date(activityDate)),
      };
    });

    /* ---------- RESERVATION ACTIVITIES ---------- */
    const reservationRows = await Reservation.find()
      .populate("userId", "name")
      .populate("bookId", "title")
      .sort({ updatedAt: -1 })
      .lean();

    const reservationActivities = reservationRows.map((r) => ({
      type: "reservation",
      user: (r.userId as any)?.name || "Unknown User",
      book: (r.bookId as any)?.title || "Unknown Book",
      date: r.createdAt,
      time: timeAgo(new Date(r.createdAt)),
    }));

    /* ---------- MERGE + SORT + LIMIT ---------- */
    return [...borrowActivities, ...reservationActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  async fetchChartDatas() {
    const borrowStatusCount = await Borrow.aggregate([
      {
        $match: {
          issueDate: {
            $gte: new Date("2025-11-24T00:00:00.000Z"),
            $lte: new Date("2025-11-24T23:59:59.999Z"),
          },
        },
      },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    const reservationStatusCount = await Reservation.aggregate([
      {
        $match: {
          reservedDate: {
            $gte: new Date("2025-11-24T00:00:00.000Z"),
            $lte: new Date("2025-11-24T23:59:59.999Z"),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      borrowStatusCount,
      reservationStatusCount,
    };
  }
}

export default new AdminService();
