import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import ViewUserTable from "../../components/adminDashboard/ViewUserTable";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const ManageUsers = () => {
  const { error, isLoading, users } = useContext(AppContext);
  const [selectedRole, setSelectedRole] = useState<keyof typeof users>("total");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 mx-4">
      <Select
        defaultValue={selectedRole}
        onValueChange={(value) => setSelectedRole(value as keyof typeof users)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {selectedRole === "total" ? "All Users" : selectedRole}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="total">All Users</SelectItem>
            <SelectItem value="user">Customers</SelectItem>
            <SelectItem value="requiter">Requiters</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="mt-4">
        <ViewUserTable users={users[selectedRole]} />
      </div>
    </div>
  );
};

export default ManageUsers;
