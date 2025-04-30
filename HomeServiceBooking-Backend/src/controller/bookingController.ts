import type { Request, Response } from "express";
import { db } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface AuthenticatedRequest extends Request {
  user?: any;
  requiter?: any;
}

export const getBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = await db.booking.findMany({
      include: {
        business: {
          select: {
            address: true,
            name: true,
            category: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
            requiter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    //return if not booked
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    //return data if user has booked
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const {
      businessId,
      date,
      time,
      paymentId,
      latitude,
      longitude,
      locationName,
    } = req.body;

    // Validate required fields
    if (!businessId || !date || !time) {
      res.status(400).json({
        success: false,
        message: "Business ID, date, and time are required",
      });
      return;
    }

    // Check if business exists
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { requiterId: true },
    });

    if (!business) {
      res.status(404).json({
        success: false,
        message: "Business not found",
      });
      return;
    }

    // Parse date
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if the booking date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      res.status(400).json({
        success: false,
        message: "Cannot book for a past date",
      });
      return;
    }

    // Create date range for the selected date
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if there's already a booking for this business at the same date and time
    const existingBooking = await db.booking.findFirst({
      where: {
        businessId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        time: time,
        bookingStatus: "COMPLETED",
      },
    });

    if (existingBooking) {
      res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
      return;
    }

    // If paymentId is provided, verify payment status
    if (paymentId) {
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        res.status(404).json({
          success: false,
          message: "Payment not found",
        });
        return;
      }

      if (payment.status !== "COMPLETED") {
        res.status(400).json({
          success: false,
          message: "Payment not completed",
        });
        return;
      }
    }

    // Create the booking with location data
    const newBooking = await db.booking.create({
      data: {
        userId,
        businessId,
        date: bookingDate,
        time: time.trim(),
        bookingStatus: "PENDING",
        latitude: latitude ? new Decimal(latitude) : null,
        longitude: longitude ? new Decimal(longitude) : null,
        locationName: locationName || null,
      },
    });

    // Create notification for the user
    await db.notification.create({
      data: {
        userId,
        message: `Your booking request for ${new Date(
          bookingDate
        ).toLocaleDateString()} at ${time} has been submitted and is pending approval.`,
        isRead: false,
      },
    });

    // create or get conversation between user and business owner
    if (business.requiterId) {
      let conversation = await db.conversation.findFirst({
        where: {
          userId,
          requiterId: business.requiterId,
        },
      });

      // If not, create a new conversation
      if (!conversation) {
        conversation = await db.conversation.create({
          data: {
            userId,
            requiterId: business.requiterId,
          },
        });

        // Add initial system message about the booking
        await db.message.create({
          data: {
            conversationId: conversation.id,
            content: `Booking #${newBooking.id} has been created for ${new Date(
              bookingDate
            ).toLocaleDateString()} at ${time}. Status: Pending approval. You can now chat with each other.`,
            senderId: "system",
            senderType: "REQUITER",
          },
        });
      } else {
        // If conversation exists, just add a new booking notification message
        await db.message.create({
          data: {
            conversationId: conversation.id,
            content: `A new booking #${
              newBooking.id
            } has been created for ${new Date(
              bookingDate
            ).toLocaleDateString()} at ${time}. Status: Pending approval.`,
            senderId: "system",
            senderType: "REQUITER",
          },
        });
      }

      // Create a notification for the requiter
      await db.notification.create({
        data: {
          requiterId: business.requiterId,
          message: `New booking request for ${new Date(
            bookingDate
          ).toLocaleDateString()} at ${time}`,
          isRead: false,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    //if user not found
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    //find booking if user available
    const booking = await db.booking.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            address: true,
            name: true,
            category: true,
            images: {
              select: {
                url: true,
              },
              take: 1,
            },
            requiter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    //return if not booked
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    //return data if user has booked
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Error getting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBookedTimeSlots = async (req: Request, res: Response) => {
  try {
    const { businessId, date } = req.query;

    if (!businessId || !date) {
      res.status(400).json({
        success: false,
        message: "Business ID and date are required",
      });
      return;
    }

    // Parse date
    const bookingDate = new Date(date as string);
    bookingDate.setHours(0, 0, 0, 0);

    // Create date range for the selected date
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all bookings for this business on the selected date
    const bookings = await db.booking.findMany({
      where: {
        businessId: businessId as string,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        bookingStatus: "COMPLETED",
      },
      select: {
        time: true,
      },
    });

    // Extract just the time strings
    const bookedSlots = bookings.map((booking) => booking.time);

    res.status(200).json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error("Error getting booked time slots:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Validate status
    if (!status || !["PENDING", "COMPLETED", "CANCELLED"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Valid status is required (PENDING, COMPLETED, or CANCELLED)",
      });
      return;
    }

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: {
          select: {
            requiterId: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    // Verify that the requiter owns this business
    if (booking.business.requiterId !== requiterId) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to update this booking",
      });
      return;
    }

    // Update the booking status
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: status,
      },
      include: {
        user: true,
        business: true,
      },
    });

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: updatedBooking.user.id,
        message: `Your booking for ${
          updatedBooking.business.name
        } has been ${status.toLowerCase()}. ${
          status === "COMPLETED"
            ? "Thank you for using our service!"
            : status === "CANCELLED"
            ? "Please contact support if you have any questions."
            : ""
        }`,
        isRead: false,
      },
    });

    // Find conversation between user and requiter
    const conversation = await db.conversation.findFirst({
      where: {
        userId: booking.user.id,
        requiterId: requiterId,
      },
    });

    // If conversation exists, add a status update message
    if (conversation) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          content: `Booking #${bookingId} status has been updated to ${status} by the service provider.`,
          senderId: "system",
          senderType: "REQUITER",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRequiterBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const businesses = await db.business.findMany({
      where: { requiterId },
      select: { id: true },
    });

    const businessIds = businesses.map((b) => b.id);

    const bookings = await db.booking.findMany({
      where: {
        businessId: { in: businessIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            userProfileImage: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error getting requiter bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRequiterBookingStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Find all businesses owned by this requiter
    const businesses = await db.business.findMany({
      where: { requiterId },
      select: { id: true },
    });

    const businessIds = businesses.map((b) => b.id);

    // Find all bookings for these businesses
    const bookings = await db.booking.findMany({
      where: {
        businessId: { in: businessIds },
      },
      include: {
        business: {
          select: {
            amount: true,
            category: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.bookingStatus === "PENDING"
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.bookingStatus === "COMPLETED"
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.bookingStatus === "CANCELLED"
    ).length;

    // Calculate total revenue (from completed bookings)
    const totalRevenue = bookings
      .filter((b) => b.bookingStatus === "COMPLETED")
      .reduce((sum, booking) => sum + booking.business.amount, 0);

    // Group bookings by month
    const monthlyBookings: Record<string, number> = {};
    bookings.forEach((booking) => {
      const month = new Date(booking.date).toLocaleString("default", {
        month: "short",
      });
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });

    // Group bookings by category
    const categoryBookings: Record<string, number> = {};
    bookings.forEach((booking) => {
      const category = booking.business.category;
      categoryBookings[category] = (categoryBookings[category] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        monthlyBookings,
        categoryBookings,
      },
    });
  } catch (error) {
    console.error("Error getting booking statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
