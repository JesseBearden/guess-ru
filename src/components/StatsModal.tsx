import React, { useEffect, useRef } from 'react';
import { Statistics } from '../types';
import { calculateWinPercentage } from '../utilities/statistics';

interface StatsModalProps {
  statistics: Statistics;
  isVisible: boolean;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ statistics, isVisible, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
        className="bg-gradient-secondary text-white rounded-xl max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-heavy animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-6 border-b border-white/20 mb-4">
          <h2 id="stats-title" className="m-0 text-2xl text-hot-pink">Statistics</h2>
          <button 
            ref={closeButtonRef}
            className="bg-transparent text-4xl text-white/80 p-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Close statistics"
          >
            ×
          </button>
        </div>
        <div className="px-6 pb-6">
          {/* Overall Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-1 sm:gap-3">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.gamesPlayed}</div>
              <div className="text-sm text-white/80 uppercase tracking-wide">Games Played</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{winPercentage}%</div>
              <div className="text-sm text-white/80 uppercase tracking-wide">Win Rate</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.currentStreak}</div>
              <div className="text-sm text-white/80 uppercase tracking-wide">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 sm:p-3">
              <div className="text-4xl font-bold text-hot-pink mb-2 sm:text-2xl">{statistics.maxStreak}</div>
              <div className="text-sm text-white/80 uppercase tracking-wide">Max Streak</div>
            </div>
          </div>

          {/* Win Distribution Chart */}
          <div className="mb-8">
            <h3 className="mb-4 text-hot-pink text-xl text-center">Guess Distribution</h3>
            <div className="flex flex-col gap-2">
              {statistics.winDistribution.map((count, index) => {
                const guessNumber = index + 1;
                const percentage = maxWins > 0 ? (count / maxWins) * 100 : 0;
                
                return (
                  <div key={guessNumber} className="flex items-center gap-3 sm:gap-2">
                    <div className="w-5 text-center font-bold text-white/90 sm:w-4">{guessNumber}</div>
                    <div className="flex-1 relative h-6 bg-white/10 rounded overflow-hidden sm:h-5">
                      <div 
                        className="h-full bg-gradient-to-r from-hot-pink to-deep-pink rounded transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.7)] sm:text-[0.7rem] sm:right-1.5">
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
            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/80">Total Wins:</span>
                <span className="text-hot-pink font-bold">{statistics.gamesWon}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/80">Total Losses:</span>
                <span className="text-hot-pink font-bold">{statistics.gamesPlayed - statistics.gamesWon}</span>
              </div>
            </div>
          )}

          {statistics.gamesPlayed === 0 && (
            <div className="text-center p-8 text-white/70">
              <p className="m-0 italic">No games played yet. Start playing to see your statistics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
