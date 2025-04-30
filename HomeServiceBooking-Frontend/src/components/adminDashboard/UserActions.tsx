import React, { useState } from "react";
import { MoreHorizontal, Trash2, Eye, Ban, UserCheck } from "lucide-react";
import { UseNotifications } from "../../context/NotificationContext";

interface UserActionsProps {
  userId: string;
  userName: string;
  isBanned?: boolean;
  onViewDetails: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  userId,
  userName,
  isBanned = false,
  onViewDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addNotification } = UseNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleViewDetails = () => {
    onViewDetails();
    setIsOpen(false);
    console.log(window.location.href);
  };

  const handleBanUser = () => {
    // Mock API call to ban user
    console.log(`Banning user: ${userId}`);

    // Add notification
    addNotification({
      message: `${isBanned ? "Unbanned" : "Banned"} user: ${userName}`,
      isRead: false,
      type: "warning",
      userId,
    });

    setIsOpen(false);
  };

  const handleDeleteUser = () => {
    if (window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      // Mock API call to delete user
      console.log(`Deleting user: ${userId}`);

      // Add notification
      addNotification({
        message: `Deleted user: ${userName}`,
        isRead: false,
        type: "error",
        userId,
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
        aria-label="User actions"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
          <ul className="py-1">
            <li>
              <button
                onClick={handleViewDetails}
                className="flex w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" /> View Details
              </button>
            </li>
            <li>
              <button
                onClick={handleBanUser}
                className="flex w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                {isBanned ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" /> Unban User
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" /> Ban User
                  </>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={handleDeleteUser}
                className="flex w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete User
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserActions;
