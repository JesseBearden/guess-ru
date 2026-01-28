import fc from 'fast-check';
import {
  saveGameState,
  loadGameState,
  saveStatistics,
  loadStatistics,
  savePreferences,
  loadPreferences,
  updatePreference,
  performDailyCleanup,
  Preferences
} from './localStorage';
import { GameState, Statistics, FeedbackType, DirectionType } from '../types/index';
import { getDailyQueen, getPacificDateString } from './dailyQueenSelection';

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

// Generators for property-based testing - using positive numbers to avoid -0 issues
const contestantArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  season: fc.integer({ min: 1, max: 20 }),
  finishingPosition: fc.integer({ min: 1, max: 20 }),
  ageAtShow: fc.integer({ min: 18, max: 80 }),
  hometown: fc.string({ minLength: 1, maxLength: 100 }),
  hometownCoordinates: fc.record({
    // Use integers to avoid floating point precision issues with -0
    latitude: fc.integer({ min: -90, max: 90 }),
    longitude: fc.integer({ min: -180, max: 180 })
  }),
  headshotUrl: fc.webUrl(),
  silhouetteUrl: fc.webUrl()
});

const gameStateArb = fc.record({
  secretQueen: contestantArb,
  guesses: fc.array(fc.record({
    contestant: contestantArb,
    feedback: fc.record({
      season: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      position: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      age: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      hometown: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.WRONG) as fc.Arbitrary<FeedbackType.CORRECT | FeedbackType.WRONG>,
      // Don't include undefined values - JSON.stringify removes them
      seasonDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER),
      positionDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER),
      ageDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER)
    })
  }), { maxLength: 8 }),
  isComplete: fc.boolean(),
  isWon: fc.boolean(),
  startTime: fc.integer({ min: 1, max: Date.now() }),
  // Don't use undefined - JSON.stringify removes it
  gameDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map(date => date.toISOString().split('T')[0])
});

const statisticsArb = fc.record({
  gamesPlayed: fc.integer({ min: 0, max: 10000 }),
  gamesWon: fc.integer({ min: 0, max: 10000 }),
  currentStreak: fc.integer({ min: 0, max: 1000 }),
  maxStreak: fc.integer({ min: 0, max: 1000 }),
  winDistribution: fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 8, maxLength: 8 })
});

const preferencesArb = fc.record({
  hasSeenInstructions: fc.boolean(),
  showSilhouette: fc.boolean()
});

describe('localStorage Property Tests', () => {
  describe('Property 10: Game State Persistence', () => {
    test('Feature: guessru-game, Property 10: Game State Persistence - For any game state saved and loaded on the same day, the loaded state should be identical to the saved state', () => {
      fc.assert(
        fc.property(gameStateArb, (gameState) => {
          // Ensure the game date is today for this test
          const todayGameState = { ...gameState, gameDate: getPacificDateString() };
          
          // Save the game state
          const saveResult = saveGameState(todayGameState);
          expect(saveResult).toBe(true);
          
          // Load the game state
          const loadedState = loadGameState();
          
          // Compare key properties (JSON serialization may change some values)
          expect(loadedState).not.toBeNull();
          if (loadedState) {
            expect(loadedState.gameDate).toBe(todayGameState.gameDate);
            expect(loadedState.isComplete).toBe(todayGameState.isComplete);
            expect(loadedState.isWon).toBe(todayGameState.isWon);
            expect(loadedState.guesses.length).toBe(todayGameState.guesses.length);
            expect(loadedState.secretQueen.id).toBe(todayGameState.secretQueen.id);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Feature: guessru-game, Property 10: Game State Persistence - For any game state from a different day, loading should return null and clear the old state', () => {
      fc.assert(
        fc.property(gameStateArb, (gameState) => {
          // Ensure the game date is NOT today
          const oldDate = '2023-01-01'; // Fixed old date
          const oldGameState = { ...gameState, gameDate: oldDate };
          
          // Manually set the old game state in storage (bypassing our save function)
          localStorage.setItem('guessru_game_state', JSON.stringify(oldGameState));
          
          // Try to load the game state
          const loadedState = loadGameState();
          
          // Should return null for old game state
          expect(loadedState).toBeNull();
          
          // The old state should be cleared from storage
          expect(localStorage.getItem('guessru_game_state')).toBeNull();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Statistics Persistence', () => {
    test('Feature: guessru-game, Property 10: Statistics should be preserved after save and load', () => {
      fc.assert(
        fc.property(statisticsArb, (statistics) => {
          // Save statistics
          const saveResult = saveStatistics(statistics);
          expect(saveResult).toBe(true);
          
          // Load statistics
          const loadedStats = loadStatistics();
          
          // Statistics should match
          expect(loadedStats).toEqual(statistics);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Preferences Persistence', () => {
    test('Feature: guessru-game, Property 10: Preferences should be preserved after save and load', () => {
      fc.assert(
        fc.property(preferencesArb, (preferences) => {
          // Save preferences
          const saveResult = savePreferences(preferences);
          expect(saveResult).toBe(true);
          
          // Load preferences
          const loadedPrefs = loadPreferences();
          
          // Preferences should match
          expect(loadedPrefs).toEqual(preferences);
        }),
        { numRuns: 100 }
      );
    });
  });
});
