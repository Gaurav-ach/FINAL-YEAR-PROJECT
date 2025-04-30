import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../lib/prisma";

interface AuthRequest extends Request {
  requiter?: any;
}

export const requiterAuthMiddleware = async (
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

    const requiter = await db.requiter.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!requiter) {
      res.status(401).json({ success: false, message: "Requiter not found" });
      return;
    }

    req.requiter = requiter;

    next();
  } catch (error) {
    console.error("jwt error: ", error);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
