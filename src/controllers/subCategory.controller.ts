import { Request, Response, NextFunction } from "express";
import mongoose, { ObjectId, Schema, Types } from "mongoose";
import { ISubCategory, SubCategory } from "../models/subCategory.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { redis } from "../utils/redis";

// CREATE SUB CATEGORIES
const createSubCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { names, categoryId } = req.body as {
      names: string[];
      categoryId: string;
    };

    if (!names || names.length === 0) {
      return next(new ApiError("Add atleas one sub category", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new ApiError("Invalid category id", 400));
    }

    const categoryObjectId = new Types.ObjectId(categoryId);

    const subCategoriesToSave = [] as ISubCategory[];

    names.forEach((name) => {
      if (name || name !== "") {
        subCategoriesToSave.push({
          name,
          category: categoryObjectId,
        } as ISubCategory);
      }
    });

    if (subCategoriesToSave.length === 0) {
      return next(new ApiError("Add atleas one sub category", 400));
    }

    await SubCategory.insertMany(subCategoriesToSave);

    const newSubCategories = await SubCategory.find();

    if (!newSubCategories) {
      return next(new ApiError("Couldn't get new sub subcategory list", 500));
    }

    await redis.set("sub_categories", JSON.stringify(newSubCategories));

    res
      .status(201)
      .json(
        new ApiResponse(
          true,
          201,
          "Created some sub categories",
          newSubCategories
        )
      );
  }
);
