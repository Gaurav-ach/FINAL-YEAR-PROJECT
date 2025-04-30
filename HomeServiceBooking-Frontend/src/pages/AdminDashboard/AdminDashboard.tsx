import { useContext } from "react";
import {
  Users,
  Settings,
  LogOut,
  Bell,
  LayoutDashboard,
  List,
} from "lucide-react";
import logo from "../../assets/logo.svg";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import NotificationBell from "../../components/adminDashboard/NotificationBell";
import { getInitials } from "../../lib/utils";

// OPTIONAL: If you have a Footer component, import it here.
// import Footer from "../../components/layout/Footer";

const AdminDashboard = () => {
  const { logout, requiterData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  const isProfilePage = location.pathname.includes("/admin/profile");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar for admin panel */}
      <div className="z-50 py-3 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center">
            <img
              className="cursor-pointer max-sm:w-32"
              src={logo || "https://via.placeholder.com/150x50?text=Logo"}
              alt="logo"
              width={200}
              height={150}
            />
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative group">
              <Avatar className="w-10 h-10 border-2 border-gray-200">
                <AvatarImage
                  className="object-cover object-top w-full h-full rounded-full"
                  src={requiterData?.requiterProfileImage}
                  alt={requiterData?.name || "Admin"}
                />
                <AvatarFallback>
                  {getInitials(requiterData?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-0 right-0 z-10 hidden pt-12 text-black rounded w-52 group-hover:block">
                <ul className="flex flex-col gap-1 p-2 m-0 text-sm list-none bg-white border rounded-md shadow-md">
                  <li className="px-3 py-2 font-medium text-gray-900 border-b">
                    {requiterData?.name || "Admin User"}
                  </li>
                  <Link to="/adminDashboard/profile">
                    <li className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </li>
                  </Link>
                  <li
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 mt-1 text-red-600 rounded-md cursor-pointer hover:bg-red-50"
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

      {/* Main content area: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {!isProfilePage && (
          <aside className="flex flex-col w-64 bg-white border-r shadow-sm">
            <div className="flex flex-col flex-1 pt-5">
              <nav className="flex-1 px-2 space-y-1">
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center p-3 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  to="/adminDashboard/dashboard"
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  Dashboard
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center p-3 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  to="/adminDashboard/users"
                >
                  <Users className="w-5 h-5 mr-3" />
                  User Management
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center p-3 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  to="/adminDashboard/services"
                >
                  <List className="w-5 h-5 mr-3" />
                  Service Management
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center p-3 text-base font-medium rounded-md ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  to="/adminDashboard/notifications"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </NavLink>
              </nav>
              <div className="px-2 pt-5 mt-auto mb-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 text-base font-medium text-red-700 rounded-md hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className={`flex-1 ${!isProfilePage ? "px-6 py-6" : ""} min-h-0`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
