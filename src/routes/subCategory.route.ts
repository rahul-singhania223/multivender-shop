import { Router } from "express";
import {
  createSubCategories,
  deleteSubCategories,
  getAllSubCategories,
} from "../controllers/subCategory.controller";
import { authorizeRole } from "../middlewares/authorizeRole";
import { authorizeUser } from "../middlewares/authorizeUser";

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
