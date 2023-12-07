import { Request, Response, NextFunction, json } from "express";
import { Schema } from "mongoose";
import { Category, ICategory } from "../models/category.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { redis } from "../utils/redis";

// CREATE CATEGORIES
const createCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { names } = req.body as { names: string[] };

    if (names.length === 0) {
      return next(new ApiError("Add atleast one name", 400));
    }

    const newNames: ICategory[] = [];

    names.forEach((name) => {
      if (name || name !== "") {
        const categoryItem = { name } as ICategory;

        newNames.push(categoryItem);
      }
    });

    if (newNames.length === 0) {
      return next(new ApiError("Add atleast one name", 400));
    }

    let newCategories = await Category.insertMany(newNames);

    if (!newCategories) {
      return next(new ApiError("Couldn't create your categories", 500));
    }

    newCategories = await Category.find();

    let cacheCategories = JSON.parse((await redis.get("categories")) as string);

    if (cacheCategories) {
      cacheCategories = [...cacheCategories, ...newCategories];
    }

    cacheCategories = newCategories;

    await redis.set("categories", JSON.stringify(cacheCategories));

    res
      .status(201)
      .json(
        new ApiResponse(
          true,
          201,
          "categories created successfully",
          newCategories
        )
      );
  }
);

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheCategories = JSON.parse(
      (await redis.get("categories")) as string
    );

    if (cacheCategories) {
      return res
        .status(200)
        .json(
          new ApiResponse(true, 200, "Got all categories", cacheCategories)
        );
    }

    const categories = await Category.find();

    if (!categories) {
      return next(new ApiError("Couldn't get categories list", 500));
    }

    await redis.set("categories", JSON.stringify(categories));

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got all categories", categories));
  }
);

// DELETE CATEGORIES
const deleteCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body as { ids: string[] };

    if (ids.length === 0) {
      return next(new ApiError("Choose atleast one item to delete", 400));
    }

    const newIds: string[] = [];

    ids.forEach((id) => {
      if (id || id !== "") {
        const tempId: string = id;

        newIds.push(tempId);
      }
    });

    if (newIds.length === 0) {
      return next(new ApiError("Choose atleast one item to delete", 400));
    }

    const deleteInstance = await Category.deleteMany({ _id: newIds });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete categories", 500));
    }

    const categories = await Category.find();

    await redis.set("categories", JSON.stringify(categories));

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Deleted some categories", categories));
  }
);

export { createCategories, getAllCategories, deleteCategories };
