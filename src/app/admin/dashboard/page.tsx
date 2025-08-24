"use client";

import React from "react";
import {
  UsersIcon,
  TrophyIcon,
  CreditCardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Mock data - replace with real API calls
const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  activeTournaments: 5,
  totalRevenue: 15420,
};

const stats = [
  {
    name: "Total Users",
    value: mockStats.totalUsers.toLocaleString(),
    change: "+12%",
    changeType: "increase" as const,
    icon: UsersIcon,
    color: "blue" as const,
  },
  {
    name: "Active Users",
    value: mockStats.activeUsers.toLocaleString(),
    change: "+8%",
    changeType: "increase" as const,
    icon: UsersIcon,
    color: "green" as const,
  },
  {
    name: "Active Tournaments",
    value: mockStats.activeTournaments.toString(),
    change: "+2",
    changeType: "increase" as const,
    icon: TrophyIcon,
    color: "purple" as const,
  },
  {
    name: "Total Revenue",
    value: `$${mockStats.totalRevenue.toLocaleString()}`,
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-700">
          Overview of your Nhandare gaming platform
        </p>
      </div>

      {/* Stats grid */}
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
              <p className="ml-16 truncate text-sm font-medium text-gray-700">
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

      {/* Recent activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  {
                    id: 1,
                    type: "tournament",
                    content: 'New tournament "Chess Masters 2024" created',
                    time: "2 hours ago",
                  },
                  {
                    id: 2,
                    type: "user",
                    content: "User john_doe registered",
                    time: "4 hours ago",
                  },
                  {
                    id: 3,
                    type: "payment",
                    content: "Payment of $50 processed for tournament entry",
                    time: "6 hours ago",
                  },
                  {
                    id: 4,
                    type: "game",
                    content: "Chess game completed between player1 and player2",
                    time: "8 hours ago",
                  },
                ].map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== 3 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <ChartBarIcon className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-700">
                              {activity.content}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-700">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
