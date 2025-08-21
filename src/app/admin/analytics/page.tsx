"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
} from "recharts";
import {
  UsersIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  QueueListIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import {
  matchmakingService,
  MatchmakingAnalytics,
} from "../../../services/MatchmakingService";
import {
  adminStatsService,
  AdminStats,
  OnlinePlayersData,
  ActiveGamesData,
} from "../../../services/AdminStatsService";

const timeRanges = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [matchmakingData, setMatchmakingData] =
    useState<MatchmakingAnalytics | null>(null);
  const [currentQueue, setCurrentQueue] = useState<Record<string, number>>({});
  const [matchmakingError, setMatchmakingError] = useState<string | null>(null);

  // Real-time admin stats state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [onlineData, setOnlineData] = useState<OnlinePlayersData | null>(null);
  const [activeGames, setActiveGames] = useState<ActiveGamesData | null>(null);
  const [realDataError, setRealDataError] = useState<string | null>(null);

  // Fetch real admin dashboard data
  const fetchRealData = useCallback(async () => {
    try {
      setRealDataError(null);
      const { adminStats, onlineData, activeGames } =
        await adminStatsService.getDashboardData();
      setAdminStats(adminStats);
      setOnlineData(onlineData);
      setActiveGames(activeGames);
    } catch (error) {
      console.error("Failed to fetch real dashboard data:", error);
      setRealDataError("Failed to load dashboard data");
    }
  }, []);

  // Fetch matchmaking analytics
  const fetchMatchmakingAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setMatchmakingError(null);

      const days =
        selectedTimeRange === "24h"
          ? 1
          : selectedTimeRange === "7d"
          ? 7
          : selectedTimeRange === "30d"
          ? 30
          : 90;

      const response = await matchmakingService.getAnalytics(undefined, days);
      setMatchmakingData(response.data.analytics);
      setCurrentQueue(response.data.currentQueue);
    } catch (error) {
      console.error("Failed to fetch matchmaking analytics:", error);
      setMatchmakingError("Failed to load matchmaking data");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange]);

  // Fetch data on component mount and time range change
  useEffect(() => {
    fetchMatchmakingAnalytics();
    fetchRealData();
  }, [fetchMatchmakingAnalytics, fetchRealData]);

  // Real-time updates for all data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatchmakingAnalytics();
      fetchRealData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchMatchmakingAnalytics, fetchRealData]);

  // Real dashboard stats
  const stats =
    adminStats && onlineData && activeGames
      ? [
          {
            name: "Online Users",
            value: onlineData.online.toLocaleString(),
            change: `${adminStats.activeUsers} total active`,
            changeType: "neutral" as const,
            icon: UsersIcon,
            color: "blue" as const,
          },
          {
            name: "Active Games",
            value: activeGames.sessions.toString(),
            change: `${onlineData.activeSessions} playing now`,
            changeType: "neutral" as const,
            icon: ChartBarIcon,
            color: "green" as const,
          },
          {
            name: "Active Tournaments",
            value: adminStats.activeTournaments.toString(),
            change: `${adminStats.totalTournaments} total`,
            changeType: "neutral" as const,
            icon: TrophyIcon,
            color: "purple" as const,
          },
          {
            name: "Total Users",
            value: adminStats.totalUsers.toLocaleString(),
            change: `${adminStats.inactiveUsers} inactive`,
            changeType: "neutral" as const,
            icon: UsersIcon,
            color: "green" as const,
          },
        ]
      : [];

  // Matchmaking-specific stats
  const matchmakingStats = matchmakingData
    ? [
        {
          name: "Total Matches",
          value: matchmakingData.matches.total.toLocaleString(),
          change: `${matchmakingData.matches.humanPercentage}% human`,
          changeType: "neutral" as const,
          icon: RocketLaunchIcon,
          color: "blue" as const,
        },
        {
          name: "Avg Wait Time",
          value: `${matchmakingData.performance.averageWaitTime}s`,
          change:
            matchmakingData.performance.averageWaitTime < 45 ? "Good" : "High",
          changeType:
            matchmakingData.performance.averageWaitTime < 45
              ? ("increase" as const)
              : ("decrease" as const),
          icon: ClockIcon,
          color:
            matchmakingData.performance.averageWaitTime < 45
              ? ("green" as const)
              : ("yellow" as const),
        },
        {
          name: "Peak Users",
          value: matchmakingData.performance.peakConcurrentUsers.toString(),
          change: "Concurrent",
          changeType: "neutral" as const,
          icon: UsersIcon,
          color: "purple" as const,
        },
        {
          name: "Current Queue",
          value: Object.values(currentQueue)
            .reduce((sum, count) => sum + count, 0)
            .toString(),
          change: `${Object.keys(currentQueue).length} games`,
          changeType: "neutral" as const,
          icon: QueueListIcon,
          color: "blue" as const,
        },
      ]
    : [];

  // Prepare chart data for human vs AI matches
  const humanVsAiData = matchmakingData
    ? [
        {
          name: "Human vs Human",
          value: matchmakingData.matches.humanPercentage,
          count: matchmakingData.matches.human,
          color: "#10B981",
        },
        {
          name: "Human vs AI",
          value: matchmakingData.matches.aiPercentage,
          count: matchmakingData.matches.ai,
          color: "#3B82F6",
        },
      ]
    : [];

  // Prepare daily matchmaking data for charts
  const dailyMatchmakingData = matchmakingData
    ? matchmakingData.daily.reduce(
        (acc, day) => {
          const existingDay = acc.find((d) => d.date === day.date);
          if (existingDay) {
            existingDay.totalMatches += day.totalMatches;
            existingDay.humanMatches += day.humanMatches;
            existingDay.aiMatches += day.aiMatches;
            existingDay.averageWaitTime = Math.round(
              (existingDay.averageWaitTime + day.averageWaitTime) / 2
            );
          } else {
            acc.push({
              date: day.date.split("-").slice(1).join("/"), // Format as MM/DD
              totalMatches: day.totalMatches,
              humanMatches: day.humanMatches,
              aiMatches: day.aiMatches,
              averageWaitTime: day.averageWaitTime,
            });
          }
          return acc;
        },
        [] as Array<{
          date: string;
          totalMatches: number;
          humanMatches: number;
          aiMatches: number;
          averageWaitTime: number;
        }>
      )
    : [];

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    neutral: "bg-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Live platform analytics and matchmaking insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Time Range:</span>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>
      </div>

      {/* Real-time stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div
                className={`absolute rounded-md p-3 ${
                  colorClasses[stat.color]
                }`}
              >
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Error Messages */}
      {(matchmakingError || realDataError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          {matchmakingError && (
            <p className="text-sm text-red-600">
              ⚠️ Matchmaking: {matchmakingError}
            </p>
          )}
          {realDataError && (
            <p className="text-sm text-red-600">
              ⚠️ Dashboard: {realDataError}
            </p>
          )}
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              🔗 Real Analytics Connected
            </p>
            <p className="text-xs text-green-600">
              Live data from backend API • Updates every 30 seconds • No mock
              data
            </p>
          </div>
          {matchmakingData && (
            <div className="text-right">
              <p className="text-xs text-green-600">
                Last Updated:
                {new Date(matchmakingData.period.endDate).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {matchmakingData && (
        <>
          {/* Matchmaking Performance Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                🎮 Matchmaking Performance ({matchmakingData.period.days} days)
              </h3>
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Updating...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {matchmakingStats.map((stat) => (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-lg bg-gray-50 px-4 py-5"
                >
                  <dt>
                    <div
                      className={`absolute rounded-md p-3 ${
                        colorClasses[stat.color]
                      }`}
                    >
                      <stat.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                      {stat.change}
                    </p>
                  </dd>
                </div>
              ))}
            </div>

            {/* Current Queue Status */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                🔄 Current Queue Status
              </h4>
              {Object.keys(currentQueue).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(currentQueue).map(([gameType, count]) => (
                    <div key={gameType} className="text-center">
                      <p className="text-lg font-semibold text-blue-600">
                        {count}
                      </p>
                      <p className="text-xs text-blue-500 capitalize">
                        {gameType}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-blue-600">
                    🎯 No players currently in queue
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Players waiting for matches will appear here in real-time
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Real Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Distribution by Active Sessions */}
        {onlineData && Object.keys(onlineData.byGame).length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🎮 Active Games Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(onlineData.byGame).map(
                    ([name, count], index) => ({
                      name,
                      value: count,
                      color: [
                        `#3B82F6`,
                        `#10B981`,
                        `#F59E0B`,
                        `#EF4444`,
                        `#8B5CF6`,
                      ][index % 5],
                    })
                  )}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(onlineData.byGame).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [`#3B82F6`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Total Active Sessions:
                <strong>{onlineData.activeSessions}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Human vs AI Matches */}
        {matchmakingData && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🤖 Human vs AI Matches
            </h3>
            {humanVsAiData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={humanVsAiData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, count }) =>
                        `${name}: ${value}% (${count})`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {humanVsAiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-semibold text-green-600">
                      {matchmakingData.matches.humanPercentage}%
                    </p>
                    <p className="text-sm text-green-500">Human Matches</p>
                    <p className="text-xs text-gray-500">
                      {matchmakingData.matches.human} total
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-semibold text-blue-600">
                      {matchmakingData.matches.aiPercentage}%
                    </p>
                    <p className="text-sm text-blue-500">AI Matches</p>
                    <p className="text-xs text-gray-500">
                      {matchmakingData.matches.ai} total
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-6xl mb-4">🎮</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  No Match Data Yet
                </h4>
                <p className="text-sm text-center max-w-md">
                  Analytics are connected! Start playing Quick Match games to
                  see human vs AI distribution here.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-semibold text-green-600">0</p>
                    <p className="text-sm text-green-500">Human Matches</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-semibold text-blue-600">0</p>
                    <p className="text-sm text-blue-500">AI Matches</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Matchmaking Performance */}
        {matchmakingData && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📊 Daily Matchmaking Performance
            </h3>
            {dailyMatchmakingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyMatchmakingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="totalMatches"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="Total Matches"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="averageWaitTime"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Avg Wait Time (s)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  No Daily Performance Data
                </h4>
                <p className="text-sm text-center max-w-md">
                  Analytics are live! Daily trends will appear here as players
                  use Quick Match over time.
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    Data Period:
                    <strong>{matchmakingData.period.days} days</strong>
                    <br />
                    <span className="text-xs">
                      {new Date(
                        matchmakingData.period.startDate
                      ).toLocaleDateString()}
                      -
                      {new Date(
                        matchmakingData.period.endDate
                      ).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wait Time Analysis */}
        {matchmakingData && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ⏱️ Wait Time Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Wait Time</span>
                <span className="text-lg font-semibold text-gray-900">
                  {matchmakingData.performance.averageWaitTime}s
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    matchmakingData.performance.averageWaitTime <= 30
                      ? "bg-green-500"
                      : matchmakingData.performance.averageWaitTime <= 45
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (matchmakingData.performance.averageWaitTime / 90) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="text-xs text-gray-500 flex justify-between">
                <span>Excellent (0-30s)</span>
                <span>Good (30-45s)</span>
                <span>Needs Improvement (45s+)</span>
              </div>

              {matchmakingData.performance.averageRatingDifference && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Match Quality:</strong> Average rating difference of
                    <span className="font-semibold text-blue-600">
                      ±{matchmakingData.performance.averageRatingDifference}
                    </span>
                    points between players
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
