import { Home, LayoutDashboard, Search, User } from "lucide-react";
import logo from "../../assets/Logo.svg";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const AdminDashboard = () => {
  const { logout, requiterData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate("/");
  };
  return (
    <div className="min-h-screen">
      {/*Navbar for requiter pannel*/}
      <div className="py-4 shadow">
        <div className="flex items-start justify-between px-5">
          <img
            className="cursor-pointer max-sm:w-32"
            src={logo}
            alt="logo"
            width={200}
            height={200}
          />
          <div className="flex items-center gap-3">
            <p className="max-sm:hidden">Welcome, {requiterData?.name}</p>
            <div className="relative group">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  className="object-cover object-top w-full h-full rounded-full"
                  src={requiterData?.requiterProfileImage}
                  alt={"username"}
                />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="absolute top-0 right-0 z-10 hidden pt-12 text-black rounded group-hover:block">
                <ul className="p-2 m-0 text-sm list-none border rounded-md bg-gray-50 hover:bg-gray-100">
                  <li
                    onClick={handleLogout}
                    className="px-2 py-1 pr-10 cursor-pointer"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start">
        {/*sidebar for requiter pannel*/}
        <div className="inline-block min-h-screen border-r-2">
          <ul className="flex flex-col items-start pt-5 text-gray-800">
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-indigo-100 border-r-4 border-primary"
                }`
              }
              to={"/adminDashboard/dashboard"}
            >
              <LayoutDashboard />
              <p>Dashboard</p>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-indigo-100 border-r-4 border-primary"
                }`
              }
              to={"/adminDashboard/viewUsers"}
            >
              <Search />
              <p>View All Users</p>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-indigo-100 border-r-4 border-primary"
                }`
              }
              to={"/adminDashboard/manage-service"}
            >
              <Home />
              <p>Manage Services</p>
            </NavLink>
          </ul>
        </div>

        <div className="flex-1 pt-5 ml-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
