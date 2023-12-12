import { Router } from "express";
import { addItem, getItems, removeItem } from "../controllers/cart.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// ADD ITEM
router.post("/add", authorizeUser, authorizeRole("CUSTOMER"), addItem);

// REMOVE ITEM
router.delete(
  "/remove/:id",
  authorizeUser,
  authorizeRole("CUSTOMER"),
  removeItem
);

router.get("/get", authorizeUser, authorizeRole("CUSTOMER"), getItems);

export default router;
