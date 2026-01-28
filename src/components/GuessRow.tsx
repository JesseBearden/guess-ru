import React from 'react';
import { Guess, FeedbackType, DirectionType } from '../types';

interface GuessRowProps {
  guess: Guess;
  index: number;
}

const GuessRow: React.FC<GuessRowProps> = ({ guess, index }) => {
  const { contestant, feedback } = guess;

  const getFeedbackClasses = (feedbackType: FeedbackType): string => {
    switch (feedbackType) {
      case FeedbackType.CORRECT:
        return 'bg-feedback-correct text-white';
      case FeedbackType.CLOSE:
        return 'bg-feedback-close text-white';
      case FeedbackType.WRONG:
        return 'bg-feedback-wrong text-white';
      default:
        return 'bg-feedback-wrong text-white';
    }
  };

  const getDirectionArrow = (direction?: DirectionType): string => {
    if (!direction) return '';
    return direction === DirectionType.HIGHER ? '↑' : '↓';
  };

  return (
    <div 
      className="bg-white rounded-lg border-2 border-text-dark/80 shadow-md overflow-hidden
                 animate-slide-in-left motion-reduce:animate-none
                 border-l-4 border-l-warning-yellow"
      role="row" 
      aria-label={`Guess ${index + 1}: ${contestant.name}`}
    >
      {/* Queen name - always on top on mobile, inline on desktop */}
      <div 
        className="bg-gradient-to-r from-primary-pink/20 to-secondary-blue/20 
                   px-3 py-2 border-b-2 border-text-dark/30
                   sm:text-center"
      >
        <span className="font-bold text-text-dark text-base">
          {contestant.name}
        </span>
      </div>

      {/* Feedback cells - 4 column grid */}
      <div className="grid grid-cols-4 gap-0">
        {/* Season */}
        <FeedbackCell
          label="Season"
          value={contestant.season}
          feedback={feedback.season}
          direction={feedback.seasonDirection}
          getFeedbackClasses={getFeedbackClasses}
          getDirectionArrow={getDirectionArrow}
        />

        {/* Position */}
        <FeedbackCell
          label="Pos"
          value={contestant.finishingPosition}
          feedback={feedback.position}
          direction={feedback.positionDirection}
          getFeedbackClasses={getFeedbackClasses}
          getDirectionArrow={getDirectionArrow}
        />

        {/* Age */}
        <FeedbackCell
          label="Age"
          value={contestant.ageAtShow}
          feedback={feedback.age}
          direction={feedback.ageDirection}
          getFeedbackClasses={getFeedbackClasses}
          getDirectionArrow={getDirectionArrow}
        />

        {/* Hometown */}
        <FeedbackCell
          label="City"
          value={contestant.hometown}
          feedback={feedback.hometown}
          getFeedbackClasses={getFeedbackClasses}
          getDirectionArrow={getDirectionArrow}
          isHometown
        />
      </div>
    </div>
  );
};

// Individual feedback cell component
interface FeedbackCellProps {
  label: string;
  value: string | number;
  feedback: FeedbackType;
  direction?: DirectionType;
  getFeedbackClasses: (feedback: FeedbackType) => string;
  getDirectionArrow: (direction?: DirectionType) => string;
  isHometown?: boolean;
}

const FeedbackCell: React.FC<FeedbackCellProps> = ({
  label,
  value,
  feedback,
  direction,
  getFeedbackClasses,
  getDirectionArrow,
  isHometown = false,
}) => {
  const arrow = getDirectionArrow(direction);
  
  return (
    <div 
      className={`flex flex-col items-center justify-center p-2 border-r border-text-dark/20 last:border-r-0
                  ${getFeedbackClasses(feedback)}
                  min-h-[60px] sm:min-h-[70px]`}
      role="gridcell"
      aria-label={`${label}: ${value}${feedback === FeedbackType.CORRECT ? ' - Correct' : feedback === FeedbackType.CLOSE ? ' - Close' : ' - Wrong'}`}
    >
      {/* Label - visible on mobile */}
      <span className="hidden sm:block text-[10px] uppercase tracking-wide opacity-80 mb-1">
        {label}
      </span>
      
      {/* Value */}
      <span className={`font-bold ${isHometown ? 'text-xs text-center leading-tight' : 'text-sm'}`}>
        {value}
      </span>
      
      {/* Direction arrow */}
      {arrow && (
        <span 
          className="text-lg font-bold leading-none mt-1 animate-bounce-arrow motion-reduce:animate-none"
          aria-label={`Go ${direction}`}
        >
          {arrow}
        </span>
      )}
    </div>
  );
};

export default GuessRow;
