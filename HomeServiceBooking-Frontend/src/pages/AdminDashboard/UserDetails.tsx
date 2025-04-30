import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Ban,
  UserX,
  CheckCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { UseNotifications } from "../../context/NotificationContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  status: "active" | "banned" | "pending" | "suspended";
  createdAt: string;
  userProfileImage?: string;
  requiterProfileImage?: string;
  bookings: {
    id: string;
    service: string;
    date: string;
    status: string;
  }[];
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = UseNotifications();
  const [isBanned, setIsBanned] = useState(false);
  const navigate = useNavigate();
  const { backendUrl, requiterToken } = useContext(AppContext);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${backendUrl}/api/admin/users/${id}`,
          {
            headers: { Authorization: requiterToken },
          }
        );

        if (data.success) {
          setUser(data.user);
          console.log(data.user);
          setIsBanned(data.user.status === "banned");
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Error loading user details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id, backendUrl, requiterToken]);

  const handleBanUser = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/admin/users/${id}/toggle-status`,
        { status: isBanned ? "active" : "banned" },
        { headers: { Authorization: requiterToken } }
      );

      if (data.success) {
        setIsBanned(!isBanned);
        toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully`);
        addNotification({
          message: `User ${isBanned ? "unbanned" : "banned"}: ${
            user?.name || "Unknown"
          }`,
          isRead: false,
          type: isBanned ? "success" : "warning",
          userId: user?.id,
        });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (!user?.id) return;

    if (window.confirm(`Are you sure you want to delete user: ${user.name}?`)) {
      try {
        const { data } = await axios.delete(
          `${backendUrl}/api/admin/users/${user.id}`,
          { headers: { Authorization: requiterToken } }
        );

        if (data.success) {
          toast.success("User deleted successfully");
          addNotification({
            message: `User deleted: ${user.name}`,
            isRead: false,
            type: "error",
            userId: user.id,
          });
          navigate("/adminDashboard/users");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="w-48 h-6 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-500">User not found</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/adminDashboard/users"
            className="p-2 mr-2 text-gray-600 bg-white rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBanUser}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isBanned
                ? "text-green-700 bg-green-50 hover:bg-green-100"
                : "text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
            }`}
          >
            {isBanned ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Ban className="w-4 h-4 mr-2" />
            )}
            {isBanned ? "Unban User" : "Ban User"}
          </Button>
          <Button
            onClick={handleDeleteUser}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-700 rounded-md bg-red-50 hover:bg-red-100"
          >
            <UserX className="w-4 h-4 mr-2" />
            Delete User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <div className="overflow-hidden bg-white border rounded-lg shadow">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <img
                  src={
                    user.userProfileImage ||
                    user.requiterProfileImage ||
                    "https://via.placeholder.com/150"
                  }
                  alt={user.name}
                  className="w-24 h-24 mb-4 rounded-full"
                />
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <div className="mt-2">
                  <Badge
                    variant={user.role === "USER" ? "default" : "secondary"}
                  >
                    {user.role === "USER" ? "Customer" : "Service Provider"}
                  </Badge>
                </div>
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.contactNumber && (
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{user.contactNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="md:col-span-2">
          <div className="overflow-hidden bg-white border rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Bookings
              </h3>
            </div>
            <div className="p-6">
              {user.bookings && user.bookings.length > 0 ? (
                <div className="overflow-hidden border rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          Service
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                booking.status === "COMPLETED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
