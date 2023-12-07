import { Router } from "express";
import {
  createCategories,
  getAllCategories,
} from "../controllers/category.controller";
import { authorizeRole } from "../middlewares/authorizeRole";
import { authorizeUser } from "../middlewares/authorizeUser";

const router = Router();

// CREATE CATEGORIES
router.post("/create", authorizeUser, authorizeRole("ADMIN"), createCategories);

// GET CATEGORIES
router.get("/get", authorizeUser, authorizeRole("ADMIN"), getAllCategories);

export default router;
