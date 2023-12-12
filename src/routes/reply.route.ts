import { Router } from "express";
import {
  createReply,
  deleteReply,
  getReplies,
} from "../controllers/reply.controllers";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";

const router = Router();

// CREATE REPLY (only for customer)
router.post("/create", authorizeUser, authorizeRole("CUSTOMER"), createReply);

// GET REPLY
router.get("/get/:id", authorizeUser, getReplies);

// DELETE REPLY (only for customer)
router.delete(
  "/delete/:id",
  authorizeUser,
  authorizeRole("CUSTOMER"),
  deleteReply
);

export default router;
