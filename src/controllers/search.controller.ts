import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// SEARCH PRODUCT
const searchProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const keyword = req.query.k;

    if (!keyword) {
      return next(new ApiError("Keyword is require to search", 400));
    }

    const results = await Product.aggregate([
      {
        $search: {
          index: "product",
          text: {
            query: keyword,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got search results", results));
  }
);

export { searchProduct };
