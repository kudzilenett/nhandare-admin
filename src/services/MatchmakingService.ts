import { apiClient } from "../lib/api-client";

export interface MatchmakingAnalytics {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  matches: {
    total: number;
    human: number;
    ai: number;
    humanPercentage: number;
    aiPercentage: number;
  };
  performance: {
    averageWaitTime: number;
    averageRatingDifference: number | null;
    peakConcurrentUsers: number;
  };
  daily: Array<{
    date: string;
    gameType: string;
    totalMatches: number;
    humanMatches: number;
    aiMatches: number;
    averageWaitTime: number;
    averageRatingDifference: number | null;
  }>;
}

export interface MatchmakingResponse {
  success: boolean;
  data: {
    analytics: MatchmakingAnalytics;
    currentQueue: Record<string, number>;
    timestamp: string;
  };
}

export class MatchmakingService {
  /**
   * Get matchmaking analytics
   */
  async getAnalytics(
    gameType?: string,
    days = 7
  ): Promise<MatchmakingResponse> {
    const params = new URLSearchParams();
    if (gameType) params.append("gameType", gameType);
    params.append("days", days.toString());

    return apiClient.get<MatchmakingResponse>(
      `/api/games/analytics?${params.toString()}`
    );
  }

  /**
   * Get current queue status for all games
   */
  async getCurrentQueue(): Promise<Record<string, number>> {
    const response = await this.getAnalytics();
    return response.data.currentQueue;
  }

  /**
   * Get queue status for specific game
   */
  async getQueueStatus(gameType: string): Promise<Record<string, unknown>> {
    return apiClient.get(`/api/games/queue-status/${gameType}`);
  }
}

export const matchmakingService = new MatchmakingService();
