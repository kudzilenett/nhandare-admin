"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { userService, UserStats, UserActivity } from "@/services/UserService";

interface UserDetailsModalProps {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: "user" | "admin" | "moderator";
    status: "active" | "inactive" | "banned" | "pending";
    walletBalance: number;
    totalGamesPlayed: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    lastActive: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: any) => void;
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onEdit,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "games" | "moderation"
  >("overview");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockUserStats: UserStats = {
    totalGamesPlayed: user?.totalGamesPlayed || 0,
    totalWins: user?.totalWins || 0,
    totalLosses: user?.totalLosses || 0,
    totalDraws: 2,
    winRate: user?.winRate || 0,
    currentEloRating: 1247,
    highestEloRating: 1340,
    totalTournamentsPlayed: 8,
    totalTournamentsWon: 2,
    totalWinnings: 145.5,
    averageGameDuration: 18.5,
    favoriteGameType: "chess",
    lastActiveDate: user?.lastActive || "",
    accountCreatedDate: user?.createdAt || "",
    totalTimeSpent: 1250, // in minutes
  };

  const mockUserActivity: UserActivity[] = [
    {
      id: "1",
      userId: user?.id || "",
      activityType: "login",
      description: "User logged in",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      createdAt: "2024-01-19T15:30:00Z",
    },
    {
      id: "2",
      userId: user?.id || "",
      activityType: "game_played",
      description: "Played chess game against opponent",
      metadata: { gameType: "chess", result: "win", opponent: "player123" },
      createdAt: "2024-01-19T14:45:00Z",
    },
    {
      id: "3",
      userId: user?.id || "",
      activityType: "tournament_joined",
      description: "Joined weekend chess tournament",
      metadata: {
        tournamentId: "tour_123",
        tournamentName: "Weekend Chess Championship",
      },
      createdAt: "2024-01-18T20:15:00Z",
    },
  ];

  useEffect(() => {
    if (isOpen && user) {
      // Load user stats and activity
      setIsLoading(true);
      // In real implementation, you would call:
      // Promise.all([
      //   userService.getUserStats(user.id),
      //   userService.getUserActivity(user.id)
      // ]).then(([stats, activity]) => {
      //   setUserStats(stats);
      //   setUserActivity(activity.activities);
      // }).finally(() => setIsLoading(false));

      // Mock data for now
      setTimeout(() => {
        setUserStats(mockUserStats);
        setUserActivity(mockUserActivity);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "banned":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-indigo-100 text-indigo-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "login":
        return <GlobeAltIcon className="h-4 w-4 text-green-500" />;
      case "logout":
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      case "game_played":
        return <TrophyIcon className="h-4 w-4 text-blue-500" />;
      case "tournament_joined":
        return <TrophyIcon className="h-4 w-4 text-purple-500" />;
      case "payment_made":
        return <BanknotesIcon className="h-4 w-4 text-green-500" />;
      case "profile_updated":
        return <UserCircleIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: UserCircleIcon },
    { id: "activity", name: "Activity", icon: ClockIcon },
    { id: "games", name: "Game Stats", icon: TrophyIcon },
    { id: "moderation", name: "Moderation", icon: ShieldCheckIcon },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="px-3 py-1 text-sm font-medium text-admin-accent border border-admin-accent rounded-md hover:bg-admin-accent hover:text-white"
              >
                Edit User
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* User Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
                <span
                  className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(user.walletBalance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Games Played</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.totalGamesPlayed}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Win Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.winRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-admin-accent text-admin-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {user.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Member since</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Last active</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(user.lastActive)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Verification Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-900">
                      Email Verified
                    </span>
                  </div>
                  <div className="flex items-center">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-900">
                      Phone Not Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Recent Activity
              </h4>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        {activity.metadata && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "games" && userStats && (
            <div className="space-y-6">
              {/* Game Statistics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Game Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats.totalGamesPlayed}
                    </p>
                    <p className="text-sm text-gray-500">Total Games</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {userStats.totalWins}
                    </p>
                    <p className="text-sm text-gray-500">Wins</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {userStats.totalLosses}
                    </p>
                    <p className="text-sm text-gray-500">Losses</p>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">
                      {userStats.totalDraws}
                    </p>
                    <p className="text-sm text-gray-500">Draws</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {userStats.currentEloRating}
                    </p>
                    <p className="text-sm text-gray-500">Current ELO</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {userStats.highestEloRating}
                    </p>
                    <p className="text-sm text-gray-500">Highest ELO</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDuration(userStats.totalTimeSpent)}
                    </p>
                    <p className="text-sm text-gray-500">Time Played</p>
                  </div>
                </div>
              </div>

              {/* Tournament Stats */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Tournaments
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {userStats.totalTournamentsPlayed}
                    </p>
                    <p className="text-sm text-gray-500">Tournaments Played</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {userStats.totalTournamentsWon}
                    </p>
                    <p className="text-sm text-gray-500">Tournaments Won</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(userStats.totalWinnings)}
                    </p>
                    <p className="text-sm text-gray-500">Total Winnings</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "moderation" && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Moderation History
              </h4>
              <div className="text-center py-8">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No moderation actions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This user has a clean record with no moderation actions taken.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
