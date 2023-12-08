import { Router } from "express";
import {
  createSubCategories,
  deleteSubCategories,
  getAllSubCategories,
} from "../controllers/subCategory.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE SUB CATEGORIES
router.post(
  "/create",
  authorizeUser,
  authorizeRole("ADMIN"),
  createSubCategories
);

// DELETE SUB CATEGORIES
router.delete(
  "/delete",
  authorizeUser,
  authorizeRole("ADMIN"),
  deleteSubCategories
);

// GET ALL SUB CATEGORIES
router.get("/get", getAllSubCategories);

export default router;
