import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// ADD TO CART
const addItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.query.p as string;
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ApiError("Invalid product id", 400));
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ApiError("Product not found", 404));
    }

    const newCart = await Cart.create({
      product_id: productId,
      createdBy: user._id,
    });

    if (!newCart) {
      return next(new ApiError("Couldn't add item to the cart", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "One item added to the cart", newCart));
  }
);

// REMOVE FROM CART
const removeItem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cartId = req.params.id;
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return next(new ApiError("Invalid cart item id", 400));
    }

    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return next(new ApiError("Cart item not found", 404));
    }

    const isValidUser = user._id === cartItem.createdBy.toString();

    if (!isValidUser) {
      return next(new ApiError("You cannot perform this action", 401));
    }

    const deleteInstance = await Cart.deleteOne({ _id: cartId });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete the item", 500));
    }

    const remainingItems = await Cart.find();

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "One item deleted successfully",
          remainingItems
        )
      );
  }
);

// GET ITEMS
const getItems = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const cartItems = await Cart.find({ createdBy: user._id });

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got all cart items", cartItems));
  }
);

export { addItem, removeItem, getItems };
