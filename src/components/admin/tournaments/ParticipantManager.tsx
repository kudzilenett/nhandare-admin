"use client";

import React, { useState, useMemo } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { TournamentParticipant } from "@/services/TournamentService";

// Mock participant data
const mockParticipants: TournamentParticipant[] = [
  {
    id: "1",
    userId: "user1",
    username: "ChessMaster92",
    email: "chess.master@email.com",
    seed: 1,
    registrationDate: "2024-01-12T10:30:00Z",
    status: "confirmed",
  },
  {
    id: "2",
    userId: "user2",
    username: "QueenGambit",
    email: "queen.gambit@email.com",
    seed: 2,
    registrationDate: "2024-01-12T11:15:00Z",
    status: "confirmed",
  },
  {
    id: "3",
    userId: "user3",
    username: "RookiePlayer",
    email: "rookie.player@email.com",
    seed: 3,
    registrationDate: "2024-01-12T14:20:00Z",
    status: "registered",
  },
  {
    id: "4",
    userId: "user4",
    username: "KnightRider",
    email: "knight.rider@email.com",
    seed: 4,
    registrationDate: "2024-01-13T09:45:00Z",
    status: "confirmed",
  },
  {
    id: "5",
    userId: "user5",
    username: "BishopMoves",
    email: "bishop.moves@email.com",
    seed: 5,
    registrationDate: "2024-01-13T16:30:00Z",
    status: "withdrawn",
  },
];

interface ParticipantManagerProps {
  tournamentId: string;
  tournamentName: string;
  maxParticipants: number;
  onClose: () => void;
}

const statusColors = {
  registered: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  withdrawn: "bg-red-100 text-red-800",
};

export default function ParticipantManager({
  tournamentId,
  tournamentName,
  maxParticipants,
  onClose,
}: ParticipantManagerProps) {
  const [participants, setParticipants] =
    useState<TournamentParticipant[]>(mockParticipants);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (participant) =>
          participant.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          participant.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (participant) => participant.status === statusFilter
      );
    }

    // Sort by seed
    filtered.sort((a, b) => a.seed - b.seed);

    return filtered;
  }, [participants, searchQuery, statusFilter]);

  const handleAddParticipant = async () => {
    if (!newParticipantEmail.trim()) return;

    setIsLoading(true);
    try {
      // Here you would call the tournament service
      // const newParticipant = await tournamentService.addParticipant(tournamentId, newParticipantEmail);

      // Mock implementation
      const newParticipant: TournamentParticipant = {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        username: newParticipantEmail.split("@")[0],
        email: newParticipantEmail,
        seed: participants.length + 1,
        registrationDate: new Date().toISOString(),
        status: "registered",
      };

      setParticipants([...participants, newParticipant]);
      setNewParticipantEmail("");
      setShowAddParticipant(false);

      console.log("Added participant:", newParticipant);
    } catch (error) {
      console.error("Error adding participant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (window.confirm("Are you sure you want to remove this participant?")) {
      try {
        // await tournamentService.removeParticipant(tournamentId, participantId);
        setParticipants(participants.filter((p) => p.id !== participantId));
        console.log("Removed participant:", participantId);
      } catch (error) {
        console.error("Error removing participant:", error);
      }
    }
  };

  const handleUpdateSeed = async (participantId: string, newSeed: number) => {
    try {
      // await tournamentService.updateParticipantSeed(tournamentId, participantId, newSeed);
      setParticipants(
        participants.map((p) =>
          p.id === participantId ? { ...p, seed: newSeed } : p
        )
      );
      console.log(
        "Updated seed for participant:",
        participantId,
        "to",
        newSeed
      );
    } catch (error) {
      console.error("Error updating seed:", error);
    }
  };

  const handleMoveSeed = (participantId: string, direction: "up" | "down") => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return;

    const newSeed =
      direction === "up" ? participant.seed - 1 : participant.seed + 1;

    // Check bounds
    if (newSeed < 1 || newSeed > participants.length) return;

    // Find participant with the target seed and swap
    const otherParticipant = participants.find((p) => p.seed === newSeed);
    if (otherParticipant) {
      setParticipants(
        participants.map((p) => {
          if (p.id === participantId) return { ...p, seed: newSeed };
          if (p.id === otherParticipant.id)
            return { ...p, seed: participant.seed };
          return p;
        })
      );
    }
  };

  const handleGenerateSeeds = () => {
    if (
      window.confirm(
        "This will randomly reassign all participant seeds. Continue?"
      )
    ) {
      const shuffled = [...participants];

      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Assign new seeds
      const reseeded = shuffled.map((participant, index) => ({
        ...participant,
        seed: index + 1,
      }));

      setParticipants(reseeded);
    }
  };

  const activeParticipants = participants.filter(
    (p) => p.status !== "withdrawn"
  );

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Participants
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tournamentName} • {activeParticipants.length}/{maxParticipants}
              participants
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="confirmed">Confirmed</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddParticipant(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-admin-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent"
                disabled={activeParticipants.length >= maxParticipants}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </button>
              <button
                onClick={handleGenerateSeeds}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                Random Seeds
              </button>
            </div>
          </div>

          {/* Add Participant Form */}
          {showAddParticipant && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter participant email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent focus:border-admin-accent"
                />
                <button
                  onClick={handleAddParticipant}
                  disabled={isLoading || !newParticipantEmail.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-admin-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent disabled:opacity-50"
                >
                  {isLoading ? "Adding..." : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowAddParticipant(false);
                    setNewParticipantEmail("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-auto">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No participants found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Add participants to get started."}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{participant.seed}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveSeed(participant.id, "up")}
                            disabled={participant.seed === 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowUpIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              handleMoveSeed(participant.id, "down")
                            }
                            disabled={participant.seed === participants.length}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowDownIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[participant.status]
                        }`}
                      >
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        participant.registrationDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove Participant"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {activeParticipants.length} of {maxParticipants} slots filled
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
