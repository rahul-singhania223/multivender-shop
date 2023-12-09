import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError";
import handleApiError from "./middlewares/handleApiError.middleware";
import { authorizeUser } from "./middlewares/authorizeUser.middleware";
import { authorizeRole } from "./middlewares/authorizeRole.middleware";
import { upload } from "./middlewares/multer.middleware";
import path from "path";
import { Field } from "multer";

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
import subCategoryRouter from "./routes/subCategory.route";
import productRouter from "./routes/product.route";
import orderRouter from "./routes/order.route";
import addressRouter from "./routes/address.route";

app.use("/api/v1/user", userRouter);

app.use("/api/v1/categories", categoryRouter);

app.use("/api/v1/sub-categories", subCategoryRouter);

app.use("/api/v1/product", productRouter);

app.use("/api/v1/order", orderRouter);

app.use("/api/v1/address", addressRouter);

// handle unknown routes
app.get("*", (req, res, next) => {
  next(new ApiError("Unknown route", 404));
});

app.use(handleApiError);

export { app };
