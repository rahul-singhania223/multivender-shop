import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller";
import {
  createReview,
  deleteReview,
  getReviews,
} from "../controllers/review.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE REVIEW (only for customer)
router.post(
  "/create/:id",
  authorizeUser,
  authorizeRole("CUSTOMER"),
  createReview
);

// DELETE REVIEW (only for customer)
router.delete(
  "/delete/:id",
  authorizeUser,
  authorizeRole("CUSTOMER"),
  deleteReview
);

// GET REVIEWS
router.get(
  "/get/:id",
  authorizeUser,
  authorizeRole("CUSTOMER", "VENDOR"),
  getReviews
);

export default router;
