import { Request, Response } from "express";
import userService from "../services/UserService";
import { catchAsync } from "../utils/errors/catchAsync";

export class UserController {

  static addUser = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.addUser(req.body);
    res.status(201).json(result);
  });

  static getAllUserDetails = catchAsync(async (_req: Request, res: Response) => {
    const result = await userService.getAllUserDetails();
    res.status(200).json(result);
  });

  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req.params.id);
    res.status(200).json(result);
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(result);
  });

  static searchUser = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.searchUser(req.query);
    res.status(200).json(result);
  });

}
