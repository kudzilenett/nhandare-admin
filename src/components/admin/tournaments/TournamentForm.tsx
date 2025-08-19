"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminTournament } from "@/types/admin";
import { CreateTournamentData } from "@/services/TournamentService";

const tournamentSchema = z
  .object({
    title: z
      .string()
      .min(3, "Tournament title must be at least 3 characters")
      .max(100, "Tournament title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters"),
    gameType: z.enum(["chess", "checkers", "connect4", "tictactoe"], {
      message: "Please select a game type",
    }),
    maxPlayers: z
      .number()
      .min(4, "Minimum 4 participants required")
      .max(256, "Maximum 256 participants allowed"),
    entryFee: z.number().min(0, "Entry fee cannot be negative"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    prizeBreakdown: z.object({
      // Changed from 'prizeDistribution' to match database schema
      first: z
        .number()
        .min(0, "First place prize cannot be negative")
        .max(100, "Prize percentage cannot exceed 100"),
      second: z
        .number()
        .min(0, "Second place prize cannot be negative")
        .max(100, "Prize percentage cannot exceed 100"),
      third: z
        .number()
        .min(0, "Third place prize cannot be negative")
        .max(100, "Prize percentage cannot exceed 100"),
    }),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      const total =
        data.prizeBreakdown.first +
        data.prizeBreakdown.second +
        data.prizeBreakdown.third;
      return total <= 100;
    },
    {
      message: "Total prize breakdown cannot exceed 100%",
      path: ["prizeBreakdown"],
    }
  );

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface TournamentFormProps {
  tournament?: AdminTournament;
  onSubmit: (data: CreateTournamentData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const gameTypeOptions = [
  { value: "chess", label: "Chess" },
  { value: "checkers", label: "Checkers" },
  { value: "connect4", label: "Connect 4" },
  { value: "tictactoe", label: "Tic Tac Toe" },
];

const participantOptions = [
  { value: 4, label: "4 participants" },
  { value: 8, label: "8 participants" },
  { value: 16, label: "16 participants" },
  { value: 32, label: "32 participants" },
  { value: 64, label: "64 participants" },
  { value: 128, label: "128 participants" },
  { value: 256, label: "256 participants" },
];

export default function TournamentForm({
  tournament,
  onSubmit,
  onCancel,
  isLoading = false,
}: TournamentFormProps) {
  const isEditing = !!tournament;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: tournament
      ? {
          title: tournament.title,
          description: tournament.description,
          gameType: tournament.gameType || "chess",
          maxPlayers: tournament.maxPlayers,
          entryFee: tournament.entryFee,
          startDate: new Date(tournament.startDate).toISOString().split("T")[0],
          endDate: new Date(tournament.endDate).toISOString().split("T")[0],
          prizeBreakdown: tournament.prizeBreakdown || {
            first: 50, // Default values when no breakdown exists
            second: 30,
            third: 20,
          },
        }
      : {
          gameType: "chess",
          maxPlayers: 16,
          entryFee: 0,
          prizeBreakdown: {
            first: 50,
            second: 30,
            third: 20,
          },
        },
  });

  const entryFee = watch("entryFee");
  const prizeBreakdown = watch("prizeBreakdown");

  // Calculate prize pool
  const calculatePrizePool = () => {
    const maxPlayers = watch("maxPlayers");
    return maxPlayers * entryFee;
  };

  // Calculate actual prize amounts
  const calculatePrizeAmounts = () => {
    const prizePool = calculatePrizePool();
    return {
      first: Math.round(((prizePool * prizeBreakdown.first) / 100) * 100) / 100,
      second:
        Math.round(((prizePool * prizeBreakdown.second) / 100) * 100) / 100,
      third: Math.round(((prizePool * prizeBreakdown.third) / 100) * 100) / 100,
    };
  };

  const onFormSubmit = async (data: TournamentFormData) => {
    await onSubmit(data);
  };

  const prizeAmounts = calculatePrizeAmounts();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Tournament" : "Create New Tournament"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Update tournament details and settings"
              : "Set up a new tournament for players to join"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Tournament Title *
              </label>
              <input
                {...register("title")}
                type="text"
                id="title"
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
                placeholder="Enter tournament title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={4}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
                placeholder="Enter tournament description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="gameType"
                className="block text-sm font-medium text-gray-700"
              >
                Game Type *
              </label>
              <select
                {...register("gameType")}
                id="gameType"
                className={`mt-1 block w-full rounded-md border ${
                  errors.gameType ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
              >
                {gameTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gameType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.gameType.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="maxPlayers"
                className="block text-sm font-medium text-gray-700"
              >
                Max Players *
              </label>
              <select
                {...register("maxPlayers", { valueAsNumber: true })}
                id="maxPlayers"
                className={`mt-1 block w-full rounded-md border ${
                  errors.maxPlayers ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
              >
                {participantOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.maxPlayers && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxPlayers.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date *
              </label>
              <input
                {...register("startDate")}
                type="date"
                id="startDate"
                className={`mt-1 block w-full rounded-md border ${
                  errors.startDate ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date *
              </label>
              <input
                {...register("endDate")}
                type="date"
                id="endDate"
                className={`mt-1 block w-full rounded-md border ${
                  errors.endDate ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Financial Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Financial Settings
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="entryFee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Entry Fee ($)
                </label>
                <input
                  {...register("entryFee", { valueAsNumber: true })}
                  type="number"
                  id="entryFee"
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.entryFee ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm`}
                  placeholder="0.00"
                />
                {errors.entryFee && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.entryFee.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Prize Pool
                </label>
                <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                  ${calculatePrizePool().toFixed(2)}
                </div>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Prize Distribution (%)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="firstPlace"
                    className="block text-xs font-medium text-gray-600"
                  >
                    1st Place (${prizeAmounts.first.toFixed(2)})
                  </label>
                  <input
                    {...register("prizeBreakdown.first", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    id="firstPlace"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="secondPlace"
                    className="block text-xs font-medium text-gray-600"
                  >
                    2nd Place (${prizeAmounts.second.toFixed(2)})
                  </label>
                  <input
                    {...register("prizeBreakdown.second", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    id="secondPlace"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="thirdPlace"
                    className="block text-xs font-medium text-gray-600"
                  >
                    3rd Place (${prizeAmounts.third.toFixed(2)})
                  </label>
                  <input
                    {...register("prizeBreakdown.third", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    id="thirdPlace"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-admin-accent focus:outline-none focus:ring-admin-accent sm:text-sm"
                  />
                </div>
              </div>
              {errors.prizeBreakdown && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.prizeBreakdown.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-admin-accent border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : isEditing ? (
                "Update Tournament"
              ) : (
                "Create Tournament"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
