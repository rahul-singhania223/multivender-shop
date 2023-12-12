import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { IUser, User } from "../models/user.model";
import { setCookie } from "../utils/setCookie";

// AUTHORIZE USER
const authorizeUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { access_token, refresh_token } = req.cookies;

    async function setUser(token: string, secret: string) {
      const { _id } = jwt.verify(token, secret) as JwtPayload;

      const cachedUser = JSON.parse((await redis.get(_id)) as string);

      if (cachedUser) {
        req.user = cachedUser;
        return next();
      }

      const databaseUser = await User.findById(_id);

      if (!databaseUser) {
        return next(new ApiError("Couldn't get user", 500));
      }

      req.user = databaseUser;
      return next();
    }

    if (access_token) {
      await setUser(access_token, process.env.ACCESS_TOKEN_SECRET as string);
      return;
    }

    if (!refresh_token) {
      return next(new ApiError("Session expired", 400));
    }

    const { _id, fullName, email, avatar } = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    const newAccessToken = jwt.sign(
      { _id, fullName, email, avatar },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { _id, fullName, email, avatar },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "10d" }
    );

    setCookie("access_token", newAccessToken, 15, res);
    setCookie("refresh_token", newRefreshToken, 10 * 60 * 24, res);

    setUser(newAccessToken, process.env.ACCESS_TOKEN_SECRET as string);
  }
);

export { authorizeUser };
