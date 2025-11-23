import { Request, Response } from "express";
import borrowService from "../services/BorrowService";
import { BorrowStatus } from "../types/borrowStatus";
import { catchAsync } from "../utils/errors/catchAsync";

export class BorrowBookController {
  
  /* ---------------- ISSUE BOOK ---------------- */
  static addBorrowBook = catchAsync(async (req: Request, res: Response) => {
    const result = await borrowService.addBorrowBook(req.body);
    res.status(201).json(result);
  });

  /* ---------------- UPDATE BORROW STATUS ---------------- */
  static updateBorrowStatus = catchAsync(async (req: Request, res: Response) => {
    const status = req.body.status as BorrowStatus;
    const result = await borrowService.updateBorrowStatus(req.params.id, status);
    res.status(200).json(result);
  });

  /* ---------------- USER BORROW LIST ---------------- */
  static getBorrowDetailsByUser = catchAsync(async (req: Request, res: Response) => {
    const result = await borrowService.getBorrowDetailsByUser(req.params.id);
    res.status(200).json(result);
  });

  /* ---------------- ALL BORROW HISTORY ---------------- */
  static getBorrowHistory = catchAsync(async (_req: Request, res: Response) => {
    const result = await borrowService.getBorrowHistory();
    res.status(200).json(result);
  });

  /* ---------------- FETCH BORROW BY ID ---------------- */
  static getBorrowDetailsById = catchAsync(async (req: Request, res: Response) => {
    const result = await borrowService.getBorrowDetailsById(req.params.id);
    res.status(200).json(result);
  });

  /* ---------------- OUTSTANDING FINES ---------------- */
  static getOutStandingFine = catchAsync(async (_req: Request, res: Response) => {
    const result = await borrowService.getOutStandingFine();
    res.status(200).json(result);
  });
}
