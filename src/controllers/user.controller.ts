import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { IJWTBody, IUserBody } from "../../interfaces";
import { generateOtp } from "../utils/generateOtp";
import { generateActivationToken } from "../utils/generateActivationToken";
import { ApiResponse } from "../utils/ApiResponse";
import { sendMail } from "../utils/sendMail";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { setCookie } from "../utils/setCookie";
import { IUploaded } from "./product.controller";
import {
  deleteImageFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary";

// REGISTER USER
const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email, password, phone, isVendor } =
      req.body as IUserBody;

    if (!fullName || !email || !password || !phone) {
      return next(new ApiError("All input fields are required", 400));
    }

    if (password.length < 6) {
      return next(new ApiError("Password must atleast 6 characters long", 400));
    }

    const existingUser = await User.aggregate([
      {
        $match: {
          $or: [{ email }, { phone }],
        },
      },
    ]);

    if (existingUser.length > 0) {
      return next(
        new ApiError("user with this phone and email already exist?", 400)
      );
    }

    const otp: number = generateOtp();

    const activationToken: string = generateActivationToken(otp, {
      fullName,
      email,
      password,
      phone,
      isVendor,
    });

    try {
      await sendMail({
        email,
        template: "activation-mail.ejs",
        subject: "activate your RA.one account",
        data: { otp, fullName },
      });
    } catch (err) {
      console.log("Couldn't send mail", err);
    }

    setCookie(
      "activation_token",
      activationToken,
      1000 * 60 * parseInt(process.env.ACTIVATION_TOKEN_EXPIRY as string),
      res
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          `We have sent an 6 digit opt to your email ${email}`,
          null
        )
      );
  }
);

// ACTIVATE USER
const activateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token } = req.cookies;
    const { otp } = req.body;

    if (!otp) {
      return next(new ApiError("Please enter your OTP", 400));
    }

    if (!activation_token) {
      return next(
        new ApiError("Your OTP has been expired. Register again.", 400)
      );
    }

    const data = jwt.verify(
      activation_token,
      process.env.ACTIVATION_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!data) {
      return next(new ApiError("OTP expired, register again", 400));
    }

    const savedOtp: number = data.otp;
    const userData: IUserBody = data.userData;

    if (otp !== savedOtp) {
      return next(new ApiError("Incorrect OTP", 400));
    }

    const user = await User.create({
      ...userData,
      type: userData.isVendor ? "VENDOR" : "CUSTOMER",
    });

    if (!user) {
      return next(new ApiError("Couldn't save user", 500));
    }

    await redis.set(user._id, JSON.stringify(user));

    user.password = undefined;

    try {
      await sendMail({
        template: "registration-success-mail.ejs",
        email: user.email,
        subject: "Registration successull on RA.one",
        data: user,
      });
    } catch (err) {
      return next(
        new ApiError("Couldn't send registration successfull mail", 500)
      );
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    setCookie(
      "refresh_token",
      refreshToken,
      60 * 24 * 10 * parseInt(process.env.REFRESH_TOKEN_EXPIRY as string),
      res
    );

    setCookie(
      "access_token",
      accessToken,
      parseInt(process.env.ACCESS_TOKEN_EXPIRY as string),
      res
    );

    res.cookie("activation_token", "", { expires: new Date(0) });

    res
      .status(201)
      .json(new ApiResponse(true, 201, "User registration succesfull", user));
  }
);

// LOG IN USER
const logInUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError("All input fields are required!", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ApiError(`${email} is not registered`, 404));
    }

    const isValidPassword: boolean = await user.comparePassword(password);

    if (!isValidPassword) {
      return next(new ApiError("Invalid password", 400));
    }

    user.password = undefined;

    await redis.set(user._id, JSON.stringify(user));

    try {
      await sendMail({
        email,
        subject: "Login successfull - RA.one",
        template: "login-success-mail.ejs",
        data: user,
      });
    } catch (err) {
      return next(new ApiError("Couldn't send login success email", 500));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    setCookie(
      "refresh_token",
      refreshToken,
      60 * 24 * 10 * parseInt(process.env.REFRESH_TOKEN_EXPIRY as string),
      res
    );

    setCookie(
      "access_token",
      accessToken,
      parseInt(process.env.ACCESS_TOKEN_EXPIRY as string),
      res
    );

    res.status(200).json(new ApiResponse(true, 200, "Login sucessfull", user));
  }
);

// LOG OUT USER
const logOutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unuahorized user", 401));
    }

    await redis.del(user._id);

    res.cookie("access_token", "", { expires: new Date(0) });
    res.cookie("refresh_token", "", { expires: new Date(0) });

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Logged out successfully", null));
  }
);

// GET ME
const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    res
      .status(200)
      .json(new ApiResponse(true, 200, "Got the user profile", user));
  }
);

// UPDATE USER
const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const changes = req.body;
    const user = req.user;

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    const databaseUser = await User.findById(user._id).select("+password");

    if (!databaseUser) {
      return next(new ApiError("User not found", 404));
    }

    const updateFields: any = {};
    const validFields = ["email", "password", "fullName", "phone"];

    for (let field in changes) {
      if (validFields.includes(field) && changes[field] !== "") {
        updateFields[field] = changes[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(true, 200, "Nothing to update", user));
    }

    // password validation
    if (updateFields.password) {
      if (!changes.oldPassword) {
        return next(
          new ApiError("old password is required to update password", 400)
        );
      }

      const isSamePassword = updateFields.password === changes.oldPassword;

      if (isSamePassword) {
        return next(new ApiError("Please enter defferent password", 400));
      }

      const isValidoldPassword = await databaseUser.comparePassword(
        changes.oldPassword
      );

      if (!isValidoldPassword) {
        return next(new ApiError("Invalid old password", 401));
      }
    }

    // email validation
    if (updateFields.email) {
      const existingEmailUser = await User.findOne({
        email: updateFields.email,
      });

      if (existingEmailUser) {
        return next(
          new ApiError(`${updateFields.email} is already registered`, 400)
        );
      }

      const otp = generateOtp();
      const updateToken = jwt.sign(
        { updateFields, otp, user },
        process.env.UPDATE_TOKEN_SECRET as string,
        { expiresIn: "5m" }
      );

      try {
        await sendMail({
          template: "update-confirmation-mail.ejs",
          subject: "Update profile",
          email: updateFields.email,
          data: {
            otp,
            fullName: user.fullName,
            confirmUpdateUrl: process.env.CLIENT as string,
          },
        });
      } catch (err) {
        return next(
          new ApiError("Couldn't send otp email to update profile", 500)
        );
      }

      setCookie("update_token", updateToken, 5, res);
      return res
        .status(200)
        .json(
          new ApiResponse(
            true,
            200,
            `Check your email ${updateFields.email} to get 6 digit otp`,
            null
          )
        );
    }

    const updateInstance = await User.updateOne(
      { _id: user._id },
      updateFields
    );

    if (updateInstance.modifiedCount === 0) {
      return next(new ApiError("Couldn't update profile", 500));
    }

    const updatedUser = await User.findById(user._id);

    if (!updatedUser) {
      return next(new ApiError("user not found after updating profile", 404));
    }

    await redis.set(updatedUser._id, JSON.stringify(updatedUser));

    res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Updated profile successfully", updatedUser)
      );
  }
);

// UPDATE CONFIRMATION
const updateConfirmation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { update_token } = req.cookies;
    const { otp } = req.body;

    if (!update_token) {
      return next(new ApiError("Token not found", 400));
    }

    const {
      updateFields,
      otp: savedOtp,
      user,
    } = jwt.verify(
      update_token,
      process.env.UPDATE_TOKEN_SECRET as string
    ) as JwtPayload;

    const databaseUser = await User.findById(user._id);

    if (!databaseUser) {
      return next(new ApiError("User not found", 404));
    }

    const isValidOtp = otp === savedOtp;

    if (!isValidOtp) {
      return next(new ApiError("Invalid otp", 400));
    }

    const updateInstance = await User.updateOne(
      { _id: user._id },
      updateFields
    );

    if (updateInstance.modifiedCount === 0) {
      return next(new ApiError("Couldn't update profile", 500));
    }

    const updatedUser = await User.findById(user._id);

    if (!updatedUser) {
      return next(new ApiError("user not found after updating profile", 404));
    }

    await redis.set(updatedUser._id, JSON.stringify(updatedUser));

    res
      .status(200)
      .json(
        new ApiResponse(true, 200, "Updated profile successfully", updatedUser)
      );
  }
);

// UPDATE AVATAR
const updateAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const files: IUploaded = req.files as IUploaded;

    if (!files) {
      return next(new ApiError("Add an image to update avatar", 400));
    }

    if (!user) {
      return next(new ApiError("Unauthorized error", 401));
    }

    if (user.avatar) {
      const deleteResponse = await deleteImageFromCloudinary(
        user.avatar.public_id
      );

      if (deleteResponse !== "ok") {
        return next(new ApiError("Couldn't delete prev avatar to update", 500));
      }
    }

    const newAvatarPath = files["avatar"].map(
      (file: Express.Multer.File) => file.path
    )[0];

    const newAvatar = await uploadOnCloudinary(newAvatarPath);

    const updateInstance = await User.updateOne(
      { _id: user._id },
      { avatar: newAvatar }
    );

    if (updateInstance.modifiedCount === 0) {
      return next(new ApiError("Couldn't update avatar", 500));
    }

    const newUser = await User.findById(user._id);

    if (!newUser) {
      return next(new ApiError("Couldn't get user after avatar update", 500));
    }

    await redis.set(user._id, JSON.stringify(newUser));

    res
      .status(200)
      .json(
        new ApiResponse(true, 200, "User avatar updated successfully", newUser)
      );
  }
);

export {
  registerUser,
  activateUser,
  logOutUser,
  logInUser,
  getMe,
  updateUser,
  updateConfirmation,
  updateAvatar,
};
