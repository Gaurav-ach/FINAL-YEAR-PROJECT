import { Card, CardHeader, CardTitle } from "../ui/card";

interface viewUserCardProps {
  totalUsers: number;
  title: string;
}

const ViewUserCard = ({ totalUsers, title }: viewUserCardProps) => {
  return (
    <Card className="flex flex-col items-center justify-between p-4 transition-transform duration-300 ease-in-out cursor-pointer hover:bg-gray-100">
      <CardHeader className="flex items-center">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <p className="text-lg font-medium">{totalUsers ?? 0}</p>
      </CardHeader>
    </Card>
  );
};

export default ViewUserCard;
