import { Router } from "express";
import {
  activateUser,
  getMe,
  logInUser,
  logOutUser,
  registerUser,
  updateAvatar,
  updateConfirmation,
  updateUser,
} from "../controllers/user.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { authorizeUser } from "../middlewares/authorizeUser.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

// REGISTER USER
router.post("/register", registerUser);

// ACTIVATE USER
router.post("/activate", activateUser);

// LOG OUT USER
router.delete("/log-out", authorizeUser, logOutUser);

// LOG IN USER
router.post("/login", logInUser);

// GET USER INFO
router.get("/me", authorizeUser, getMe);

// UPDATE USER
router.put("/update", authorizeUser, updateUser);

// UPDATE AVATAR
router.put(
  "/update-avatar",
  authorizeUser,
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateAvatar
);

router.post("/confirm-update", authorizeUser, updateConfirmation);

export default router;
