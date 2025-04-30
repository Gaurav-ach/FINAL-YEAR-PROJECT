import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  role?: string;
  [key: string]: any;
}

const verifyToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    // Log the decoded token for debugging
    console.log("Token verification result:", {
      id: decoded.id,
      role: decoded.role || "undefined",
      hasId: !!decoded.id,
    });

    // Ensure the token has at least an ID
    if (!decoded.id) {
      console.error("Token missing ID field");
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

export default verifyToken;
