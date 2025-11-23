import mongoose from "mongoose";
import { Book, IBook } from "../models/Book";
import { Borrow } from "../models/Borrow";
import { buildSearchFilter } from "../utils/buildSearchFilter";

type BookUpdateFields = Partial<
  Pick<
    IBook,
    | "title"
    | "author"
    | "publisher"
    | "genre"
    | "publicationYear"
    | "totalCopies"
    | "shelfLocation"
    | "summary"
  >
>;

class BookService {
  /* ------------------------- ADD BOOK ------------------------- */
  async addBook(data: any) {
    const {
      title,
      author,
      publisher,
      isbn,
      genre,
      publicationYear,
      totalCopies,
      availableCopies,
      shelfLocation,
      summary,
    } = data;

    if (availableCopies > totalCopies) {
      throw { status: 400, message: "Available copies cannot exceed total copies." };
    }

    try {
      const newBook = await Book.create({
        title,
        author,
        publisher,
        isbn,
        genre,
        publicationYear,
        totalCopies,
        availableCopies,
        shelfLocation,
        summary,
      });

      return newBook;
    } catch (err: any) {
      if (err instanceof mongoose.Error.ValidationError) {
        throw { status: 400, message: err.message };
      }
      if (err.code === 11000) {
        throw { status: 400, message: "Book with this ISBN already exists" };
      }
      throw err;
    }
  }

  /* ------------------------- UPDATE BOOK ------------------------- */
  async updateBook(id: string, body: any) {
    const forbiddenFields = ["isbn", "availableCopies"];
    if (forbiddenFields.some((f) => f in body)) {
      throw {
        status: 400,
        message: `You cannot update fields: ${forbiddenFields.join(", ")}`,
      };
    }

    const allowedFields = [
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
      Object.entries(body).filter(([k]) => allowedFields.includes(k))
    ) as BookUpdateFields;

    if (Object.keys(updateData).length === 0) {
      throw { status: 400, message: "No valid fields provided for update." };
    }

    const existing = await Book.findById(id);
    if (!existing) {
      throw { status: 404, message: "Book not found" };
    }

    if (
      updateData.totalCopies != null &&
      existing.availableCopies > updateData.totalCopies
    ) {
      throw {
        status: 400,
        message: `Total copies cannot be less than currently available copies (${existing.availableCopies}).`,
      };
    }

    const updated = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return {
      message: "Book Updated Successfully",
      updatedBook: updated,
    };
  }

  /* ------------------------- FETCH ALL BOOKS ------------------------- */
  async fetchAllBooks() {
    return Book.find({}).sort({ createdAt: -1 }).lean();
  }

  /* ------------------------- FETCH BY ID ------------------------- */
  async fetchBookById(id: string) {
    const book = await Book.findById(id).lean();
    if (!book) throw { status: 404, message: `Book not found for id: ${id}` };
    return book;
  }

  /* ------------------------- DELETE BOOK ------------------------- */
  async deleteBookById(id: string) {
    const activeBorrow = await Borrow.findOne({
      bookId: id,
      status: { $ne: "returned" },
    });

    if (activeBorrow) {
      throw {
        status: 400,
        message: "This book is currently issued and cannot be deleted.",
      };
    }

    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) {
      throw { status: 404, message: `Book not found for id: ${id}` };
    }

    return {
      message: "Book deleted successfully",
      deletedBookId: deleted._id,
    };
  }

  /* ------------------------- SEARCH BOOK ------------------------- */
  async searchBook(query: any) {
    const fields = ["title", "author", "isbn", "genre"] as const;

    const filter = buildSearchFilter(query, fields);

    if (Object.keys(filter).length === 0) {
      throw {
        status: 400,
        message:
          "Please provide at least one search parameter (title, author, isbn, genre).",
      };
    }

    return Book.find(filter).lean();
  }
}

export default new BookService();
