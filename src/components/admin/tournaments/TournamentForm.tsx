"use client";

import React, { useState } from "react";
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
    bracketType: z.enum(
      ["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "ROUND_ROBIN", "SWISS"],
      {
        message: "Please select a bracket type",
      }
    ),
    useAdvancedSeeding: z.boolean(),
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
      return total === 100;
    },
    {
      message: "Prize breakdown must equal 100%",
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

const bracketTypeOptions = [
  {
    value: "SINGLE_ELIMINATION",
    label: "Single Elimination",
    description: "Players are eliminated after one loss - Simple & fast",
  },
  {
    value: "DOUBLE_ELIMINATION",
    label: "Double Elimination",
    description:
      "Players must lose twice to be eliminated - Fairer competition",
  },
  {
    value: "ROUND_ROBIN",
    label: "Round Robin",
    description: "Every player faces every other player - Most comprehensive",
  },
  {
    value: "SWISS",
    label: "Swiss System",
    description:
      "Players face opponents with similar records - Balanced matches",
  },
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
  const [showAdvancedSeeding, setShowAdvancedSeeding] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          bracketType: tournament.bracketType || "SINGLE_ELIMINATION",
          useAdvancedSeeding:
            tournament.bracketConfig?.useAdvancedSeeding ?? false,
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
          bracketType: "SINGLE_ELIMINATION",
          useAdvancedSeeding: false,
          prizeBreakdown: {
            first: 50,
            second: 30,
            third: 20,
          },
        },
  });

  const entryFee = watch("entryFee");
  const prizeBreakdown = watch("prizeBreakdown");
  const bracketType = watch("bracketType");
  const useAdvancedSeeding = watch("useAdvancedSeeding");

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
    // Transform the form data to match CreateTournamentData interface
    const transformedData: CreateTournamentData = {
      title: data.title,
      description: data.description,
      gameType: data.gameType,
      maxPlayers: data.maxPlayers,
      entryFee: data.entryFee,
      startDate: data.startDate,
      endDate: data.endDate,
      prizeBreakdown: data.prizeBreakdown,
      bracketType: data.bracketType,
      // Add bracket configuration with advanced seeding
      bracketConfig: {
        useAdvancedSeeding: data.useAdvancedSeeding,
        seedingOptions: {
          includePerformance: true,
          includeHistory: true,
          includeRegional: false,
          includeConsistency: true,
          performanceWeight: 0.4,
          historyWeight: 0.3,
          regionalWeight: 0.1,
          consistencyWeight: 0.2,
          ratingWeight: 0.5,
          recentTournaments: 10,
          regionalRadius: 100,
        },
      },
    };
    await onSubmit(transformedData);
  };

  const prizeAmounts = calculatePrizeAmounts();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit Tournament" : "Create New Tournament"}
          </h2>
          <p className="mt-1 text-sm text-gray-700">
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
                className="block text-sm font-medium text-gray-800"
              >
                Tournament Title *
              </label>
              <input
                {...register("title")}
                type="text"
                id="title"
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
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
                className="block text-sm font-medium text-gray-800"
              >
                Description *
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={4}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
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
                className="block text-sm font-medium text-gray-800"
              >
                Game Type *
              </label>
              <select
                {...register("gameType")}
                id="gameType"
                className={`mt-1 block w-full rounded-md border ${
                  errors.gameType ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900`}
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
                className="block text-sm font-medium text-gray-800"
              >
                Max Participants *
              </label>
              <select
                {...register("maxPlayers", { valueAsNumber: true })}
                id="maxPlayers"
                className={`mt-1 block w-full rounded-md border ${
                  errors.maxPlayers ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900`}
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
                htmlFor="entryFee"
                className="block text-sm font-medium text-gray-800"
              >
                Entry Fee (USD) *
              </label>
              <input
                {...register("entryFee", { valueAsNumber: true })}
                type="number"
                id="entryFee"
                min="0"
                step="0.01"
                className={`mt-1 block w-full rounded-md border ${
                  errors.entryFee ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
                placeholder="0.00"
              />
              {errors.entryFee && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.entryFee.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Prize Pool
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <span className="text-lg font-semibold text-gray-900">
                  ${calculatePrizePool().toFixed(2)}
                </span>
                <p className="text-sm text-gray-700">
                  {watch("maxPlayers")} players × ${entryFee} entry fee
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-800"
              >
                Start Date *
              </label>
              <input
                {...register("startDate")}
                type="date"
                id="startDate"
                className={`mt-1 block w-full rounded-md border ${
                  errors.startDate ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900`}
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
                className="block text-sm font-medium text-gray-800"
              >
                End Date *
              </label>
              <input
                {...register("endDate")}
                type="date"
                id="endDate"
                className={`mt-1 block w-full rounded-md border ${
                  errors.endDate ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Bracket Configuration */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bracket Configuration
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="bracketType"
                  className="block text-sm font-medium text-gray-800"
                >
                  Tournament Format *
                </label>
                <select
                  {...register("bracketType")}
                  id="bracketType"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.bracketType ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900`}
                >
                  {bracketTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.bracketType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bracketType.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-700">
                  {
                    bracketTypeOptions.find((opt) => opt.value === bracketType)
                      ?.description
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Advanced Seeding
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useAdvancedSeeding"
                    {...register("useAdvancedSeeding")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="useAdvancedSeeding"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Use advanced seeding algorithms
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  Advanced seeding considers player performance, history, and
                  regional factors for more balanced matchups.
                </p>
              </div>
            </div>

            {useAdvancedSeeding && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">
                    Advanced Seeding Enabled
                  </span>
                </div>
                <p className="mt-2 text-sm text-blue-700">
                  The system will automatically analyze player statistics and
                  historical performance to create balanced tournament brackets.
                </p>
              </div>
            )}
          </div>

          {/* Prize Breakdown */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Prize Distribution
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="firstPrize"
                  className="block text-sm font-medium text-gray-800"
                >
                  First Place (%) *
                </label>
                <input
                  {...register("prizeBreakdown.first", { valueAsNumber: true })}
                  type="number"
                  id="firstPrize"
                  min="0"
                  max="100"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.prizeBreakdown?.first
                      ? "border-red-300"
                      : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
                  placeholder="50"
                />
                {errors.prizeBreakdown?.first && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.prizeBreakdown.first.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-700">
                  ${prizeAmounts.first.toFixed(2)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="secondPrize"
                  className="block text-sm font-medium text-gray-800"
                >
                  Second Place (%) *
                </label>
                <input
                  {...register("prizeBreakdown.second", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  id="secondPrize"
                  min="0"
                  max="100"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.prizeBreakdown?.second
                      ? "border-red-300"
                      : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
                  placeholder="30"
                />
                {errors.prizeBreakdown?.second && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.prizeBreakdown.second.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-700">
                  ${prizeAmounts.second.toFixed(2)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="thirdPrize"
                  className="block text-sm font-medium text-gray-800"
                >
                  Third Place (%) *
                </label>
                <input
                  {...register("prizeBreakdown.third", { valueAsNumber: true })}
                  type="number"
                  id="thirdPrize"
                  min="0"
                  max="100"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.prizeBreakdown?.third
                      ? "border-red-300"
                      : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-blue-600 sm:text-sm text-gray-900 placeholder-gray-500`}
                  placeholder="20"
                />
                {errors.prizeBreakdown?.third && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.prizeBreakdown.third.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-700">
                  ${prizeAmounts.third.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">
                  Total Distribution:
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {prizeBreakdown.first +
                    prizeBreakdown.second +
                    prizeBreakdown.third}
                  %
                </span>
              </div>
              {prizeBreakdown.first +
                prizeBreakdown.second +
                prizeBreakdown.third !==
                100 && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ Prize distribution must equal 100%
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Tournament"
                : "Create Tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
