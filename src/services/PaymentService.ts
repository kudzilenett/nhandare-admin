import { apiClient } from "@/lib/api-client";
import {
  AdminPayment,
  PaginationInfo,
  FilterOption,
  SortOption,
} from "@/types/admin";

export interface PaymentFilters {
  status?: string[];
  type?: string[];
  currency?: string[];
  paymentMethod?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
  userId?: string;
  tournamentId?: string;
}

export interface PaymentSortOption extends SortOption {
  key: "amount" | "createdAt" | "status" | "type" | "updatedAt";
}

export interface PaymentListResponse {
  payments: AdminPayment[];
  pagination: PaginationInfo;
  filters: FilterOption[];
  totalAmount: number;
  averageAmount: number;
  successRate: number;
}

export interface PaymentDetails extends AdminPayment {
  pesepayData?: {
    reference: string;
    transactionId?: string;
    paymentMethodCode?: string;
    mobileMoneyNumber?: string;
    failureReason?: string;
  };
  refundHistory?: PaymentRefund[];
  auditTrail: PaymentAuditEntry[];
}

export interface PaymentRefund {
  id: string;
  amount: number;
  reason: string;
  status: "pending" | "completed" | "failed";
  processedBy: string;
  processedAt: string;
  createdAt: string;
}

export interface PaymentAuditEntry {
  id: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  performedBy: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateRefundData {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
}

export interface UpdatePaymentStatusData {
  paymentId: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  reason?: string;
  failureReason?: string;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  averageTransactionValue: number;
  successRate: number;
  failureRate: number;
  refundRate: number;
  totalTransactions: number;
  transactionsThisMonth: number;
  popularPaymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
    totalAmount: number;
  }>;
  revenueByDay: Array<{
    date: string;
    amount: number;
    transactions: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    amount: number;
  }>;
  userSpending: Array<{
    userId: string;
    username: string;
    totalSpent: number;
    transactionCount: number;
  }>;
}

export interface PaymentMethod {
  code: string;
  name: string;
  type: "card" | "mobile_money" | "bank_transfer";
  currency: string;
  isActive: boolean;
  fees?: {
    fixed?: number;
    percentage?: number;
  };
}

export interface MobileMoneyProvider {
  code: string;
  name: string;
  currency: string;
  phonePattern: string;
  isActive: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  destinationNumber?: string;
  mobileMoneyProviderCode?: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

export interface ProcessWithdrawalData {
  withdrawalId: string;
  status: "COMPLETED" | "FAILED";
  failureReason?: string;
  transactionReference?: string;
  adminNotes?: string;
}

export interface WithdrawalStats {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  failedWithdrawals: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  averageAmount: number;
  successRate: number;
  statusDistribution: Array<{
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

/**
 * PaymentService - Comprehensive payment management service for admin panel
 *
 * Features:
 * - Payment transaction monitoring and management
 * - Refund processing and dispute resolution
 * - Financial analytics and reporting
 * - Payment method and provider management
 * - Withdrawal processing and approval
 * - Audit trail and compliance tracking
 * - Real-time payment status updates
 */
export class PaymentService {
  /**
   * Get paginated list of payments with advanced filtering
   */
  async getPayments(
    filters: PaymentFilters = {},
    sort: PaymentSortOption = { key: "createdAt", direction: "desc" },
    page: number = 1,
    limit: number = 20
  ): Promise<PaymentListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sort.key,
      sortOrder: sort.direction,
    });

    // Add filters
    if (filters.status?.length) {
      // Map UI status values to API status values
      const statusMap: Record<string, string> = {
        pending: "PENDING",
        processing: "PROCESSING",
        completed: "COMPLETED",
        failed: "FAILED",
        cancelled: "CANCELLED",
        refunded: "REFUNDED",
      };
      filters.status.forEach((status) => {
        const apiStatus = statusMap[status] || status;
        params.append("status", apiStatus);
      });
    }
    if (filters.type?.length) {
      filters.type.forEach((type) => params.append("type", type));
    }
    if (filters.currency?.length) {
      filters.currency.forEach((currency) =>
        params.append("currency", currency)
      );
    }
    if (filters.paymentMethod?.length) {
      filters.paymentMethod.forEach((method) =>
        params.append("paymentMethod", method)
      );
    }
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.userId) {
      params.append("userId", filters.userId);
    }
    if (filters.tournamentId) {
      params.append("tournamentId", filters.tournamentId);
    }
    if (filters.dateRange) {
      params.append("startDate", filters.dateRange.start);
      params.append("endDate", filters.dateRange.end);
    }
    if (filters.amountRange) {
      params.append("minAmount", filters.amountRange.min.toString());
      params.append("maxAmount", filters.amountRange.max.toString());
    }

    const response = await apiClient.get(`/api/payments/admin?${params}`);
    return (response as { data: PaymentListResponse }).data;
  }

  /**
   * Get detailed payment information
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    const response = await apiClient.get(`/api/payments/admin/${paymentId}`);
    return (response as { data: PaymentDetails }).data;
  }

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(data: UpdatePaymentStatusData): Promise<void> {
    await apiClient.put(`/api/payments/admin/${data.paymentId}/status`, {
      status: data.status,
      reason: data.reason,
      failureReason: data.failureReason,
    });
  }

  /**
   * Process refund for a payment
   */
  async processRefund(data: CreateRefundData): Promise<PaymentRefund> {
    const response = await apiClient.post(
      `/api/payments/admin/${data.paymentId}/refund`,
      {
        amount: data.amount,
        reason: data.reason,
      }
    );
    return (response as { data: PaymentRefund }).data;
  }

  /**
   * Get payment analytics and financial metrics
   */
  async getAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<PaymentAnalytics> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append("startDate", dateRange.start);
      params.append("endDate", dateRange.end);
    }

    const response = await apiClient.get(
      `/api/payments/admin/analytics?${params}`
    );
    return response.data;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(currency: string = "USD"): Promise<PaymentMethod[]> {
    const response = await apiClient.get(
      `/payments/methods?currency=${currency}`
    );
    return response.data.allMethods || [];
  }

  /**
   * Get mobile money providers for Zimbabwe
   */
  async getMobileMoneyProviders(): Promise<MobileMoneyProvider[]> {
    const response = await apiClient.get("/payments/mobile-money");
    return response.data || [];
  }

  /**
   * Test payment gateway connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get("/payments/test-connection");
    return response.data;
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<string[]> {
    const response = await apiClient.get("/payments/currencies");
    return response.data || ["USD"];
  }

  /**
   * Get user payment history (admin view)
   */
  async getUserPayments(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    payments: AdminPayment[];
    pagination: PaginationInfo;
    totalSpent: number;
    totalEarned: number;
  }> {
    const response = await apiClient.get(
      `/api/payments/admin/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get tournament payment history
   */
  async getTournamentPayments(
    tournamentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    payments: AdminPayment[];
    pagination: PaginationInfo;
    totalRevenue: number;
    participantsPaid: number;
  }> {
    const response = await apiClient.get(
      `/api/payments/admin/tournament/${tournamentId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get pending withdrawal requests
   */
  async getWithdrawalRequests(
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    withdrawals: WithdrawalRequest[];
    pagination: PaginationInfo;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    try {
      const response = await apiClient.get<{ data: WithdrawalRequest[] }>(
        `/api/payments/admin/withdrawals?${params}`
      );
      console.log("Withdrawal requests response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      throw error;
    }
  }

  /**
   * Process withdrawal request (approve/reject)
   */
  async processWithdrawal(data: ProcessWithdrawalData): Promise<void> {
    await apiClient.put(
      `/api/payments/admin/withdrawals/${data.withdrawalId}`,
      {
        status: data.status,
        failureReason: data.failureReason,
        transactionReference: data.transactionReference,
        adminNotes: data.adminNotes,
      }
    );
  }

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats(dateRange?: {
    start: string;
    end: string;
  }): Promise<WithdrawalStats> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append("startDate", dateRange.start);
      params.append("endDate", dateRange.end);
    }

    try {
      const response = await apiClient.get<{ data: WithdrawalStats }>(
        `/api/payments/admin/withdrawals/stats?${params}`
      );
      console.log("Withdrawal stats response:", response);
      return response.data;
    } catch (error) {
      console.error("Error fetching withdrawal stats:", error);
      throw error;
    }
  }

  /**
   * Get payment audit trail
   */
  async getAuditTrail(
    paymentId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    auditEntries: PaymentAuditEntry[];
    pagination: PaginationInfo;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (paymentId) {
      params.append("paymentId", paymentId);
    }

    const response = await apiClient.get(`/api/payments/admin/audit?${params}`);
    return response.data;
  }

  /**
   * Export payments data
   */
  async exportPayments(
    filters: PaymentFilters = {},
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    const params = new URLSearchParams({ format });

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value && typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          params.append(`${key}.${subKey}`, subValue.toString());
        });
      } else if (value) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(
      `/api/payments/admin/export?${params}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  /**
   * Get payment filter options
   */
  async getFilterOptions(): Promise<{
    statuses: FilterOption[];
    types: FilterOption[];
    currencies: FilterOption[];
    paymentMethods: FilterOption[];
  }> {
    const response = await apiClient.get("/api/payments/admin/filters");
    return response.data;
  }

  /**
   * Get revenue trends for dashboard
   */
  async getRevenueTrends(
    period: "day" | "week" | "month" | "year" = "month",
    limit: number = 30
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      transactions: number;
      successRate: number;
    }>
  > {
    const response = await apiClient.get(
      `/api/payments/admin/trends?period=${period}&limit=${limit}`
    );
    return response.data || [];
  }

  /**
   * Bulk update payment statuses
   */
  async bulkUpdateStatus(
    paymentIds: string[],
    status: string,
    reason?: string
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ paymentId: string; error: string }>;
  }> {
    const response = await apiClient.put("/api/payments/admin/bulk-update", {
      paymentIds,
      status,
      reason,
    });
    return response.data;
  }

  /**
   * Search payments by reference or transaction ID
   */
  async searchByReference(reference: string): Promise<AdminPayment[]> {
    const response = await apiClient.get(
      `/api/payments/admin/search?reference=${encodeURIComponent(reference)}`
    );
    return response.data || [];
  }

  /**
   * Get payment disputes and issues
   */
  async getDisputes(
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    disputes: Array<{
      id: string;
      paymentId: string;
      userId: string;
      reason: string;
      status: "open" | "investigating" | "resolved" | "closed";
      priority: "low" | "medium" | "high" | "urgent";
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: PaginationInfo;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }

    const response = await apiClient.get(
      `/api/payments/admin/disputes?${params}`
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();
