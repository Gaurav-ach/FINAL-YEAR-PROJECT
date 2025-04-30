"use client";

import {
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  SquarePlus,
  User,
} from "lucide-react";
import logo from "../../assets/Logo.svg";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import DashboardSkeleton from "../../components/requiterDashboard/DashboardSkeleton";

const RequiterDashboard = () => {
  const { logout, requiterData, backendUrl, requiterToken } =
    useContext(AppContext);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if requiter is on the chat page
  const isOnChatPage = location.pathname === "/requiterDashboard/chat";

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!requiterData?.id || !requiterToken) return;

      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/chat/requiter/unread`,
          {
            headers: { Authorization: requiterToken },
          }
        );

        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isOnChatPage) {
      fetchUnreadCount();

      const intervalId = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(intervalId);
    } else {
      setUnreadCount(0);
    }
  }, [
    requiterData,
    backendUrl,
    requiterToken,
    isOnChatPage,
    location.pathname,
  ]);

  // Handle logout
  const handleLogout = async () => {
    try {
      logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  // Check if current page is profile page or chat page
  const isProfileorChatPage =
    location.pathname.includes("/requiterDashboard/profile") ||
    location.pathname.includes("/requiterDashboard/chat");

  const renderUnreadBadge = (position = "default") => {
    if (isOnChatPage || unreadCount === 0) return null;

    const baseClasses =
      "flex items-center justify-center text-xs text-white bg-red-500 rounded-full";

    if (position === "dropdown") {
      return (
        <span className={`absolute ${baseClasses} w-5 h-5 -right-2 -top-1`}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      );
    }

    return (
      <span className={`absolute ${baseClasses} w-5 h-5 right-2`}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="py-4 shadow">
        <div className="flex items-start justify-between px-5">
          <img
            className="cursor-pointer max-sm:w-32"
            src={logo || "/placeholder.svg"}
            alt="logo"
            width={200}
            height={200}
            onClick={() => navigate("/requiterDashboard/dashboard")}
          />
          <div className="flex items-center gap-3">
            <p className="max-sm:hidden">Welcome, {requiterData?.name}</p>
            <div className="relative group">
              <Avatar className="w-12 h-12 cursor-pointer">
                <AvatarImage
                  className="object-cover object-top w-full h-full rounded-full"
                  src={requiterData?.requiterProfileImage}
                  alt={requiterData?.name || "Profile"}
                />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-0 right-0 z-50 hidden pt-12 text-black rounded w-52 group-hover:block">
                <ul className="flex flex-col gap-2 p-2 m-0 text-sm list-none border rounded-md shadow-md bg-gray-50">
                  <Link to={"/requiterDashboard/profile"}>
                    <li className="flex items-center px-2 py-1 pr-10 rounded cursor-pointer hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </li>
                  </Link>
                  <Link to={"/requiterDashboard/dashboard"}>
                    <li className="relative flex items-center px-2 py-1 pr-10 rounded cursor-pointer hover:bg-gray-100">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </li>
                  </Link>

                  <li
                    onClick={handleLogout}
                    className="flex items-center px-2 py-1 pr-10 text-red-600 rounded cursor-pointer hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto">
        {!isProfileorChatPage && (
          <div className="min-w-[220px] border-r-2 h-full">
            <ul className="flex flex-col items-start pt-5 text-gray-800">
              <NavLink
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                    isActive && "bg-indigo-100 border-r-4 border-primary"
                  }`
                }
                to={"/requiterDashboard/dashboard"}
              >
                <LayoutDashboard className="w-5 h-5" />
                <p>Dashboard</p>
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                    isActive && "bg-indigo-100 border-r-4 border-primary"
                  }`
                }
                to={"/requiterDashboard/add-service"}
              >
                <SquarePlus className="w-5 h-5" />
                <p>Add Service</p>
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                    isActive && "bg-indigo-100 border-r-4 border-primary"
                  }`
                }
                to={"/requiterDashboard/manage-service"}
              >
                <Home className="w-5 h-5" />
                <p>Manage Services</p>
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 relative ${
                    isActive && "bg-indigo-100 border-r-4 border-primary"
                  }`
                }
                to={"/requiterDashboard/chat"}
              >
                <MessageCircle className="w-5 h-5" />
                <p>Messages</p>
                {renderUnreadBadge()}
              </NavLink>
            </ul>
          </div>
        )}

        {/* Main content area */}
        {!isProfileorChatPage ? (
          <div className="flex-1 p-5 overflow-y-auto">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequiterDashboard;
