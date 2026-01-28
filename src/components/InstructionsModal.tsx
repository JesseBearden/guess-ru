import React, { useEffect, useRef } from 'react';

interface InstructionsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isVisible, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (isVisible) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
      
      // Handle escape key
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

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
    >
      <div 
        ref={modalRef}
        className="bg-gradient-secondary text-white rounded-xl max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-heavy animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-6 border-b border-white/20 mb-4">
          <h2 id="instructions-title" className="m-0 text-2xl text-hot-pink">How to Play</h2>
          <button 
            ref={closeButtonRef}
            className="bg-transparent text-4xl text-white/80 p-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Close instructions"
          >
            ×
          </button>
        </div>
        
        <div className="px-6 pb-6">
          {/* Game Overview */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">🎯 Goal</h3>
            <p className="text-white/90 leading-relaxed">
              Guess the secret RuPaul's Drag Race queen in 8 tries or less! A new queen is featured every day.
            </p>
          </div>

          {/* How to Guess */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">✨ How to Guess</h3>
            <ul className="text-white/90 leading-relaxed list-none p-0 m-0 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold">1.</span>
                <span>Type a drag queen's name in the input box</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">2.</span>
                <span>Select from the autocomplete suggestions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold">3.</span>
                <span>Press Enter or click to submit your guess</span>
              </li>
            </ul>
          </div>

          {/* Color Coding System */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">🎨 Color Coding</h3>
            <p className="text-white/90 mb-3">After each guess, you'll see color-coded feedback:</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-feedback-correct rounded flex items-center justify-center text-white font-bold" aria-hidden="true">✓</div>
                <div>
                  <span className="text-feedback-correct font-semibold">Green</span>
                  <span className="text-white/80"> — Exact match!</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-feedback-close rounded flex items-center justify-center text-white font-bold" aria-hidden="true">~</div>
                <div>
                  <span className="text-feedback-close font-semibold">Yellow</span>
                  <span className="text-white/80"> — Close! Within 3 (for numbers) or 75 miles (for hometown)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-feedback-wrong rounded flex items-center justify-center text-white font-bold" aria-hidden="true">✗</div>
                <div>
                  <span className="text-feedback-wrong font-semibold">Gray</span>
                  <span className="text-white/80"> — Not a match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directional Arrows */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">⬆️ Directional Arrows</h3>
            <p className="text-white/90 leading-relaxed">
              For numerical attributes (Season, Position, Age), arrows indicate if the correct answer is higher (⬆️) or lower (⬇️) than your guess.
            </p>
          </div>

          {/* Attributes */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">📊 Attributes</h3>
            <p className="text-white/90 mb-3">Each guess shows these attributes:</p>
            <ul className="text-white/90 leading-relaxed list-none p-0 m-0 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-hot-pink">•</span>
                <span><strong>Season</strong> — Which main US season they competed on</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hot-pink">•</span>
                <span><strong>Position</strong> — Their finishing placement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hot-pink">•</span>
                <span><strong>Age</strong> — Their age during the show</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hot-pink">•</span>
                <span><strong>Hometown</strong> — Where they're from</span>
              </li>
            </ul>
          </div>

          {/* Optional Hints */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">💡 Optional Hints</h3>
            <p className="text-white/90 leading-relaxed">
              Click the silhouette toggle button (👤) to show or hide a silhouette of the secret queen for an extra visual hint!
            </p>
          </div>

          {/* Daily Reset */}
          <div className="mb-6">
            <h3 className="text-hot-pink text-lg mb-3">🕛 Daily Reset</h3>
            <p className="text-white/90 leading-relaxed">
              A new queen is featured every day at midnight Pacific Time. Come back tomorrow for a new challenge!
            </p>
          </div>

          {/* Good Luck */}
          <div className="text-center p-4 bg-white/10 rounded-lg border border-hot-pink/30">
            <p className="text-xl text-hot-pink font-bold m-0">Good luck, and may the best woman win! 👑</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
