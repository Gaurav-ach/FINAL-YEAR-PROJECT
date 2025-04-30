import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsListProps {
  notifications: Notification[];
  backendUrl: string;
  requiterToken: string;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsList = ({
  notifications,
  backendUrl,
  requiterToken,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsListProps) => {
  const handleMarkAllAsRead = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/requiter/notifications`,
        {},
        {
          headers: {
            Authorization: requiterToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        onMarkAllAsRead();
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/requiter/notifications/${notificationId}`,
        {},
        {
          headers: {
            Authorization: requiterToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        onMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" /> Notifications
        </CardTitle>
        <CardDescription>
          Stay updated with your business activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 && notifications.some((n) => !n.isRead) && (
          <div className="mb-4">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          </div>
        )}
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No notifications</h3>
            <p className="mt-1 text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.isRead
                    ? "bg-white"
                    : "bg-blue-50 border-blue-200"
                } cursor-pointer`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`${
                        notification.isRead
                          ? "text-gray-700"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Badge
                      variant="secondary"
                      className="text-blue-800 bg-blue-100 border-blue-200"
                    >
                      New
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsList;
