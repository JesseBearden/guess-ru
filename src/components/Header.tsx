import React from 'react';
import { GameModeKey } from '../types';

interface HeaderProps {
  onShowInstructions: () => void;
  onShowStats: () => void;
  gameMode: GameModeKey;
  onModeChange: (mode: GameModeKey) => void;
}

const Header: React.FC<HeaderProps> = ({ onShowInstructions, onShowStats, gameMode, onModeChange }) => {
  return (
    <header className="bg-gradient-primary text-white py-2 sm:py-3 md:py-4 shadow-light">
      <div className="max-w-[1200px] mx-auto px-3 flex justify-between items-center gap-2 sm:px-3 sm:gap-2 md:px-4 md:gap-3">
        <div className="text-left min-w-0">
          <h1 className="m-0 text-2xl font-bold font-display drop-shadow-lg sm:text-3xl md:text-4xl">
            GuessRu
          </h1>
          <p className="m-0 text-xs leading-tight opacity-90 font-light sm:text-sm md:text-base">
            Daily drag queen guessing game
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Mode Toggle */}
          <div
            className="flex rounded-full border border-white/30 overflow-hidden bg-white/10 h-10 sm:h-11 md:h-12 sm:border-2"
            role="radiogroup"
            aria-label="Game difficulty"
          >
            <button
              className={`px-3 py-1 text-xs font-semibold transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 ${
                gameMode === 'easy'
                  ? 'bg-white/30 text-white'
                  : 'bg-transparent text-white/60 hover:text-white/80'
              }`}
              onClick={() => onModeChange('easy')}
              role="radio"
              aria-checked={gameMode === 'easy'}
              aria-label="Easy mode: Top 7 from first 10 seasons"
            >
              Easy
            </button>
            <button
              className={`px-3 py-1 text-xs font-semibold transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 ${
                gameMode === 'standard'
                  ? 'bg-white/30 text-white'
                  : 'bg-transparent text-white/60 hover:text-white/80'
              }`}
              onClick={() => onModeChange('standard')}
              role="radio"
              aria-checked={gameMode === 'standard'}
              aria-label="Standard mode: All queens, all seasons"
            >
              Standard
            </button>
          </div>

          <button 
            className="bg-white/20 border border-white/30 text-white p-1.5 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0 sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] sm:p-2 sm:border-2 md:w-12 md:h-12 md:min-w-[48px] md:min-h-[48px] md:p-3"
            onClick={onShowInstructions}
            aria-label="Show game instructions"
            title="How to play"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </button>
          
          <button 
            className="bg-white/20 border border-white/30 text-white p-1.5 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px] hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0 sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] sm:p-2 sm:border-2 md:w-12 md:h-12 md:min-w-[48px] md:min-h-[48px] md:p-3"
            onClick={onShowStats}
            aria-label="Show game statistics"
            title="Statistics"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5">
              <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
