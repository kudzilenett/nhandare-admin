"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { paymentService, PaymentFilters } from "@/services/PaymentService";
import { AdminPayment } from "@/types/admin";
import PaymentDetailsModal from "@/components/admin/payments/PaymentDetailsModal";

// Payment type options
const paymentTypes = [
  { value: "ENTRY_FEE", label: "Entry Fee", color: "blue" },
  { value: "PRIZE_PAYOUT", label: "Prize Payout", color: "green" },
  { value: "REFUND", label: "Refund", color: "yellow" },
  { value: "WITHDRAWAL", label: "Withdrawal", color: "purple" },
  { value: "PLATFORM_FEE", label: "Platform Fee", color: "gray" },
];

// Payment status options
const paymentStatuses = [
  { value: "pending", label: "Pending", color: "yellow", icon: ClockIcon },
  {
    value: "processing",
    label: "Processing",
    color: "blue",
    icon: ArrowPathIcon,
  },
  {
    value: "completed",
    label: "Completed",
    color: "green",
    icon: CheckCircleIcon,
  },
  { value: "failed", label: "Failed", color: "red", icon: XCircleIcon },
  { value: "cancelled", label: "Cancelled", color: "gray", icon: XCircleIcon },
  {
    value: "refunded",
    label: "Refunded",
    color: "orange",
    icon: ArrowPathIcon,
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<"amount" | "createdAt" | "status">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Load payments from API
  useEffect(() => {
    loadPayments();
  }, [pagination.currentPage, filters, searchTerm, sortField, sortDirection]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPayments(
        {
          ...filters,
          search: searchTerm || undefined,
        },
        { key: sortField, direction: sortDirection },
        pagination.currentPage,
        pagination.itemsPerPage
      );

      setPayments(response.payments);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        hasNextPage: response.pagination.hasNextPage,
        hasPreviousPage: response.pagination.hasPreviousPage,
      }));

      // Update stats from API response
      setApiStats({
        totalTransactions: response.pagination.totalItems,
        totalAmount: response.totalAmount || 0,
        successRate: response.successRate || 0,
        failedCount: Math.round(
          ((100 - (response.successRate || 0)) *
            response.pagination.totalItems) /
            100
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...(prev.status || []), status],
    }));
  };

  // Handle type filter change
  const handleTypeFilter = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type?.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...(prev.type || []), type],
    }));
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    // Map API status to UI status
    const statusMap: Record<string, string> = {
      COMPLETED: "completed",
      PENDING: "pending",
      PROCESSING: "processing",
      FAILED: "failed",
      CANCELLED: "cancelled",
      REFUNDED: "refunded",
    };
    const mappedStatus = statusMap[status] || status;
    return (
      paymentStatuses.find((s) => s.value === mappedStatus) ||
      paymentStatuses[0]
    );
  };

  // Get type configuration
  const getTypeConfig = (type: string) => {
    return paymentTypes.find((t) => t.value === type) || paymentTypes[0];
  };

  // Handle bulk actions
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const result = await paymentService.bulkUpdateStatus(
        selectedPayments,
        newStatus
      );
      console.log("Bulk update result:", result);
      setSelectedPayments([]);
      loadPayments(); // Reload to get updated data
    } catch (err) {
      console.error("Bulk update failed:", err);
    }
  };

  // Handle payment status update
  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      await paymentService.updatePaymentStatus({
        paymentId,
        status: newStatus as
          | "pending"
          | "processing"
          | "completed"
          | "failed"
          | "cancelled"
          | "refunded",
      });
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? {
                ...payment,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : payment
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Handle refund processing
  const handleProcessRefund = async (paymentId: string, amount?: number) => {
    try {
      await paymentService.processRefund({
        paymentId,
        amount,
        reason: "Admin refund",
      });
      loadPayments(); // Reload to get updated data
    } catch (err) {
      console.error("Refund processing failed:", err);
    }
  };

  // Statistics from API response
  const [apiStats, setApiStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0,
    failedCount: 0,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor transactions, process refunds, and manage payment disputes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              /* Export payments */
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      apiStats.totalTransactions.toLocaleString()
                    )}
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
                <BanknotesIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Volume
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      `$${apiStats.totalAmount.toLocaleString()}`
                    )}
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
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      `${apiStats.successRate.toFixed(1)}%`
                    )}
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
                    Failed Payments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      apiStats.failedCount
                    )}
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
                  placeholder="Search payments, users, or transaction IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                showFilters || Object.keys(filters).length > 0
                  ? "text-blue-700 bg-blue-50 border-blue-300"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paymentStatuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusFilter(status.value)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        filters.status?.includes(status.value)
                          ? `bg-${status.color}-100 text-${status.color}-700 border-${status.color}-200`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } border`}
                    >
                      <status.icon className="h-3 w-3 mr-1" />
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Type</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeFilter(type.value)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        filters.type?.includes(type.value)
                          ? `bg-${type.color}-100 text-${type.color}-700 border-${type.color}-200`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } border`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                Error loading payments
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadPayments}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Payment Transactions ({pagination.totalItems})
            </h3>
            {selectedPayments.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedPayments.length} selected
                </span>
                <button
                  onClick={() => handleBulkStatusUpdate("processing")}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Mark as Processing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate("failed")}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Mark as Failed
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">Loading payments...</span>
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
                        selectedPayments.length === payments.length &&
                        payments.length > 0
                      }
                      onChange={(e) =>
                        setSelectedPayments(
                          e.target.checked ? payments.map((p) => p.id) : []
                        )
                      }
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortField("amount");
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        );
                      }}
                      className="group inline-flex"
                    >
                      Amount
                      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible">
                        ↕
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortField("createdAt");
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        );
                      }}
                      className="group inline-flex"
                    >
                      Date
                      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible">
                        ↕
                      </span>
                    </button>
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const typeConfig = getTypeConfig(payment.type);

                  return (
                    <tr
                      key={payment.id}
                      className={
                        selectedPayments.includes(payment.id)
                          ? "bg-blue-50"
                          : ""
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={(e) =>
                            setSelectedPayments(
                              e.target.checked
                                ? [...selectedPayments, payment.id]
                                : selectedPayments.filter(
                                    (id) => id !== payment.id
                                  )
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {payment.user.firstName.charAt(0)}
                              {payment.user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.user.firstName} {payment.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{payment.user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </div>
                        {payment.tournament && (
                          <div className="text-sm text-gray-500">
                            {payment.tournament.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${typeConfig.color}-100 text-${typeConfig.color}-800`}
                        >
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}
                        >
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </span>
                        {payment.failureReason && (
                          <div className="text-xs text-red-600 mt-1">
                            {payment.failureReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paymentMethodCode || "Unknown"}
                        {payment.mobileMoneyNumber && (
                          <div className="text-xs text-gray-500">
                            {payment.mobileMoneyNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <div className="text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {payment.status === "completed" &&
                            payment.type === "ENTRY_FEE" && (
                              <button
                                onClick={() => handleProcessRefund(payment.id)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Process Refund"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            )}

                          <div className="relative">
                            <button className="text-gray-400 hover:text-gray-600">
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {payments.length === 0 && !loading && (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No payments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your search or filters."
                : "No payment transactions have been recorded yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              disabled={!pagination.hasPreviousPage}
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
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
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
                  disabled={!pagination.hasPreviousPage}
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
                  { length: Math.min(5, pagination.totalPages) },
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
                          pageNum === pagination.currentPage
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
                  disabled={!pagination.hasNextPage}
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          paymentId={selectedPayment.id}
          onPaymentUpdate={(paymentId, updates) => {
            setPayments((prev) =>
              prev.map((payment) =>
                payment.id === paymentId ? { ...payment, ...updates } : payment
              )
            );
          }}
        />
      )}
    </div>
  );
}
