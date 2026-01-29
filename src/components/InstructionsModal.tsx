import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
        className="bg-[#f5f0e8] text-text-dark border-2 border-text-dark rounded-lg max-w-[400px] w-[90%] shadow-heavy animate-modal-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-text-dark">
          <h2 id="instructions-title" className="m-0 text-xl font-bold">How to Play</h2>
          <button 
            ref={closeButtonRef}
            className="w-10 h-10 flex items-center justify-center rounded border-2 border-text-dark bg-white hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Close instructions"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Intro */}
          <p className="text-sm leading-relaxed">
            Guess the secret RuPaul's Drag Race queen in 8 tries or less! Type a name, select from suggestions, and use the feedback to narrow it down.
          </p>

          {/* Color Coding */}
          <div>
            <h3 className="font-bold text-sm mb-2">Color Coding</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-feedback-correct rounded border border-text-dark" aria-hidden="true"></div>
                <span className="text-sm"><strong>Green</strong> — Exact match!</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-feedback-close rounded border border-text-dark" aria-hidden="true"></div>
                <span className="text-sm"><strong>Yellow</strong> — Close (within 3 for numbers, 75 miles for hometown)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white rounded border border-text-dark" aria-hidden="true"></div>
                <span className="text-sm"><strong>White</strong> — Not a match</span>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <div>
            <h3 className="font-bold text-sm mb-2">Arrows</h3>
            <p className="text-sm leading-relaxed">
              ↑ or ↓ arrows show if the correct answer is higher or lower than your guess.
            </p>
          </div>

          {/* Game Modes */}
          <div>
            <h3 className="font-bold text-sm mb-2">Game Modes</h3>
            <p className="text-sm leading-relaxed">
              Click the <strong>gear icon</strong> (⚙️) in the header to open settings and adjust difficulty:
            </p>
            <ul className="text-sm leading-relaxed mt-2 ml-4 list-disc space-y-1">
              <li><strong>First 10 Seasons</strong> — Limits queens to seasons 1-10</li>
              <li><strong>Top 5 Only</strong> — Limits queens to top 5 finishers</li>
            </ul>
            <p className="text-sm leading-relaxed mt-2">
              Each mode combination has its own daily queen and separate statistics!
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-text-dark/30">
            <p className="text-xs text-text-dark/70 italic m-0">New queen daily at midnight PT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
