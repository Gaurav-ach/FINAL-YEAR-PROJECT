import { Request, Response } from "express";
import { db } from "../lib/prisma";

interface AuthenticatedRequest extends Request {
  requiter?: any;
}

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const id = req.requiter?.id;
  const userRole = req.requiter?.role;

  if (!id || userRole !== "ADMIN") {
    res.status(400).json({ success: false, message: "Unauthorized access" });
    return;
  }

  const { role } = req.query;

  //initial value of users and total numbers of users
  let users = [];
  let totalUsers = 0;
  try {
    if (role === "user") {
      users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          userProfileImage: true,
          isActive: true,
        },
      });
      totalUsers = await db.user.count();
    } else if (role === "requiter") {
      users = await db.requiter.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          contactNumber: true,
          role: true,
          requiterProfileImage: true,
        },
      });
      totalUsers = await db.requiter.count();
    } else {
      //fetch both requiter and users
      const requiter = await db.requiter.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          contactNumber: true,
          role: true,
          requiterProfileImage: true,
        },
      });

      const normalUsers = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          userProfileImage: true,
          isActive: true,
        },
      });

      users = [...requiter, ...normalUsers];

      //fetch both users and requiter total count
      const totalRequiter = await db.requiter.count();
      const totalNormalUsers = await db.user.count();
      totalUsers = totalRequiter + totalNormalUsers;
    }

    res.status(200).json({ success: true, users, totalUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;
    const { id } = req.params;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!id) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    // Try to find user in both user and requiter tables
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        userProfileImage: true,
        createdAt: true,
        booking: {
          select: {
            id: true,
            date: true,
            bookingStatus: true,
            business: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    const requiter = await db.requiter.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        requiterProfileImage: true,
        contactNumber: true,
        createdAt: true,
        Business: {
          select: {
            id: true,
            name: true,
            booking: {
              select: {
                id: true,
                date: true,
                bookingStatus: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!user && !requiter) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Format the response based on whether it's a user or requiter
    const userDetails = user
      ? {
          ...user,
          role: "USER",
          bookings: user.booking.map((booking) => ({
            id: booking.id,
            service: booking.business.name,
            date: booking.date,
            status: booking.bookingStatus.toLowerCase(),
          })),
        }
      : {
          ...requiter,
          bookings: requiter?.Business.flatMap((business) =>
            business.booking.map((booking) => ({
              id: booking.id,
              service: business.name,
              date: booking.date,
              status: booking.bookingStatus.toLowerCase(),
              customerName: booking.user.name,
            }))
          ),
        };

    res.status(200).json({
      success: true,
      user: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;
    const { userId } = req.params;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await db.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleUserStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;
    const { id } = req.params;
    const { status } = req.body;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!id) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    if (!status || !["active", "banned"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Valid status (active or banned) is required",
      });
      return;
    }

    // Try to update user in both tables
    const user = await db.user.findUnique({ where: { id } });
    const requiter = await db.requiter.findUnique({ where: { id } });

    if (!user && !requiter) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    let updatedUser;
    if (user) {
      updatedUser = await db.user.update({
        where: { id },
        data: { status },
      });
    } else {
      updatedUser = await db.requiter.update({
        where: { id },
        data: { status },
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getBookingStats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const totalBookings = await db.booking.count();
    const pendingBookings = await db.booking.count({
      where: { bookingStatus: "PENDING" },
    });
    const completedBookings = await db.booking.count({
      where: { bookingStatus: "COMPLETED" },
    });
    const cancelledBookings = await db.booking.count({
      where: { bookingStatus: "CANCELLED" },
    });

    // Get bookings with location data
    const bookingsWithLocation = await db.booking.findMany({
      where: {
        NOT: {
          latitude: null,
          longitude: null,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        locationName: true,
        business: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        bookingsWithLocation,
      },
    });
  } catch (error) {
    console.error("Error getting booking stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPendingBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const pendingBookings = await db.booking.findMany({
      where: { bookingStatus: "PENDING" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        business: {
          select: {
            name: true,
            category: true,
            requiter: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      pendingBookings,
    });
  } catch (error) {
    console.error("Error getting pending bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCompletedBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const completedBookings = await db.booking.findMany({
      where: { bookingStatus: "COMPLETED" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        business: {
          select: {
            name: true,
            category: true,
            requiter: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      completedBookings,
    });
  } catch (error) {
    console.error("Error getting pending bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAdminNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const notifications = await db.notification.findMany({
      where: {
        requiterId: adminId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAdminNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;
    const { id } = req.params;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Notification ID is required" });
      return;
    }

    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    if (notification.requiterId !== adminId) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to update this notification",
      });
      return;
    }

    const updatedNotification = await db.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const markAllAdminNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.requiter?.id;
    const adminRole = req.requiter?.role;

    if (!adminId || adminRole !== "ADMIN") {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    await db.notification.updateMany({
      where: {
        requiterId: adminId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
