import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { IUser, User } from "../models/user.model";

// AUTHORIZE USER
const authorizeUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { access_token, refresh_token } = req.cookies;

    if (!refresh_token) {
      return next(new ApiError("Session expired", 401));
    }

    let newAccessToken = access_token;

    if (!access_token) {
      const data = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as JwtPayload;

      newAccessToken = jwt.sign(
        {
          _id: data._id,
          fullName: data.fullName,
          avatar: data.avatar,
          email: data.email,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
      );
    }

    const { _id } = jwt.verify(
      newAccessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    const cacheUser = JSON.parse((await redis.get(_id)) as string);

    if (cacheUser) {
      req.user = cacheUser;
      return next();
    }

    const databaseUser = (await User.findById(_id)) as IUser;

    if (!databaseUser) {
      return next(new ApiError("User not found", 404));
    }

    req.user = databaseUser;

    next();
  }
);

export { authorizeUser };
