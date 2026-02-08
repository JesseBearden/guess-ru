import React, { useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface HintButtonsProps {
  entranceQuote: string;
  snatchGameCharacter: string;
  hintsUsed: { entranceQuote: boolean; snatchGame: boolean };
  onHintUsed: (hintType: 'entranceQuote' | 'snatchGame') => void;
  disabled?: boolean;
  className?: string;
  timerSlot?: ReactNode;
  modeKey?: string;
}

const HintButtons: React.FC<HintButtonsProps> = ({
  entranceQuote,
  snatchGameCharacter,
  hintsUsed,
  onHintUsed,
  disabled = false,
  className = '',
  timerSlot,
  modeKey
}) => {
  const [entranceQuoteVisible, setEntranceQuoteVisible] = useState(false);
  const [snatchGameVisible, setSnatchGameVisible] = useState(false);

  // Reset visibility when mode changes
  useEffect(() => {
    setEntranceQuoteVisible(false);
    setSnatchGameVisible(false);
  }, [modeKey]);

  const handleEntranceQuoteToggle = () => {
    if (!entranceQuoteVisible && !hintsUsed.entranceQuote) {
      onHintUsed('entranceQuote');
    }
    setEntranceQuoteVisible(!entranceQuoteVisible);
  };

  const handleSnatchGameToggle = () => {
    if (!snatchGameVisible && !hintsUsed.snatchGame) {
      onHintUsed('snatchGame');
    }
    setSnatchGameVisible(!snatchGameVisible);
  };

  const baseButtonClass = `flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg font-medium text-sm transition-all
    ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-text-dark cursor-pointer hover:bg-gray-50'}`;

  const activeButtonClass = `shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)] bg-gray-100`;

  // Use inline style for border to ensure it's applied
  const buttonStyle = { border: '2px solid #2c3e50' };
  const revealBoxStyle = { border: '2px solid #2c3e50' };

  const showRevealBox = entranceQuoteVisible || snatchGameVisible;

  return (
    <div className={className}>
      {/* Revealed hint content - separate boxes for each hint */}
      {showRevealBox && (
        <div className="flex gap-2 mb-3">
          {entranceQuoteVisible && (
            <div className="flex-1 p-3 bg-white rounded-lg text-text-dark italic" style={revealBoxStyle}>
              <span className="font-medium not-italic">🎤 </span>"{entranceQuote}"
            </div>
          )}
          {snatchGameVisible && (
            <div className="flex-1 p-3 bg-white rounded-lg text-text-dark" style={revealBoxStyle}>
              <span className="font-medium">🎭 </span>{snatchGameCharacter}
            </div>
          )}
        </div>
      )}

      {/* Buttons + Timer row - all same height */}
      <div className="flex gap-2 items-stretch">
        {/* Entrance Quote Button */}
        <button
          onClick={handleEntranceQuoteToggle}
          disabled={disabled}
          style={buttonStyle}
          className={`${baseButtonClass} flex-1 ${entranceQuoteVisible ? activeButtonClass : ''}`}
          aria-expanded={entranceQuoteVisible}
          aria-label="Toggle entrance quote hint"
        >
          <span>🎤</span>
          <span>Entrance Quote</span>
          {entranceQuoteVisible && <X size={16} className="text-primary-pink ml-0.5" />}
        </button>

        {/* Snatch Game Button */}
        <button
          onClick={handleSnatchGameToggle}
          disabled={disabled}
          style={buttonStyle}
          className={`${baseButtonClass} flex-1 ${snatchGameVisible ? activeButtonClass : ''}`}
          aria-expanded={snatchGameVisible}
          aria-label="Toggle snatch game hint"
        >
          <span>🎭</span>
          <span>Snatch Game</span>
          {snatchGameVisible && <X size={16} className="text-primary-pink ml-0.5" />}
        </button>

        {/* Timer slot - rendered inline with buttons */}
        {timerSlot}
      </div>
    </div>
  );
};

export default HintButtons;
