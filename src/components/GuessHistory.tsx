import React from 'react';
import { Guess } from '../types';
import GuessRow from './GuessRow';

interface GuessHistoryProps {
  guesses: Guess[];
  maxGuesses?: number;
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ 
  guesses, 
  maxGuesses = 8 
}) => {
  // Create array of 8 slots, filled with guesses where available
  const slots = Array.from({ length: maxGuesses }, (_, i) => guesses[i] || null);

  return (
    <div className="w-full" role="grid" aria-label="Guess history">
      {/* Column headers - always visible at top */}
      <div 
        className="grid grid-cols-5 gap-0 mb-3 border-b-2 border-dashed border-text-dark/40"
        role="row"
      >
        <div className="text-center text-sm font-bold text-text-dark py-2" role="columnheader">
          Name
        </div>
        <div className="text-center text-sm font-bold text-text-dark py-2" role="columnheader">
          Season
        </div>
        <div className="text-center text-sm font-bold text-text-dark py-2" role="columnheader">
          Position
        </div>
        <div className="text-center text-sm font-bold text-text-dark py-2" role="columnheader">
          Age
        </div>
        <div className="text-center text-sm font-bold text-text-dark py-2" role="columnheader">
          Hometown
        </div>
      </div>

      {/* Guess slots */}
      <div className="space-y-3">
        {slots.map((guess, index) => (
          guess ? (
            <GuessRow 
              key={`${guess.contestant.id}-${index}`}
              guess={guess}
              index={index}
            />
          ) : (
            <PlaceholderRow key={`placeholder-${index}`} number={index + 1} />
          )
        ))}
      </div>
    </div>
  );
};

// Placeholder row component - comic book dashed border style
const PlaceholderRow: React.FC<{ number: number }> = ({ number }) => {
  return (
    <div 
      className="grid grid-cols-5 gap-0 border-2 border-dashed border-text-dark/30 rounded-lg
                 bg-white/30 transition-all duration-200 hover:border-text-dark/50 hover:bg-white/50"
      role="row"
      aria-label={`Guess slot ${number} - empty`}
    >
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className={`py-4 flex items-center justify-center ${i < 4 ? 'border-r border-dashed border-text-dark/30' : ''}`}
        >
          {i === 0 && (
            <span className="text-xl font-bold text-text-dark/40 select-none">
              {number}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;
