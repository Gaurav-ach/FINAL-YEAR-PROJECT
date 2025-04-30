import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface UserStatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  trend?: string;
  className?: string;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend && <p className="text-xs text-gray-500">{trend}</p>}
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;
