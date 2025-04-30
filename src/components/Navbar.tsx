import logo from "../assets/Logo.svg";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { MenuIcon, User } from "lucide-react";
import { useContext, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Navbar = () => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const { setShowRequiterLogin, setShowUserLogin, userData, logout } =
    useContext(AppContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();

    navigate("/");
    window.location.reload();
  };

  //close the sidebar when navigating the pages
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };
  return (
    <div className="">
      <div className="flex justify-between px-6 py-5 shadow-sm">
        <div className="flex items-center gap-8">
          {/* logo */}
          <Link to={"/"}>
            <img src={logo} alt="logo" width={200} height={200} />
          </Link>
          {/* navLinks */}

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
                <div className="absolute top-0 right-0 z-10 hidden text-black rounded pt-14 group-hover:block">
                  <ul className="p-2 m-0 text-sm list-none border rounded-md bg-gray-50 hover:bg-gray-100">
                    <Link to={"/user-profile"}>
                      <li className="px-2 py-1 pr-10 cursor-pointer">
                        Profile
                      </li>
                    </Link>
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
                    <Button variant="outline">Profile</Button>
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
