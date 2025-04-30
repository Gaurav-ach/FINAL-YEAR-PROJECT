import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { AppContext } from "./AppContext";

export interface UserNotification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "info" | "success" | "warning" | "error";
  userId?: string;
}

interface UserNotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Omit<UserNotification, "id" | "createdAt">
  ) => void;
  deleteNotification: (id: string) => void;
}

const UserNotificationContext = createContext<
  UserNotificationContextType | undefined
>(undefined);

export const UseUserNotifications = () => {
  const context = useContext(UserNotificationContext);
  if (!context) {
    throw new Error(
      "useUserNotifications must be used within a UserNotificationProvider"
    );
  }
  return context;
};

interface UserNotificationProviderProps {
  children: ReactNode;
}

export const UserNotificationProvider = ({
  children,
}: UserNotificationProviderProps) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { backendUrl, userToken } = useContext(AppContext);

  useEffect(() => {
    if (userToken) {
      // Fetch notifications
      const fetchNotifications = async () => {
        if (!userToken) return;

        try {
          const { data } = await axios.get(
            `${backendUrl}/api/user/notifications`,
            {
              headers: { Authorization: userToken },
            }
          );

          if (data.success) {
            setNotifications(data.notifications);
            setUnreadCount(
              data.notifications.filter((n: UserNotification) => !n.isRead)
                .length
            );
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userToken, backendUrl]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    if (!userToken) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/notifications/${id}`,
        {},
        { headers: { Authorization: userToken } }
      );

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userToken) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/user/notifications`,
        {},
        { headers: { Authorization: userToken } }
      );

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Add a new notification (client-side only)
  const addNotification = (
    notification: Omit<UserNotification, "id" | "createdAt">
  ) => {
    const newNotification: UserNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Delete notification (client-side only)
  const deleteNotification = (id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  return (
    <UserNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification,
      }}
    >
      {children}
    </UserNotificationContext.Provider>
  );
};
