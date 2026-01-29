import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { GameMode } from '../types';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isVisible, 
  onClose, 
  mode, 
  onModeChange 
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleFirstTenSeasonsToggle = () => {
    onModeChange({
      ...mode,
      firstTenSeasons: !mode.firstTenSeasons
    });
  };

  const handleTopFiveOnlyToggle = () => {
    onModeChange({
      ...mode,
      topFiveOnly: !mode.topFiveOnly
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        ref={modalRef}
        className="bg-[#f5f0e8] text-text-dark border-2 border-text-dark rounded-lg max-w-[400px] w-[90%] shadow-heavy animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-text-dark">
          <h2 id="settings-title" className="m-0 text-xl font-bold">Settings</h2>
          <button 
            ref={closeButtonRef}
            className="w-10 h-10 flex items-center justify-center rounded border-2 border-text-dark bg-white hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-text-dark/70 mb-4">
            Customize your game experience. Each mode combination has its own daily queen and tracks statistics separately.
          </p>

          {/* First 10 Seasons Toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded border-2 border-text-dark">
            <div>
              <span className="font-bold text-sm">First 10 Seasons</span>
              <p className="text-xs text-text-dark/70 mt-1">Only queens from seasons 1-10</p>
            </div>
            <button
              onClick={handleFirstTenSeasonsToggle}
              className={`w-12 h-6 rounded-full border-2 border-text-dark transition-colors relative flex-shrink-0 ${
                mode.firstTenSeasons ? 'bg-feedback-correct' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={mode.firstTenSeasons}
              aria-label="Toggle First 10 Seasons mode"
            >
              <span 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-text-dark transition-all ${
                  mode.firstTenSeasons ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Top 5 Only Toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded border-2 border-text-dark">
            <div>
              <span className="font-bold text-sm">Top 5 Only</span>
              <p className="text-xs text-text-dark/70 mt-1">Only queens who placed in the top 5</p>
            </div>
            <button
              onClick={handleTopFiveOnlyToggle}
              className={`w-12 h-6 rounded-full border-2 border-text-dark transition-colors relative flex-shrink-0 ${
                mode.topFiveOnly ? 'bg-feedback-correct' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={mode.topFiveOnly}
              aria-label="Toggle Top 5 Only mode"
            >
              <span 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-text-dark transition-all ${
                  mode.topFiveOnly ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Current Mode Info */}
          <div className="text-center pt-2 border-t border-text-dark/30">
            <p className="text-xs text-text-dark/70 italic m-0">
              {mode.firstTenSeasons && mode.topFiveOnly && 'Playing: First 10 Seasons + Top 5'}
              {mode.firstTenSeasons && !mode.topFiveOnly && 'Playing: First 10 Seasons'}
              {!mode.firstTenSeasons && mode.topFiveOnly && 'Playing: Top 5 Only'}
              {!mode.firstTenSeasons && !mode.topFiveOnly && 'Playing: All Queens'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
