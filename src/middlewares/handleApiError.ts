import { Request, Response, NextFunction } from "express";

const handleApiError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.message = error.message || "Internal server error";
  error.statusCode = error.statusCode || 500;

  res.status(error.statusCode).json({
    success: false,
    data: null,
    message: error.message,
  });
};

export { handleApiError };
