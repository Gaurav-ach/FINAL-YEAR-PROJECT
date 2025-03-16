import logo from "../assets/Logo.svg";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa6";

const Footer = () => {
  return (
    <div className="container px-4 md:px-20 mx-auto flex items-center justify-between gap-4 py-3 mt-20">
      <img src={logo} alt="logo" width={200} height={200} />
      <p className="flex-1 border-l border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden">
        Copyright ©2025 | All rights reserved
      </p>
      <div className="flex items-center gap-3">
        <FaFacebook size={25} className="text-blue-700" />
        <FaInstagram size={25} className="text-pink-600" />
        <FaTwitter size={25} className="text-cyan-500" />
      </div>
    </div>
  );
};

export default Footer;
