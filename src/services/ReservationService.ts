import mongoose from "mongoose";
import { Reservation } from "../models/Reservation";
import { Borrow } from "../models/Borrow";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { getPagination } from "../utils/pagination";

class ReservationService {
  
  /* --------------------------------------------------
   * RESERVE A BOOK
   * -------------------------------------------------- */
  async reserveBook(data: any) {
    const { userId, bookId } = data;

    const user = await User.findById(userId).select("name email");
    if (!user) throw { status: 404, message: "User not found." };

    const book = await Book.findById(bookId).select("title availableCopies");
    if (!book) throw { status: 404, message: "Book not found." };

    // Already reserved?
    const existingReservation = await Reservation.findOne({
      userId,
      bookId,
      status: "active",
    });

    if (existingReservation) {
      throw { status: 400, message: "You already reserved this book." };
    }

    // Already borrowed?
    const alreadyIssued = await Borrow.findOne({
      userId,
      bookId,
      status: { $in: ["issued", "late"] },
    });

    if (alreadyIssued) {
      throw {
        status: 400,
        message: "You already borrowed this book. Cannot reserve.",
      };
    }

    const reservedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(reservedDate.getDate() + 2);

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
  }

  /* --------------------------------------------------
   * GET ALL RESERVATIONS (ADMIN)
   * -------------------------------------------------- */
  async getAllReservations(query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-reservedDate");

    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = query.userId;
    if (query.bookId) filter.bookId = query.bookId;

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

  /* --------------------------------------------------
   * GET USER-SPECIFIC RESERVATIONS
   * -------------------------------------------------- */
  async getUserReservations(userId: string, query: any) {
    const { page, limit, skip, sort } = getPagination(query, "-reservedDate");

    const filter: Record<string, any> = { userId };

    if (query.status) filter.status = query.status;

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

  /* --------------------------------------------------
   * CANCEL A RESERVATION
   * -------------------------------------------------- */
  async cancelReservation(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid reservation ID" };
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) throw { status: 404, message: "Reservation not found." };

    if (reservation.status !== "active") {
      throw {
        status: 400,
        message: `Cannot cancel reservation with status '${reservation.status}'.`,
      };
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
