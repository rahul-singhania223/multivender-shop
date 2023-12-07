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
router.post("/create", createCategories);

// GET CATEGORIES
router.get("/get", getAllCategories);

// DELETE CATEGORIES
router.delete("/delete", deleteCategories);

export default router;
