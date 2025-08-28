"use client";

import React, { useState, useEffect } from "react";
import {
  ChatBubbleLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

// Types
interface FlaggedMessage {
  id: number;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  reason: string;
  status: string;
  severity: string;
}

interface BannedUser {
  id: string;
  username: string;
  email: string;
  banReason: string;
  banDate: string;
  banExpiry: string;
  status: string;
}

interface ModerationStats {
  totalFlagged: number;
  pendingReview: number;
  reviewedToday: number;
  bannedUsers: number;
  suspendedUsers: number;
  autoFiltered: number;
}

// Mock data - replace with real API calls
const flaggedMessages: FlaggedMessage[] = [
  {
    id: 1,
    userId: "user123",
    username: "john_doe",
    message: "This is an inappropriate message that needs moderation",
    timestamp: "2024-01-15T10:30:00Z",
    reason: "inappropriate_content",
    status: "pending",
    severity: "medium",
  },
  {
    id: 2,
    userId: "user456",
    username: "jane_smith",
    message: "Another flagged message for review",
    timestamp: "2024-01-15T09:15:00Z",
    reason: "spam",
    status: "pending",
    severity: "low",
  },
  {
    id: 3,
    userId: "user789",
    username: "bob_wilson",
    message: "This message contains offensive language",
    timestamp: "2024-01-15T08:45:00Z",
    reason: "offensive_language",
    status: "reviewed",
    severity: "high",
  },
];

const bannedUsers = [
  {
    id: "user123",
    username: "john_doe",
    email: "john@example.com",
    banReason: "Repeated violations",
    banDate: "2024-01-10T14:30:00Z",
    banExpiry: "2024-02-10T14:30:00Z",
    status: "banned",
  },
  {
    id: "user456",
    username: "jane_smith",
    email: "jane@example.com",
    banReason: "Inappropriate content",
    banDate: "2024-01-12T16:20:00Z",
    banExpiry: "2024-01-19T16:20:00Z",
    status: "suspended",
  },
];

const moderationStats = {
  totalFlagged: 45,
  pendingReview: 12,
  reviewedToday: 8,
  bannedUsers: 3,
  suspendedUsers: 5,
  autoFiltered: 156,
};

const severityColors = {
  low: "bg-yellow-100 text-yellow-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-green-100 text-green-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ModerationPage() {
  const [selectedTab, setSelectedTab] = useState("flagged");
  const [selectedMessage, setSelectedMessage] = useState<FlaggedMessage | null>(
    null
  );
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [autoFilterEnabled, setAutoFilterEnabled] = useState(true);

  // Real data state
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [moderationStats, setModerationStats] = useState<ModerationStats>({
    totalFlagged: 0,
    pendingReview: 0,
    reviewedToday: 0,
    bannedUsers: 0,
    suspendedUsers: 0,
    autoFiltered: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchModerationData = async () => {
      setIsLoading(true);
      try {
        // Fetch flagged content
        const flaggedResponse = await fetch("/api/moderation/flagged");
        if (flaggedResponse.ok) {
          const flaggedData = await flaggedResponse.json();
          setFlaggedMessages(flaggedData.data.flaggedContent);
        }

        // Fetch banned users
        const bannedResponse = await fetch("/api/moderation/banned");
        if (bannedResponse.ok) {
          const bannedData = await bannedResponse.json();
          setBannedUsers(bannedData.data.bannedUsers);
        }

        // Fetch moderation stats
        const statsResponse = await fetch("/api/moderation/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setModerationStats(statsData.data);
        }
      } catch (error) {
        console.error("Failed to fetch moderation data:", error);
        // Fallback to mock data
        setFlaggedMessages([
          {
            id: 1,
            userId: "user123",
            username: "john_doe",
            message: "This is an inappropriate message that needs moderation",
            timestamp: "2024-01-15T10:30:00Z",
            reason: "inappropriate_content",
            status: "pending",
            severity: "medium",
          },
        ]);
        setBannedUsers([
          {
            id: "user123",
            username: "john_doe",
            email: "john@example.com",
            banReason: "Repeated violations",
            banDate: "2024-01-10T14:30:00Z",
            banExpiry: "2024-02-10T14:30:00Z",
            status: "banned",
          },
        ]);
        setModerationStats({
          totalFlagged: 45,
          pendingReview: 12,
          reviewedToday: 8,
          bannedUsers: 3,
          suspendedUsers: 5,
          autoFiltered: 156,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModerationData();
  }, []);

  const tabs = [
    { id: "flagged", name: "Flagged Messages", icon: FlagIcon },
    { id: "users", name: "User Management", icon: UserIcon },
    { id: "settings", name: "Moderation Settings", icon: ShieldCheckIcon },
  ];

  const handleMessageAction = (messageId: number, action: string) => {
    // In real implementation, this would call the API
    console.log(`Action ${action} on message ${messageId}`);

    // Update local state
    const updatedMessages = flaggedMessages.map((msg) =>
      msg.id === messageId
        ? { ...msg, status: action === "approve" ? "approved" : "rejected" }
        : msg
    );

    setShowMessageModal(false);
  };

  const handleUserAction = (
    userId: string,
    action: string,
    duration?: number
  ) => {
    // In real implementation, this would call the API
    console.log(`Action ${action} on user ${userId} for ${duration} days`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Content Moderation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage flagged content and user behavior
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FlagIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Flagged
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.totalFlagged}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Review
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.pendingReview}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reviewed Today
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.reviewedToday}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Banned Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.bannedUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Suspended
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.suspendedUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Auto Filtered
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {moderationStats.autoFiltered}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Flagged Messages Tab */}
          {selectedTab === "flagged" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Flagged Messages
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoFilterEnabled}
                      onChange={(e) => setAutoFilterEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Auto-filter enabled
                    </span>
                  </label>
                </div>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flaggedMessages.map((message) => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {message.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {message.userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {message.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {message.reason.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              severityColors[
                                message.severity as keyof typeof severityColors
                              ]
                            }`}
                          >
                            {message.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusColors[
                                message.status as keyof typeof statusColors
                              ]
                            }`}
                          >
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getTimeAgo(message.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowMessageModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {message.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleMessageAction(message.id, "approve")
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleMessageAction(message.id, "reject")
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {selectedTab === "users" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                User Management
              </h3>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ban Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ban Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bannedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "banned"
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.banReason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.banDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.banExpiry)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUserAction(user.id, "unban")}
                              className="text-green-600 hover:text-green-900"
                            >
                              Unban
                            </button>
                            <button
                              onClick={() =>
                                handleUserAction(user.id, "extend", 7)
                              }
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Extend
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Moderation Settings Tab */}
          {selectedTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Moderation Settings
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Automated Filtering
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Enable auto-filtering
                      </span>
                      <input
                        type="checkbox"
                        checked={autoFilterEnabled}
                        onChange={(e) => setAutoFilterEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Filter offensive language
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Filter spam</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Ban Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Default ban duration (days)
                      </label>
                      <input
                        type="number"
                        defaultValue={7}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Warning threshold
                      </label>
                      <input
                        type="number"
                        defaultValue={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Message Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    User
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMessage.username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedMessage.message}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedMessage.reason.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Severity
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      severityColors[
                        selectedMessage.severity as keyof typeof severityColors
                      ]
                    }`}
                  >
                    {selectedMessage.severity}
                  </span>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() =>
                      handleMessageAction(selectedMessage.id, "approve")
                    }
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleMessageAction(selectedMessage.id, "reject")
                    }
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
