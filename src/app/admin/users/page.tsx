"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  ChartBarIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  userService,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  UserListParams,
} from "@/services/UserService";
import UserForm from "@/components/admin/users/UserForm";
import UserDetailsModal from "@/components/admin/users/UserDetailsModal";
import { PlatformUser } from "@/types/admin";
import { toast } from "react-hot-toast";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  banned: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const roleColors = {
  user: "bg-blue-200 text-blue-800",
  moderator: "bg-purple-200 text-purple-800",
  admin: "bg-indigo-200 text-indigo-800",
  super_admin: "bg-red-200 text-red-800",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    case "inactive":
      return <ClockIcon className="h-4 w-4 text-gray-500" />;
    case "banned":
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    case "pending":
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
    default:
      return <UserCircleIcon className="h-4 w-4 text-gray-400" />;
  }
};

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [viewingUser, setViewingUser] = useState<PlatformUser | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [hasGamesFilter, setHasGamesFilter] = useState<string>("all");
  const [hasBalanceFilter, setHasBalanceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    | "username"
    | "status"
    | "role"
    | "lastActive"
    | "winRate"
    | "totalGamesPlayed"
  >("lastActive");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const filters: UserFilters = {};

      if (statusFilter !== "all") {
        filters.status = [statusFilter];
      }
      if (roleFilter !== "all") {
        filters.role = [roleFilter];
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (hasGamesFilter !== "all") {
        filters.hasPlayedGames = hasGamesFilter === "yes";
      }
      if (hasBalanceFilter !== "all") {
        filters.hasWalletBalance = hasBalanceFilter === "yes";
      }

      const params: UserListParams = {
        page: currentPage,
        limit: pageSize,
        filters,
        sort: {
          key: sortBy,
          direction: sortOrder,
        },
      };

      const response = await userService.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when filters or pagination change
  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    pageSize,
    searchQuery,
    statusFilter,
    roleFilter,
    hasGamesFilter,
    hasBalanceFilter,
    sortBy,
    sortOrder,
  ]);

  const handleCreateUser = async (data: CreateUserData | UpdateUserData) => {
    setIsSubmitting(true);
    try {
      await userService.createUser(data as CreateUserData);
      toast.success("User created successfully");
      setShowCreateModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data: CreateUserData | UpdateUserData) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await userService.updateUser(editingUser.id, data as UpdateUserData);
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: "active" | "inactive" | "banned"
  ) => {
    try {
      if (newStatus === "active") {
        await userService.activateUser(userId);
        toast.success("User activated successfully");
      } else if (newStatus === "inactive") {
        await userService.deactivateUser(userId);
        toast.success("User deactivated successfully");
      } else if (newStatus === "banned") {
        await userService.banUser(userId, "Banned by admin");
        toast.success("User banned successfully");
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "user" | "admin" | "moderator"
  ) => {
    try {
      await userService.assignRole(userId, newRole);
      toast.success("User role updated successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      if (newStatus === "active") {
        await userService.activateUser(userId);
        toast.success("User activated successfully");
      } else {
        await userService.deactivateUser(userId);
        toast.success("User deactivated successfully");
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to perform this action");
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} users?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (action === "toggle-status") {
        // For toggle-status, we'll activate inactive users and deactivate active users
        const activeUsers = users.filter(
          (user) => selectedUsers.includes(user.id) && user.status === "active"
        );
        const inactiveUsers = users.filter(
          (user) => selectedUsers.includes(user.id) && user.status !== "active"
        );

        if (activeUsers.length > 0) {
          await userService.bulkUpdateStatus(
            activeUsers.map((u) => u.id),
            "inactive"
          );
        }
        if (inactiveUsers.length > 0) {
          await userService.bulkUpdateStatus(
            inactiveUsers.map((u) => u.id),
            "active"
          );
        }

        const actionText =
          activeUsers.length > 0 && inactiveUsers.length > 0
            ? "toggled status for"
            : activeUsers.length > 0
            ? "deactivated"
            : "activated";
        toast.success(
          `${selectedUsers.length} users ${actionText} successfully`
        );
      } else if (action === "activate") {
        await userService.bulkUpdateStatus(selectedUsers, "active");
        toast.success(`${selectedUsers.length} users activated successfully`);
      } else if (action === "deactivate") {
        await userService.bulkUpdateStatus(selectedUsers, "inactive");
        toast.success(`${selectedUsers.length} users deactivated successfully`);
      } else if (action === "ban") {
        await userService.bulkUpdateStatus(selectedUsers, "banned");
        toast.success(`${selectedUsers.length} users banned successfully`);
      }

      setSelectedUsers([]);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) {
      return <div className="w-4 h-4" />;
    }
    return sortOrder === "asc" ? (
      <div className="w-4 h-4 text-blue-500">↑</div>
    ) : (
      <div className="w-4 h-4 text-blue-500">↓</div>
    );
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const convertToISOString = (
    dateValue: Date | string | null | undefined
  ): string => {
    if (!dateValue) return "";

    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }

    if (typeof dateValue === "string") {
      return dateValue;
    }

    try {
      return new Date(dateValue).toISOString();
    } catch (error) {
      console.error("Error converting date to ISO string:", error);
      return "";
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-700">
            Manage platform users and their accounts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Has Games
            </label>
            <select
              value={hasGamesFilter}
              onChange={(e) => setHasGamesFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Has Balance
            </label>
            <select
              value={hasBalanceFilter}
              onChange={(e) => setHasBalanceFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("activate")}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction("ban")}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Ban
              </button>
              <button
                onClick={() => handleBulkAction("toggle-status")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-700">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <SortIcon column="status" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center gap-1">
                        Role
                        <SortIcon column="role" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Wallet
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("totalGamesPlayed")}
                    >
                      <div className="flex items-center gap-1">
                        Games
                        <SortIcon column="totalGamesPlayed" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("winRate")}
                    >
                      <div className="flex items-center gap-1">
                        Win Rate
                        <SortIcon column="winRate" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("lastActive")}
                    >
                      <div className="flex items-center gap-1">
                        Last Active
                        <SortIcon column="lastActive" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 group"
                      onClick={() => setViewingUser(user)}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserCircleIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon status={user.status} />
                          <span
                            className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusColors[
                                user.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            roleColors[user.role as keyof typeof roleColors]
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(user.walletBalance || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalGamesPlayed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.winRate ? `${user.winRate.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>
                            {user.lastActive
                              ? formatDate(user.lastActive)
                              : "Never"}
                          </span>
                          <EyeIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id, user.status)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              user.status === "active"
                                ? "bg-green-600"
                                : "bg-gray-200"
                            }`}
                            title={
                              user.status === "active"
                                ? "Deactivate User"
                                : "Activate User"
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                                user.status === "active"
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>
                      to
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalUsers)}
                      </span>
                      of <span className="font-medium">{totalUsers}</span>
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <UserForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <UserForm
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUser}
      />

      {viewingUser && (
        <UserDetailsModal
          user={{
            ...viewingUser,
            lastActive: convertToISOString(viewingUser.lastActive),
            createdAt: convertToISOString(viewingUser.createdAt),
            updatedAt: convertToISOString(viewingUser.updatedAt),
          }}
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
}
