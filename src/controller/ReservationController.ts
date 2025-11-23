import { Request, Response } from "express";
import reservationService from "../services/ReservationService";
import { catchAsync } from "../utils/errors/catchAsync";

export class ReservationController {
  
  static reserveBook = catchAsync(async (req: Request, res: Response) => {
    const result = await reservationService.reserveBook(req.body);
    res.status(201).json(result);
  });

  static getAllReservations = catchAsync(async (req: Request, res: Response) => {
    const result = await reservationService.getAllReservations(req.query);
    res.status(200).json(result);
  });

  static getUserReservations = catchAsync(async (req: Request, res: Response) => {
    const result = await reservationService.getUserReservations(
      req.params.id,
      req.query
    );
    res.status(200).json(result);
  });

  static cancelReservation = catchAsync(async (req: Request, res: Response) => {
    const result = await reservationService.cancelReservation(req.params.id);
    res.status(200).json(result);
  });

}
