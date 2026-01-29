import React, { useEffect, useRef, useState } from 'react';
import { Statistics, GameModeKey } from '../types';
import { calculateWinPercentage, getCurrentStatistics } from '../utilities/statistics';

interface StatsModalProps {
  currentModeKey: GameModeKey;
  isVisible: boolean;
  onClose: () => void;
}

// Mode display labels for the dropdown
const MODE_LABELS: Record<GameModeKey, string> = {
  'default': 'All Queens',
  'first10': 'First 10 Seasons',
  'top5': 'Top 5 Only',
  'first10-top5': 'First 10 + Top 5'
};

// All available mode keys for the dropdown
const ALL_MODE_KEYS: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];

const StatsModal: React.FC<StatsModalProps> = ({ currentModeKey, isVisible, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // State to track selected mode in the dropdown
  const [selectedModeKey, setSelectedModeKey] = useState<GameModeKey>(currentModeKey);
  
  // Load statistics for the selected mode
  const statistics: Statistics = getCurrentStatistics(selectedModeKey);

  // Reset selected mode to current mode when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedModeKey(currentModeKey);
    }
  }, [isVisible, currentModeKey]);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isVisible) {
      closeButtonRef.current?.focus();
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onClose]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModeKey(e.target.value as GameModeKey);
  };

  if (!isVisible) {
    return null;
  }

  const winPercentage = calculateWinPercentage(statistics);
  const maxWins = Math.max(...statistics.winDistribution);

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <div 
        className="bg-[#f5f0e8] text-text-dark border-2 border-text-dark rounded-lg max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-heavy animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-6 border-b-2 border-text-dark mb-4 pb-4">
          <h2 id="stats-title" className="m-0 text-2xl font-bold">Statistics</h2>
          <button 
            ref={closeButtonRef}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded border-2 border-text-dark bg-white hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Close statistics"
          >
            ×
          </button>
        </div>
        <div className="px-6 pb-6">
          {/* Mode Selector Dropdown */}
          <div className="mb-6">
            <label htmlFor="mode-selector" className="block text-sm font-bold mb-2">
              View Stats For:
            </label>
            <select
              id="mode-selector"
              value={selectedModeKey}
              onChange={handleModeChange}
              className="w-full p-3 bg-white border-2 border-text-dark rounded text-text-dark font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-text-dark"
              aria-label="Select game mode to view statistics"
            >
              {ALL_MODE_KEYS.map((modeKey) => (
                <option key={modeKey} value={modeKey}>
                  {MODE_LABELS[modeKey]}
                  {modeKey === currentModeKey ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-1 sm:gap-3">
            <div className="text-center p-4 bg-white rounded border-2 border-text-dark sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.gamesPlayed}</div>
              <div className="text-sm text-text-dark/80 uppercase tracking-wide">Games Played</div>
            </div>
            <div className="text-center p-4 bg-white rounded border-2 border-text-dark sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{winPercentage}%</div>
              <div className="text-sm text-text-dark/80 uppercase tracking-wide">Win Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded border-2 border-text-dark sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.currentStreak}</div>
              <div className="text-sm text-text-dark/80 uppercase tracking-wide">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-white rounded border-2 border-text-dark sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.maxStreak}</div>
              <div className="text-sm text-text-dark/80 uppercase tracking-wide">Max Streak</div>
            </div>
          </div>

          {/* Win Distribution Chart */}
          <div className="mb-8">
            <h3 className="mb-4 text-text-dark font-bold text-xl text-center">Guess Distribution</h3>
            <div className="flex flex-col gap-2">
              {statistics.winDistribution.map((count, index) => {
                const guessNumber = index + 1;
                const percentage = maxWins > 0 ? (count / maxWins) * 100 : 0;
                
                return (
                  <div key={guessNumber} className="flex items-center gap-3 sm:gap-2">
                    <div className="w-5 text-center font-bold text-text-dark/90 sm:w-4">{guessNumber}</div>
                    <div className="flex-1 relative h-6 bg-text-dark/10 rounded overflow-hidden sm:h-5">
                      <div 
                        className="h-full bg-gradient-to-r from-hot-pink to-deep-pink rounded transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-text-dark drop-shadow-[1px_1px_2px_rgba(255,255,255,0.7)] sm:text-[0.7rem] sm:right-1.5">
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Statistics */}
          {statistics.gamesPlayed > 0 && (
            <div className="border-t-2 border-text-dark pt-4">
              <div className="flex justify-between items-center py-2 border-b border-text-dark/30">
                <span className="text-text-dark/80">Total Wins:</span>
                <span className="text-hot-pink font-bold">{statistics.gamesWon}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-dark/80">Total Losses:</span>
                <span className="text-hot-pink font-bold">{statistics.gamesPlayed - statistics.gamesWon}</span>
              </div>
            </div>
          )}

          {statistics.gamesPlayed === 0 && (
            <div className="text-center p-8 text-text-dark/70">
              <p className="m-0 italic">No games played yet in this mode. Start playing to see your statistics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
