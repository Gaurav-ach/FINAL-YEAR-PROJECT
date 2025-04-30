import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { Users, UserCheck, UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import UserStatsCard from "../../components/adminDashboard/UserStatsCard";
import DashboardSkeleton from "../../components/requiterDashboard/DashboardSkeleton";
import { Booking } from "../../lib/type";
import { Skeleton } from "../../components/ui/skeleton";
import { StatCard } from "../../components/adminDashboard/StatCard";
import { BarChart } from "../../components/adminDashboard/BarChart";
import { PieChart } from "../../components/adminDashboard/PieChart";
import { BookingStatusCard } from "../../components/adminDashboard/BookingStatusCard";

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyBookings: { month: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
}

const ViewAdminDashboard = () => {
  const { totalUsers, backendUrl } = useContext(AppContext);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyBookings: [],
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendUrl}/api/booking`);

        if (response.data?.booking && Array.isArray(response.data.booking)) {
          const bookingData: Booking[] = response.data.booking;

          // Calculate statistics
          const calculatedStats: BookingStats = {
            totalBookings: bookingData.length,
            pendingBookings: bookingData.filter(
              (b) => b.bookingStatus === "PENDING"
            ).length,
            completedBookings: bookingData.filter(
              (b) => b.bookingStatus === "COMPLETED"
            ).length,
            totalRevenue: bookingData
              .filter((b) => b.bookingStatus === "COMPLETED")
              .reduce(
                (sum, booking) => sum + (booking.business?.amount || 0),
                0
              ),
            monthlyBookings: (() => {
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

              return Object.entries(monthlyData).map(([month, count]) => ({
                month,
                count,
              }));
            })(),
            categoryDistribution: (() => {
              const categoryData: Record<string, number> = {};
              bookingData.forEach((booking) => {
                const category = booking.business?.category || "Uncategorized";
                categoryData[category] = (categoryData[category] || 0) + 1;
              });

              return Object.entries(categoryData).map(([name, value]) => ({
                name,
                value,
              }));
            })(),
          };

          setStats(calculatedStats);
        } else {
          throw new Error("Invalid booking data format");
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [backendUrl]);

  const cancelledBookings =
    stats.totalBookings - stats.pendingBookings - stats.completedBookings;

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Overview of all user, booking activity and key metrics
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <Skeleton className="w-24 h-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-16 h-8 mb-1" />
                    <Skeleton className="w-20 h-3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <UserStatsCard
                title="Total Users"
                value={totalUsers?.total || 0}
                icon={<Users className="w-6 h-6 text-indigo-600" />}
                trend={`${((totalUsers?.total || 0) / 100).toFixed(1)}% growth`}
                className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <UserStatsCard
                title="Active Users"
                value={totalUsers?.user || 0}
                icon={<UserCheck className="w-6 h-6 text-green-600" />}
                trend={`${((totalUsers?.user || 0) / 100).toFixed(1)}% active`}
                className="border-green-200 bg-gradient-to-br from-green-50 to-green-100"
              />
              <UserStatsCard
                title="Service Providers"
                value={totalUsers?.requiter || 0}
                icon={<UserX className="w-6 h-6 text-amber-600" />}
                trend={`${((totalUsers?.requiter || 0) / 100).toFixed(
                  1
                )}% providers`}
                className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
              />
            </>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3 ">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <Skeleton className="w-24 h-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-16 h-8 mb-1" />
                    <Skeleton className="w-20 h-3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                title="Pending Bookings"
                value={stats.pendingBookings}
                description={`${
                  stats.totalBookings > 0
                    ? Math.round(
                        (stats.pendingBookings / stats.totalBookings) * 100
                      )
                    : 0
                }% of total`}
                className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
              />
              <StatCard
                title="Completed Bookings"
                value={stats.completedBookings}
                description={`${
                  stats.totalBookings > 0
                    ? Math.round(
                        (stats.completedBookings / stats.totalBookings) * 100
                      )
                    : 0
                }% of total`}
                className="border-green-200 bg-gradient-to-br from-green-50 to-green-100"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Monthly Bookings Trend */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Monthly Booking Trends</CardTitle>
              <CardDescription>Number of bookings per month</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <BarChart data={stats.monthlyBookings} />
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>
                Booking distribution by business category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="rounded-full h-[250px] w-[250px] mx-auto" />
                </div>
              ) : (
                <PieChart data={stats.categoryDistribution} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {loading ? (
              <Card className="h-full shadow-sm">
                <CardHeader>
                  <Skeleton className="w-32 h-5 mb-2" />
                  <Skeleton className="w-48 h-4" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="w-20 h-4" />
                        <Skeleton className="w-12 h-4" />
                      </div>
                      <Skeleton className="w-full h-2" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <BookingStatusCard
                totalBookings={stats.totalBookings}
                pendingBookings={stats.pendingBookings}
                completedBookings={stats.completedBookings}
                cancelledBookings={cancelledBookings}
              />
            )}
          </div>

          {/* Revenue Analysis */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Average booking value and revenue details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-20" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="w-full h-16" />
                      <Skeleton className="w-full h-16" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                      <div className="mb-1 text-sm font-medium text-emerald-800">
                        Revenue per Category
                      </div>
                      <div className="text-2xl font-bold">
                        {stats.categoryDistribution.length}
                      </div>
                      <div className="mt-1 text-xs text-emerald-700">
                        Business categories
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-sky-50 to-sky-100">
                      <div className="mb-1 text-sm font-medium text-sky-800">
                        Completion Rate
                      </div>
                      <div className="text-2xl font-bold">
                        {stats.totalBookings > 0
                          ? `${Math.round(
                              (stats.completedBookings / stats.totalBookings) *
                                100
                            )}%`
                          : "0%"}
                      </div>
                      <div className="mt-1 text-xs text-sky-700">
                        {stats.completedBookings} out of {stats.totalBookings}{" "}
                        bookings completed
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAdminDashboard;
