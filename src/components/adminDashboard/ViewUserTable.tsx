import { requiterDataProps, total, user } from "../../lib/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type UserArrayType = total[] | user[] | requiterDataProps[];

interface viewUserDataProps {
  users: UserArrayType;
}

const ViewUserTable = ({ users }: viewUserDataProps) => {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full border border-gray-800">
        <TableHeader>
          <TableRow className="bg-gray-800">
            <TableHead className="text-left">ID</TableHead>
            <TableHead className="text-left">Name</TableHead>
            <TableHead className="text-left">Email</TableHead>
            <TableHead className="text-left">Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user: user | requiterDataProps |total) => (
              <TableRow key={user.id} className="border-t border-gray-800">
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.contactNumber || "N/A"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ViewUserTable;
