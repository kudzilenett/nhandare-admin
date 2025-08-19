// Admin Panel Types

export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  SUPPORT = "support",
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowthRate: number;

  // Tournament metrics
  activeTournaments: number;
  totalTournaments: number;
  tournamentParticipation: number;
  averagePrizePool: number;

  // Financial metrics
  totalRevenue: number;
  revenueThisMonth: number;
  paymentSuccessRate: number;
  averageTransactionValue: number;

  // System metrics
  systemUptime: number;
  activeGames: number;
  averageResponseTime: number;
}

export interface SystemHealth {
  database: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    connections: number;
  };
  api: {
    status: "healthy" | "warning" | "error";
    responseTime: number;
    errorRate: number;
  };
  websocket: {
    status: "healthy" | "warning" | "error";
    connectedUsers: number;
    messageRate: number;
  };
}

export interface AdminTournament {
  id: string;
  title: string; // Changed from 'name' to match database schema
  description: string;
  startDate: Date;
  endDate: Date;
  status: "OPEN" | "CLOSED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  maxPlayers: number; // Changed from 'maxParticipants' to match database schema
  currentPlayers: number; // Changed from 'currentParticipants' to match database schema
  entryFee: number;
  prizePool: number;
  gameId: string; // Changed from 'gameType' to match database schema (this will be the actual game ID)
  gameType?: "chess" | "checkers" | "connect4" | "tictactoe"; // Optional for display purposes
  prizeBreakdown?: {
    // Added to match database schema
    first: number;
    second: number;
    third: number;
  };
  // Removed 'isPublic' as it doesn't exist in database schema
  createdBy?: string; // Made optional as it might not be included in all responses
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformUser {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive" | "banned" | "pending";
  role: "user" | "admin" | "moderator";
  walletBalance: number;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPayment {
  id: string;
  userId: string;
  tournamentId?: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  paymentMethodCode?: string;
  mobileMoneyNumber?: string;
  pesePayTransactionId?: string;
  pesePayReference?: string;
  paymentInitiatedAt?: string;
  paymentConfirmedAt?: string;
  paymentFailedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  tournament?: {
    id: string;
    title: string;
    game: {
      name: string;
    };
  };
}

export interface AdminGame {
  id: string;
  type: "chess" | "checkers" | "connect4" | "tictactoe";
  status: "waiting" | "active" | "completed" | "cancelled";
  player1Id: string;
  player2Id?: string;
  winnerId?: string;
  tournamentId?: string;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  badge?: number;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  key: string;
  direction: "asc" | "desc";
}

// Withdrawal Management Types
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
  status: "completed" | "failed";
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
