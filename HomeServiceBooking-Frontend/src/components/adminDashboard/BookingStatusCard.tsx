import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";

interface BookingStatusCardProps {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings?: number;
}

export function BookingStatusCard({
  totalBookings,
  pendingBookings,
  completedBookings,
  cancelledBookings = 0,
}: BookingStatusCardProps) {
  // Calculate percentages
  const pendingPercentage =
    totalBookings > 0 ? Math.round((pendingBookings / totalBookings) * 100) : 0;
  const completedPercentage =
    totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0;
  const cancelledPercentage =
    totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 100)
      : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Booking Status</CardTitle>
        <CardDescription>Overview of all booking statuses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Completed</span>
            <span className="text-sm text-muted-foreground">
              {completedPercentage}%
            </span>
          </div>
          <Progress
            value={completedPercentage}
            className="h-2 bg-gray-200 [&>div]:bg-green-500"
          />
          <div className="text-xs text-muted-foreground">
            {completedBookings} bookings
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pending</span>
            <span className="text-sm text-muted-foreground">
              {pendingPercentage}%
            </span>
          </div>
          <Progress
            value={pendingPercentage}
            className="h-2 bg-gray-200 [&>div]:bg-blue-500"
          />
          <div className="text-xs text-muted-foreground">
            {pendingBookings} bookings
          </div>
        </div>

        {cancelledBookings > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancelled</span>
              <span className="text-sm text-muted-foreground">
                {cancelledPercentage}%
              </span>
            </div>
            <Progress
              value={cancelledPercentage}
              className="h-2 bg-gray-200 [&>div]:bg-red-500"
            />
            <div className="text-xs text-muted-foreground">
              {cancelledBookings} bookings
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
