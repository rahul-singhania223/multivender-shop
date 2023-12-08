import { Router } from "express";
import {
  createCategories,
  deleteCategories,
  getAllCategories,
} from "../controllers/category.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE CATEGORIES
router.post("/create", authorizeUser, authorizeRole("ADMIN"), createCategories);

// GET CATEGORIES
router.get("/get", getAllCategories);

// DELETE CATEGORIES
router.delete(
  "/delete",
  authorizeUser,
  authorizeRole("ADMIN"),
  deleteCategories
);

export default router;
