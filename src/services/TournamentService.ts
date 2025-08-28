import { apiClient } from "@/lib/api-client";
import {
  AdminTournament,
  PaginationInfo,
  FilterOption,
  SortOption,
} from "@/types/admin";

export interface TournamentFilters {
  status?: string[];
  gameType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface TournamentListParams {
  page?: number;
  limit?: number;
  filters?: TournamentFilters;
  sort?: SortOption;
}

export interface TournamentListResponse {
  tournaments: AdminTournament[];
  pagination: PaginationInfo;
  filters: {
    status: FilterOption[];
    gameType: FilterOption[];
  };
}

export interface CreateTournamentData {
  title: string; // Changed from 'name' to match database schema
  description: string;
  gameType: "chess" | "checkers" | "connect4" | "tictactoe"; // Keep for form convenience, will be converted to gameId
  maxPlayers: number; // Changed from 'maxParticipants' to match database schema
  entryFee: number;
  startDate: string;
  endDate: string;
  // Removed 'isPublic' as it doesn't exist in database schema
  prizeBreakdown: {
    // Changed from 'prizeDistribution' to match database schema
    first: number;
    second: number;
    third: number;
  };
  // New bracket configuration fields
  bracketType:
    | "SINGLE_ELIMINATION"
    | "DOUBLE_ELIMINATION"
    | "ROUND_ROBIN"
    | "SWISS";
  bracketConfig?: {
    useAdvancedSeeding: boolean;
    seedingOptions?: {
      includePerformance: boolean;
      includeHistory: boolean;
      includeRegional: boolean;
      includeConsistency: boolean;
      performanceWeight: number;
      historyWeight: number;
      regionalWeight: number;
      consistencyWeight: number;
      ratingWeight: number;
      recentTournaments: number;
      regionalRadius: number;
    };
  };
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {
  status?: "draft" | "registration" | "active" | "completed" | "cancelled";
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  username: string;
  email: string;
  seed: number;
  registrationDate: string;
  status: "registered" | "confirmed" | "withdrawn";
}

export interface TournamentBracket {
  rounds: {
    id: string;
    roundNumber: number;
    matches: {
      id: string;
      player1Id: string;
      player2Id?: string;
      winnerId?: string;
      status: "pending" | "active" | "completed";
      scheduledTime?: string;
      completedTime?: string;
    }[];
  }[];
}

export interface TournamentAnalytics {
  participationRate: number;
  averageGameDuration: number;
  completionRate: number;
  revenueGenerated: number;
  topPerformers: {
    userId: string;
    username: string;
    wins: number;
    winRate: number;
  }[];
}

class TournamentService {
  private baseUrl = "/api/tournaments";

  // Tournament CRUD Operations
  async getTournaments(
    params: TournamentListParams = {}
  ): Promise<TournamentListResponse> {
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
      if (params.filters.gameType?.length) {
        searchParams.append("gameType", params.filters.gameType.join(","));
      }
      if (params.filters.search) {
        searchParams.append("search", params.filters.search);
      }
      if (params.filters.dateRange) {
        searchParams.append("startDate", params.filters.dateRange.start);
        searchParams.append("endDate", params.filters.dateRange.end);
      }
    }

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    const response = await apiClient.get<{
      success: boolean;
      data: {
        tournaments: Array<{
          id: string;
          title: string;
          description: string;
          startDate: string;
          endDate: string;
          status: string;
          maxPlayers: number;
          currentPlayers: number;
          entryFee: number;
          prizePool: number;
          game?: { id: string; name: string };
          isOnlineOnly: boolean;
          prizeBreakdown?: { first: number; second: number; third: number };
          createdBy?: string;
          createdAt: string;
          updatedAt: string;
          // Add bracket configuration fields
          bracketType?: string;
          useAdvancedSeeding?: boolean;
          bracketConfig?: {
            useAdvancedSeeding: boolean;
            seedingOptions?: {
              includePerformance: boolean;
              includeHistory: boolean;
              includeRegional: boolean;
              includeConsistency: boolean;
              performanceWeight: number;
              historyWeight: number;
              regionalWeight: number;
              consistencyWeight: number;
              ratingWeight: number;
              recentTournaments: number;
              regionalRadius: number;
            };
          };
        }>;
        pagination: PaginationInfo;
      };
    }>(url);

    // Transform backend response to match frontend expectations
    const tournaments: AdminTournament[] = response.data.tournaments.map(
      (tournament: {
        id: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        status: string;
        maxPlayers: number;
        currentPlayers: number;
        entryFee: number;
        prizePool: number;
        game?: { id: string; name: string };
        isOnlineOnly: boolean;
        prizeBreakdown?: { first: number; second: number; third: number };
        createdBy?: string;
        createdAt: string;
        updatedAt: string;
        // Add bracket configuration fields
        bracketType?: string;
        useAdvancedSeeding?: boolean;
        bracketConfig?: {
          useAdvancedSeeding: boolean;
          seedingOptions?: {
            includePerformance: boolean;
            includeHistory: boolean;
            includeRegional: boolean;
            includeConsistency: boolean;
            performanceWeight: number;
            historyWeight: number;
            regionalWeight: number;
            consistencyWeight: number;
            ratingWeight: number;
            recentTournaments: number;
            regionalRadius: number;
          };
        };
      }) => ({
        id: tournament.id,
        title: tournament.title,
        description: tournament.description,
        startDate: new Date(tournament.startDate),
        endDate: new Date(tournament.endDate),
        status: tournament.status as
          | "OPEN"
          | "CLOSED"
          | "ACTIVE"
          | "COMPLETED"
          | "CANCELLED",
        maxPlayers: tournament.maxPlayers,
        currentPlayers: tournament.currentPlayers,
        entryFee: tournament.entryFee,
        prizePool: tournament.prizePool,
        gameId: tournament.game?.id || "default-game-id",
        gameType: (tournament.game?.name?.toLowerCase() || "chess") as
          | "chess"
          | "checkers"
          | "connect4"
          | "tictactoe",
        prizeBreakdown: tournament.prizeBreakdown || undefined,
        createdBy: tournament.createdBy || "admin",
        createdAt: new Date(tournament.createdAt),
        updatedAt: new Date(tournament.updatedAt),
        // Map bracket configuration fields
        bracketType: tournament.bracketType as
          | "SINGLE_ELIMINATION"
          | "DOUBLE_ELIMINATION"
          | "ROUND_ROBIN"
          | "SWISS"
          | undefined,
        bracketConfig: tournament.bracketConfig || undefined,
      })
    );

    return {
      tournaments,
      pagination: response.data.pagination,
      filters: {
        status: [],
        gameType: [],
      },
    };
  }

  async getTournament(id: string): Promise<AdminTournament> {
    return apiClient.get<AdminTournament>(`${this.baseUrl}/${id}`);
  }

  async createTournament(data: CreateTournamentData): Promise<AdminTournament> {
    try {
      // Transform frontend data to match backend expectations
      const gameId = await this.getGameIdFromType(data.gameType);

      // Calculate dates properly
      const now = new Date();
      const startDate = new Date(data.startDate);

      // Set registration end to 23:59:59 on the day before tournament starts
      const registrationEnd = new Date(startDate);
      registrationEnd.setDate(registrationEnd.getDate() - 1);
      registrationEnd.setHours(23, 59, 59, 999); // End at 11:59:59 PM

      // Ensure registration end is after registration start
      // If the calculated end time is before now, set it to tomorrow at 11:59 PM
      if (registrationEnd <= now) {
        registrationEnd.setDate(now.getDate() + 1);
        registrationEnd.setHours(23, 59, 59, 999);
      }

      const backendData = {
        title: data.title,
        description: data.description,
        gameId: gameId,
        maxPlayers: data.maxPlayers,
        entryFee: data.entryFee,
        prizePool: data.entryFee * data.maxPlayers, // Calculate prize pool
        startDate: data.startDate,
        endDate: data.endDate,
        registrationStart: now.toISOString(), // Start registration now
        registrationEnd: registrationEnd.toISOString(), // End registration before tournament starts
        isOnlineOnly: true, // Default to online-only since isPublic doesn't exist in schema
        prizeBreakdown: data.prizeBreakdown,
        bracketType: data.bracketType,
        bracketConfig: data.bracketConfig,
      };

      console.log("Creating tournament with data:", backendData);
      const response = await apiClient.post<AdminTournament>(
        this.baseUrl,
        backendData
      );
      console.log("Tournament created successfully:", response);
      return response;
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  }

  private async getGameIdFromType(gameType: string): Promise<string> {
    try {
      console.log(`Fetching game ID for type: ${gameType}`);

      // Fetch games from the backend to get actual IDs
      const response = await apiClient.get<{
        success: boolean;
        data: {
          games: Array<{ id: string; name: string }>;
        };
      }>("/api/games");

      console.log("Games response:", response);

      if (response.success && response.data && response.data.games) {
        console.log("Games array:", response.data.games);
        const games = response.data.games;
        const gameMap: Record<string, string> = {};

        games.forEach((game: { id: string; name: string }) => {
          const normalizedName = game.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          gameMap[normalizedName] = game.id;
          console.log(`Mapped ${game.name} (${normalizedName}) to ${game.id}`);
        });

        // Map frontend game types to backend game names
        const gameTypeMapping: Record<string, string> = {
          chess: "chess",
          checkers: "checkers",
          connect4: "connect4",
          tictactoe: "tictactoe",
        };

        const backendGameName = gameTypeMapping[gameType];
        const gameId = gameMap[backendGameName];

        console.log(
          `Looking for game: ${backendGameName}, found ID: ${gameId}`
        );

        if (gameId) {
          return gameId;
        }
      }

      // Fallback: return a default game ID (chess)
      console.warn(
        `Could not find game ID for type: ${gameType}, using default`
      );
      return "default-chess-id";
    } catch (error) {
      console.error("Error fetching games:", error);
      // Fallback: return a default game ID
      return "default-chess-id";
    }
  }

  async updateTournament(
    id: string,
    data: UpdateTournamentData
  ): Promise<AdminTournament> {
    // Transform gameType to gameId if needed
    const transformedData: UpdateTournamentData & { gameId?: string } = {
      ...data,
    };
    if (data.gameType) {
      const gameId = await this.getGameIdFromType(data.gameType);
      transformedData.gameId = gameId;
      delete transformedData.gameType; // Remove gameType from the request
    }

    return apiClient.put<AdminTournament>(
      `${this.baseUrl}/${id}`,
      transformedData
    );
  }

  async deleteTournament(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  async cancelTournament(
    id: string,
    reason?: string
  ): Promise<AdminTournament> {
    return apiClient.patch<AdminTournament>(`${this.baseUrl}/${id}/cancel`, {
      reason,
    });
  }

  // Participant Management
  async getTournamentParticipants(
    id: string
  ): Promise<TournamentParticipant[]> {
    return apiClient.get<TournamentParticipant[]>(
      `${this.baseUrl}/${id}/participants`
    );
  }

  async addParticipant(
    tournamentId: string,
    userId: string
  ): Promise<TournamentParticipant> {
    return apiClient.post<TournamentParticipant>(
      `${this.baseUrl}/${tournamentId}/participants`,
      {
        userId,
      }
    );
  }

  async removeParticipant(tournamentId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(
      `${this.baseUrl}/${tournamentId}/participants/${userId}`
    );
  }

  async updateParticipantSeed(
    tournamentId: string,
    userId: string,
    seed: number
  ): Promise<TournamentParticipant> {
    return apiClient.patch<TournamentParticipant>(
      `${this.baseUrl}/${tournamentId}/participants/${userId}`,
      { seed }
    );
  }

  // Bracket Management
  async getTournamentBracket(id: string): Promise<TournamentBracket> {
    return apiClient.get<TournamentBracket>(`${this.baseUrl}/${id}/bracket`);
  }

  async updateTournamentBracket(
    id: string,
    bracket: TournamentBracket
  ): Promise<TournamentBracket> {
    return apiClient.put<TournamentBracket>(
      `${this.baseUrl}/${id}/bracket`,
      bracket
    );
  }

  async generateBracket(id: string): Promise<TournamentBracket> {
    return apiClient.post<TournamentBracket>(
      `${this.baseUrl}/${id}/bracket/generate`
    );
  }

  // Match Management
  async updateMatchResult(
    tournamentId: string,
    matchId: string,
    winnerId: string
  ): Promise<void> {
    return apiClient.patch<void>(
      `${this.baseUrl}/${tournamentId}/matches/${matchId}`,
      {
        winnerId,
      }
    );
  }

  async scheduleMatch(
    tournamentId: string,
    matchId: string,
    scheduledTime: string
  ): Promise<void> {
    return apiClient.patch<void>(
      `${this.baseUrl}/${tournamentId}/matches/${matchId}/schedule`,
      {
        scheduledTime,
      }
    );
  }

  // Tournament Analytics
  async getTournamentAnalytics(id: string): Promise<TournamentAnalytics> {
    return apiClient.get<TournamentAnalytics>(
      `${this.baseUrl}/${id}/analytics`
    );
  }

  // Tournament Actions
  async startTournament(id: string): Promise<AdminTournament> {
    return apiClient.post<AdminTournament>(`${this.baseUrl}/${id}/start`);
  }

  async completeTournament(id: string): Promise<AdminTournament> {
    return apiClient.post<AdminTournament>(`${this.baseUrl}/${id}/complete`);
  }

  async pauseTournament(id: string): Promise<AdminTournament> {
    return apiClient.post<AdminTournament>(`${this.baseUrl}/${id}/pause`);
  }

  async resumeTournament(id: string): Promise<AdminTournament> {
    return apiClient.post<AdminTournament>(`${this.baseUrl}/${id}/resume`);
  }

  // Chat Moderation
  async getTournamentChat(id: string, page = 1, limit = 50) {
    return apiClient.get(
      `${this.baseUrl}/${id}/chat?page=${page}&limit=${limit}`
    );
  }

  async deleteMessage(tournamentId: string, messageId: string): Promise<void> {
    return apiClient.delete(
      `${this.baseUrl}/${tournamentId}/chat/${messageId}`
    );
  }

  async muteUser(
    tournamentId: string,
    userId: string,
    duration: number
  ): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${tournamentId}/chat/mute`, {
      userId,
      duration,
    });
  }

  // Bulk Operations
  async bulkUpdateTournaments(
    tournamentIds: string[],
    updates: Partial<UpdateTournamentData>
  ): Promise<AdminTournament[]> {
    return apiClient.patch<AdminTournament[]>(`${this.baseUrl}/bulk`, {
      tournamentIds,
      updates,
    });
  }

  async bulkDeleteTournaments(tournamentIds: string[]): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/bulk`, {
      data: { tournamentIds },
    });
  }

  // Export Functions
  async exportTournamentData(
    id: string,
    format: "csv" | "json" | "xlsx" = "csv"
  ): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `${this.baseUrl}/${id}/export?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  async exportTournamentReport(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/${id}/report`, {
      responseType: "blob",
    });
    return response;
  }
}

export const tournamentService = new TournamentService();
