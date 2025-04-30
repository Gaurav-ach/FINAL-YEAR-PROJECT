import React from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Notification } from "../../context/NotificationContext";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const { id, message, isRead, createdAt, type } = notification;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <X className="w-5 h-5 text-red-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`p-4 border-b ${
        !isRead ? "bg-blue-50" : ""
      } transition-colors duration-200 hover:bg-gray-50`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">{getIcon()}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{message}</p>
              {!isRead && (
                <Badge variant="outline" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {format(createdAt, "MM/dd/yyyy")}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isRead && (
            <button
              onClick={() => onMarkAsRead(id)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={() => onDelete(id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
