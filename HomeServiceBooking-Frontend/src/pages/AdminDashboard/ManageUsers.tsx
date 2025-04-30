import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Search, Filter, RefreshCcw } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

const ManageUsers = () => {
  const { error, isLoading, users } = useContext(AppContext);
  const [selectedRole, setSelectedRole] = useState<"user" | "requiter">("user");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter users based on search term
  const filteredUsers = users[selectedRole]?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (userId: string) => {
    navigate(`/adminDashboard/users/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 rounded-full border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center flex-1 px-3 py-2 bg-white border rounded-md min-w-[260px]">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="flex-1 text-sm bg-transparent border-0 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 text-sm bg-white border rounded-md cursor-pointer"
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "user" | "requiter")
            }
          >
            <option value="user">Customers</option>
            <option value="requiter">Service Providers</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden bg-white border rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 text-white bg-indigo-500 rounded-full">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          selectedRole === "requiter" ? "default" : "outline"
                        }
                      >
                        {selectedRole === "requiter"
                          ? "Service Provider"
                          : "Customer"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(user.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500 whitespace-nowrap"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">
                  {filteredUsers?.length || 0}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {users[selectedRole]?.length || 0}
                </span>{" "}
                results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
