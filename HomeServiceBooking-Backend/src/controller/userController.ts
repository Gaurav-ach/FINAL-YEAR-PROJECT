import { Request, Response } from "express";
import { db } from "../lib/prisma";
import { Prisma, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken";

interface AuthenticatedRequest extends Request {
  user?: any;
}

//Register a new user
export const registerUser = async (req: Request, res: Response) => {
  //define req body types
  const { firstName, lastName, email, password } = req.body;

  const imageFile = req.file;

  //Ensure the required fields are provided
  if (!firstName || !lastName || !email || !password || !imageFile) {
    res.status(400).json({ success: false, message: "Missing details" });
    return;
  }

  try {
    //check if user already exists
    const userExists: User | null = await db.user.findUnique({
      where: { email },
    });

    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //storing image
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    //storing name
    const name = firstName + " " + lastName;

    //create the user data to store in database
    const userData: Prisma.UserCreateInput = {
      email,
      password: hashPassword,
      name,
      firstName,
      lastName,
      userProfileImage: imageUpload.secure_url,
    };

    //store the user data in database
    const createdUser = await db.user.create({ data: userData });

    //generate the token using createdUser
    const token = generateToken(createdUser.id);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        image: createdUser.userProfileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Login the user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    //finding the existing user
    const userExists: User | null = await db.user.findUnique({
      where: { email },
    });

    if (!userExists) {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
      return;
    }

    //compare the password with hashedpassword
    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
      return;
    }

    //generate the token if password matches
    const token = generateToken(userExists.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
        image: userExists.userProfileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//get user data
export const getUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(400).json({ success: false, message: "user not found" });
      return;
    }

    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//deleting user data
export const deleteUserData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    //find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    //check if user exists
    if (!user) {
      res.status(404).json({ success: false, message: "user not found" });
      return;
    }

    //delete the user
    await db.user.delete({
      where: { id: userId },
    });

    res
      .status(200)
      .json({ success: true, message: "Profile Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user.id;
  const updates = req.body;
  const imageFile = req.file;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  try {
    //check if user exists
    const existingUser = await db.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    // If updating password, check old password and hash new password
    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(
        updates.oldPassword,
        existingUser.password
      );
      if (!isMatch) {
        res.status(400).json({ success: false, message: "Invalid password" });
        return;
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.newPassword, salt);

      // Remove oldPassword and newPassword from updates to avoid accidental storage
      delete updates.oldPassword;
      delete updates.newPassword;
    }

    // Optional image upload to Cloudinary
    if (imageFile) {
      const uploadResult = await cloudinary.uploader.upload(imageFile.path);
      updates.userProfileImage = uploadResult.secure_url;
    }

    //update the user and store in the database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updates,
    });

    console.log(updatedUser);
    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

// Get user notifications
export const getUserNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const notifications = await db.notification.findMany({
      where: {
        userId,
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

// Mark notification as read
export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
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

    if (notification.userId !== userId) {
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

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    await db.notification.updateMany({
      where: {
        userId,
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

// Get user payment history
export const getUserPaymentHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const payments = await db.payment.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
