import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError";
import handleApiError from "./middlewares/handleApiError";

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
import userRouter from "./routes/user.route";
import categoryRouter from "./routes/category.route";
import { authorizeUser } from "./middlewares/authorizeUser";
import { authorizeRole } from "./middlewares/authorizeRole";

app.use("/api/v1/user", userRouter);
app.use(
  "/api/v1/categories",
  authorizeUser,
  authorizeRole("ADMIN"),
  categoryRouter
);

// handle unknown routes
app.get("*", (req, res, next) => {
  next(new ApiError("Unknown route", 404));
});

app.use(handleApiError);

export { app };
