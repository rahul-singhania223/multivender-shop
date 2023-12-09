import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOneOrder,
  updateOrder,
} from "../controllers/order.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE AN ORDER
router.post("/create", authorizeUser, authorizeRole("CUSTOMER"), createOrder);

// UPDATE AN ORDER
router.put("/update/:id", authorizeUser, authorizeRole("VENDOR"), updateOrder);

// GET ONE ORDER
router.get(
  "/get/:id",
  authorizeUser,
  authorizeRole("VENDOR", "CUSTOMER"),
  getOneOrder
);

// GET ALL ORDERS
router.get(
  "/get",
  authorizeUser,
  authorizeRole("VENDOR", "CUSTOMER"),
  getAllOrders
);

export default router;
