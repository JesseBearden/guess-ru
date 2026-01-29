import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onShowInstructions: () => void;
  onShowStats: () => void;
  onShowSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowInstructions, onShowStats, onShowSettings }) => {
  return (
    <header className="bg-gradient-primary text-white py-4 shadow-light">
      <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center md:px-3 sm:px-2">
        <div className="text-left">
          <h1 className="m-0 text-4xl font-bold font-display drop-shadow-lg md:text-3xl sm:text-2xl">
            GuessRu
          </h1>
          <p className="m-0 text-base opacity-90 font-light md:text-sm sm:text-xs">
            Daily drag queen guessing game
          </p>
        </div>
        
        <div className="flex gap-3 sm:gap-2">
          <button 
            className="bg-white/20 border-2 border-white/30 text-white p-3 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0 md:w-11 md:h-11 md:min-w-[44px] md:min-h-[44px] md:p-2"
            onClick={onShowInstructions}
            aria-label="Show game instructions"
            title="How to play"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="md:w-[18px] md:h-[18px]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </button>

          <button 
            className="bg-white/20 border-2 border-white/30 text-white p-3 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0 md:w-11 md:h-11 md:min-w-[44px] md:min-h-[44px] md:p-2"
            onClick={onShowSettings}
            aria-label="Show game settings"
            title="Settings"
          >
            <Settings size={20} className="md:w-[18px] md:h-[18px]" />
          </button>
          
          <button 
            className="bg-white/20 border-2 border-white/30 text-white p-3 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 active:translate-y-0 md:w-11 md:h-11 md:min-w-[44px] md:min-h-[44px] md:p-2"
            onClick={onShowStats}
            aria-label="Show game statistics"
            title="Statistics"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="md:w-[18px] md:h-[18px]">
              <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
