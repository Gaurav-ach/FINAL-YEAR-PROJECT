import express from "express";
import { requiterAuthMiddleware } from "../middleware/requiterAuthMiddleware";
import {
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getBookingStats,
  getPendingBookings,
  markAdminNotificationAsRead,
  getAdminNotifications,
  markAllAdminNotificationsAsRead,
  getCompletedBookings,
  getUserDetails,
} from "../controller/adminController";

const router = express.Router();

router.get("/getAllUsers", requiterAuthMiddleware, getAllUsers);
router.get("/users/:id", requiterAuthMiddleware, getUserDetails);
router.delete("/users/:userId", requiterAuthMiddleware, deleteUser);
router.put(
  "/users/:id/toggle-status",
  requiterAuthMiddleware,
  toggleUserStatus
);
router.get("/booking-stats", requiterAuthMiddleware, getBookingStats);
router.get("/pending-bookings", requiterAuthMiddleware, getPendingBookings);
router.get("/completed-bookings", requiterAuthMiddleware, getCompletedBookings);

// Notification routes
router.get("/notifications", requiterAuthMiddleware, getAdminNotifications);
router.put(
  "/notifications/:id",
  requiterAuthMiddleware,
  markAdminNotificationAsRead
);
router.put(
  "/notifications",
  requiterAuthMiddleware,
  markAllAdminNotificationsAsRead
);
export default router;
