import mongoose from "mongoose";
import { Book } from "../models/Book";
import { Borrow } from "../models/Borrow";
import { buildSearchFilter } from "../utils/buildSearchFilter";
import { BookSearchQuery, BookCreateFields, BookUpdateFields } from "../types/bookTypes";
import { assertIsObject } from "../utils/errors/validateObject";
import { AppError } from "../utils/errors/AppError";

class BookService {

  async addBook(data: unknown) {
    assertIsObject(data, "Invalid request body");
    const body = data as Partial<BookCreateFields>;

    const required: (keyof BookCreateFields)[] = [
      "title",
      "author",
      "publisher",
      "isbn",
      "genre",
      "publicationYear",
      "totalCopies",
      "availableCopies",
    ];

    // Validate required fields
    for (const field of required) {
      if (body[field] == null) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    // Business rule validation
    if (body.availableCopies! > body.totalCopies!) {
      throw new AppError("Available copies cannot exceed total copies.", 400);
    }

    try {
      const newBook = await Book.create(body);
      return newBook;
    } catch (err: unknown) {
      // Mongoose validation error
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === 11000
      ) {
        throw new AppError("Book with this ISBN already exists.", 400);
      }

      throw err; 
    }
  }

  async updateBook(id: string, data: unknown) {
    assertIsObject(data, "Invalid request body");

    const bodyObj = data as Record<string, unknown>;

    const forbidden = ["isbn", "availableCopies"];

    if (forbidden.some((field) => field in bodyObj)) {
      throw new AppError(`You cannot update fields: ${forbidden.join(", ")}`, 400);
    }

    const allowed = [
      "title",
      "author",
      "publisher",
      "genre",
      "publicationYear",
      "totalCopies",
      "shelfLocation",
      "summary",
    ];

    const updateData = Object.fromEntries(
      Object.entries(bodyObj).filter(([k]) => allowed.includes(k))
    ) as BookUpdateFields;

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields provided for update.", 400);
    }

    const existing = await Book.findById(id);
    if (!existing) {
      throw new AppError("Book not found", 404);
    }

    if (
      updateData.totalCopies != null &&
      existing.availableCopies > updateData.totalCopies
    ) {
      throw new AppError(
        `Total copies cannot be less than current available copies (${existing.availableCopies}).`,
        400
      );
    }

    try {
      const updated = await Book.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return {
        message: "Book updated successfully",
        updatedBook: updated,
      };
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw new AppError(err.message, 400);
      }
      throw err;
    }
  }

  async fetchAllBooks() {
    return Book.find({}).sort({ createdAt: -1 }).lean();
  }
  async fetchBookById(id: string) {
    const book = await Book.findById(id).lean();
    if (!book) {
      throw new AppError(`Book not found for id: ${id}`, 404);
    }
    return book;
  }

  /* --------------------------------------------------------
   * DELETE BOOK
   * -------------------------------------------------------- */
  async deleteBookById(id: string) {
    const activeBorrow = await Borrow.findOne({
      bookId: id,
      status: { $ne: "returned" },
    });

    if (activeBorrow) {
      throw new AppError("This book is currently issued and cannot be deleted.", 400);
    }

    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError(`Book not found for id: ${id}`, 404);
    }

    return {
      message: "Book deleted successfully",
      deletedBookId: deleted._id,
    };
  }

  /* --------------------------------------------------------
   * SEARCH BOOK
   * -------------------------------------------------------- */
  async searchBook(query: unknown) {
    assertIsObject(query, "Invalid search query");

    const q = query as BookSearchQuery;

    const fields = ["title", "author", "isbn", "genre"] as const;

    const filter = buildSearchFilter(q, fields);

    if (Object.keys(filter).length === 0) {
      throw new AppError(
        "Please provide at least one search parameter: title, author, isbn, genre.",
        400
      );
    }

    return Book.find(filter).lean();
  }
}

export default new BookService();
