import express from "express";
import {
  addBusinessData,
  deleteBusinessData,
  deleteRequiterData,
  getBusinessData,
  getBusinessDataById,
  getBusinessDataForRequiter,
  getRequiterData,
  getRequiterNotifications,
  loginRequiter,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerRequiter,
  updateBusinessData,
  updateRequiterProfile,
} from "../controller/requiterController";
import upload from "../config/multer";
import { requiterAuthMiddleware } from "../middleware/requiterAuthMiddleware";

const router = express.Router();

router.post("/register-requiter", upload.single("profile"), registerRequiter);
router.post("/login-requiter", loginRequiter);
router.get("/getrequiterData", requiterAuthMiddleware, getRequiterData);

router.delete(
  "/deleteRequiterData",
  requiterAuthMiddleware,
  deleteRequiterData
);

router.put(
  "/updateRequiterProfile",
  requiterAuthMiddleware,
  upload.single("requiterProfileImage"),
  updateRequiterProfile
);

router.post(
  "/addBusiness",
  upload.array("images", 4),
  requiterAuthMiddleware,
  addBusinessData
);
router.get("/getBusinessData", getBusinessData);
router.get(
  "/getBusinessDataForRequiter",
  requiterAuthMiddleware,
  getBusinessDataForRequiter
);
router.get("/getBusinessDataById/:id", getBusinessDataById);
router.put(
  "/updateBusiness/:id",
  upload.array("images", 4),
  requiterAuthMiddleware,
  updateBusinessData
);
router.delete(
  "/deleteBusiness/:id",
  requiterAuthMiddleware,
  deleteBusinessData
);

// Notification routes
router.get("/notifications", requiterAuthMiddleware, getRequiterNotifications);
router.put(
  "/notifications/:id",
  requiterAuthMiddleware,
  markNotificationAsRead
);
router.put(
  "/notifications",
  requiterAuthMiddleware,
  markAllNotificationsAsRead
);

export default router;
