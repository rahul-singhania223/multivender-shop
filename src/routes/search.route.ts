import { Router } from "express";
import { searchProduct } from "../controllers/search.controller";

const router = Router();

// search product
router.get("/", searchProduct);

export default router;
