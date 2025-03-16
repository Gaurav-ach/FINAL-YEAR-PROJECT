import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";


interface DecodedToken {
  id: string | null;
  role: string | null;
}

const Redirect = ({ children }: { children: React.ReactNode }) => {
  const { requiterToken, isLoading } = useContext(AppContext);

  if (isLoading) return <div>Loading...</div>;

  if (!requiterToken) return children;

  try {
    const decoded = jwtDecode<DecodedToken>(requiterToken);

    switch (decoded.role) {
      case "REQUITER":
        return <Navigate to="/requiterDashboard/dashboard" replace />;
      case "ADMIN":
        return <Navigate to="/adminDashboard/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return children;
  }
};

export default Redirect;
