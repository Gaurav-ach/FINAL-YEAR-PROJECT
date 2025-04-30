import express from "express";
import { UserAuthMiddleware } from "../middleware/userAuthMiddleware";
import {
  createBooking,
  getBookedTimeSlots,
  getBookings,
  getRequiterBookings,
  getRequiterBookingStats,
  getUserBookings,
  updateBookingStatus,
} from "../controller/bookingController";
import { requiterAuthMiddleware } from "../middleware/requiterAuthMiddleware";

const router = express.Router();

router.get("/", getBookings);

//user routes
router.post("/create", UserAuthMiddleware, createBooking);
router.get("/getUserBookings", UserAuthMiddleware, getUserBookings);
router.get("/booked-slots", getBookedTimeSlots);

// Requiter routes
router.get("/requiter", requiterAuthMiddleware, getRequiterBookings);
router.get("/requiter/stats", requiterAuthMiddleware, getRequiterBookingStats);
router.put("/:bookingId", requiterAuthMiddleware, updateBookingStatus);

export default router;
