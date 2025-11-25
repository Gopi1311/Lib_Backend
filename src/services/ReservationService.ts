import mongoose from "mongoose";
import { Reservation } from "../models/Reservation";
import { Borrow } from "../models/Borrow";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { getPagination } from "../utils/pagination";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

interface ReserveBookFields {
  userId: string;
  bookId: string;
}

class ReservationService {
    async reserveBook(data: unknown) {
      assertIsObject(data, "Invalid request body");

      const body = data as Partial<ReserveBookFields>;
      const { userId, bookId } = body;

      if (!userId || !bookId) {
        throw new AppError("userId and bookId are required.", 400);
      }

      // Validate user
      const user = await User.findById(userId).select("name email");
      if (!user) throw new AppError("User not found.", 404);

      // Validate book
      const book = await Book.findById(bookId).select("title availableCopies");
      if (!book) throw new AppError("Book not found.", 404);

      // Already reserved?
      const existingReservation = await Reservation.findOne({
        userId,
        bookId,
        status: "active",
      });

      if (existingReservation) {
        throw new AppError("You already reserved this book.", 400);
      }

      // Already borrowed?
      const alreadyIssued = await Borrow.findOne({
        userId,
        bookId,
        status: { $in: ["issued", "late"] },
      });

      if (alreadyIssued) {
        throw new AppError(
          "You already borrowed this book. Cannot reserve.",
          400
        );
      }

      const reservedDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(reservedDate.getDate() + 2);

      try {
        const reservation = await Reservation.create({
          userId,
          bookId,
          reservedDate,
          expiryDate,
          status: "active",
        });

        return {
          message: "Book reserved successfully",
          reservation,
        };
      } catch (err:unknown) {
        if (err instanceof mongoose.Error.ValidationError) {
          throw new AppError(err.message, 400);
        }
        throw err;
      }
    }

  async getAllReservations(query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const q = query as Record<string, unknown>;
    const { page, limit, skip, sort } = getPagination(q, "-reservedDate");

    const filter: Record<string, unknown> = {};

    if (q.status) filter.status = q.status;
    if (q.userId) filter.userId = q.userId;
    if (q.bookId) filter.bookId = q.bookId;

    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .populate("userId", "name email role phone")
      .populate("bookId", "title author isbn")
      .select("userId bookId reservedDate expiryDate status createdAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: reservations,
    };
  }

  async getUserReservations(userId: string, query: unknown) {
    assertIsObject(query, "Invalid query parameters");

    const q = query as Record<string, unknown>;
    const { page, limit, skip, sort } = getPagination(q, "-reservedDate");

    const filter: Record<string, unknown> = { userId };

    if (q.status) filter.status = q.status;

    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .populate("bookId", "title author isbn")
      .select("bookId reservedDate expiryDate status createdAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: reservations,
    };
  }

  async cancelReservation(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid reservation ID", 400);
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) throw new AppError("Reservation not found.", 404);

    if (reservation.status !== "active") {
      throw new AppError(
        `Cannot cancel reservation with status '${reservation.status}'.`,
        400
      );
    }

    reservation.status = "cancelled";
    await reservation.save();

    return {
      message: "Reservation cancelled successfully",
      reservation,
    };
  }
}

export default new ReservationService();
