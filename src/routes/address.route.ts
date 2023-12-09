import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  getAddressList,
  getOneAddress,
} from "../controllers/address.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// ADD ADDRESS ( only for customer)
router.post("/create", authorizeUser, authorizeRole("CUSTOMER"), addAddress);

// DELETE ADDRESS ( only for customer)
router.delete(
  "/delete/:id",
  authorizeUser,
  authorizeRole("CUSTOMER"),
  deleteAddress
);

// GET ADDRESS LIST ( only for customer)
router.get("/get", authorizeUser, authorizeRole("CUSTOMER"), getAddressList);

// GET ONE ADDRESS
router.get(
  "/get/:id",
  authorizeUser,
  authorizeRole("CUSTOMER", "VENDOR"),
  getOneAddress
);

export default router;
