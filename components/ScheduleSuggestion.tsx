import React from 'react';
import { SuggestedSchedule } from '../types';
import { Clock, CheckCircle, X } from 'lucide-react';

interface ScheduleSuggestionProps {
  suggestions: SuggestedSchedule[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const ScheduleSuggestion: React.FC<ScheduleSuggestionProps> = ({
  suggestions,
  onAccept,
  onReject,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500 space-y-3">
      <div className="flex items-center space-x-2">
        <Clock size={20} className="text-blue-600 dark:text-blue-400" />
        <p className="font-semibold text-blue-900 dark:text-blue-200">
          Suggested Activities
        </p>
      </div>

      <div className="space-y-2">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded border border-blue-200 dark:border-blue-800"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {suggestion.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {suggestion.startTime} - {suggestion.endTime}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAccept(suggestion.id)}
                disabled={suggestion.accepted}
                className={`p-2 rounded transition-colors ${
                  suggestion.accepted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-500 hover:text-green-600'
                }`}
                title="Accept"
              >
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => onReject(suggestion.id)}
                disabled={suggestion.accepted}
                className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Reject"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-600 dark:text-blue-400">
        💡 Click the checkmark to add to your schedule, or X to dismiss.
      </p>
    </div>
  );
};

export default ScheduleSuggestion;
