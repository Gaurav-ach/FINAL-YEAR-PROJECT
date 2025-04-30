import { Request, Response } from "express";
import { db } from "../lib/prisma";
import { Prisma, Requiter } from "@prisma/client";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken";

interface AuthenticatedRequest extends Request {
  requiter?: any;
}

//Register a new requiter
export const registerRequiter = async (req: Request, res: Response) => {
  //define req body types
  const { firstName, lastName, email, password, contactNumber, role } =
    req.body;

  const imageFile = req.file;

  //Ensure the required fields are provided
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !imageFile ||
    !role ||
    !contactNumber
  ) {
    res.status(400).json({ success: false, message: "Missing details" });
    return;
  }

  try {
    //check if requiter already exists
    const requiterExists: Requiter | null = await db.requiter.findUnique({
      where: { email },
    });

    if (requiterExists) {
      res
        .status(400)
        .json({ success: false, message: "Requiter already exists" });
      return;
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //validate Roles
    const allowedRoles = ["REQUITER"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
    }

    //storing image
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    //storing name
    const name = firstName + " " + lastName;

    //create the requiter data to store in database
    const requiterData: Prisma.RequiterCreateInput = {
      email,
      password: hashPassword,
      name,
      firstName,
      lastName,
      contactNumber,
      role,
      requiterProfileImage: imageUpload.secure_url,
    };

    //store the requiter data in database
    const createdRequiter = await db.requiter.create({ data: requiterData });

    //generate the token using createdRequiter
    const token = generateToken(createdRequiter.id, createdRequiter.role);

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      requiter: {
        id: createdRequiter.id,
        name: createdRequiter.name,
        email: createdRequiter.email,
        image: createdRequiter.requiterProfileImage,
        role: createdRequiter.role,
        contactNumber: createdRequiter.contactNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering requiter: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Login the requiter
export const loginRequiter = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    //finding the existing requiter
    const requiterExists: Requiter | null = await db.requiter.findUnique({
      where: { email },
    });

    if (!requiterExists) {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
      return;
    }

    //compare the password with hashedpassword
    const isMatch = await bcrypt.compare(password, requiterExists.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid Credentials" });
      return;
    }

    //generate the token if password matches
    const token = generateToken(requiterExists.id, requiterExists.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      requiter: {
        id: requiterExists.id,
        name: requiterExists.name,
        email: requiterExists.email,
        image: requiterExists.requiterProfileImage,
        role: requiterExists.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in requiter: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//api to add business data
export const addBusinessData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const requiterId = req.requiter?.id;

  if (!requiterId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  const { name, about, address, category, amount } = req.body;
  const imageFile = req.files as Express.Multer.File[];

  if (!name || !category || !about || !category || !amount || !imageFile) {
    res.status(400).json({ success: false, message: "Missing details" });
    return;
  }

  try {
    // Ensure the Vendor (User) exists
    const existingRequiter = await db.requiter.findUnique({
      where: { id: requiterId },
    });

    if (!existingRequiter) {
      res.status(404).json({ success: false, message: "Requiter not found" });
      return;
    }

    const amountInNum = Number(amount);

    const businessData: Prisma.BusinessCreateInput = {
      name,
      category,
      about,
      address,
      amount: amountInNum,
      requiter: {
        connect: { id: requiterId },
      },
    };

    const newBusinessData = await db.business.create({
      data: businessData,
    });

    const uploadImages = await Promise.all(
      imageFile.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
      })
    );

    await Promise.all(
      uploadImages.map(async (url) => {
        await db.imageUrl.create({
          data: {
            businessId: newBusinessData.id,
            url,
          },
        });
      })
    );

    res.status(200).json({
      success: true,
      message: "Added New business data",
      business: newBusinessData,
      images: uploadImages,
    });
  } catch (error) {
    console.error("Error adding business data:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

//api to get business data
export const getBusinessData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const businessData = await db.business.findMany({
      include: {
        images: true,
        requiter: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
          },
        },
      },
    });

    if (!businessData || businessData.length === 0) {
      res.status(404).json({ success: false, message: "No Data Found" });
      return;
    }

    res.status(200).json({ success: true, businessData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//api to get business data
export const getBusinessDataForRequiter = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(404).json({ success: false, message: "UnAuthorized Access" });
    }

    const businessData = await db.business.findMany({
      where: { requiterId },
      include: {
        images: true,
        requiter: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
          },
        },
      },
    });

    if (!businessData || businessData.length === 0) {
      res.status(404).json({ success: false, message: "No Data Found" });
      return;
    }

    res.status(200).json({ success: true, businessData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//getBusinessDataById
export const getBusinessDataById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: "ID is required" });
      return;
    }

    const businessData = await db.business.findUnique({
      where: { id: id as string },
      include: {
        images: true,
        requiter: {
          select: {
            name: true,
            email: true,
            contactNumber: true,
          },
        },
      },
    });

    if (!businessData) {
      res.status(404).json({ success: false, message: "No data found" });
      return;
    }

    res.status(200).json({ success: true, businessData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//get requiter data
export const getRequiterData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }
    const requiter = await db.requiter.findUnique({
      where: { id: requiterId },
    });

    if (!requiter) {
      res.status(400).json({ success: false, message: "Requiter not found" });
      return;
    }

    res.status(200).json({ success: true, requiter: requiter });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//deleting requiter data
export const deleteRequiterData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    //find the requiter
    const requiter = await db.requiter.findUnique({
      where: { id: requiterId },
    });

    //check if requiter exists
    if (!requiter) {
      res.status(404).json({ success: false, message: "user not found" });
      return;
    }

    //delete the requiter
    await db.requiter.delete({
      where: { id: requiterId },
    });

    res
      .status(200)
      .json({ success: true, message: "Profile Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateRequiterProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const requiterId = req.requiter.id;
  const updates = req.body;
  const imageFile = req.file;

  if (!requiterId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  try {
    //check if requiter exists
    const existingRequiter = await db.requiter.findUnique({
      where: { id: requiterId },
    });

    if (!existingRequiter) {
      res.status(400).json({ success: false, message: "Requiter not found" });
      return;
    }

    // If updating password, check old password and hash new password
    if (updates.oldPassword && updates.newPassword) {
      const isMatch = await bcrypt.compare(
        updates.oldPassword,
        existingRequiter.password
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
      updates.requiterProfileImage = uploadResult.secure_url;
    }

    //update the requiter and store in the database
    const updatedRequiter = await db.requiter.update({
      where: { id: requiterId },
      data: updates,
    });

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      requiter: updatedRequiter,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

// Update business data
export const updateBusinessData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;
    const { id } = req.params;
    const { name, about, address, category, amount } = req.body;
    const imageFiles = req.files as Express.Multer.File[];

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Check if the business exists and belongs to this requiter
    const existingBusiness = await db.business.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingBusiness) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (existingBusiness.requiterId !== requiterId) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to update this business",
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (about) updateData.about = about;
    if (address) updateData.address = address;
    if (category) updateData.category = category;
    if (amount) updateData.amount = Number(amount);

    // Update business data
    await db.business.update({
      where: { id },
      data: updateData,
    });

    // Handle image updates if new images are provided
    if (imageFiles && imageFiles.length > 0) {
      // Delete existing images from Cloudinary
      if (existingBusiness.images.length > 0) {
        try {
          await Promise.all(
            existingBusiness.images.map(async (image) => {
              const publicId = image.url.split("/").pop()?.split(".")[0];
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            })
          );
        } catch (error) {
          console.error("Error deleting old images from Cloudinary:", error);
        }
      }

      // Delete existing image records from database
      await db.imageUrl.deleteMany({
        where: { businessId: id },
      });

      // Upload new images to Cloudinary and create new records
      const uploadPromises = imageFiles.map((file) =>
        cloudinary.uploader.upload(file.path)
      );
      const uploadedImages = await Promise.all(uploadPromises);

      // Create new image records
      await Promise.all(
        uploadedImages.map((image) =>
          db.imageUrl.create({
            data: {
              businessId: id,
              url: image.secure_url,
            },
          })
        )
      );
    }

    // Fetch updated business data with images
    const finalBusinessData = await db.business.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business: finalBusinessData,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete a business
export const deleteBusinessData = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;
    const { id } = req.params;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Business ID is required" });
      return;
    }

    // Check if the business exists and belongs to this requiter
    const business = await db.business.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    if (business.requiterId !== requiterId) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to delete this business",
      });
      return;
    }

    // Delete associated images from Cloudinary
    if (business.images && business.images.length > 0) {
      try {
        await Promise.all(
          business.images.map(async (image) => {
            const publicId = image.url.split("/").pop()?.split(".")[0];
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          })
        );
      } catch (imageError) {
        console.error("Error deleting images from Cloudinary:", imageError);
      }
    }

    // Delete the business
    await db.business.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get requiter notifications
export const getRequiterNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Get notifications for this requiter
    const notifications = await db.notification.findMany({
      where: {
        requiterId,
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
    const requiterId = req.requiter?.id;
    const { id } = req.params;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Notification ID is required" });
      return;
    }

    // Check if the notification exists and belongs to this requiter
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res
        .status(404)
        .json({ success: false, message: "Notification not found" });
      return;
    }

    if (notification.requiterId !== requiterId) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to update this notification",
      });
      return;
    }

    // Update the notification
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
    const requiterId = req.requiter?.id;

    if (!requiterId) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    // Update all unread notifications for this requiter
    const result = await db.notification.updateMany({
      where: {
        requiterId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Get updated notifications
    const updatedNotifications = await db.notification.findMany({
      where: {
        requiterId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      notifications: updatedNotifications,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create a notification
export const createNotification = async (data: {
  userId?: string;
  requiterId?: string;
  message: string;
}) => {
  try {
    const notification = await db.notification.create({
      data: {
        ...data,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
