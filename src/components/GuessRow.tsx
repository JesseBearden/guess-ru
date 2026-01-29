import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Guess, FeedbackType, DirectionType } from '../types';

interface GuessRowProps {
  guess: Guess;
  index: number;
}

const GuessRow: React.FC<GuessRowProps> = ({ guess, index }) => {
  const { contestant, feedback } = guess;

  return (
    <div 
      className="rounded-lg border-2 border-text-dark overflow-hidden
                 animate-slide-in-left motion-reduce:animate-none"
      role="row" 
      aria-label={`Guess ${index + 1}: ${contestant.name}`}
    >
      {/* Mobile: Name above the row - centered */}
      <div className="md:hidden bg-white border-b-2 border-text-dark px-3 py-2 text-center">
        <span className="font-bold text-text-dark text-sm">
          {contestant.name}
        </span>
      </div>

      {/* Desktop: 5 column grid with name | Mobile: 4 column grid without name */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-0">
        {/* Name - Desktop only */}
        <div 
          className="hidden md:flex items-center justify-center p-2 border-r border-text-dark bg-white min-h-[50px] rounded-l-md"
          role="gridcell"
        >
          <span className="font-bold text-text-dark text-sm text-center">
            {contestant.name}
          </span>
        </div>

        {/* Season */}
        <FeedbackCell
          value={contestant.season}
          feedback={feedback.season}
          direction={feedback.seasonDirection}
        />

        {/* Position */}
        <FeedbackCell
          value={contestant.finishingPosition}
          feedback={feedback.position}
          direction={feedback.positionDirection}
        />

        {/* Age */}
        <FeedbackCell
          value={contestant.ageAtShow}
          feedback={feedback.age}
          direction={feedback.ageDirection}
        />

        {/* Hometown */}
        <FeedbackCell
          value={contestant.hometown}
          feedback={feedback.hometown}
          isHometown
          isLast
        />
      </div>
    </div>
  );
};

// Individual feedback cell component
interface FeedbackCellProps {
  value: string | number;
  feedback: FeedbackType;
  direction?: DirectionType;
  isHometown?: boolean;
  isLast?: boolean;
}

const FeedbackCell: React.FC<FeedbackCellProps> = ({
  value,
  feedback,
  direction,
  isHometown = false,
  isLast = false,
}) => {
  const feedbackLabel = feedback === FeedbackType.CORRECT ? ' - Correct' : feedback === FeedbackType.CLOSE ? ' - Close' : '';
  
  const getBgClass = () => {
    switch (feedback) {
      case FeedbackType.CORRECT:
        return 'bg-feedback-correct text-white';
      case FeedbackType.CLOSE:
        return 'bg-feedback-close text-white';
      default:
        return 'bg-white text-text-dark';
    }
  };

  const renderDirectionIcon = () => {
    if (!direction) return null;
    const IconComponent = direction === DirectionType.HIGHER ? ArrowUp : ArrowDown;
    return (
      <IconComponent 
        size={20} 
        strokeWidth={3}
        className="ml-1 inline-block"
      />
    );
  };
  
  return (
    <div 
      className={`flex items-center justify-center p-2 ${isLast ? 'rounded-r-md' : 'border-r border-text-dark'}
                  min-h-[50px] ${getBgClass()}`}
      role="gridcell"
      aria-label={`${value}${feedbackLabel}`}
    >
      <span className={`font-bold ${isHometown ? 'text-xs text-center leading-tight' : 'text-sm'}`}>
        {value}
      </span>
      {renderDirectionIcon()}
    </div>
  );
};

export default GuessRow;
