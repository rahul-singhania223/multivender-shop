import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Address, IAddress } from "../models/address.model";
import { Order } from "../models/order.model";
import router from "../routes/user.route";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// ADD ADDRESS
const addAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, pin, country, state, line1, line2, city } = req.body;

    const user = req.user;

    if (!phone || !pin || !country || !state || !line1 || !city) {
      return next(new ApiError("All input fields are required", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const addressDocument: IAddress = {
      user_id: user._id,
      pin,
      phone,
      country,
      city,
      state,
      line1,
      line2: line2 ? line2 : "",
    } as IAddress;

    const address = await Address.create(addressDocument);

    if (!address) {
      return next(new ApiError("Couldn't add address", 500));
    }

    res
      .status(201)
      .json(
        new ApiResponse(true, 201, "new address added successfully", address)
      );
  }
);

// DELETE ADDRESS
const deleteAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return next(new ApiError("Invalid address id", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const address = await Address.findById(addressId);

    if (!address) {
      return next(new ApiError("Address not found", 404));
    }

    const isValidCustomer = address.user_id.toString() === user._id;

    if (!isValidCustomer) {
      return next(new ApiError("You can't delete this address", 400));
    }

    const pendingOrders = await Order.find({
      address_id: address._id,
      status: "PENDING",
    });

    if (pendingOrders.length > 0) {
      return next(
        new ApiError(
          `Couldn't delete the address, ${pendingOrders.length} orders are pending.`,
          400
        )
      );
    }

    const deleteInstance = await Address.deleteOne({ _id: addressId });

    if (deleteInstance.deletedCount === 0) {
      return next(new ApiError("Couldn't delete address", 500));
    }

    const newAddressList = await Address.find({ user_id: user._id });

    if (!newAddressList) {
      return next(
        new ApiError(
          "Delete one address but can't get remaining address list",
          500
        )
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          "One address deleted successfully",
          newAddressList
        )
      );
  }
);

// GET ADDRESS LIST (only for customer)
const getAddressList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const addressList = await Address.find({ user_id: user._id });

    if (!addressList) {
      return next(new ApiError("Couldn't get address list", 500));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got all address list", addressList));
  }
);

// GET ONE ADDRESS
const getOneAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const addressId = req.params.id;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return next(new ApiError("Invalid address id", 400));
    }

    const address = await Address.findById(addressId);

    if (!address) {
      return next(new ApiError("Address not found", 404));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, 200, "One address found", address));
  }
);

export { addAddress, deleteAddress, getAddressList, getOneAddress };
