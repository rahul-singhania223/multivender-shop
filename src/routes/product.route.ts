import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getOneProruct,
} from "../controllers/product.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

// CREATE PRODUCT
router.post(
  "/create",
  authorizeUser,
  authorizeRole("VENDOR"),
  upload.fields([
    { name: "dp", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProduct
);

// DELETE ONE PRODUCT
router.delete(
  "/delete/:id",
  authorizeUser,
  authorizeRole("VENDOR"),
  deleteProduct
);

// UPDATE ONE PRODUCT
router.put(
  "/edit/:id",
  authorizeUser,
  authorizeRole("VENDOR"),
  upload.fields([
    { name: "dp", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  editProduct
);

// GET ALL PRODUCTS
router.get("/get-all", getAllProducts);

// GET ONE PRODUCT
router.get("/get/:id", getOneProruct);

// EDIT PRODUCT DETAILS
// router.get("/edit/:id", editProduct)

export default router;
