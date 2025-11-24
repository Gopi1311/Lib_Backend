import { IBook } from "../models/Book";
export type BookSearchQuery = Partial<{
  title: string;
  author: string;
  isbn: string;
  genre: string;
}>;

export type BookCreateFields = {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  genre: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
  summary?: string;
};


export type BookUpdateFields = Partial<
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