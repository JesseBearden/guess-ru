import fc from 'fast-check';
import { GameState, Statistics, FeedbackType, DirectionType } from '../types';
import { updateStatistics, calculateWinPercentage, resetStatistics, getCurrentStatistics } from './statistics';
import { saveStatistics } from './localStorage';

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

// Arbitraries for generating test data
const contestantArb = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  season: fc.integer({ min: 1, max: 16 }),
  finishingPosition: fc.integer({ min: 1, max: 14 }),
  ageAtShow: fc.integer({ min: 18, max: 65 }),
  hometown: fc.string({ minLength: 1 }),
  hometownCoordinates: fc.record({
    latitude: fc.double({ min: -90, max: 90 }),
    longitude: fc.double({ min: -180, max: 180 })
  }),
  headshotUrl: fc.webUrl(),
  entranceQuote: fc.option(fc.string(), { nil: undefined }),
  farewellQuote: fc.option(fc.string(), { nil: undefined }),
  snatchGameCharacter: fc.option(fc.string(), { nil: undefined })
});

const feedbackArb = fc.record({
  season: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  position: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  age: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  hometown: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.WRONG) as fc.Arbitrary<FeedbackType.CORRECT | FeedbackType.WRONG>,
  seasonDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined }),
  positionDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined }),
  ageDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined })
});

const guessArb = fc.record({
  contestant: contestantArb,
  feedback: feedbackArb
});

const completedGameStateArb = fc.record({
  secretQueen: contestantArb,
  guesses: fc.array(guessArb, { minLength: 1, maxLength: 8 }),
  isComplete: fc.constant(true),
  isWon: fc.boolean(),
  startTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
  endTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
  gameDate: fc.date().map(d => d.toISOString().split('T')[0])
}).map(state => ({
  ...state,
  endTime: Math.max(state.startTime, state.endTime)
}));

const winningGameStateArb = completedGameStateArb.map(state => ({
  ...state,
  isWon: true,
  guesses: state.guesses.map((guess, index) => {
    // Make the last guess a winning guess
    if (index === state.guesses.length - 1) {
      return {
        ...guess,
        feedback: {
          season: FeedbackType.CORRECT,
          position: FeedbackType.CORRECT,
          age: FeedbackType.CORRECT,
          hometown: FeedbackType.CORRECT as FeedbackType.CORRECT | FeedbackType.WRONG
        }
      };
    }
    return guess;
  })
}));

const losingGameStateArb = completedGameStateArb.map(state => ({
  ...state,
  isWon: false,
  guesses: Array(8).fill(null).map(() => ({
    contestant: {
      id: 'test-id',
      name: 'Test Queen',
      season: 1,
      finishingPosition: 8,
      ageAtShow: 25,
      hometown: 'Test City',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: 'https://example.com/headshot.jpg',
      entranceQuote: '',
      farewellQuote: '',
      snatchGameCharacter: ''
    },
    feedback: {
      season: FeedbackType.WRONG,
      position: FeedbackType.WRONG,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG as FeedbackType.CORRECT | FeedbackType.WRONG,
      seasonDirection: DirectionType.HIGHER as DirectionType | undefined,
      positionDirection: DirectionType.LOWER as DirectionType | undefined,
      ageDirection: DirectionType.HIGHER as DirectionType | undefined
    }
  }))
}));

describe('Feature: guessru-game, Property 18: Statistics Tracking Accuracy', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    resetStatistics();
  });

  test('Property 18: Statistics should accurately track games played, wins, streaks, and guess distribution', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(winningGameStateArb, losingGameStateArb), { minLength: 1, maxLength: 20 }),
        (gameStates) => {
          // Reset statistics before each test
          resetStatistics();
          
          let expectedGamesPlayed = 0;
          let expectedGamesWon = 0;
          let expectedCurrentStreak = 0;
          let expectedMaxStreak = 0;
          let expectedWinDistribution = [0, 0, 0, 0, 0, 0, 0, 0];
          
          // Process each game state and track expected values
          for (const gameState of gameStates) {
            const statsBefore = updateStatistics(gameState);
            
            expectedGamesPlayed += 1;
            
            if (gameState.isWon) {
              expectedGamesWon += 1;
              expectedCurrentStreak += 1;
              expectedMaxStreak = Math.max(expectedMaxStreak, expectedCurrentStreak);
              
              // Update win distribution
              const guessCount = gameState.guesses.length;
              if (guessCount >= 1 && guessCount <= 8) {
                expectedWinDistribution[guessCount - 1] += 1;
              }
            } else {
              expectedCurrentStreak = 0;
            }
            
            // Verify statistics are correct after this game
            expect(statsBefore.gamesPlayed).toBe(expectedGamesPlayed);
            expect(statsBefore.gamesWon).toBe(expectedGamesWon);
            expect(statsBefore.currentStreak).toBe(expectedCurrentStreak);
            expect(statsBefore.maxStreak).toBe(expectedMaxStreak);
            expect(statsBefore.winDistribution).toEqual(expectedWinDistribution);
          }
          
          // Verify final statistics by loading from storage (don't call updateStatistics again)
          const finalStats = getCurrentStatistics();
          expect(finalStats.gamesPlayed).toBe(expectedGamesPlayed);
          expect(finalStats.gamesWon).toBe(expectedGamesWon);
          expect(finalStats.currentStreak).toBe(expectedCurrentStreak);
          expect(finalStats.maxStreak).toBe(expectedMaxStreak);
          expect(finalStats.winDistribution).toEqual(expectedWinDistribution);
          
          // Verify win percentage calculation
          const expectedWinPercentage = expectedGamesPlayed > 0 
            ? Math.round((expectedGamesWon / expectedGamesPlayed) * 100) 
            : 0;
          expect(calculateWinPercentage(finalStats)).toBe(expectedWinPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 18a: Statistics should handle single game completion correctly', () => {
    fc.assert(
      fc.property(
        completedGameStateArb,
        (gameState) => {
          resetStatistics();
          
          const updatedStats = updateStatistics(gameState);
          
          // Games played should increment by 1
          expect(updatedStats.gamesPlayed).toBe(1);
          
          if (gameState.isWon) {
            // Win-related assertions
            expect(updatedStats.gamesWon).toBe(1);
            expect(updatedStats.currentStreak).toBe(1);
            expect(updatedStats.maxStreak).toBe(1);
            
            // Win distribution should be updated
            const guessCount = gameState.guesses.length;
            if (guessCount >= 1 && guessCount <= 8) {
              expect(updatedStats.winDistribution[guessCount - 1]).toBe(1);
              // All other distribution slots should be 0
              updatedStats.winDistribution.forEach((count, index) => {
                if (index !== guessCount - 1) {
                  expect(count).toBe(0);
                }
              });
            }
          } else {
            // Loss-related assertions
            expect(updatedStats.gamesWon).toBe(0);
            expect(updatedStats.currentStreak).toBe(0);
            expect(updatedStats.maxStreak).toBe(0);
            
            // Win distribution should remain all zeros
            expect(updatedStats.winDistribution).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 18b: Statistics should maintain streak correctly across wins and losses', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 3, maxLength: 10 }),
        (winLossSequence) => {
          resetStatistics();
          
          let expectedCurrentStreak = 0;
          let expectedMaxStreak = 0;
          let expectedWins = 0;
          
          winLossSequence.forEach((isWin, index) => {
            // Create a mock game state
            const mockGameState: GameState = {
              secretQueen: {
                id: 'secret-queen',
                name: 'Secret Queen',
                season: 1,
                finishingPosition: 1,
                ageAtShow: 30,
                hometown: 'Secret City',
                hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
                headshotUrl: 'https://example.com/secret.jpg',
                entranceQuote: '',
                farewellQuote: '',
                snatchGameCharacter: ''
              },
              guesses: [{ 
                contestant: {
                  id: 'guess-queen',
                  name: 'Guess Queen',
                  season: 2,
                  finishingPosition: 2,
                  ageAtShow: 25,
                  hometown: 'Guess City',
                  hometownCoordinates: { latitude: 34.0522, longitude: -118.2437 },
                  headshotUrl: 'https://example.com/guess.jpg',
                  entranceQuote: '',
                  farewellQuote: '',
                  snatchGameCharacter: ''
                }, 
                feedback: {
                  season: isWin ? FeedbackType.CORRECT : FeedbackType.WRONG,
                  position: isWin ? FeedbackType.CORRECT : FeedbackType.WRONG,
                  age: isWin ? FeedbackType.CORRECT : FeedbackType.WRONG,
                  hometown: (isWin ? FeedbackType.CORRECT : FeedbackType.WRONG) as FeedbackType.CORRECT | FeedbackType.WRONG
                }
              }],
              isComplete: true,
              isWon: isWin,
              startTime: Date.now(),
              endTime: Date.now(),
              gameDate: new Date().toISOString().split('T')[0]
            };
            
            if (isWin) {
              expectedCurrentStreak += 1;
              expectedMaxStreak = Math.max(expectedMaxStreak, expectedCurrentStreak);
              expectedWins += 1;
            } else {
              expectedCurrentStreak = 0;
            }
            
            const stats = updateStatistics(mockGameState);
            
            expect(stats.currentStreak).toBe(expectedCurrentStreak);
            expect(stats.maxStreak).toBe(expectedMaxStreak);
            expect(stats.gamesWon).toBe(expectedWins);
            expect(stats.gamesPlayed).toBe(index + 1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 18c: Statistics should reject incomplete games', () => {
    fc.assert(
      fc.property(
        completedGameStateArb.map(state => ({ ...state, isComplete: false })),
        (incompleteGameState) => {
          resetStatistics();
          
          expect(() => updateStatistics(incompleteGameState)).toThrow('Cannot update statistics for incomplete game');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 18d: Win percentage calculation should be accurate', () => {
    fc.assert(
      fc.property(
        fc.record({
          gamesPlayed: fc.integer({ min: 0, max: 1000 }),
          gamesWon: fc.integer({ min: 0, max: 1000 })
        }).filter(({ gamesPlayed, gamesWon }) => gamesWon <= gamesPlayed),
        ({ gamesPlayed, gamesWon }) => {
          const mockStats: Statistics = {
            gamesPlayed,
            gamesWon,
            currentStreak: 0,
            maxStreak: 0,
            winDistribution: [0, 0, 0, 0, 0, 0, 0, 0]
          };
          
          const expectedPercentage = gamesPlayed > 0 
            ? Math.round((gamesWon / gamesPlayed) * 100) 
            : 0;
          
          expect(calculateWinPercentage(mockStats)).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });
});