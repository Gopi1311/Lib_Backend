import mongoose from "mongoose";
import { Borrow } from "../models/Borrow";
import { Book } from "../models/Book";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";
import { ALLOWED_BORROW_STATUS, BorrowStatus } from "../types/borrowStatus";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

interface BorrowCreateFields {
  userId: string;
  bookId: string;
  days?: number;
}

class BorrowService {
  async addBorrowBook(data: unknown) {
    assertIsObject(data, "Invalid request body");

    const body = data as Partial<BorrowCreateFields>;

    // Validate required fields
    if (!body.userId || !body.bookId) {
      throw new AppError("userId and bookId are required.", 400);
    }

    const { userId, bookId, days = 14 } = body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found.", 404);

    // Validate book
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found.", 404);

    if (book.availableCopies < 1) {
      throw new AppError("No available copies.", 400);
    }

    // Prevent issuing same book twice
    const alreadyIssued = await Borrow.findOne({
      userId,
      bookId,
      status: { $in: ["issued", "late"] },
    });

    if (alreadyIssued) {
      throw new AppError(
        "User already borrowed this book and not returned yet.",
        400
      );
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + days);

    try {
      const borrowRecord = await Borrow.create({
        userId,
        bookId,
        issueDate,
        dueDate,
        returnDate: null,
        status: "issued",
        fine: 0,
      });

      // Update book availability
      book.availableCopies -= 1;
      await book.save();

      // Auto-complete active reservation if exists
      await Reservation.findOneAndUpdate(
        { userId, bookId, status: "active" },
        { status: "completed" }
      );

      return {
        message: "Book issued successfully",
        borrowRecord,
      };
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async updateBorrowStatus(id: string, status: unknown) {
    if (typeof status !== "string") {
      throw new AppError("Invalid status format", 400);
    }

    if (!ALLOWED_BORROW_STATUS.includes(status as BorrowStatus)) {
      throw new AppError(
        `Invalid status. Allowed: ${ALLOWED_BORROW_STATUS.join(", ")}`,
        400
      );
    }

    const newStatus = status as BorrowStatus;

    const borrow = await Borrow.findById(id);
    if (!borrow) throw new AppError("Borrow record not found.", 404);

    if (borrow.status === "returned" && newStatus === "returned") {
      throw new AppError("Borrow already returned.", 400);
    }

    if (newStatus === "returned" && borrow.fine > 0) {
      throw new AppError(
        `Fine of ₹${borrow.fine} must be paid before return.`,
        400
      );
    }

    // Update status
    borrow.status = newStatus;

    // Return book
    if (newStatus === "returned") {
      borrow.returnDate = new Date();

      const book = await Book.findById(borrow.bookId);
      if (!book) throw new AppError("Book not found.", 404);

      book.availableCopies += 1;
      await book.save();
    }

    await borrow.save();

    return {
      message: "Borrow status updated successfully",
      updated: borrow,
    };
  }

  async getBorrowDetailsByUser(id: string) {
    const borrowDetails = await Borrow.find({ userId: id })
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine bookId")
      .sort({ issueDate: -1 })
      .lean();

    return borrowDetails;
  }

  async getBorrowHistory() {
    const borrowDetails = await Borrow.find()
      .populate("userId", "name email role phone")
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine userId bookId")
      .sort({ issueDate: -1 })
      .lean();

    return { borrowDetails };
  }

  async getBorrowDetailsById(id: string) {
    const borrow = await Borrow.findById(id)
      .populate("userId", "name email role phone")
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine userId bookId")
      .lean();

    if (!borrow) throw new AppError("Borrow record not found", 404);

    return borrow;
  }

  async getOutStandingFine() {
    const outstanding = await Borrow.find({ fine: { $gt: 0 } })
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .lean();

    return {
      total: outstanding.length,
      data: outstanding,
    };
  }

  async getOutStandingFineByUser(id: string) {
    console.log("Fetching outstanding fines for user:", id);

    const outstanding = await Borrow.find({
      userId: id,
      fine: { $gt: 0 },
      status: { $ne: "returned" },
    })
      .populate("bookId", "title author")
      .lean();

    return { data: outstanding };
  }
}

export default new BorrowService();
