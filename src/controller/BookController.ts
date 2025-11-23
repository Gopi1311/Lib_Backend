import { Request, Response } from "express";
import bookService from "../services/BookService";
import { catchAsync } from "../utils/errors/catchAsync";

export class BookController {
  
  static addBook = catchAsync(async (req: Request, res: Response) => {
    const result = await bookService.addBook(req.body);
    res.status(201).json(result);
  });

  static updateBook = catchAsync(async (req: Request, res: Response) => {
    const result = await bookService.updateBook(req.params.id, req.body);
    res.status(200).json(result);
  });

  static fetchAllBooks = catchAsync(async (req: Request, res: Response) => {
    const books = await bookService.fetchAllBooks();
    res.status(200).json(books);
  });

  static fetchBookById = catchAsync(async (req: Request, res: Response) => {
    const book = await bookService.fetchBookById(req.params.id);
    res.status(200).json(book);
  });

  static deleteBookById = catchAsync(async (req: Request, res: Response) => {
    const result = await bookService.deleteBookById(req.params.id);
    res.status(200).json(result);
  });

  static searchBook = catchAsync(async (req: Request, res: Response) => {
    const results = await bookService.searchBook(req.query);
    res.status(200).json(results);
  });

}
