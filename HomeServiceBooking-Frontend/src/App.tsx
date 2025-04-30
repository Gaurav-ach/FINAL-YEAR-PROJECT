import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Category from "./pages/Category";
import BusinessDetails from "./pages/BusinessDetails";
import RequiterLogin from "./components/RequiterLogin";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { Toaster } from "sonner";
import RequiterDashboard from "./pages/RequiterDashboard/RequiterDashboard";
import AddService from "./pages/RequiterDashboard/AddService";
import ManageService from "./pages/RequiterDashboard/ManageService";
import ViewRequiterDashboard from "./pages/RequiterDashboard/ViewRequiterDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ViewAdminDashboard from "./pages/AdminDashboard/ViewAdminDashboard";
import ProtectedRoutes from "./middleware/ProtectedRoutes";
import ViewUsers from "./pages/AdminDashboard/ManageUsers";
import UserLogin from "./components/UserLogin";
import UserProfile from "./pages/userProfile";
import Profile from "./pages/Profile";
import MyBooking from "./pages/MyBooking";
import Chat from "./pages/Chat";
import RequiterChat from "./pages/RequiterChat";
import ProtectedUserRoutes from "./middleware/ProtectedUserRoutes";
import UserDetails from "./pages/AdminDashboard/UserDetails";
import ManageServices from "./pages/AdminDashboard/ManageServices";
import NotificationCenter from "./pages/AdminDashboard/NotificationCenter";
import PaymentHistory from "./pages/PaymentHistory";

const App = () => {
  const location = useLocation();
  const { showRequiterLogin, showUserLogin, userToken } =
    useContext(AppContext);
  return (
    <div>
      {!location.pathname.startsWith("/requiterDashboard") &&
        !location.pathname.startsWith("/adminDashboard") && <Navbar />}
      {showRequiterLogin && <RequiterLogin />}
      {showUserLogin && <UserLogin />}
      <Toaster richColors duration={5000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/businessDetails/:id" element={<BusinessDetails />} />
        <Route
          path="/user-profile"
          element={
            <ProtectedUserRoutes>
              <UserProfile />
            </ProtectedUserRoutes>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedUserRoutes>
              <PaymentHistory />
            </ProtectedUserRoutes>
          }
        />

        {userToken && <Route path="/my-booking" element={<MyBooking />} />}

        <Route
          path="/chat"
          element={
            <ProtectedUserRoutes>
              <Chat />
            </ProtectedUserRoutes>
          }
        />

        <Route
          path="/requiterDashboard"
          element={
            <ProtectedRoutes requiredRole="REQUITER">
              <RequiterDashboard />
            </ProtectedRoutes>
          }
        >
          <Route path="dashboard" element={<ViewRequiterDashboard />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="manage-service" element={<ManageService />} />
          <Route path="profile" element={<Profile />} />
          <Route path="chat" element={<RequiterChat />} />
        </Route>
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoutes requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoutes>
          }
        >
          <Route path="dashboard" element={<ViewAdminDashboard />} />
          <Route path="users" element={<ViewUsers />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!location.pathname.startsWith("/category/") &&
        !location.pathname.startsWith("/requiterDashboard") &&
        !location.pathname.startsWith("/chat") && <Footer />}
    </div>
  );
};

export default App;
