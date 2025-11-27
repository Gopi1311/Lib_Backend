import { Request, Response } from "express";
import finePaymentService from "../services/FinePaymentService";
import { catchAsync } from "../utils/errors/catchAsync";

export class FinePaymentController {
  
  static payFine = catchAsync(async (req: Request, res: Response) => {
    const result = await finePaymentService.payFine(req.body);
    res.status(201).json(result);
  });

  static getPaymentsByUser = catchAsync(async (req: Request, res: Response) => {
    const result = await finePaymentService.getPaymentsByUser(
      req.user.id,
      req.query
    );
    res.status(200).json(result);
  });

  static getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await finePaymentService.getPaymentHistory(req.query);
    res.status(200).json(result);
  });

  static getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const result = await finePaymentService.getPaymentById(req.params.id);
    res.status(200).json(result);
  });

}
