import { apiClient } from "../lib/api-client";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalMatches: number;
  totalPayments: number;
  inactiveUsers: number;
}

export interface OnlinePlayersData {
  online: number;
  activeSessions: number;
  byGame: Record<string, number>;
}

export interface ActiveGamesData {
  sessions: number;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

export interface OnlinePlayersResponse {
  success: boolean;
  data: OnlinePlayersData;
}

export interface ActiveGamesResponse {
  success: boolean;
  data: ActiveGamesData;
}

export class AdminStatsService {
  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStatsResponse> {
    return apiClient.get<AdminStatsResponse>("/api/auth/admin/stats");
  }

  /**
   * Get online players data
   */
  async getOnlinePlayersData(): Promise<OnlinePlayersResponse> {
    return apiClient.get<OnlinePlayersResponse>("/api/games/online-players");
  }

  /**
   * Get active games count
   */
  async getActiveGamesData(): Promise<ActiveGamesResponse> {
    return apiClient.get<ActiveGamesResponse>("/api/games/active");
  }

  /**
   * Get all real-time dashboard data
   */
  async getDashboardData(): Promise<{
    adminStats: AdminStats;
    onlineData: OnlinePlayersData;
    activeGames: ActiveGamesData;
  }> {
    const [adminStatsRes, onlineRes, activeGamesRes] = await Promise.all([
      this.getAdminStats(),
      this.getOnlinePlayersData(),
      this.getActiveGamesData(),
    ]);

    return {
      adminStats: adminStatsRes.data,
      onlineData: onlineRes.data,
      activeGames: activeGamesRes.data,
    };
  }
}

export const adminStatsService = new AdminStatsService();
