import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IOrder, Order } from "../models/order.model";
import { Product } from "../models/product.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// CREATE ORDER
const createOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { quantity, payment_mode, address_id } = req.body;

    const product_id = req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(product_id) ||
      !mongoose.Types.ObjectId.isValid(address_id)
    ) {
      return next(new ApiError("Invalid product id or address Id", 400));
    }

    if (!quantity || quantity === 0) {
      return next(new ApiError("minimum 1 quantity required", 400));
    }

    if (!payment_mode || payment_mode === "") {
      return next(new ApiError("Payment mode is required", 400));
    }

    const product = await Product.findById(product_id);

    if (!product) {
      return next(new ApiError("Product not found to create order", 500));
    }

    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const orderDocument: IOrder = {
      product_id: new mongoose.Types.ObjectId(product_id),
      orderedBy: user._id,
      ownedBy: new mongoose.Types.ObjectId(product.owner as unknown as string),
      address_id,
      payment_mode,
      quantity,
      final_price: product.price,
      discount: product.discount,
    } as IOrder;

    const newOrder = await Order.create(orderDocument);

    if (!orderDocument) {
      return next(new ApiError("Couldn't create a new order", 500));
    }

    res
      .status(201)
      .json(
        new ApiResponse(true, 201, "Placed an order successfully", newOrder)
      );
  }
);

// UPDATE ORDER
const updateOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id;
    const { isPaid, status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ApiError("Order not found to update", 500));
    }

    if (!isPaid && !status) {
      return res
        .status(200)
        .json(new ApiResponse(false, 200, "Nothing to update", order));
    }

    const fieldsToUpdate: any = {};

    if (isPaid) {
      fieldsToUpdate.isPaid = isPaid;
    }

    if (status && status !== order.status) {
      fieldsToUpdate.status = status;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(false, 200, "Nothing to update", order));
    }

    const statusList = [
      "PENDING",
      "PACKED",
      "OUT FOR DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    if (fieldsToUpdate.status && !statusList.includes(fieldsToUpdate.status)) {
      return next(
        new ApiError(
          "Order status can be PENDING, PACKED, OUT FOR DELIVERY, DELIVERED, CANCELLED, RETURNED",
          400
        )
      );
    }

    const updateInstace = await Order.updateOne(
      { _id: orderId },
      fieldsToUpdate
    );

    if (updateInstace.modifiedCount === 0) {
      return next(new ApiError("Couldn't update the order", 500));
    }

    const updatedOrder = await Order.findById(orderId);

    if (!updatedOrder) {
      return next(new ApiError("Couldn't get the order after update", 500));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "Update one order successfully",
          updatedOrder
        )
      );
  }
);

// GET ONE ORDER
const getOneOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const orderId = req.params.id;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ApiError("Invalid order id", 400));
    }

    const isValidUser = user.type === "VENDOR" || user.type === "CUSTOMER";

    if (!isValidUser) {
      return next(new ApiError("Your are not allowed to get orders", 401));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    res.status(200).json(new ApiResponse(true, 200, "One order found", order));
  }
);

// GET ALL ORDERS
const getAllOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    // is vendor?
    const isVendor = user.type === "VENDOR";

    if (isVendor) {
      const ordersForVendor = await Order.find({ ownedBy: user._id });

      if (!ordersForVendor) {
        return next(new ApiError("Couldn't get orders", 500));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            "Found all orders owned by vendor",
            ordersForVendor
          )
        );
    }

    const isCustomer = user.type === "CUSTOMER";

    if (isCustomer) {
      const ordersForCustomer = await Order.find({ orderedBy: user._id });

      if (!ordersForCustomer) {
        return next(new ApiError("Couldn't get orders", 500));
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            "Found all orders created by customer",
            ordersForCustomer
          )
        );
    }
  }
);

export { createOrder, updateOrder, getOneOrder, getAllOrders };
