import { useState } from "react";
import { Bell, Check, RefreshCcw, Trash2, Search } from "lucide-react";
import { UseNotifications } from "../../context/NotificationContext";
import NotificationItem from "../../components/adminDashboard/NotificationItem";

const NotificationCenter = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = UseNotifications();

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.message
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.isRead) ||
      (filter === "read" && notification.isRead) ||
      filter === notification.type;

    return matchesSearch && matchesFilter;
  });

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Center
          </h1>
          <p className="text-gray-500">Manage system notifications</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </button>
          )}
          <button
            onClick={clearAllNotifications}
            className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
          <button className="flex items-center px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center flex-1 px-3 py-2 bg-white border rounded-md min-w-[260px]">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            className="flex-1 text-sm bg-transparent border-0 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 text-sm bg-white border rounded-md cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="info">Information</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-hidden bg-white border rounded-lg shadow">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Bell className="w-4 h-4 mr-1" />
              {unreadCount} unread
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notifications found</p>
              <p>Any system notifications will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
