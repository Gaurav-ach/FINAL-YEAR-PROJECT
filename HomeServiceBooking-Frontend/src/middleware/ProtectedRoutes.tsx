import React from "react";

import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "REQUITER" | "ADMIN";
}

interface DecodedToken {
  id: string | null;
  role: string | null;
}

const ProtectedRoutes = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { requiterToken, isLoading, setRequiterToken } = useContext(AppContext);
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  // Effect to ensure token is properly loaded
  useEffect(() => {
    const verifyToken = async () => {
      setIsVerifying(true);

      // If no token in context, check localStorage
      if (!requiterToken) {
        const storedToken = localStorage.getItem("requiterToken");
        if (storedToken) {
          setRequiterToken(storedToken);
        }
      }

      // Short delay to ensure token is processed
      await new Promise((resolve) => setTimeout(resolve, 50));
      setIsVerifying(false);
    };

    verifyToken();
  }, [requiterToken, setRequiterToken]);

  // Show loading while verifying or while the app is in a loading state
  if (isLoading || isVerifying) {
    return <div>Loading...</div>;
  }

  // Get token from context or localStorage
  const token = requiterToken || localStorage.getItem("requiterToken");

  if (!token) {
    return <Navigate to={"/"} replace state={{ from: location }} />;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (!decoded || decoded.role !== requiredRole) {
      return <Navigate to={"/"} replace state={{ from: location }} />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to={"/"} replace state={{ from: location }} />;
  }
};

export default ProtectedRoutes;
