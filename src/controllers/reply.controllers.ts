import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IReply, Reply } from "../models/reply.model";
import router from "../routes/user.route";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// CREATE A REPLY
const createReply = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment } = req.body;
    const reviewId = req.query.r as string;
    const productId = req.query.p as string;
    const user = req.user;

    if (!comment) {
      return next(new ApiError("comment is required", 400));
    }

    if (
      !mongoose.Types.ObjectId.isValid(reviewId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return next(new ApiError("Invalid product id or review id", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const replyDocument: IReply = {
      comment,
      review_id: new mongoose.Types.ObjectId(reviewId),
      createdBy: user._id,
      product_id: new mongoose.Types.ObjectId(productId),
    } as IReply;

    const reply = await Reply.create(replyDocument);

    if (!reply) {
      return next(new ApiError("Couldn't create reply", 500));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(true, 201, "One reply created successfully", reply)
      );
  }
);

// GET ALL REPLIES
const getReplies = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return next(new ApiError("Invalid review id", 400));
    }

    const repliesList = await Reply.find({ review_id: reviewId });

    if (!repliesList) {
      return next(new ApiError("Couldn't find replies", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got list of replies", repliesList));
  }
);

// DELETE REPLY ( only customer )
const deleteReply = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const replyId = req.params.id;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(replyId)) {
      return next(new ApiError("Invalid review id", 400));
    }

    const reply = await Reply.findById(replyId);

    if (!reply) {
      return next(new ApiError("Reply not found", 404));
    }

    const isCreatedByUser = reply.createdBy.toString() === user?._id;

    if (!isCreatedByUser) {
      return next(new ApiError("You can't delete reply", 400));
    }

    const deleteInstance = await Reply.deleteOne({ _id: replyId });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete one reply", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "One reply deleted successfully", null));
  }
);

export { createReply, getReplies, deleteReply };
