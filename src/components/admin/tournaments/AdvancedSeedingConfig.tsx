import React, { useState } from "react";

interface SeedingOptions {
  includePerformance: boolean;
  includeHistory: boolean;
  includeRegional: boolean;
  includeConsistency: boolean;
  performanceWeight: number;
  historyWeight: number;
  regionalWeight: number;
  consistencyWeight: number;
  ratingWeight: number;
  recentTournaments: number;
  regionalRadius: number;
}

interface AdvancedSeedingConfigProps {
  options: SeedingOptions;
  onOptionsChange: (options: SeedingOptions) => void;
  disabled?: boolean;
}

const AdvancedSeedingConfig: React.FC<AdvancedSeedingConfigProps> = ({
  options,
  onOptionsChange,
  disabled = false,
}) => {
  const updateOption = (key: keyof SeedingOptions, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const updateWeight = (key: keyof SeedingOptions, value: number) => {
    const newOptions = { ...options, [key]: value };

    // Recalculate other weights to maintain 100% total
    const totalOtherWeights = Object.keys(newOptions)
      .filter((k) => k !== key && k.endsWith("Weight"))
      .reduce(
        (sum, k) => sum + (newOptions[k as keyof SeedingOptions] as number),
        0
      );

    const remainingWeight = 1 - value;
    const scaleFactor = remainingWeight / totalOtherWeights;

    Object.keys(newOptions).forEach((k) => {
      if (k !== key && k.endsWith("Weight")) {
        newOptions[k as keyof SeedingOptions] =
          (newOptions[k as keyof SeedingOptions] as number) * scaleFactor;
      }
    });

    onOptionsChange(newOptions);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Advanced Seeding Configuration
        </h3>
      </div>

      {/* Factor Toggles */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700">Rating-Based Seeding</h4>
            <p className="text-sm text-gray-500">Base player rating</p>
          </div>
          <input
            type="checkbox"
            checked={true}
            disabled={true}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700">Performance Analysis</h4>
            <p className="text-sm text-gray-500">Recent match results</p>
          </div>
          <input
            type="checkbox"
            checked={options.includePerformance}
            onChange={(e) =>
              updateOption("includePerformance", e.target.checked)
            }
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700">Tournament History</h4>
            <p className="text-sm text-gray-500">Past tournament performance</p>
          </div>
          <input
            type="checkbox"
            checked={options.includeHistory}
            onChange={(e) => updateOption("includeHistory", e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700">Regional Factors</h4>
            <p className="text-sm text-gray-500">
              Location-based considerations
            </p>
          </div>
          <input
            type="checkbox"
            checked={options.includeRegional}
            onChange={(e) => updateOption("includeRegional", e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-700">Consistency Scoring</h4>
            <p className="text-sm text-gray-500">Performance stability</p>
          </div>
          <input
            type="checkbox"
            checked={options.includeConsistency}
            onChange={(e) =>
              updateOption("includeConsistency", e.target.checked)
            }
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Weight Configuration */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-700 mb-3">
          Seeding Factor Weights
        </h4>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Rating Weight</span>
            <span className="text-sm font-medium text-gray-800">
              {Math.round(options.ratingWeight * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={options.ratingWeight * 100}
            onChange={(e) =>
              updateWeight("ratingWeight", parseInt(e.target.value) / 100)
            }
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {options.includePerformance && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Performance Weight</span>
              <span className="text-sm font-medium text-gray-800">
                {Math.round(options.performanceWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={options.performanceWeight * 100}
              onChange={(e) =>
                updateWeight(
                  "performanceWeight",
                  parseInt(e.target.value) / 100
                )
              }
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {options.includeHistory && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">History Weight</span>
              <span className="text-sm font-medium text-gray-800">
                {Math.round(options.historyWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={options.historyWeight * 100}
              onChange={(e) =>
                updateWeight("historyWeight", parseInt(e.target.value) / 100)
              }
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {options.includeRegional && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Regional Weight</span>
              <span className="text-sm font-medium text-gray-800">
                {Math.round(options.regionalWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={options.regionalWeight * 100}
              onChange={(e) =>
                updateWeight("regionalWeight", parseInt(e.target.value) / 100)
              }
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {options.includeConsistency && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Consistency Weight</span>
              <span className="text-sm font-medium text-gray-800">
                {Math.round(options.consistencyWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={options.consistencyWeight * 100}
              onChange={(e) =>
                updateWeight(
                  "consistencyWeight",
                  parseInt(e.target.value) / 100
                )
              }
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recent Tournaments
          </label>
          <input
            type="number"
            value={options.recentTournaments}
            onChange={(e) =>
              updateOption("recentTournaments", parseInt(e.target.value) || 5)
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regional Radius (km)
          </label>
          <input
            type="number"
            value={options.regionalRadius}
            onChange={(e) =>
              updateOption("regionalRadius", parseInt(e.target.value) || 100)
            }
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="100"
          />
        </div>
      </div>

      {/* Weight Validation */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Weight:</span>
          <span className="text-sm font-medium text-gray-800">
            {Math.round(
              (options.ratingWeight +
                options.performanceWeight +
                options.historyWeight +
                options.regionalWeight +
                options.consistencyWeight) *
                100
            )}
            %
          </span>
        </div>
        {Math.abs(
          options.ratingWeight +
            options.performanceWeight +
            options.historyWeight +
            options.regionalWeight +
            options.consistencyWeight -
            1
        ) > 0.01 && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ Weights must sum to 100%
          </p>
        )}
      </div>
    </div>
  );
};

export default AdvancedSeedingConfig;
