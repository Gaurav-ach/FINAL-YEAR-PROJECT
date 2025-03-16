import { Navigate } from "react-router-dom";
import { useContext } from "react";
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
  const { requiterToken, isLoading } = useContext(AppContext);

  if (isLoading) return <div>Loading...</div>;

  if (!requiterToken) {
    return <Navigate to={"/"} replace />;
  }

  const decoded = jwtDecode<DecodedToken>(requiterToken);

  if (!decoded || decoded.role !== requiredRole) {
    return <Navigate to={"/"} replace />;
  }

  return children;
};

export default ProtectedRoutes;
