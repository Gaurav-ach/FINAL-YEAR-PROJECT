import express from "express";
import { UserAuthMiddleware } from "../middleware/userAuthMiddleware";
import {
  createStripePayment,
  verifyStripePayment,
  createKhaltiPayment,
  verifyKhaltiPayment,
} from "../controller/paymentController";

const router = express.Router();

// Stripe payment routes
router.post("/stripe/create-payment", UserAuthMiddleware, createStripePayment);
router.post("/stripe/verify-payment", verifyStripePayment);

// Khalti payment routes
router.post("/khalti/create-payment", UserAuthMiddleware, createKhaltiPayment);
router.post("/khalti/verify-payment", verifyKhaltiPayment);

export default router;
