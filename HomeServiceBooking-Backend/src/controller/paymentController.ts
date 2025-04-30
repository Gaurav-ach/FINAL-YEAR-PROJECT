import type { Request, Response } from "express";
import { db } from "../lib/prisma";
import Stripe from "stripe";
import axios from "axios";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export const createStripePayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { amount, businessName } = req.body;

    // Validate payload
    if (!amount) {
      res.status(400).json({ success: false, message: "Amount is required" });
      return;
    }

    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100);

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId,
        businessName: businessName || "Service Booking",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Ensure the user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist
    if (!existingUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Store new payment record
    const payment = await db.payment.create({
      data: {
        amount: amount,
        paymentMethod: "CREDIT",
        status: "PENDING",
        userId: existingUser.id,
      },
    });

    // Create notification for the user
    await db.notification.create({
      data: {
        userId,
        message: `Payment of $${amount} initiated for ${
          businessName || "Service Booking"
        }.`,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Stripe payment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyStripePayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    if (!paymentIntentId || !paymentId) {
      res.status(400).json({
        success: false,
        message: "Payment Intent ID and Payment ID are required",
      });
      return;
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    // Update payment status
    let updatedPayment;
    if (paymentIntent.status === "succeeded") {
      updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: { status: "COMPLETED" },
      });

      // Get user ID from payment record
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        select: { userId: true, amount: true },
      });

      if (payment) {
        // Create notification for successful payment
        await db.notification.create({
          data: {
            userId: payment.userId,
            message: `Payment of $${payment.amount} has been completed successfully.`,
            isRead: false,
          },
        });
      }
    } else {
      updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: { status: "PENDING" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verification successful",
      payment: updatedPayment,
      stripeStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error("Stripe verification error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
    });
  }
};

export const createKhaltiPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { payload } = req.body;

    if (!payload) {
      res.status(400).json({ success: false, message: "payload is required" });
      return;
    }

    const khaltiResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Store new payment record
    const payment = await db.payment.create({
      data: {
        amount: payload.amount,
        paymentMethod: "CREDIT",
        status: "PENDING",
        userId: userId,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId,
        message: `Payment of NPR ${
          payload.amount
        } initiated for ${"Service Booking"}.`,
        isRead: false,
      },
    });

    res.status(200).json({
      success: true,
      paymentUrl: khaltiResponse.data.payment_url,
      pidx: khaltiResponse.data.pidx,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Khalti payment error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyKhaltiPayment = async (req: Request, res: Response) => {
  try {
    const { pidx, paymentId } = req.body;

    if (!pidx || !paymentId) {
      res.status(400).json({
        success: false,
        message: "Payment ID and Khalti transaction ID are required",
      });
      return;
    }

    const khaltiResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    // Update payment status based on Khalti response
    let updatedPayment;
    if (khaltiResponse.data.status === "Completed") {
      updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: { status: "COMPLETED" },
      });

      // Create notification for successful payment
      await db.notification.create({
        data: {
          userId: payment.userId,
          message: `Payment of NPR ${payment.amount} has been completed successfully.`,
          isRead: false,
        },
      });
    } else {
      updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: { status: "PENDING" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verification successful",
      payment: updatedPayment,
      khaltiStatus: khaltiResponse.data.status,
    });
  } catch (error) {
    console.error("Khalti verification error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
    });
  }
};
