import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller";
import {
  createReview,
  deleteReview,
  getReviews,
} from "../controllers/review.conroller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE REVIEW (only for customer)
router.post("/create", authorizeUser, authorizeRole("CUSTOMER"), createReview);

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
