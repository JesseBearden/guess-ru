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
  silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
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
    
    expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
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
    
    const wrongElements = Array.from(gridcells).filter(hasWrongFeedback);
    expect(wrongElements).toHaveLength(1); // Hometown should be wrong
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
    
    const wrongElements = Array.from(gridcells).filter(hasWrongFeedback);
    expect(wrongElements).toHaveLength(4); // All 4 attributes should be wrong
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

    render(<GuessRow guess={mockGuess} index={0} />);
    
    const upArrows = screen.getAllByText('↑');
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

    render(<GuessRow guess={mockGuess} index={0} />);
    
    const downArrows = screen.getAllByText('↓');
    expect(downArrows).toHaveLength(3); // Season, position, age should all have down arrows
  });

  test('does not display arrows when no direction provided', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.CORRECT,
      hometown: FeedbackType.CORRECT
    });

    render(<GuessRow guess={mockGuess} index={0} />);
    
    // Check that no arrows are present
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });

  test('displays mixed feedback types correctly', () => {
    const mockGuess = createMockGuess({
      season: FeedbackType.CORRECT,
      position: FeedbackType.CLOSE,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG,
      ageDirection: DirectionType.HIGHER
    });

    const { container } = render(<GuessRow guess={mockGuess} index={0} />);
    
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    expect(Array.from(gridcells).filter(hasCorrectFeedback)).toHaveLength(1); // Season
    expect(Array.from(gridcells).filter(hasCloseFeedback)).toHaveLength(1); // Position
    expect(Array.from(gridcells).filter(hasWrongFeedback)).toHaveLength(2); // Age and hometown
    
    expect(screen.getByText('↑')).toBeInTheDocument(); // Age direction arrow
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
    expect(screen.getAllByRole('gridcell')).toHaveLength(4); // 4 feedback cells
    
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
    
    expect(screen.getByLabelText('Season: 6 - Correct')).toBeInTheDocument();
    expect(screen.getByLabelText('Pos: 1 - Close')).toBeInTheDocument();
    expect(screen.getByLabelText('Age: 37 - Wrong')).toBeInTheDocument();
    expect(screen.getByLabelText('City: New York, New York - Correct')).toBeInTheDocument();
    expect(screen.getByLabelText('Go higher')).toBeInTheDocument();
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
    
    expect(screen.getByText('A Very Long Drag Queen Name That Might Wrap')).toBeInTheDocument();
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
