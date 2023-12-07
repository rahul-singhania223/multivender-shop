import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// AUTHORIZE ROLE
const authorizeRole = (role: "ADMIN" | "CUSTOMER" | "VENDOR") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized user", 401));
    }

    const isAdmin = user.type === role;

    if (!isAdmin) {
      return next(
        new ApiError("You are not allowed to perform this action", 403)
      );
    }

    next();
  });

export { authorizeRole };
