import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError";
import handleApiError from "./middlewares/handleApiError";
import { authorizeUser } from "./middlewares/authorizeUser";
import { authorizeRole } from "./middlewares/authorizeRole";

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

app.use("/api/v1/user", userRouter);

app.use("/api/v1/categories", categoryRouter);

app.use("/api/v1/sub-categories", subCategoryRouter);

// handle unknown routes
app.get("*", (req, res, next) => {
  next(new ApiError("Unknown route", 404));
});

app.use(handleApiError);

export { app };
