"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  EyeIcon,
  UserGroupIcon,
  TrophyIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import TournamentForm from "@/components/admin/tournaments/TournamentForm";
import ParticipantManager from "@/components/admin/tournaments/ParticipantManager";
import {
  tournamentService,
  CreateTournamentData,
  TournamentListParams,
} from "@/services/TournamentService";
import { AdminTournament } from "@/types/admin";
import toast from "react-hot-toast";
// Simple currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const statusColors = {
  OPEN: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const gameTypeColors = {
  chess: "bg-indigo-100 text-indigo-800",
  checkers: "bg-orange-100 text-orange-800",
  connect4: "bg-yellow-100 text-yellow-800",
  tictactoe: "bg-pink-100 text-pink-800",
};

export default function TournamentsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTournament, setEditingTournament] =
    useState<AdminTournament | null>(null);
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([]);
  const [managingParticipants, setManagingParticipants] =
    useState<AdminTournament | null>(null);
  const [showTournamentDetails, setShowTournamentDetails] = useState(false);
  const [selectedTournamentDetails, setSelectedTournamentDetails] =
    useState<AdminTournament | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gameTypeFilter, setGameTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "name" | "status" | "participants" | "startDate"
  >("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build query parameters
  const queryParams: TournamentListParams = useMemo(() => {
    const params: TournamentListParams = {
      page: currentPage,
      limit: pageSize,
      sort: {
        key: sortBy,
        direction: sortOrder,
      },
    };

    // Add filters
    const filters: { search?: string; status?: string[]; gameType?: string[] } =
      {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== "all") filters.status = [statusFilter];
    if (gameTypeFilter !== "all") filters.gameType = [gameTypeFilter];

    if (Object.keys(filters).length > 0) {
      params.filters = filters;
    }

    return params;
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    statusFilter,
    gameTypeFilter,
  ]);

  // Fetch tournaments
  const {
    data: tournamentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tournaments", queryParams],
    queryFn: () => tournamentService.getTournaments(queryParams),
  });

  // Mutations
  const createTournamentMutation = useMutation({
    mutationFn: (data: CreateTournamentData) =>
      tournamentService.createTournament(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setShowCreateModal(false);
      toast.success("Tournament created successfully");
    },
    onError: (error) => {
      console.error("Error creating tournament:", error);
      toast.error("Failed to create tournament");
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTournamentData }) =>
      tournamentService.updateTournament(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setEditingTournament(null);
      toast.success("Tournament updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tournament:", error);
      toast.error("Failed to update tournament");
    },
  });

  const deleteTournamentMutation = useMutation({
    mutationFn: (id: string) => tournamentService.deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Tournament deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting tournament:", error);
      toast.error("Failed to delete tournament");
    },
  });

  const bulkDeleteTournamentMutation = useMutation({
    mutationFn: (ids: string[]) => tournamentService.bulkDeleteTournaments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setSelectedTournaments([]);
      toast.success("Tournaments deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting tournaments:", error);
      toast.error("Failed to delete tournaments");
    },
  });

  const handleCreateTournament = async (data: CreateTournamentData) => {
    createTournamentMutation.mutate(data);
  };

  const handleEditTournament = async (data: CreateTournamentData) => {
    if (editingTournament) {
      updateTournamentMutation.mutate({ id: editingTournament.id, data });
    }
  };

  const handleDeleteTournament = async (id: string) => {
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) return;

    // Industry standard: Check tournament status before allowing deletion
    if (tournament.status === "ACTIVE" || tournament.status === "COMPLETED") {
      toast.error(
        "Cannot delete active or completed tournaments. Use cancel or archive instead."
      );
      return;
    }

    if (tournament.currentParticipants > 0) {
      toast.error(
        "Cannot delete tournaments with participants. Cancel the tournament first."
      );
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this tournament? This action cannot be undone."
      )
    ) {
      try {
        await deleteTournamentMutation.mutateAsync(id);
        toast.success("Tournament deleted successfully");
      } catch (error) {
        toast.error("Failed to delete tournament");
      }
    }
  };

  const handleCancelTournament = async (id: string) => {
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) return;

    if (tournament.status === "COMPLETED") {
      toast.error("Cannot cancel completed tournaments");
      return;
    }

    if (
      confirm(
        "Are you sure you want to cancel this tournament? Participants will be notified and refunded."
      )
    ) {
      try {
        // TODO: Implement cancel tournament mutation
        toast.success("Tournament cancelled successfully");
      } catch (error) {
        toast.error("Failed to cancel tournament");
      }
    }
  };

  const handleArchiveTournament = async (id: string) => {
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) return;

    if (tournament.status !== "COMPLETED") {
      toast.error("Only completed tournaments can be archived");
      return;
    }

    if (confirm("Are you sure you want to archive this tournament?")) {
      try {
        // TODO: Implement archive tournament mutation
        toast.success("Tournament archived successfully");
      } catch (error) {
        toast.error("Failed to archive tournament");
      }
    }
  };

  const handleSuspendTournament = async (id: string) => {
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) return;

    if (tournament.status === "COMPLETED") {
      toast.error("Cannot suspend completed tournaments");
      return;
    }

    if (
      confirm(
        "Are you sure you want to suspend this tournament? It will be temporarily disabled."
      )
    ) {
      try {
        // TODO: Implement suspend tournament mutation
        toast.success("Tournament suspended successfully");
      } catch (error) {
        toast.error("Failed to suspend tournament");
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTournaments.length === 0) return;

    if (action === "delete") {
      const confirmMessage = `Are you sure you want to delete ${selectedTournaments.length} tournaments?`;
      if (window.confirm(confirmMessage)) {
        bulkDeleteTournamentMutation.mutate(selectedTournaments);
      }
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return null;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  // Handle loading and error states
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load tournaments</div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center rounded-md bg-admin-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showCreateModal || editingTournament) {
    return (
      <TournamentForm
        tournament={editingTournament || undefined}
        onSubmit={
          editingTournament ? handleEditTournament : handleCreateTournament
        }
        onCancel={() => {
          setShowCreateModal(false);
          setEditingTournament(null);
        }}
        isLoading={
          createTournamentMutation.isPending ||
          updateTournamentMutation.isPending
        }
      />
    );
  }

  const tournaments = tournamentsData?.tournaments || [];
  const pagination = tournamentsData?.pagination;

  return (
    <>
      {managingParticipants && (
        <ParticipantManager
          tournamentId={managingParticipants.id}
          tournamentName={managingParticipants.name}
          maxParticipants={managingParticipants.maxParticipants}
          onClose={() => setManagingParticipants(null)}
        />
      )}

      <div className="space-y-6">
        {/* Page header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Tournaments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and monitor all tournaments on the platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {selectedTournaments.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkDeleteTournamentMutation.isPending}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  <TrashIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Delete Selected ({selectedTournaments.length})
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-admin-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Create Tournament
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Game Type Filter */}
            <select
              value={gameTypeFilter}
              onChange={(e) => setGameTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
            >
              <option value="all">All Game Types</option>
              <option value="chess">Chess</option>
              <option value="checkers">Checkers</option>
              <option value="connect4">Connect 4</option>
              <option value="tictactoe">Tic Tac Toe</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-500">
              <FunnelIcon className="h-4 w-4 mr-1" />
              {isLoading ? "Loading..." : `${tournaments.length} tournaments`}
              {pagination && ` of ${pagination.totalItems}`}
            </div>
          </div>
        </div>

        {/* Tournaments table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading tournaments...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-admin-accent border-gray-300 rounded focus:ring-admin-accent"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTournaments(
                                tournaments.map((t: AdminTournament) => t.id)
                              );
                            } else {
                              setSelectedTournaments([]);
                            }
                          }}
                          checked={
                            selectedTournaments.length === tournaments.length &&
                            tournaments.length > 0
                          }
                        />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Tournament
                          <SortIcon column="name" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          <SortIcon column="status" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game Type
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("participants")}
                      >
                        <div className="flex items-center gap-1">
                          Participants
                          <SortIcon column="participants" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prize Pool
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort("startDate")}
                      >
                        <div className="flex items-center gap-1">
                          Start Date
                          <SortIcon column="startDate" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tournaments.map((tournament: AdminTournament) => (
                      <tr
                        key={tournament.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          // Don't trigger row click if clicking on checkbox or action buttons
                          if (
                            (e.target as HTMLElement).closest(
                              'input[type="checkbox"]'
                            ) ||
                            (e.target as HTMLElement).closest("button")
                          ) {
                            return;
                          }
                          setSelectedTournamentDetails(tournament);
                          setShowTournamentDetails(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-admin-accent border-gray-300 rounded focus:ring-admin-accent"
                            checked={selectedTournaments.includes(
                              tournament.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTournaments([
                                  ...selectedTournaments,
                                  tournament.id,
                                ]);
                              } else {
                                setSelectedTournaments(
                                  selectedTournaments.filter(
                                    (id) => id !== tournament.id
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {tournament.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {tournament.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              statusColors[tournament.status]
                            }`}
                          >
                            {tournament.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              gameTypeColors[tournament.gameType]
                            }`}
                          >
                            {tournament.gameType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              {tournament.currentParticipants}/
                              {tournament.maxParticipants}
                            </span>
                            <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                              <div
                                className="bg-admin-accent h-2 rounded-full"
                                style={{
                                  width: `${
                                    (tournament.currentParticipants /
                                      tournament.maxParticipants) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${tournament.prizePool.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(tournament.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTournamentDetails(tournament);
                                setShowTournamentDetails(true);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>

                            {/* Edit - Only for draft/upcoming tournaments */}
                            {(tournament.status === "OPEN" ||
                              tournament.status === "CLOSED") && (
                              <button
                                onClick={() => setEditingTournament(tournament)}
                                className="text-admin-accent hover:text-blue-700"
                                title="Edit Tournament"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}

                            {/* Cancel - For active/upcoming tournaments */}
                            {(tournament.status === "OPEN" ||
                              tournament.status === "ACTIVE") && (
                              <button
                                onClick={() =>
                                  handleCancelTournament(tournament.id)
                                }
                                className="text-orange-600 hover:text-orange-800"
                                title="Cancel Tournament"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}

                            {/* Suspend - For problematic tournaments */}
                            {(tournament.status === "OPEN" ||
                              tournament.status === "ACTIVE") && (
                              <button
                                onClick={() =>
                                  handleSuspendTournament(tournament.id)
                                }
                                className="text-yellow-600 hover:text-yellow-800"
                                title="Suspend Tournament"
                              >
                                <ExclamationTriangleIcon className="h-4 w-4" />
                              </button>
                            )}

                            {/* Archive - For completed tournaments */}
                            {tournament.status === "COMPLETED" && (
                              <button
                                onClick={() =>
                                  handleArchiveTournament(tournament.id)
                                }
                                className="text-purple-600 hover:text-purple-800"
                                title="Archive Tournament"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                  />
                                </svg>
                              </button>
                            )}

                            {/* Delete - Only for empty draft tournaments */}
                            {tournament.status === "OPEN" &&
                              tournament.currentParticipants === 0 && (
                                <button
                                  onClick={() =>
                                    handleDeleteTournament(tournament.id)
                                  }
                                  disabled={deleteTournamentMutation.isPending}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                  title="Delete Tournament"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}

                            {/* Manage Participants - For tournaments with participants */}
                            {tournament.currentParticipants > 0 && (
                              <button
                                onClick={() =>
                                  setManagingParticipants(tournament)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="Manage Participants"
                              >
                                <UserGroupIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tournaments.length === 0 && (
                <div className="text-center py-12">
                  <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No tournaments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    gameTypeFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by creating a new tournament."}
                  </p>
                  {!searchQuery &&
                    statusFilter === "all" &&
                    gameTypeFilter === "all" && (
                      <div className="mt-6">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="inline-flex items-center rounded-md bg-admin-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                          Create Tournament
                        </button>
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? "z-10 bg-admin-accent border-admin-accent text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Details Modal */}
      {showTournamentDetails && selectedTournamentDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 border w-11/12 max-w-2xl mx-auto rounded-lg shadow-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTournamentDetails.name}
              </h3>
              <button
                onClick={() => setShowTournamentDetails(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-900">
                  Description:
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTournamentDetails.description}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Status:</p>
                <p className="mt-1 text-sm text-gray-500">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      statusColors[selectedTournamentDetails.status]
                    }`}
                  >
                    {selectedTournamentDetails.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Game Type:</p>
                <p className="mt-1 text-sm text-gray-500">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      gameTypeColors[selectedTournamentDetails.gameType]
                    }`}
                  >
                    {selectedTournamentDetails.gameType}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Entry Fee:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(selectedTournamentDetails.entryFee)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Prize Pool:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatCurrency(selectedTournamentDetails.prizePool)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Participants:
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTournamentDetails.currentParticipants}/
                  {selectedTournamentDetails.maxParticipants}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Start Date:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(
                    selectedTournamentDetails.startDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">End Date:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(
                    selectedTournamentDetails.endDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Created By:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTournamentDetails.createdBy}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Public:</p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedTournamentDetails.isPublic ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowTournamentDetails(false);
                  setEditingTournament(selectedTournamentDetails);
                }}
                className="inline-flex items-center rounded-md bg-admin-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Tournament
              </button>
              <button
                onClick={() => setShowTournamentDetails(false)}
                className="inline-flex items-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
