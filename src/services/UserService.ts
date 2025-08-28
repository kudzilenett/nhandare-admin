import { apiClient } from "@/lib/api-client";
import {
  PlatformUser,
  PaginationInfo,
  FilterOption,
  SortOption,
} from "@/types/admin";

export interface UserFilters {
  status?: string[];
  role?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  isActive?: boolean;
  hasPlayedGames?: boolean;
  hasWalletBalance?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  filters?: UserFilters;
  sort?: SortOption;
}

export interface UserListResponse {
  users: PlatformUser[];
  pagination: PaginationInfo;
  filters: {
    status: FilterOption[];
    role: FilterOption[];
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "inactive";
  password: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  walletBalance?: number;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastActive?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType:
    | "login"
    | "logout"
    | "game_played"
    | "tournament_joined"
    | "payment_made"
    | "profile_updated";
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserGameHistory {
  id: string;
  gameType: "chess" | "checkers" | "connect4" | "tictactoe";
  opponentId: string;
  opponentUsername: string;
  result: "win" | "loss" | "draw";
  tournamentId?: string;
  tournamentName?: string;
  duration: number; // in seconds
  eloChange: number;
  createdAt: string;
}

export interface UserPaymentHistory {
  id: string;
  amount: number;
  currency: string;
  type: "tournament_entry" | "wallet_deposit" | "withdrawal" | "prize_payout";
  status: "pending" | "completed" | "failed" | "refunded";
  description: string;
  tournamentId?: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  topUsersByGames: {
    userId: string;
    username: string;
    gamesPlayed: number;
    winRate: number;
  }[];
  userGrowthData: {
    date: string;
    newUsers: number;
    totalUsers: number;
  }[];
  userActivityData: {
    date: string;
    activeUsers: number;
    sessions: number;
  }[];
}

export interface UserStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  currentEloRating: number;
  highestEloRating: number;
  totalTournamentsPlayed: number;
  totalTournamentsWon: number;
  totalWinnings: number;
  averageGameDuration: number;
  favoriteGameType: string;
  lastActiveDate: string;
  accountCreatedDate: string;
  totalTimeSpent: number; // in minutes
}

export interface UserModerationAction {
  id: string;
  userId: string;
  actionType: "warn" | "mute" | "ban" | "unban" | "suspend";
  reason: string;
  duration?: number; // in hours, null for permanent
  moderatorId: string;
  moderatorUsername: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

class UserService {
  private baseUrl = "/api/users";

  // User CRUD Operations
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.sort) {
      searchParams.append("sortBy", params.sort.key);
      searchParams.append("sortOrder", params.sort.direction);
    }

    // Add filters
    if (params.filters) {
      if (params.filters.status?.length) {
        searchParams.append("status", params.filters.status.join(","));
      }
      if (params.filters.role?.length) {
        searchParams.append("role", params.filters.role.join(","));
      }
      if (params.filters.search) {
        searchParams.append("search", params.filters.search);
      }
      if (params.filters.dateRange) {
        searchParams.append(
          "dateRange",
          JSON.stringify(params.filters.dateRange)
        );
      }
      if (params.filters.hasPlayedGames !== undefined) {
        searchParams.append(
          "hasPlayedGames",
          params.filters.hasPlayedGames.toString()
        );
      }
      if (params.filters.hasWalletBalance !== undefined) {
        searchParams.append(
          "hasWalletBalance",
          params.filters.hasWalletBalance.toString()
        );
      }
    }

    const url = `${this.baseUrl}/admin/all?${searchParams.toString()}`;
    const response = await apiClient.get<{
      success: boolean;
      data: UserListResponse;
    }>(url);
    return response.data;
  }

  async getUser(id: string): Promise<PlatformUser> {
    return apiClient.get<PlatformUser>(`${this.baseUrl}/${id}`);
  }

  async createUser(data: CreateUserData): Promise<PlatformUser> {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/create`, data);
    return response.data.user;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<PlatformUser> {
    const response = await apiClient.put<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}`, data);
    return response.data.user;
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/admin/${id}`);
  }

  // User Status Management
  async activateUser(id: string): Promise<PlatformUser> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}/activate`);
    return response.data.user;
  }

  async deactivateUser(id: string, reason?: string): Promise<PlatformUser> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}/deactivate`, {
      reason,
    });
    return response.data.user;
  }

  async banUser(
    id: string,
    reason: string,
    duration?: number
  ): Promise<PlatformUser> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}/ban`, {
      reason,
      duration,
    });
    return response.data.user;
  }

  async unbanUser(id: string): Promise<PlatformUser> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}/unban`);
    return response.data.user;
  }

  async suspendUser(
    id: string,
    reason: string,
    duration: number
  ): Promise<PlatformUser> {
    return apiClient.patch<PlatformUser>(`${this.baseUrl}/${id}/suspend`, {
      reason,
      duration,
    });
  }

  // Role Management
  async assignRole(
    id: string,
    role: "user" | "admin" | "moderator"
  ): Promise<PlatformUser> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { user: PlatformUser };
    }>(`${this.baseUrl}/admin/${id}/assign-role`, {
      role,
    });
    return response.data.user;
  }

  async getUserPermissions(id: string): Promise<string[]> {
    return apiClient.get<string[]>(`${this.baseUrl}/${id}/permissions`);
  }

  async updateUserPermissions(
    id: string,
    permissions: string[]
  ): Promise<void> {
    return apiClient.put<void>(`${this.baseUrl}/${id}/permissions`, {
      permissions,
    });
  }

  // User Activity and History
  async getUserActivity(
    id: string,
    page = 1,
    limit = 50
  ): Promise<{
    activities: UserActivity[];
    pagination: PaginationInfo;
  }> {
    return apiClient.get(
      `${this.baseUrl}/${id}/activity?page=${page}&limit=${limit}`
    );
  }

  async getUserGameHistory(
    id: string,
    page = 1,
    limit = 50
  ): Promise<{
    games: UserGameHistory[];
    pagination: PaginationInfo;
  }> {
    return apiClient.get(
      `${this.baseUrl}/${id}/games?page=${page}&limit=${limit}`
    );
  }

  async getUserPaymentHistory(
    id: string,
    page = 1,
    limit = 50
  ): Promise<{
    payments: UserPaymentHistory[];
    pagination: PaginationInfo;
  }> {
    return apiClient.get(
      `${this.baseUrl}/${id}/payments?page=${page}&limit=${limit}`
    );
  }

  async getUserStats(id: string): Promise<UserStats> {
    return apiClient.get<UserStats>(`${this.baseUrl}/${id}/stats`);
  }

  // User Analytics
  async getUserAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<UserAnalytics> {
    const params = dateRange
      ? `?startDate=${dateRange.start}&endDate=${dateRange.end}`
      : "";
    return apiClient.get<UserAnalytics>(`${this.baseUrl}/analytics${params}`);
  }

  async getUserEngagementMetrics(id: string): Promise<{
    sessionsThisWeek: number;
    averageSessionDuration: number;
    lastLoginDate: string;
    totalLogins: number;
    gamesPlayedThisWeek: number;
    tournamentsJoinedThisMonth: number;
  }> {
    return apiClient.get(`${this.baseUrl}/${id}/engagement`);
  }

  // Moderation
  async getUserModerationHistory(id: string): Promise<UserModerationAction[]> {
    return apiClient.get<UserModerationAction[]>(
      `${this.baseUrl}/${id}/moderation-history`
    );
  }

  async addModerationAction(
    userId: string,
    actionType: "warn" | "mute" | "ban" | "suspend",
    reason: string,
    duration?: number
  ): Promise<UserModerationAction> {
    return apiClient.post<UserModerationAction>(
      `${this.baseUrl}/${userId}/moderation`,
      {
        actionType,
        reason,
        duration,
      }
    );
  }

  async removeModerationAction(
    userId: string,
    actionId: string
  ): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${userId}/moderation/${actionId}`);
  }

  // Verification
  async verifyUserEmail(id: string): Promise<PlatformUser> {
    return apiClient.patch<PlatformUser>(`${this.baseUrl}/${id}/verify-email`);
  }

  async verifyUserPhone(id: string): Promise<PlatformUser> {
    return apiClient.patch<PlatformUser>(`${this.baseUrl}/${id}/verify-phone`);
  }

  async resendVerificationEmail(id: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${id}/resend-verification`);
  }

  // Wallet Management
  async getUserWalletBalance(
    id: string
  ): Promise<{ balance: number; currency: string }> {
    return apiClient.get(`${this.baseUrl}/${id}/wallet`);
  }

  async adjustUserWalletBalance(
    id: string,
    amount: number,
    reason: string
  ): Promise<{
    newBalance: number;
    transactionId: string;
  }> {
    return apiClient.patch(`${this.baseUrl}/${id}/wallet/adjust`, {
      amount,
      reason,
    });
  }

  async freezeUserWallet(id: string, reason: string): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${id}/wallet/freeze`, { reason });
  }

  async unfreezeUserWallet(id: string): Promise<void> {
    return apiClient.patch(`${this.baseUrl}/${id}/wallet/unfreeze`);
  }

  // Bulk Operations
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UpdateUserData>
  ): Promise<PlatformUser[]> {
    const response = await apiClient.post<{
      success: boolean;
      data: { updatedCount: number };
    }>(`${this.baseUrl}/admin/bulk-update`, {
      userIds,
      updates,
    });
    // Note: The backend returns count, not the actual users
    return [];
  }

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    return apiClient.post<void>(`${this.baseUrl}/admin/bulk-delete`, {
      userIds,
    });
  }

  async bulkAssignRole(
    userIds: string[],
    role: "user" | "admin" | "moderator"
  ): Promise<void> {
    return apiClient.post<void>(`${this.baseUrl}/admin/bulk-update`, {
      userIds,
      updates: { role },
    });
  }

  async bulkUpdateStatus(
    userIds: string[],
    status: "active" | "inactive" | "banned"
  ): Promise<void> {
    return apiClient.post<void>(`${this.baseUrl}/admin/bulk-update`, {
      userIds,
      updates: { isActive: status === "active" },
    });
  }

  // Search and Suggestions
  async searchUsers(
    query: string,
    limit = 10
  ): Promise<
    {
      id: string;
      username: string;
      email: string;
      status: string;
    }[]
  > {
    return apiClient.get(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async getSimilarUsers(id: string): Promise<PlatformUser[]> {
    return apiClient.get<PlatformUser[]>(`${this.baseUrl}/${id}/similar`);
  }

  // Export Functions
  async exportUserData(
    filters?: UserFilters,
    format: "csv" | "json" | "xlsx" = "csv"
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (format) params.append("format", format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else if (typeof value === "object") {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<Blob>(
      `${this.baseUrl}/export?${params.toString()}`,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  async generateUserReport(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/${id}/report`, {
      responseType: "blob",
    });
    return response;
  }

  // Communication
  async sendMessageToUser(
    id: string,
    subject: string,
    message: string
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${id}/message`, {
      subject,
      message,
    });
  }

  async sendBulkMessage(
    userIds: string[],
    subject: string,
    message: string
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/bulk/message`, {
      userIds,
      subject,
      message,
    });
  }

  // Device Management
  async getUserDevices(id: string): Promise<
    {
      id: string;
      deviceType: string;
      deviceName: string;
      lastUsed: string;
      ipAddress: string;
      isActive: boolean;
    }[]
  > {
    return apiClient.get(`${this.baseUrl}/${id}/devices`);
  }

  async revokeUserDevice(userId: string, deviceId: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${userId}/devices/${deviceId}`);
  }

  async revokeAllUserDevices(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}/devices`);
  }
}

export const userService = new UserService();
