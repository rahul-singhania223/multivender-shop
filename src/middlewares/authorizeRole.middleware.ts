import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// AUTHORIZE ROLE
const authorizeRole = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized user", 401));
    }

    if (!roles.includes(user.type)) {
      return next(
        new ApiError("You are not allowed to perform this actioin", 500)
      );
    }

    req.user = user;

    next();
  });

export { authorizeRole };
