import React from "react";
import { Badge } from "../ui/badge";

interface UserStatusBadgeProps {
  status: "active" | "banned" | "pending" | "suspended";
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "active":
      return <Badge variant="default">Active</Badge>;
    case "banned":
      return <Badge variant="destructive">Banned</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "suspended":
      return <Badge variant="secondary">Suspended</Badge>;
    default:
      return null;
  }
};

export default UserStatusBadge;
