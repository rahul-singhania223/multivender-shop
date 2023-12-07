import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { IJWTBody, IUserBody } from "../../interfaces";
import { generateOtp } from "../utils/generateOtp";
import { generateActivationToken } from "../utils/generateActivationToken";
import { ApiResponse } from "../utils/ApiResponse";
import { sendMail } from "../utils/sendMail";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

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

    res.cookie("activation_token", activationToken, {
      maxAge:
        1000 * 60 * parseInt(process.env.ACTIVATION_TOKEN_EXPIRY as string),
      expires: new Date(
        parseInt(new Date().toString()) +
          1000 * 60 * parseInt(process.env.ACTIVATION_TOKEN_EXPIRY as string)
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

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

    res.cookie("refresh_token", refreshToken, {
      expires: new Date(
        parseInt(new Date().toString()) +
          1000 * 60 * parseInt(process.env.REFRESH_TOKEN_EXPIRY as string)
      ),
      maxAge:
        1000 *
        60 *
        60 *
        24 *
        parseInt(process.env.REFRESH_TOKEN_EXPIRY as string),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    res.cookie("access_token", accessToken, {
      expires: new Date(
        parseInt(new Date().toString()) +
          1000 * 60 * parseInt(process.env.ACCESS_TOKEN_EXPIRY as string)
      ),
      maxAge: 1000 * 60 * parseInt(process.env.ACCESS_TOKEN_EXPIRY as string),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

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

    res.cookie("refresh_token", refreshToken, {
      expires: new Date(
        parseInt(new Date().toString()) +
          1000 * 60 * parseInt(process.env.REFRESH_TOKEN_EXPIRY as string)
      ),
      maxAge:
        1000 *
        60 *
        60 *
        24 *
        parseInt(process.env.REFRESH_TOKEN_EXPIRY as string),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

    res.cookie("access_token", accessToken, {
      expires: new Date(
        parseInt(new Date().toString()) +
          1000 * 60 * parseInt(process.env.ACCESS_TOKEN_EXPIRY as string)
      ),
      maxAge: 1000 * 60 * parseInt(process.env.ACCESS_TOKEN_EXPIRY as string),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    });

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

export { registerUser, activateUser, logOutUser, logInUser };
