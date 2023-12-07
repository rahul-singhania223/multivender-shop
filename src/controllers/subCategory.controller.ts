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

// GET ALL SUB CATEGORIES
const getAllSubCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.query;

    if (!category || category === "") {
      return next(new ApiError("Invalid category", 400));
    }

    const cacheSubCategories = JSON.parse(
      (await redis.get("sub_categories")) as string
    ) as { name: string; category: string }[];

    if (cacheSubCategories) {
      const lisOfSubcategories = cacheSubCategories.filter(
        (subCategory) => subCategory.category === category
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            "Got some sub categories",
            lisOfSubcategories
          )
        );
    }

    const lisOfSubcategories = await SubCategory.find({
      category: new mongoose.Types.ObjectId(category as string),
    });

    if (!lisOfSubcategories) {
      return next(new ApiError("Couldn't get list of sub categories", 500));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "Got some sub categories",
          lisOfSubcategories
        )
      );
  }
);

// DELETE SUB CATEGORIES
const deleteSubCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body as { ids: string[] };

    if (ids.length === 0) {
      return next(new ApiError("Choose atleast one item to delete", 400));
    }

    const idsToDelete = [] as Types.ObjectId[];

    ids.forEach((id) => {
      if (id || id !== "") {
        idsToDelete.push(new mongoose.Types.ObjectId(id as string));
      }
    });

    if (idsToDelete.length === 0) {
      return next(new ApiError("Choose atleast one item to delete", 400));
    }

    const deleteInstance = await SubCategory.deleteMany({ _id: idsToDelete });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete sub categories", 500));
    }

    const newSubCategories = await SubCategory.find();

    if (!newSubCategories) {
      return next(new ApiError("Couldn't get new Sub categories", 500));
    }

    await redis.set("sub_categories", JSON.stringify(newSubCategories));

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "Deleted some sub categories",
          newSubCategories
        )
      );
  }
);

export { createSubCategories, getAllSubCategories, deleteSubCategories };
