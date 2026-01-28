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
      {/* Header row - comic book style */}
      <div 
        className="grid grid-cols-4 gap-1 mb-3 py-2 border-b-2 border-dashed border-text-dark/30
                   sm:hidden"
        role="row"
      >
        <div className="text-center text-sm font-bold text-text-dark uppercase tracking-wider" role="columnheader">
          Season
        </div>
        <div className="text-center text-sm font-bold text-text-dark uppercase tracking-wider" role="columnheader">
          Position
        </div>
        <div className="text-center text-sm font-bold text-text-dark uppercase tracking-wider" role="columnheader">
          Age
        </div>
        <div className="text-center text-sm font-bold text-text-dark uppercase tracking-wider" role="columnheader">
          Hometown
        </div>
      </div>

      {/* Guess slots */}
      <div className="space-y-2">
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
      className="border-2 border-dashed border-text-dark/30 rounded-lg py-6 flex items-center justify-center
                 bg-white/30 transition-all duration-200 hover:border-text-dark/50 hover:bg-white/50"
      role="row"
      aria-label={`Guess slot ${number} - empty`}
    >
      <span className="text-2xl font-bold text-text-dark/40 select-none">
        {number}
      </span>
    </div>
  );
};

export default GuessHistory;
