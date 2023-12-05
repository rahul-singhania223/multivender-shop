import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError";

const app = express();

// app config
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// ROUTES

// handle unknown routes
app.get("*", (req, res, next) => {
  next(new ApiError("Unknown route", 404));
});

export { app };
