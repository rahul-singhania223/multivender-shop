import { NextFunction, Request, Response } from "express";
import ApiError from "./ApiError";

const asyncHandler =
  (asyncFn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(asyncFn(req, res, next)).catch((err: any) => {
      next(new ApiError(err.message, 500));
    });
