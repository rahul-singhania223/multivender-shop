import { Router } from "express";
import {
  activateUser,
  logInUser,
  logOutUser,
  registerUser,
} from "../controllers/user.controller";
import { authorizeUser } from "../middlewares/authorizeUser";

const router = Router();

// REGISTER USER
router.post("/register", registerUser);

// ACTIVATE USER
router.post("/activate", activateUser);

// LOG OUT USER
router.delete("/log-out", authorizeUser, logOutUser);

// LOG IN USER
router.post("/login", logInUser);

export default router;
