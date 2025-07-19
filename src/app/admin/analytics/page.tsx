"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  UsersIcon,
  TrophyIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

// Mock data - replace with real API calls
const userGrowthData = [
  { month: "Jan", users: 1200, newUsers: 150 },
  { month: "Feb", users: 1350, newUsers: 180 },
  { month: "Mar", users: 1520, newUsers: 200 },
  { month: "Apr", users: 1680, newUsers: 220 },
  { month: "May", users: 1850, newUsers: 250 },
  { month: "Jun", users: 2100, newUsers: 280 },
];

const revenueData = [
  { month: "Jan", revenue: 8500, tournaments: 12 },
  { month: "Feb", revenue: 9200, tournaments: 15 },
  { month: "Mar", revenue: 10800, tournaments: 18 },
  { month: "Apr", revenue: 12500, tournaments: 22 },
  { month: "May", revenue: 14200, tournaments: 25 },
  { month: "Jun", revenue: 16800, tournaments: 30 },
];

const gameDistributionData = [
  { name: "Chess", value: 35, color: "#3B82F6" },
  { name: "Checkers", value: 25, color: "#10B981" },
  { name: "Tic-Tac-Toe", value: 20, color: "#F59E0B" },
  { name: "Connect 4", value: 20, color: "#EF4444" },
];

const dailyActivityData = [
  { hour: "00:00", users: 45, games: 12 },
  { hour: "04:00", users: 32, games: 8 },
  { hour: "08:00", users: 78, games: 25 },
  { hour: "12:00", users: 156, games: 45 },
  { hour: "16:00", users: 189, games: 52 },
  { hour: "20:00", users: 234, games: 68 },
  { hour: "24:00", users: 67, games: 18 },
];

const realTimeStats = {
  activeUsers: 892,
  activeGames: 156,
  activeTournaments: 5,
  totalRevenue: 15420,
  systemUptime: 99.9,
  avgResponseTime: 245,
};

const timeRanges = [
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real implementation, this would fetch live data
      console.log("Updating real-time stats...");
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      name: "Active Users",
      value: realTimeStats.activeUsers.toLocaleString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: UsersIcon,
      color: "blue" as const,
    },
    {
      name: "Active Games",
      value: realTimeStats.activeGames.toString(),
      change: "+8%",
      changeType: "increase" as const,
      icon: ChartBarIcon,
      color: "green" as const,
    },
    {
      name: "Active Tournaments",
      value: realTimeStats.activeTournaments.toString(),
      change: "+2",
      changeType: "increase" as const,
      icon: TrophyIcon,
      color: "purple" as const,
    },
    {
      name: "Total Revenue",
      value: `$${realTimeStats.totalRevenue.toLocaleString()}`,
      change: "+23%",
      changeType: "increase" as const,
      icon: CreditCardIcon,
      color: "green" as const,
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform analytics and insights
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
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Total Users"
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                stroke="#10B981"
                strokeWidth={2}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenue & Tournaments
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Revenue ($)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="tournaments"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="Tournaments"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Game Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Game Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gameDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gameDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#3B82F6" name="Active Users" />
              <Bar dataKey="games" fill="#10B981" name="Active Games" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {realTimeStats.systemUptime}%
            </p>
            <p className="text-sm text-gray-500">System Uptime</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              {realTimeStats.avgResponseTime}ms
            </p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              ${realTimeStats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}
