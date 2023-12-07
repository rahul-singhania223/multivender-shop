import { Router } from "express";
import {
  createCategories,
  deleteCategories,
  getAllCategories,
} from "../controllers/category.controller";
import { authorizeRole } from "../middlewares/authorizeRole";
import { authorizeUser } from "../middlewares/authorizeUser";

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
