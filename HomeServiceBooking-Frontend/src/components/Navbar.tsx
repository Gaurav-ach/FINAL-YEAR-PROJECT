import logo from "../assets/Logo.svg";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Book,
  LogOut,
  MenuIcon,
  MessageCircle,
  Receipt,
  Settings,
  User,
} from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";
import UserNotificationBell from "./UserNotificationBell";

const Navbar = () => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const {
    setShowRequiterLogin,
    setShowUserLogin,
    userData,
    logout,
    backendUrl,
    userToken,
    requiterToken,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!userData || (!userToken && !requiterToken)) return;

      try {
        const endpoint = userData
          ? `${backendUrl}/api/chat/user/unread`
          : `${backendUrl}/api/chat/requiter/unread`;

        const token = userData ? userToken : requiterToken;

        const { data } = await axios.get(endpoint, {
          headers: { Authorization: token },
        });

        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    if (!isOnChatPage) {
      fetchUnreadCount();

      const intervalId = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(intervalId);
    } else {
      setUnreadCount(0);
    }
  }, [
    userData,
    backendUrl,
    userToken,
    requiterToken,
    isOnChatPage,
    location.pathname,
  ]);

  const handleLogout = async () => {
    logout();
    navigate("/");
    window.location.reload();
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="">
      <div className="flex justify-between px-6 py-5 shadow-sm">
        <div className="flex items-center gap-8">
          <Link to={"/"}>
            <img
              src={logo || "/placeholder.svg"}
              alt="logo"
              width={200}
              height={200}
            />
          </Link>

          <div className="items-center hidden gap-6 md:flex">
            <Link to={"/"}>
              <h2 className="hover:scale-105 hover:text-primary">Home</h2>
            </Link>
            <Link to={"/Services"}>
              <h2 className="hover:scale-105 hover:text-primary">Services</h2>
            </Link>
            <Link to={"/About"}>
              <h2 className="hover:scale-105 hover:text-primary">About Us</h2>
            </Link>
          </div>
        </div>
        <div className="hidden gap-2 md:flex">
          {!userData ? (
            <div>
              <Button
                onClick={() => setShowRequiterLogin(true)}
                variant="ghost"
              >
                Requiter Login
              </Button>
              <Button onClick={() => setShowUserLogin(true)}>Login</Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UserNotificationBell />
              <p className="max-sm:hidden">Welcome, {userData?.name}</p>
              <div className="relative group">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    className="object-cover object-top w-full h-full rounded-full"
                    src={userData?.userProfileImage}
                    alt={"username"}
                  />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute top-0 right-0 z-10 hidden text-black rounded w-52 pt-14 group-hover:block">
                  <ul className="flex flex-col gap-2 p-2 m-0 text-sm list-none border rounded-md bg-gray-50 hover:bg-gray-100">
                    <Link to={"/user-profile"}>
                      <li className="flex items-center px-2 py-1 pr-10 cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </li>
                    </Link>
                    <Link to={"/chat"}>
                      <li className="relative flex items-center px-2 py-1 pr-10 cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Messages
                        {!isOnChatPage && unreadCount > 0 && (
                          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -right-2 -top-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </li>
                    </Link>
                    <Link to={"/my-booking"}>
                      <li className="flex items-center px-2 py-1 pr-10 cursor-pointer">
                        <Book className="w-4 h-4 mr-2" />
                        My Bookings
                      </li>
                    </Link>
                    <Link to={"/payment-history"}>
                      <li className="flex items-center px-2 py-1 pr-10 cursor-pointer">
                        <Receipt className="w-4 h-4 mr-2" />
                        Payment History
                      </li>
                    </Link>
                    <li
                      onClick={handleLogout}
                      className="flex items-center px-2 py-1 pr-10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* mobile screen */}
        <div className="flex md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <MenuIcon size={25} className="mr-2" />
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col mt-10 space-y-4">
                <div className="flex flex-col space-y-4 text-center">
                  <Link to={"/"} onClick={handleCloseSheet}>
                    <h2>Home</h2>
                  </Link>
                  <Link to={"/Services"} onClick={handleCloseSheet}>
                    <h2>Service</h2>
                  </Link>
                  <Link to={"/About"} onClick={handleCloseSheet}>
                    <h2>About Us</h2>
                  </Link>
                </div>

                {!userData ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setShowRequiterLogin(true);
                        setIsSheetOpen(false);
                      }}
                      variant="outline"
                    >
                      Recuriter Login
                    </Button>
                    <Button
                      onClick={() => {
                        setShowUserLogin(true);
                        setIsSheetOpen(false);
                      }}
                    >
                      Login
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/user-profile" onClick={handleCloseSheet}>
                      <Button variant="outline" className="w-full">
                        Profile
                      </Button>
                    </Link>
                    <Link to="/chat" onClick={handleCloseSheet}>
                      <Button variant="outline" className="relative w-full">
                        Messages
                        {!isOnChatPage && unreadCount > 0 && (
                          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -right-2 -top-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </Link>
                    <Link to="/payment-history" onClick={handleCloseSheet}>
                      <Button variant="outline" className="w-full">
                        Payment History
                      </Button>
                    </Link>
                    <Button variant={"destructive"} onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
