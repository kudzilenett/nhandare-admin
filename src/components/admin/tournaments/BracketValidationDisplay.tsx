import React from "react";

interface BracketStructure {
  type: string;
  totalRounds: number;
  totalMatches: number;
  players: unknown[];
  generatedAt: Date;
  validationStatus: "valid" | "invalid" | "pending";
  validationErrors?: string[];
}

interface BracketValidationDisplayProps {
  bracket: BracketStructure;
}

const BracketValidationDisplay: React.FC<BracketValidationDisplayProps> = ({
  bracket,
}) => {
  const getValidationIcon = () => {
    switch (bracket.validationStatus) {
      case "valid":
        return (
          <svg
            className="w-6 h-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "invalid":
        return (
          <svg
            className="w-6 h-6 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "pending":
        return (
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getValidationColor = () => {
    switch (bracket.validationStatus) {
      case "valid":
        return "bg-green-50 border-green-200";
      case "invalid":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`rounded-xl p-6 border ${getValidationColor()}`}>
      <div className="flex items-center mb-6">
        {getValidationIcon()}
        <h3 className="text-lg font-semibold text-gray-800 ml-3">
          Bracket Validation
        </h3>
      </div>

      {/* Validation Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Status</h4>
        <div className="flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              bracket.validationStatus === "valid"
                ? "bg-green-100 text-green-800"
                : bracket.validationStatus === "invalid"
                ? "bg-red-100 text-red-800"
                : bracket.validationStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {bracket.validationStatus.charAt(0).toUpperCase() +
              bracket.validationStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* Bracket Structure Details */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Structure Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Type</span>
            <p className="text-sm font-medium text-gray-900">{bracket.type}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Rounds</span>
            <p className="text-sm font-medium text-gray-900">
              {bracket.totalRounds}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Matches</span>
            <p className="text-sm font-medium text-gray-900">
              {bracket.totalMatches}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Players</span>
            <p className="text-sm font-medium text-gray-900">
              {bracket.players.length}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Generated</span>
            <p className="text-sm font-medium text-gray-900">
              {new Date(bracket.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Errors (Admin sees full details) */}
      {bracket.validationErrors && bracket.validationErrors.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-red-700 mb-3">Validation Errors</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {bracket.validationErrors.map((error, index) => (
              <div key={index} className="flex items-start">
                <svg
                  className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketValidationDisplay;
