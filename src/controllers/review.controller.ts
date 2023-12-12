import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product.model";
import { IReview, Review } from "../models/review.model";
import router from "../routes/user.route";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// CREATE A REVIEW
const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, comment } = req.body;
    const product_id = req.params.id;
    const user = req.user;

    if (!title || !comment) {
      return next(new ApiError("Title and comment both are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return next(new ApiError("Invalid product id", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const product = await Product.findById(product_id);

    if (!product) {
      return next(new Product("Product not found", 404));
    }

    const reviewDocument: IReview = {
      title,
      comment,
      product_id: product._id,
      createdBy: user._id,
    } as IReview;

    const newReview = await Review.create(reviewDocument);

    if (!newReview) {
      return next(new ApiError("Couln't create review", 500));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(true, 201, "Review created successfully", newReview)
      );
  }
);

// DELETE ONE REVIEW
const deleteReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return next(new ApiError("Invalid review id", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new ApiError("Review not found", 404));
    }

    const isCreatedByUser = review.createdBy.toString() === user._id;

    if (!isCreatedByUser) {
      return next(new ApiError("You can't delete this review", 400));
    }

    const deleteInstance = await Review.deleteOne({ _id: reviewId });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete the review", 500));
    }

    res
      .status(200)
      .json(
        new ApiResponse(true, 200, "One review deleted successfully", null)
      );
  }
);

// GET ALL REVIEWS (for product)
const getReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ApiError("Invalid product id", 400));
    }

    const reviews = await Review.find({ product_id: productId });

    if (!reviews) {
      return next(new ApiError("Couldn't get product reviews", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got all reviews", reviews));
  }
);

export { createReview, deleteReview, getReviews };
