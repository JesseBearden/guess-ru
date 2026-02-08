import fc from 'fast-check';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useGameState } from './useGameState';
import { FeedbackType } from '../types';
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

// Mock the daily queen selection to return a predictable queen
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

// Get non-winning contestants (exclude the secret queen)
const nonWinningContestants = contestants.filter(c => c.id !== 'bebe-zahara-benet');

describe('Feature: guessru-game, Property 9: Loss Condition Handling', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    mockLocalStorage.clear();
  });

  test('Property 9: Loss condition should be triggered when player reaches 8 incorrect guesses', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit 8 non-winning guesses
            eightContestants.forEach((contestant, index) => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
              
              // Check game state after each guess
              if (index < 7) {
                // Game should not be complete yet
                expect(result.current.isGameComplete).toBe(false);
                expect(result.current.isGameWon).toBe(false);
              } else {
                // After 8th guess, game should be complete and lost
                expect(result.current.isGameComplete).toBe(true);
                expect(result.current.isGameWon).toBe(false);
                expect(result.current.gameState.endTime).toBeDefined();
              }
            });
            
            // Verify final state
            expect(result.current.gameState.guesses.length).toBe(8);
            expect(result.current.remainingGuesses).toBe(0);
            
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

  test('Property 9a: Loss should be detected exactly at the 8th incorrect guess', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit exactly 8 guesses
            eightContestants.forEach((contestant, index) => {
              const guessNumber = index + 1;
              
              act(() => {
                result.current.submitGuess(contestant.id);
              });
              
              if (guessNumber < 8) {
                // Should not be complete yet
                expect(result.current.isGameComplete).toBe(false);
                expect(result.current.gameState.guesses.length).toBe(guessNumber);
              } else {
                // Should be complete and lost at exactly 8 guesses
                expect(result.current.isGameComplete).toBe(true);
                expect(result.current.isGameWon).toBe(false);
                expect(result.current.gameState.guesses.length).toBe(8);
              }
            });
            
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

  test('Property 9b: Loss condition should prevent further guess submissions', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit 8 guesses to trigger loss
            eightContestants.forEach(contestant => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
            });
            
            // Verify game is lost
            expect(result.current.isGameComplete).toBe(true);
            expect(result.current.isGameWon).toBe(false);
            expect(result.current.gameState.guesses.length).toBe(8);
            
            // Attempt to submit additional guess
            const additionalContestant = nonWinningContestants.find(c => 
              !eightContestants.some(ec => ec.id === c.id)
            );
            
            if (additionalContestant) {
              act(() => {
                const wasSubmitted = result.current.submitGuess(additionalContestant.id);
                expect(wasSubmitted).toBe(false);
              });
              
              // Verify no additional guesses were accepted
              expect(result.current.gameState.guesses.length).toBe(8);
            }
            
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

  test('Property 9c: Loss should set endTime when game completes', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            const startTime = result.current.gameState.startTime;
            expect(result.current.gameState.endTime).toBeUndefined();
            
            // Submit 8 guesses to trigger loss
            eightContestants.forEach(contestant => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
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
      { numRuns: 50 }
    );
  });

  test('Property 9d: Loss should not occur before 8 guesses are made', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 7 }),
        (numGuesses) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit fewer than 8 guesses
            for (let i = 0; i < numGuesses; i++) {
              act(() => {
                result.current.submitGuess(nonWinningContestants[i].id);
              });
            }
            
            // Game should not be complete
            expect(result.current.isGameComplete).toBe(false);
            expect(result.current.isGameWon).toBe(false);
            expect(result.current.gameState.endTime).toBeUndefined();
            expect(result.current.gameState.guesses.length).toBe(numGuesses);
            expect(result.current.remainingGuesses).toBe(8 - numGuesses);
            
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

  test('Property 9e: Loss should reveal the secret queen information', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit 8 guesses to trigger loss
            eightContestants.forEach(contestant => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
            });
            
            // Verify game is lost and secret queen is accessible
            expect(result.current.isGameComplete).toBe(true);
            expect(result.current.isGameWon).toBe(false);
            
            // Verify secret queen information is available
            const secretQueen = result.current.gameState.secretQueen;
            expect(secretQueen).toBeDefined();
            expect(secretQueen.id).toBe('bebe-zahara-benet');
            expect(secretQueen.name).toBe('BeBe Zahara Benet');
            
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

  test('Property 9f: All guesses in a losing game should have non-winning feedback', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(nonWinningContestants, { minLength: 8, maxLength: 8 }),
        (eightContestants) => {
          // Clear localStorage before each iteration
          mockLocalStorage.clear();
          
          const { result, unmount } = renderHook(() => useGameState());
          
          try {
            // Submit 8 guesses to trigger loss
            eightContestants.forEach(contestant => {
              act(() => {
                result.current.submitGuess(contestant.id);
              });
            });
            
            // Verify game is lost
            expect(result.current.isGameWon).toBe(false);
            expect(result.current.gameState.guesses.length).toBe(8);
            
            // Verify none of the guesses are winning guesses
            result.current.gameState.guesses.forEach(guess => {
              const isWinningGuess = 
                guess.feedback.season === FeedbackType.CORRECT &&
                guess.feedback.position === FeedbackType.CORRECT &&
                guess.feedback.age === FeedbackType.CORRECT &&
                guess.feedback.hometown === FeedbackType.CORRECT;
              
              expect(isWinningGuess).toBe(false);
            });
            
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
});
