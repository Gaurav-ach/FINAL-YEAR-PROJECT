import express from "express";
import upload from "../config/multer";
import { UserAuthMiddleware } from "../middleware/userAuthMiddleware";
import {
  deleteUserData,
  getUserData,
  loginUser,
  registerUser,
  updateUserProfile,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserPaymentHistory,
} from "../controller/userController";

const router = express.Router();

router.post("/register-user", upload.single("profile"), registerUser);
router.post("/login-user", loginUser);
router.get("/getUserData", UserAuthMiddleware, getUserData);

router.delete("/deleteUserData", UserAuthMiddleware, deleteUserData);
router.put(
  "/updateUserProfile",
  UserAuthMiddleware,
  upload.single("userProfileImage"),
  updateUserProfile
);

// Notification routes
router.get("/notifications", UserAuthMiddleware, getUserNotifications);
router.put("/notifications/:id", UserAuthMiddleware, markNotificationAsRead);
router.put("/notifications", UserAuthMiddleware, markAllNotificationsAsRead);

// Payment history route
router.get("/payment-history", UserAuthMiddleware, getUserPaymentHistory);

export default router;
