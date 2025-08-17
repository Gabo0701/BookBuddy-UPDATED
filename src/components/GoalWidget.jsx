import React, { useState } from 'react';
import ProgressBar from './ProgressBar';

const GoalWidget = ({ goal, onUpdateGoal, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState(goal?.targetBooks || 12);

  const handleSave = () => {
    if (onUpdateGoal) {
      const targetValue = editTarget === '' ? 1 : parseInt(editTarget, 10) || 1;
      onUpdateGoal({ targetBooks: targetValue });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTarget(goal?.targetBooks || 12);
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  if (!goal) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const progressPercentage = goal.targetBooks > 0 
    ? Math.min((goal.currentBooks / goal.targetBooks) * 100, 100) 
    : 0;

  const booksRemaining = Math.max(goal.targetBooks - goal.currentBooks, 0);
  const isGoalMet = goal.currentBooks >= goal.targetBooks;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Reading Goal
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-1"
          aria-label="Edit reading goal"
        >
          Edit
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="goal-target" className="block text-sm font-medium text-gray-700 mb-2">
              Target Books
            </label>
            <input
              id="goal-target"
              type="number"
              min="1"
              max="365"
              value={editTarget}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setEditTarget('');
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue) && numValue >= 1) {
                    setEditTarget(numValue);
                  }
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Ring */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                  className={`transition-all duration-500 ${
                    isGoalMet ? 'text-green-500' : 'text-blue-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {goal.currentBooks}
                  </div>
                  <div className="text-xs text-gray-500">
                    of {goal.targetBooks}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            {isGoalMet ? (
              <p className="text-green-600 font-medium">
                🎉 Goal achieved! Great job!
              </p>
            ) : (
              <p className="text-gray-600">
                <span className="font-medium">{booksRemaining}</span> books to go
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <ProgressBar
            value={goal.currentBooks}
            max={goal.targetBooks}
            color={isGoalMet ? 'bg-green-500' : 'bg-blue-500'}
            showLabel={false}
            size="sm"
          />

          {/* Additional Stats */}
          {goal.targetPages > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pages read:</span>
                <span>{goal.currentPages?.toLocaleString() || 0}</span>
              </div>
              {goal.targetPages && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pages goal:</span>
                  <span>{goal.targetPages.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalWidget;