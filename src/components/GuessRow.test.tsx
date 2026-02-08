import React from 'react';
import { render, screen } from '@testing-library/react';
import GuessRow from './GuessRow';
import { Guess, FeedbackType, DirectionType } from '../types';

// Mock data for testing
const mockContestant = {
  id: 'bianca-del-rio',
  name: 'Bianca Del Rio',
  season: 6,
  finishingPosition: 1,
  ageAtShow: 37,
  hometown: 'New York, New York',
  hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
  headshotUrl: '/images/headshots/bianca-del-rio.jpg',
  entranceQuote: '',
  farewellQuote: '',
  snatchGameCharacter: ''
};

const createMockGuess = (feedback: any): Guess => ({
  contestant: mockContestant,
  feedback
});

// Helper to check if element has Tailwind feedback classes
const hasCorrectFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-correct');

const hasCloseFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-close');

const hasWrongFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-wrong');

describe('GuessRow Component', () => {
  test('renders contestant name and attributes', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CORRECT,
      age: FeedbackType.CORRECT,
      hometown: FeedbackType.CORRECT
    });

    render(<GuessRow guess={mockGuess} index={0} />);
    
    // Name appears twice (mobile + desktop), so use getAllByText
    expect(screen.getAllByText('Bianca Del Rio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('6')).toBeInTheDocument(); // Season
    expect(screen.getByText('1')).toBeInTheDocument(); // Position
    expect(screen.getByText('37')).toBeInTheDocument(); // Age
    expect(screen.getByText('New York, New York')).toBeInTheDocument(); // Hometown
  });

  test('applies correct CSS class for correct feedback', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CORRECT,
      age: FeedbackType.CORRECT,
      hometown: FeedbackType.CORRECT
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    // Get all gridcells (4 feedback cells)
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    const correctElements = Array.from(gridcells).filter(hasCorrectFeedback);
    expect(correctElements).toHaveLength(4); // All 4 attributes should be correct
  });

  test('applies correct CSS class for close feedback', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CLOSE,
      position: FeedbackType.CLOSE,
      age: FeedbackType.CLOSE,
      hometown: FeedbackType.WRONG // Hometown can't be close, only correct or wrong
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    const closeElements = Array.from(gridcells).filter(hasCloseFeedback);
    expect(closeElements).toHaveLength(3); // Season, position, age should be close
    
    // Wrong feedback uses bg-white, not bg-feedback-wrong
    const correctElements = Array.from(gridcells).filter(hasCorrectFeedback);
    expect(correctElements).toHaveLength(0); // No correct feedback
  });

  test('applies correct CSS class for wrong feedback', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.WRONG,
      position: FeedbackType.WRONG,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    // Wrong feedback doesn't have a special background class - it uses bg-white
    // So we check that none have correct or close feedback
    const correctElements = Array.from(gridcells).filter(hasCorrectFeedback);
    const closeElements = Array.from(gridcells).filter(hasCloseFeedback);
    expect(correctElements).toHaveLength(0);
    expect(closeElements).toHaveLength(0);
  });

  test('displays upward arrow for higher direction', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.WRONG,
      position: FeedbackType.WRONG,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG,
      seasonDirection: DirectionType.HIGHER,
      positionDirection: DirectionType.HIGHER,
      ageDirection: DirectionType.HIGHER
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    // Arrows are now SVG icons from lucide-react, look for lucide-arrow-up class
    const upArrows = container.querySelectorAll('.lucide-arrow-up');
    expect(upArrows).toHaveLength(3); // Season, position, age should all have up arrows
  });

  test('displays downward arrow for lower direction', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.WRONG,
      position: FeedbackType.WRONG,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG,
      seasonDirection: DirectionType.LOWER,
      positionDirection: DirectionType.LOWER,
      ageDirection: DirectionType.LOWER
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    // Arrows are now SVG icons from lucide-react, look for lucide-arrow-down class
    const downArrows = container.querySelectorAll('.lucide-arrow-down');
    expect(downArrows).toHaveLength(3); // Season, position, age should all have down arrows
  });

  test('does not display arrows when no direction provided', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.CORRECT,
      hometown: FeedbackType.CORRECT
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    // Check that no arrow SVGs are present
    expect(container.querySelectorAll('.lucide-arrow-up')).toHaveLength(0);
    expect(container.querySelectorAll('.lucide-arrow-down')).toHaveLength(0);
  });

  test('displays mixed feedback types correctly', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.CORRECT,
      ageDirection: DirectionType.HIGHER
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    // Name cell + 4 feedback cells = 5 total, but name cell has no feedback class
    // Season (correct) + Hometown (correct) = 2 correct
    expect(Array.from(gridcells).filter(hasCorrectFeedback)).toHaveLength(2);
    expect(Array.from(gridcells).filter(hasCloseFeedback)).toHaveLength(1); // Position
    
    // Arrow for age direction
    expect(container.querySelectorAll('.lucide-arrow-up')).toHaveLength(1);
  });

  test('renders with proper accessibility attributes', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.CORRECT,
      ageDirection: DirectionType.HIGHER
    });

    render(<GuessRow guess={mockGuess} index={0} />);
    
    expect(screen.getByRole('row')).toBeInTheDocument();
    // 5 gridcells: Name + Season + Position + Age + Hometown
    expect(screen.getAllByRole('gridcell')).toHaveLength(5);
    
    // Check aria-label for the row
    expect(screen.getByLabelText('Guess 1: Bianca Del Rio')).toBeInTheDocument();
  });

  test('provides descriptive aria-labels for feedback', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.CORRECT,
      ageDirection: DirectionType.HIGHER
    });

    render(<GuessRow guess={mockGuess} index={0} />);
    
    // The aria-labels are now simpler: "value - Feedback" format
    expect(screen.getByLabelText('6 - Correct')).toBeInTheDocument();
    expect(screen.getByLabelText('1 - Close')).toBeInTheDocument();
    expect(screen.getByLabelText('37')).toBeInTheDocument(); // Wrong has no suffix
    expect(screen.getByLabelText('New York, New York - Correct')).toBeInTheDocument();
  });

  test('handles different index values correctly', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CORRECT,
      age: FeedbackType.CORRECT,
      hometown: FeedbackType.CORRECT
    });

    const { rerender } = render(<GuessRow guess={mockGuess} index={0} />);
    expect(screen.getByLabelText('Guess 1: Bianca Del Rio')).toBeInTheDocument();

    rerender(<GuessRow guess={mockGuess} index={4} />);
    expect(screen.getByLabelText('Guess 5: Bianca Del Rio')).toBeInTheDocument();
  });

  test('handles long contestant names and hometowns', () => {
    const longNameContestant = {
      ...mockContestant,
      name: 'A Very Long Drag Queen Name That Might Wrap',
      hometown: 'A Very Long City Name, A Very Long State Name'
    };

    const mockGuess: Guess = {
      contestant: longNameContestant,
      feedback: {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      }
    };

    render(<GuessRow guess={mockGuess} index={0} />);
    
    // Name appears twice (mobile + desktop), so use getAllByText
    expect(screen.getAllByText('A Very Long Drag Queen Name That Might Wrap').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('A Very Long City Name, A Very Long State Name')).toBeInTheDocument();
  });

  test('handles edge case numerical values', () => {
    const edgeCaseContestant = {
      ...mockContestant,
      season: 1,
      finishingPosition: 14,
      ageAtShow: 21
    };

    const mockGuess: Guess = {
      contestant: edgeCaseContestant,
      feedback: {
        season: FeedbackType.WRONG,
        position: FeedbackType.WRONG,
        age: FeedbackType.CLOSE,
        hometown: FeedbackType.WRONG,
        seasonDirection: DirectionType.HIGHER,
        positionDirection: DirectionType.LOWER
      }
    };

    render(<GuessRow guess={mockGuess} index={0} />);
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Season
    expect(screen.getByText('14')).toBeInTheDocument(); // Position
    expect(screen.getByText('21')).toBeInTheDocument(); // Age
  });
});
