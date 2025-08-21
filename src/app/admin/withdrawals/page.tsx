"use client";

import React, { useState, useEffect } from "react";
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  paymentService,
  WithdrawalRequest,
  ProcessWithdrawalData,
} from "@/services/PaymentService";

// Withdrawal status options
const withdrawalStatuses = [
  { value: "PROCESSING", label: "Processing", color: "blue", icon: ClockIcon },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "green",
    icon: CheckCircleIcon,
  },
  { value: "FAILED", label: "Failed", color: "red", icon: XCircleIcon },
];

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Statistics
  const [stats, setStats] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    failedWithdrawals: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    averageAmount: 0,
    successRate: 0,
    statusDistribution: [] as Array<{
      status: string;
      count: number;
      amount: number;
      percentage: number;
    }>,
  });

  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  // Load withdrawals from API
  useEffect(() => {
    loadWithdrawals();
    loadStats();
  }, [pagination.currentPage, statusFilter]);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getWithdrawalRequests(
        statusFilter || undefined,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      // Add null checks to prevent undefined errors
      if (response && response.withdrawals) {
        setWithdrawals(response.withdrawals);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
          hasNextPage: response.pagination?.hasNextPage || false,
          hasPreviousPage: response.pagination?.hasPreviousPage || false,
        }));
      } else {
        // Handle case where response is undefined or missing data
        setWithdrawals([]);
        setPagination((prev) => ({
          ...prev,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
      }
    } catch (err) {
      console.error("Error loading withdrawals:", err);
      // Set default values on any error
      setWithdrawals([]);
      setPagination((prev) => ({
        ...prev,
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
      setError(
        err instanceof Error ? err.message : "Failed to load withdrawals"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await paymentService.getWithdrawalStats();
      // Add null check to prevent undefined errors
      if (data) {
        setStats(data);
      } else {
        // Set default stats if data is undefined
        setStats({
          totalWithdrawals: 0,
          pendingWithdrawals: 0,
          completedWithdrawals: 0,
          failedWithdrawals: 0,
          totalAmount: 0,
          pendingAmount: 0,
          completedAmount: 0,
          averageAmount: 0,
          successRate: 0,
          statusDistribution: [],
        });
      }
    } catch (err) {
      console.error("Error loading withdrawal stats:", err);
      // Set default stats if there's an error
      setStats({
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0,
        failedWithdrawals: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        averageAmount: 0,
        successRate: 0,
        statusDistribution: [],
      });
    }
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    // Convert frontend status to backend status format
    const statusMap: Record<string, string> = {
      PROCESSING: "processing",
      COMPLETED: "completed",
      FAILED: "failed",
    };

    const backendStatus = statusMap[status] || status;
    setStatusFilter(statusFilter === backendStatus ? "" : backendStatus);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    // Map backend status to frontend status values
    const statusMap: Record<string, string> = {
      completed: "COMPLETED",
      processing: "PROCESSING",
      failed: "FAILED",
      pending: "PENDING",
      cancelled: "CANCELLED",
    };

    const mappedStatus = statusMap[status] || status;
    return (
      withdrawalStatuses.find((s) => s.value === mappedStatus) ||
      withdrawalStatuses[0]
    );
  };

  // Handle withdrawal processing
  const handleProcessWithdrawal = async (data: ProcessWithdrawalData) => {
    setProcessingWithdrawal(true);
    try {
      await paymentService.processWithdrawal(data);
      setShowProcessModal(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
      loadStats();
    } catch (err) {
      console.error("Error processing withdrawal:", err);
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  // Handle bulk actions
  const handleBulkProcess = async (status: "COMPLETED" | "FAILED") => {
    try {
      for (const withdrawalId of selectedWithdrawals) {
        await paymentService.processWithdrawal({
          withdrawalId,
          status,
          failureReason: status === "FAILED" ? "Bulk processing" : undefined,
        });
      }
      setSelectedWithdrawals([]);
      loadWithdrawals();
      loadStats();
    } catch (err) {
      console.error("Bulk processing failed:", err);
    }
  };

  // Create test withdrawal data
  const createTestWithdrawal = async () => {
    try {
      // This would normally be done through the mobile app
      // For testing purposes, we'll create a direct API call
      const response = await fetch(
        "http://localhost:3001/api/payments/withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            amount: 50.0,
            mobileMoneyProviderCode: "PZW211", // EcoCash USD
            destinationNumber: "+263771234567",
          }),
        }
      );

      if (response.ok) {
        console.log("Test withdrawal created successfully");
        loadWithdrawals();
        loadStats();
      } else {
        console.error("Failed to create test withdrawal");
      }
    } catch (err) {
      console.error("Error creating test withdrawal:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Withdrawal Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Process user withdrawal requests and manage payouts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              /* Export withdrawals */
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={createTestWithdrawal}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Test Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Withdrawals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(stats?.totalWithdrawals || 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pendingWithdrawals || 0}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    ${(stats?.pendingAmount || 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.completedWithdrawals || 0}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    ${(stats?.completedAmount || 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(stats?.successRate || 0).toFixed(1)}%
                  </dd>
                  <dd className="text-sm text-gray-500">
                    Avg: ${(stats?.averageAmount || 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search withdrawals, users, or phone numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex items-center space-x-2">
              {withdrawalStatuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusFilter(status.value)}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    statusFilter === status.value
                      ? `bg-${status.color}-100 text-${status.color}-700 border-${status.color}-300`
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <status.icon className="h-4 w-4 mr-2" />
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading withdrawals
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadWithdrawals}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Withdrawal Requests ({pagination?.totalItems || 0})
            </h3>
            {selectedWithdrawals.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedWithdrawals.length} selected
                </span>
                <button
                  onClick={() => handleBulkProcess("COMPLETED")}
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkProcess("FAILED")}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">Loading withdrawals...</span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        selectedWithdrawals.length ===
                          (withdrawals?.length || 0) &&
                        (withdrawals?.length || 0) > 0
                      }
                      onChange={(e) =>
                        setSelectedWithdrawals(
                          e.target.checked
                            ? (withdrawals || []).map((w) => w.id)
                            : []
                        )
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(withdrawals || []).map((withdrawal) => {
                  const statusConfig = getStatusConfig(withdrawal.status);

                  return (
                    <tr
                      key={withdrawal.id}
                      className={
                        selectedWithdrawals.includes(withdrawal.id)
                          ? "bg-blue-50"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedWithdrawals.includes(withdrawal.id)}
                          onChange={(e) =>
                            setSelectedWithdrawals(
                              e.target.checked
                                ? [...selectedWithdrawals, withdrawal.id]
                                : selectedWithdrawals.filter(
                                    (id) => id !== withdrawal.id
                                  )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {withdrawal.user?.firstName}
                              {withdrawal.user?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{withdrawal.user?.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {withdrawal.mobileMoneyProviderCode || "Unknown"}
                        </div>
                        {withdrawal.destinationNumber && (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {withdrawal.destinationNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
                        >
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </span>
                        {withdrawal.failureReason && (
                          <div className="text-xs text-red-600 mt-1">
                            {withdrawal.failureReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        <div className="text-xs">
                          {new Date(
                            withdrawal.requestedAt
                          ).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowProcessModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Process Withdrawal"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {withdrawal.status === "processing" && (
                            <>
                              <button
                                onClick={() =>
                                  handleProcessWithdrawal({
                                    withdrawalId: withdrawal.id,
                                    status: "COMPLETED",
                                  })
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleProcessWithdrawal({
                                    withdrawalId: withdrawal.id,
                                    status: "FAILED",
                                    failureReason: "Rejected by admin",
                                  })
                                }
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {(withdrawals?.length || 0) === 0 && !loading && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No withdrawal requests found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter || searchTerm
                ? "Try adjusting your search or filters."
                : "No withdrawal requests have been submitted yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(pagination?.totalPages || 1) > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              disabled={!pagination?.hasPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              disabled={!pagination?.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing
                <span className="font-medium">
                  {((pagination?.currentPage || 1) - 1) *
                    (pagination?.itemsPerPage || 20) +
                    1}
                </span>
                to
                <span className="font-medium">
                  {Math.min(
                    (pagination?.currentPage || 1) *
                      (pagination?.itemsPerPage || 20),
                    pagination?.totalItems || 0
                  )}
                </span>
                of
                <span className="font-medium">
                  {pagination?.totalItems || 0}
                </span>
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={!pagination?.hasPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination?.totalPages || 1) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: pageNum,
                          }))
                        }
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === (pagination?.currentPage || 1)
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={!pagination?.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && showProcessModal && (
        <WithdrawalDetailsModal
          withdrawal={selectedWithdrawal}
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedWithdrawal(null);
          }}
          onProcess={handleProcessWithdrawal}
          processing={processingWithdrawal}
        />
      )}
    </div>
  );
}

// Withdrawal Details Modal Component
interface WithdrawalDetailsModalProps {
  withdrawal: WithdrawalRequest;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (data: ProcessWithdrawalData) => void;
  processing: boolean;
}

function WithdrawalDetailsModal({
  withdrawal,
  isOpen,
  onClose,
  onProcess,
  processing,
}: WithdrawalDetailsModalProps) {
  const [status, setStatus] = useState<"COMPLETED" | "FAILED">("COMPLETED");
  const [failureReason, setFailureReason] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "process">(
    "overview"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess({
      withdrawalId: withdrawal.id,
      status,
      failureReason: status === "FAILED" ? failureReason : undefined,
      transactionReference:
        status === "COMPLETED" ? transactionReference : undefined,
    });
  };

  if (!isOpen) return null;

  const statusConfig = (() => {
    // Map backend status to frontend status values
    const statusMap: Record<string, string> = {
      completed: "COMPLETED",
      processing: "PROCESSING",
      failed: "FAILED",
      pending: "PENDING",
      cancelled: "CANCELLED",
    };

    const mappedStatus = statusMap[withdrawal.status] || withdrawal.status;
    return (
      withdrawalStatuses.find((s) => s.value === mappedStatus) ||
      withdrawalStatuses[0]
    );
  })();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Withdrawal Details
              </h3>
              <p className="text-sm text-gray-500">ID: {withdrawal.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Withdrawal Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${withdrawal.amount.toFixed(2)} {withdrawal.currency}
                </div>
                <div className="text-sm text-gray-500">Amount</div>
              </div>
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
                >
                  <statusConfig.icon className="h-4 w-4 mr-1" />
                  {statusConfig.label}
                </span>
                <div className="text-sm text-gray-500 mt-1">Status</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {withdrawal.mobileMoneyProviderCode || "Unknown"}
                </div>
                <div className="text-sm text-gray-500">Provider</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: EyeIcon },
                { id: "process", label: "Process", icon: CheckIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "overview" | "process")}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Withdrawal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Withdrawal Information
                  </h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Provider:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {withdrawal.mobileMoneyProviderCode || "Unknown"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Destination:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {withdrawal.destinationNumber || "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Requested:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(withdrawal.requestedAt).toLocaleString()}
                      </dd>
                    </div>
                    {withdrawal.processedAt && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Processed:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(withdrawal.processedAt).toLocaleString()}
                        </dd>
                      </div>
                    )}
                    {withdrawal.failureReason && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">
                          Failure Reason:
                        </dt>
                        <dd className="text-sm font-medium text-red-600">
                          {withdrawal.failureReason}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* User Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    User Information
                  </h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {withdrawal.user?.firstName?.charAt(0)}
                        {withdrawal.user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {withdrawal.user?.firstName} {withdrawal.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{withdrawal.user?.username}
                      </p>
                    </div>
                  </div>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Email:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {withdrawal.user?.email}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Phone:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {withdrawal.user?.phoneNumber || "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">User ID:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {withdrawal.user?.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Metadata Information */}
              {withdrawal.metadata && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Additional Information
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(withdrawal.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-sm text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}

          {activeTab === "process" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Process Withdrawal
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This will update the withdrawal status and notify the
                        user. Make sure you have processed the actual payout
                        before marking as completed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "COMPLETED" | "FAILED")
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                {status === "COMPLETED" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference
                    </label>
                    <input
                      type="text"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="Enter transaction reference"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                {status === "FAILED" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Failure Reason
                    </label>
                    <textarea
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      placeholder="Enter reason for failure"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any additional notes"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      processing ||
                      (status === "FAILED" && !failureReason.trim())
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Processing..." : "Process Withdrawal"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
