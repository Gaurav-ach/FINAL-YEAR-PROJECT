import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import DashboardSkeleton from "../../components/requiterDashboard/DashboardSkeleton";
import StatCards from "../../components/requiterDashboard/StatCards";
import BookingCharts from "../../components/requiterDashboard/BookingCharts";
import BookingTable from "../../components/requiterDashboard/BookingTable";
import NotificationsList from "../../components/requiterDashboard/NotificationsList";

interface Booking {
  id: string;
  userId: string;
  businessId: string;
  date: string;
  time: string;
  bookingStatus: string;
  latitude: number;
  longitude: number;
  locationName: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    userProfileImage?: string;
  };
  business: {
    name: string;
    category: string;
    amount: number;
  };
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyBookings: { month: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
}

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ViewRequiterDashboard = () => {
  const { backendUrl, requiterToken } = useContext(AppContext);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!requiterToken) return;

      try {
        setLoading(true);

        // Fetch bookings
        const bookingsResponse = await axios.get(
          `${backendUrl}/api/booking/requiter`,
          {
            headers: { Authorization: requiterToken },
          }
        );

        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.bookings || []);

          // Calculate stats from bookings
          calculateStats(bookingsResponse.data.bookings);
        }

        // Fetch notifications
        const notificationsResponse = await axios.get(
          `${backendUrl}/api/requiter/notifications`,
          {
            headers: { Authorization: requiterToken },
          }
        );

        if (notificationsResponse.data.success) {
          setNotifications(notificationsResponse.data.notifications || []);
        }
      } catch (error) {
        //Axios error
        if (error instanceof AxiosError && error.response) {
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          toast.error(error.message || "An error occoured while fetching data");
        } else {
          toast.error("Internal Server Error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl, requiterToken]);

  // Calculate statistics from bookings
  const calculateStats = (bookingData: Booking[]) => {
    if (!bookingData || bookingData.length === 0) {
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalRevenue: 0,
        monthlyBookings: [],
        categoryDistribution: [],
      });
      return;
    }

    // Count total, pending, and completed bookings
    const totalBookings = bookingData.length;
    const pendingBookings = bookingData.filter(
      (b) => b.bookingStatus === "PENDING"
    ).length;
    const completedBookings = bookingData.filter(
      (b) => b.bookingStatus === "COMPLETED"
    ).length;

    // Calculate total revenue (from completed bookings)
    const totalRevenue = bookingData
      .filter((b) => b.bookingStatus === "COMPLETED")
      .reduce((sum, booking) => sum + booking.business.amount, 0);

    // Group bookings by month
    const monthlyData: Record<string, number> = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    bookingData.forEach((booking) => {
      const date = new Date(booking.date);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const monthlyBookings = Object.entries(monthlyData).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // Group bookings by category
    const categoryData: Record<string, number> = {};
    bookingData.forEach((booking) => {
      const category = booking.business.category;
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryData).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    setStats({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      monthlyBookings,
      categoryDistribution,
    });
  };

  // Handle booking status update
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: string
  ) => {
    if (!requiterToken) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/booking/${bookingId}`,
        { status },
        { headers: { Authorization: requiterToken } }
      );

      if (data.success) {
        toast.success(`Booking marked as ${status.toLowerCase()}`);

        // Update booking in state
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, bookingStatus: status }
              : booking
          )
        );

        // Recalculate stats
        calculateStats(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, bookingStatus: status }
              : booking
          )
        );
      } else {
        toast.error(data.message || "Failed to update booking status");
      }
    } catch (error) {
      //Axios error
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(
          error.message || "An error occoured while updating booking status"
        );
      } else {
        toast.error("Internal Server Error");
      }
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    if (!requiterToken) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/requiter/notifications/${notificationId}`,
        { isRead: true },
        { headers: { Authorization: requiterToken } }
      );

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter((n) => !n.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Stats Cards */}
          {stats && (
            <StatCards
              totalBookings={stats.totalBookings}
              pendingBookings={stats.pendingBookings}
              completedBookings={stats.completedBookings}
              totalRevenue={stats.totalRevenue}
            />
          )}

          {/* Charts */}
          {stats && (
            <BookingCharts
              monthlyBookings={stats.monthlyBookings}
              categoryDistribution={stats.categoryDistribution}
            />
          )}

          {/* Recent Bookings */}
          <BookingTable
            bookings={bookings}
            isRecent={true}
            onViewAll={() => setActiveTab("bookings")}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingTable
            bookings={bookings}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsList
            notifications={notifications}
            backendUrl={backendUrl}
            requiterToken={requiterToken || ""}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewRequiterDashboard;
