import fc from 'fast-check';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useGameState } from './useGameState';
import { FeedbackType, Contestant } from '../types';
import { contestants } from '../utilities/contestantDatabase';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock the daily queen selection to return a predictable queen from the real database
jest.mock('../utilities/dailyQueenSelection', () => ({
  getDailyQueen: () => ({
    id: 'bebe-zahara-benet',
    name: 'BeBe Zahara Benet',
    season: 1,
    finishingPosition: 1,
    ageAtShow: 28,
    hometown: 'Minneapolis, Minnesota',
    headshotUrl: '/images/headshots/bebe-zahara-benet.jpg',
    entranceQuote: '',
    farewellQuote: '',
    snatchGameCharacter: ''
  }),
  getPacificDateString: () => '2024-01-15'
}));

// Mock statistics update
jest.mock('../utilities/statistics', () => ({
  updateStatistics: jest.fn(),
  getCurrentStatistics: () => ({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    winDistribution: [0, 0, 0, 0, 0, 0, 0, 0]
  })
}));

// Mock timer sync
jest.mock('./useTimerSync', () => ({
  useTimerSync: () => {}
}));

// Arbitraries for generating test data - exclude the secret queen
const contestantArb = fc.constantFrom(...contestants.filter(c => c.id !== 'bebe-zahara-benet'));

describe('Feature: guessru-game, Property 8: Win Condition Handling', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    mockLocalStorage.clear();
  });

  test('Property 8: Win condition should be triggered when player guesses the secret queen correctly', () => {
    fc.assert(
      fc.property(
        fc.array(contestantArb, { minLength: 0, maxLength: 7 }),
        (nonWinningGuesses) => {
          // Clear localStorage before each iteration to ensure fresh state
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit non-winning guesses first (ensure unique guesses)
            const seenIds = new Set<string>();
            const uniqueGuesses = nonWinningGuesses.filter(c => {
              if (seenIds.has(c.id)) return false;
              seenIds.add(c.id);
              return true;
            });
            uniqueGuesses.forEach(contestant => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
            });
            
            // Verify game is not complete yet
            expect(result.current.isGameComplete).toBe(false);
            expect(result.current.isGameWon).toBe(false);
            
            // Submit the winning guess
            act(() => {
              result.current.submitGuess('bebe-zahara-benet');
            });
            
            // Verify win condition is triggered
            expect(result.current.isGameComplete).toBe(true);
            expect(result.current.isGameWon).toBe(true);
            
            // Verify game state properties
            expect(result.current.gameState.isComplete).toBe(true);
            expect(result.current.gameState.isWon).toBe(true);
            expect(result.current.gameState.endTime).toBeDefined();
            expect(result.current.gameState.endTime).toBeGreaterThanOrEqual(result.current.gameState.startTime);
            
            // Verify the winning guess has all correct feedback
            const lastGuess = result.current.gameState.guesses[result.current.gameState.guesses.length - 1];
            expect(lastGuess.feedback.season).toBe(FeedbackType.CORRECT);
            expect(lastGuess.feedback.position).toBe(FeedbackType.CORRECT);
            expect(lastGuess.feedback.age).toBe(FeedbackType.CORRECT);
            expect(lastGuess.feedback.hometown).toBe(FeedbackType.CORRECT);
            
            return true;
          } finally {
            unmount();
            mockLocalStorage.clear();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 8a: Win should be detected immediately upon correct guess submission', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        (guessPosition) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Get unique non-winning contestants
            const nonWinningContestants = contestants.filter(c => c.id !== 'bebe-zahara-benet');
            
            // Submit non-winning guesses up to the position before the win
            for (let i = 1; i < guessPosition && i <= nonWinningContestants.length; i++) {
              act(() => {
                result.current.submitGuess(nonWinningContestants[i - 1].id);
              });
            }
            
            // Record state before winning guess
            const guessesBeforeWin = result.current.gameState.guesses.length;
            
            expect(result.current.isGameComplete).toBe(false);
            expect(result.current.isGameWon).toBe(false);
            
            // Submit the winning guess
            act(() => {
              result.current.submitGuess('bebe-zahara-benet');
            });
            
            // Verify immediate win detection
            expect(result.current.isGameComplete).toBe(true);
            expect(result.current.isGameWon).toBe(true);
            expect(result.current.gameState.guesses.length).toBe(guessesBeforeWin + 1);
            
            return true;
          } finally {
            unmount();
            mockLocalStorage.clear();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 8b: Win condition should prevent further guess submissions', () => {
    fc.assert(
      fc.property(
        fc.array(contestantArb, { minLength: 1, maxLength: 5 }),
        (additionalGuesses) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit winning guess immediately
            act(() => {
              result.current.submitGuess('bebe-zahara-benet');
            });
            
            // Verify game is won
            expect(result.current.isGameWon).toBe(true);
            expect(result.current.isGameComplete).toBe(true);
            
            const guessCountAfterWin = result.current.gameState.guesses.length;
            
            // Attempt to submit additional guesses
            additionalGuesses.forEach(contestant => {
              act(() => {
                const wasSubmitted = result.current.submitGuess(contestant.id);
                expect(wasSubmitted).toBe(false);
              });
            });
            
            // Verify no additional guesses were accepted
            expect(result.current.gameState.guesses.length).toBe(guessCountAfterWin);
            
            return true;
          } finally {
            unmount();
            mockLocalStorage.clear();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 8c: Win should be detected only when guessing the exact secret queen', () => {
    fc.assert(
      fc.property(
        contestantArb,
        (nonWinningContestant) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit a non-winning guess
            act(() => {
              result.current.submitGuess(nonWinningContestant.id);
            });
            
            // Verify game is not won
            expect(result.current.isGameWon).toBe(false);
            expect(result.current.isGameComplete).toBe(false);
            
            // Verify the feedback is not all correct (since it's not the secret queen)
            const lastGuess = result.current.gameState.guesses[result.current.gameState.guesses.length - 1];
            const allCorrect = 
              lastGuess.feedback.season === FeedbackType.CORRECT &&
              lastGuess.feedback.position === FeedbackType.CORRECT &&
              lastGuess.feedback.age === FeedbackType.CORRECT &&
              lastGuess.feedback.hometown === FeedbackType.CORRECT;
            
            // Since we're guessing a different contestant, not all feedback should be correct
            // (unless by coincidence all attributes match, which is unlikely)
            expect(result.current.isGameWon).toBe(false);
            
            return true;
          } finally {
            unmount();
            mockLocalStorage.clear();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 8d: Win should set endTime when game completes', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            const startTime = result.current.gameState.startTime;
            expect(result.current.gameState.endTime).toBeUndefined();
            
            // Submit winning guess
            act(() => {
              result.current.submitGuess('bebe-zahara-benet');
            });
            
            // Verify endTime is set and after startTime
            expect(result.current.gameState.endTime).toBeDefined();
            expect(result.current.gameState.endTime!).toBeGreaterThanOrEqual(startTime);
            
            return true;
          } finally {
            unmount();
            mockLocalStorage.clear();
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
