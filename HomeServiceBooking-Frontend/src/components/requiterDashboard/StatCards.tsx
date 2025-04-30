import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Calendar, CheckCircle, Clock, DollarSign } from "lucide-react";

interface StatCardsProps {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

const StatCards = ({
  totalBookings,
  pendingBookings,
  completedBookings,
  totalRevenue,
}: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2 text-blue-800 bg-blue-100">
          <CardDescription>Total Bookings</CardDescription>
          <CardTitle className="flex items-center text-3xl">
            {totalBookings || 0}
            <Calendar className="w-5 h-5 ml-2 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2 text-yellow-800 bg-yellow-100">
          <CardDescription>Pending Bookings</CardDescription>
          <CardTitle className="flex items-center text-3xl">
            {pendingBookings || 0}
            <Clock className="w-5 h-5 ml-2 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2 text-red-800 bg-red-100">
          <CardDescription>Completed Bookings</CardDescription>
          <CardTitle className="flex items-center text-3xl">
            {completedBookings || 0}
            <CheckCircle className="w-5 h-5 ml-2 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2 text-green-800 bg-green-100">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="flex items-center text-3xl">
            ${totalRevenue.toFixed(2) || "0.00"}
            <DollarSign className="w-5 h-5 ml-2 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default StatCards;
