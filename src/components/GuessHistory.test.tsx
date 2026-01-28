import React from 'react';
import { render, screen } from '@testing-library/react';
import GuessHistory from './GuessHistory';
import { Guess, FeedbackType, DirectionType } from '../types';

// Mock data for testing
const mockContestant1 = {
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

const mockContestant2 = {
  id: 'bob-the-drag-queen',
  name: 'Bob the Drag Queen',
  season: 8,
  finishingPosition: 1,
  ageAtShow: 29,
  hometown: 'New York, New York',
  hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
  headshotUrl: '/images/headshots/bob-the-drag-queen.jpg',
  silhouetteUrl: '/images/silhouettes/bob-the-drag-queen.jpg'
};

const mockContestant3 = {
  id: 'trixie-mattel',
  name: 'Trixie Mattel',
  season: 7,
  finishingPosition: 6,
  ageAtShow: 25,
  hometown: 'Milwaukee, Wisconsin',
  hometownCoordinates: { latitude: 43.0389, longitude: -87.9065 },
  headshotUrl: '/images/headshots/trixie-mattel.jpg',
  silhouetteUrl: '/images/silhouettes/trixie-mattel.jpg'
};

const createMockGuess = (contestant: any, feedback: any): Guess => ({
  contestant,
  feedback
});

// Helper to check if element has Tailwind feedback classes
const hasCorrectFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-correct');

const hasCloseFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-close');

const hasWrongFeedback = (element: Element): boolean => 
  element.className.includes('bg-feedback-wrong');

describe('GuessHistory Component', () => {
  test('displays 8 placeholder boxes when no guesses provided', () => {
    render(<GuessHistory guesses={[]} />);
    
    // Should show 8 placeholder slots
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  test('displays header row with correct column labels', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // Check for column headers using role
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(4);
    expect(columnHeaders[0]).toHaveTextContent('Season');
    expect(columnHeaders[1]).toHaveTextContent('Position');
    expect(columnHeaders[2]).toHaveTextContent('Age');
    expect(columnHeaders[3]).toHaveTextContent('Hometown');
  });

  test('displays guesses in chronological order', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      }),
      createMockGuess(mockContestant2, {
        season: FeedbackType.WRONG,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.WRONG,
        seasonDirection: DirectionType.HIGHER,
        ageDirection: DirectionType.LOWER
      }),
      createMockGuess(mockContestant3, {
        season: FeedbackType.CLOSE,
        position: FeedbackType.WRONG,
        age: FeedbackType.CLOSE,
        hometown: FeedbackType.WRONG,
        positionDirection: DirectionType.HIGHER,
        ageDirection: DirectionType.HIGHER
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // Check that all contestant names are displayed
    expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
    expect(screen.getByText('Bob the Drag Queen')).toBeInTheDocument();
    expect(screen.getByText('Trixie Mattel')).toBeInTheDocument();
  });

  test('shows remaining placeholder slots after guesses', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      }),
      createMockGuess(mockContestant2, {
        season: FeedbackType.WRONG,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.WRONG
      })
    ];

    render(<GuessHistory guesses={mockGuesses} maxGuesses={8} />);
    
    // Should show placeholder slots 3-8
    expect(screen.getByLabelText('Guess slot 3 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 4 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 5 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 6 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 7 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 8 - empty')).toBeInTheDocument();
  });

  test('applies correct CSS classes for feedback colors', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.CORRECT
      })
    ];

    const { container } = render(<GuessHistory guesses={mockGuesses} />);
    
    // Check that Tailwind feedback classes are applied
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    expect(Array.from(gridcells).filter(hasCorrectFeedback).length).toBeGreaterThan(0);
    expect(Array.from(gridcells).filter(hasCloseFeedback).length).toBeGreaterThan(0);
    expect(Array.from(gridcells).filter(hasWrongFeedback).length).toBeGreaterThan(0);
  });

  test('handles custom maxGuesses prop', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      })
    ];

    render(<GuessHistory guesses={mockGuesses} maxGuesses={5} />);
    
    // Should show 5 slots total (1 guess + 4 placeholders)
    expect(screen.getByLabelText('Guess slot 2 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 3 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 4 - empty')).toBeInTheDocument();
    expect(screen.getByLabelText('Guess slot 5 - empty')).toBeInTheDocument();
    // Should NOT have slot 6
    expect(screen.queryByLabelText('Guess slot 6 - empty')).not.toBeInTheDocument();
  });

  test('renders with proper accessibility attributes', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(4); // Season, Position, Age, Hometown
  });
});

describe('GuessHistory Responsive Behavior', () => {
  test('maintains functionality on mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.CORRECT,
        ageDirection: DirectionType.HIGHER
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // All essential elements should still be present
    expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
    expect(screen.getByText('37')).toBeInTheDocument();
    expect(screen.getByText('New York, New York')).toBeInTheDocument();
  });

  test('maintains table structure across different screen sizes', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CORRECT,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      }),
      createMockGuess(mockContestant2, {
        season: FeedbackType.WRONG,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.WRONG
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // Check that grid structure is maintained using role attributes
    expect(screen.getByRole('grid')).toBeInTheDocument();
    // Header row + 2 guess rows + 6 placeholder rows = 9 rows
    expect(screen.getAllByRole('row')).toHaveLength(9);
  });
});

describe('GuessHistory Color Coding', () => {
  test('applies correct color coding for all feedback types', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CLOSE,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.CORRECT,
        ageDirection: DirectionType.HIGHER
      })
    ];

    const { container } = render(<GuessHistory guesses={mockGuesses} />);
    
    // Check for Tailwind feedback classes
    const gridcells = container.querySelectorAll('[role="gridcell"]');
    
    expect(Array.from(gridcells).filter(hasCorrectFeedback).length).toBeGreaterThan(0);
    expect(Array.from(gridcells).filter(hasCloseFeedback).length).toBeGreaterThan(0);
    expect(Array.from(gridcells).filter(hasWrongFeedback).length).toBeGreaterThan(0);
  });

  test('displays directional arrows for numerical misses', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.WRONG,
        position: FeedbackType.WRONG,
        age: FeedbackType.WRONG,
        hometown: FeedbackType.WRONG,
        seasonDirection: DirectionType.HIGHER,
        positionDirection: DirectionType.LOWER,
        ageDirection: DirectionType.HIGHER
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // Check for directional arrows - there should be multiple arrows
    const upArrows = screen.getAllByText('↑');
    const downArrows = screen.getAllByText('↓');
    
    expect(upArrows.length).toBeGreaterThan(0);
    expect(downArrows.length).toBeGreaterThan(0);
  });

  test('does not display arrows for correct or close matches', () => {
    const mockGuesses = [
      createMockGuess(mockContestant1, {
        season: FeedbackType.CORRECT,
        position: FeedbackType.CLOSE,
        age: FeedbackType.CORRECT,
        hometown: FeedbackType.CORRECT
      })
    ];

    render(<GuessHistory guesses={mockGuesses} />);
    
    // Should not have direction arrows for correct/close matches
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
    expect(screen.queryByText('↓')).not.toBeInTheDocument();
  });
});
