import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../lib/prisma";

interface AuthRequest extends Request {
  user?: any;
}

export const UserAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authroized, login Again" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "user not found" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("jwt error: ", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
