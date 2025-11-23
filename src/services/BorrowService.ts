import { Borrow } from "../models/Borrow";
import { Book } from "../models/Book";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";
import {
  ALLOWED_BORROW_STATUS,
  BorrowStatus,
} from "../types/borrowStatus";

class BorrowService {
  /* --------------------------------------------------
   * ISSUE / BORROW BOOK
   * -------------------------------------------------- */
  async addBorrowBook(data: any) {
    const { userId, bookId, days } = data;

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "User not found." };

    const book = await Book.findById(bookId);
    if (!book) throw { status: 404, message: "Book not found." };

    if (book.availableCopies < 1) {
      throw { status: 400, message: "No available copies." };
    }

    const alreadyIssued = await Borrow.findOne({
      userId,
      bookId,
      status: { $in: ["issued", "late"] },
    });

    if (alreadyIssued) {
      throw {
        status: 400,
        message: "User already borrowed this book and not returned yet.",
      };
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + (days || 14));

    const borrowRecord = await Borrow.create({
      userId,
      bookId,
      issueDate,
      dueDate,
      returnDate: null,
      status: "issued",
      fine: 0,
    });

    book.availableCopies -= 1;
    await book.save();

    await Reservation.findOneAndUpdate(
      { userId, bookId, status: "active" },
      { status: "completed" }
    );

    return {
      message: "Book issued successfully",
      borrowRecord,
    };
  }

  /* --------------------------------------------------
   * UPDATE BORROW STATUS
   * -------------------------------------------------- */
  async updateBorrowStatus(id: string, status: BorrowStatus) {
    if (!ALLOWED_BORROW_STATUS.includes(status)) {
      throw {
        status: 400,
        message: `Invalid status. Allowed: ${ALLOWED_BORROW_STATUS.join(", ")}`,
      };
    }

    const borrow = await Borrow.findById(id);
    if (!borrow) throw { status: 404, message: "Borrow record not found." };

    if (borrow.status === "returned" && status === "returned") {
      throw { status: 400, message: "Borrow already returned." };
    }

    if (status === "returned" && borrow.fine > 0) {
      throw {
        status: 400,
        message: `Fine of ₹${borrow.fine} must be paid before return.`,
      };
    }

    borrow.status = status;

    if (status === "returned") {
      borrow.returnDate = new Date();

      const book = await Book.findById(borrow.bookId);
      if (!book) throw { status: 404, message: "Book not found." };

      book.availableCopies += 1;
      await book.save();
    }

    await borrow.save();

    return {
      message: "Borrow status updated successfully",
      updated: borrow,
    };
  }

  /* --------------------------------------------------
   * USER BORROW DETAILS
   * -------------------------------------------------- */
  async getBorrowDetailsByUser(id: string) {
    const user = await User.findById(id).select("name email role phone");
    if (!user) throw { status: 404, message: "User not found by ID" };

    const borrowDetails = await Borrow.find({ userId: id })
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine bookId")
      .sort({ issueDate: -1 })
      .lean();

    return { user, borrowDetails };
  }

  /* --------------------------------------------------
   * ALL BORROW HISTORY
   * -------------------------------------------------- */
  async getBorrowHistory() {
    const borrowDetails = await Borrow.find()
      .populate("userId", "name email role phone")
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine userId bookId")
      .sort({ issueDate: -1 })
      .lean();

    return { borrowDetails };
  }

  /* --------------------------------------------------
   * SPECIFIC BORROW DETAIL
   * -------------------------------------------------- */
  async getBorrowDetailsById(id: string) {
    const borrow = await Borrow.findById(id)
      .populate("userId", "name email role phone")
      .populate("bookId", "title author genre isbn publicationYear")
      .select("issueDate dueDate returnDate status fine userId bookId")
      .lean();

    if (!borrow) throw { status: 404, message: "Borrow record not found" };

    return borrow;
  }

  /* --------------------------------------------------
   * OUTSTANDING FINES
   * -------------------------------------------------- */
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
}

export default new BorrowService();
