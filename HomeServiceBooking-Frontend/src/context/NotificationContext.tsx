import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { AppContext } from "./AppContext";

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "info" | "success" | "warning" | "error";
  userId?: string;
  requiterId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => Promise<void>;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const UseNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { backendUrl, requiterToken } = useContext(AppContext);

  useEffect(() => {
    // Fetch notifications from backend
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/notifications`, {
          headers: { Authorization: requiterToken },
        });
        if (
          res.data &&
          res.data.success &&
          Array.isArray(res.data.notifications)
        ) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [backendUrl, requiterToken]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.put(
        `${backendUrl}/api/admin/notifications/${id}`,
        { headers: { Authorization: requiterToken } },
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${backendUrl}/api/admin/notifications`,
        { headers: { Authorization: requiterToken } },
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  // Add notification: (Needs correct API in backend if you want to POST)
  const addNotification = async (
    notification: Omit<Notification, "id" | "createdAt">
  ) => {
    // You'll need to provide a POST endpoint for notifications if you want this to persist,
    // but for now we'll simply add it to the local state:
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Delete notification from local state only
  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Clear all notifications from local state only
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
