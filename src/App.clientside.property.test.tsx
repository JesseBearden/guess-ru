import fc from 'fast-check';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';
import { GameState, Statistics, FeedbackType, DirectionType, Contestant } from './types';
import { contestants } from './utilities/contestantDatabase';
import { getDailyQueen, getPacificDateString } from './utilities/dailyQueenSelection';
import { saveGameState, loadGameState, saveStatistics, loadStatistics, savePreferences, loadPreferences } from './utilities/localStorage';

/**
 * Property 15: Client-Side Architecture
 * For any game functionality, it should operate entirely in the browser without requiring server-side processing
 * **Validates: Requirements 10.2**
 */

// Mock fetch to detect any server calls
const originalFetch = global.fetch;
let fetchCalls: string[] = [];

beforeAll(() => {
  // Override fetch to track any server calls
  global.fetch = jest.fn((url: string) => {
    fetchCalls.push(url);
    return Promise.reject(new Error('Network request detected - app should be client-side only'));
  }) as jest.Mock;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  localStorage.clear();
  fetchCalls = [];
});

// Generators for property-based testing
const contestantArb = fc.constantFrom(...contestants);

const guessCountArb = fc.integer({ min: 0, max: 8 });

const gameStateArb = fc.record({
  secretQueen: contestantArb,
  guesses: fc.array(fc.record({
    contestant: contestantArb,
    feedback: fc.record({
      season: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      position: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      age: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
      hometown: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.WRONG) as fc.Arbitrary<FeedbackType.CORRECT | FeedbackType.WRONG>,
      seasonDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined }),
      positionDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined }),
      ageDirection: fc.option(fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER), { nil: undefined })
    })
  }), { maxLength: 8 }),
  isComplete: fc.boolean(),
  isWon: fc.boolean(),
  startTime: fc.integer({ min: Date.now() - 3600000, max: Date.now() }),
  endTime: fc.option(fc.integer({ min: Date.now() - 3600000, max: Date.now() }), { nil: undefined }),
  gameDate: fc.constant(getPacificDateString())
});

const statisticsArb = fc.record({
  gamesPlayed: fc.integer({ min: 0, max: 1000 }),
  gamesWon: fc.integer({ min: 0, max: 1000 }),
  currentStreak: fc.integer({ min: 0, max: 100 }),
  maxStreak: fc.integer({ min: 0, max: 100 }),
  winDistribution: fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 8, maxLength: 8 })
});

describe('Property 15: Client-Side Architecture', () => {
  test('Feature: guessru-game, Property 15: Client-Side Architecture - Daily queen selection operates without server calls', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), (date) => {
        fetchCalls = [];
        
        // Get daily queen - should not make any server calls
        const queen = getDailyQueen(date);
        
        // Verify no fetch calls were made
        expect(fetchCalls).toHaveLength(0);
        
        // Verify queen is a valid contestant
        expect(queen).toBeDefined();
        expect(queen.id).toBeDefined();
        expect(queen.name).toBeDefined();
        expect(contestants.some(c => c.id === queen.id)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 15: Client-Side Architecture - Game state persistence operates without server calls', () => {
    fc.assert(
      fc.property(gameStateArb, (gameState) => {
        fetchCalls = [];
        
        // Save game state - should use localStorage only
        const saveResult = saveGameState(gameState);
        expect(saveResult).toBe(true);
        
        // Load game state - should use localStorage only
        const loadedState = loadGameState();
        
        // Verify no fetch calls were made
        expect(fetchCalls).toHaveLength(0);
        
        // Verify state was persisted correctly
        // Note: saveGameState adds modeKey to the saved state, so we need to account for that
        expect(loadedState).toBeDefined();
        expect(loadedState?.secretQueen).toEqual(gameState.secretQueen);
        expect(loadedState?.guesses).toEqual(gameState.guesses);
        expect(loadedState?.isComplete).toEqual(gameState.isComplete);
        expect(loadedState?.isWon).toEqual(gameState.isWon);
        expect(loadedState?.gameDate).toEqual(gameState.gameDate);
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 15: Client-Side Architecture - Statistics tracking operates without server calls', () => {
    fc.assert(
      fc.property(statisticsArb, (statistics) => {
        fetchCalls = [];
        
        // Save statistics - should use localStorage only
        const saveResult = saveStatistics(statistics);
        expect(saveResult).toBe(true);
        
        // Load statistics - should use localStorage only
        const loadedStats = loadStatistics();
        
        // Verify no fetch calls were made
        expect(fetchCalls).toHaveLength(0);
        
        // Verify statistics were persisted correctly
        expect(loadedStats).toEqual(statistics);
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 15: Client-Side Architecture - Preferences persistence operates without server calls', () => {
    fc.assert(
      fc.property(
        fc.record({
          hasSeenInstructions: fc.boolean(),
          showSilhouette: fc.boolean()
        }),
        (preferences) => {
          fetchCalls = [];
          
          // Save preferences - should use localStorage only
          const saveResult = savePreferences(preferences);
          expect(saveResult).toBe(true);
          
          // Load preferences - should use localStorage only
          const loadedPrefs = loadPreferences();
          
          // Verify no fetch calls were made
          expect(fetchCalls).toHaveLength(0);
          
          // Verify preferences were persisted correctly
          expect(loadedPrefs).toEqual(preferences);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 15: Client-Side Architecture - Contestant database is available client-side without server calls', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: contestants.length - 1 }), (index) => {
        fetchCalls = [];
        
        // Access contestant data - should be available without server calls
        const contestant = contestants[index];
        
        // Verify no fetch calls were made
        expect(fetchCalls).toHaveLength(0);
        
        // Verify contestant data is complete
        expect(contestant).toBeDefined();
        expect(contestant.id).toBeDefined();
        expect(contestant.name).toBeDefined();
        expect(contestant.season).toBeGreaterThanOrEqual(1);
        expect(contestant.finishingPosition).toBeGreaterThanOrEqual(1);
        expect(contestant.ageAtShow).toBeGreaterThanOrEqual(18);
        expect(contestant.hometown).toBeDefined();
        expect(contestant.hometownCoordinates).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 15: Client-Side Architecture - All game data is stored in localStorage (browser storage)', () => {
    fc.assert(
      fc.property(gameStateArb, statisticsArb, (gameState, statistics) => {
        // Clear storage
        localStorage.clear();
        fetchCalls = [];
        
        // Save all game data
        saveGameState(gameState);
        saveStatistics(statistics);
        savePreferences({ hasSeenInstructions: true, showSilhouette: false });
        
        // Verify data is in localStorage
        expect(localStorage.getItem('guessru_game_state')).not.toBeNull();
        expect(localStorage.getItem('guessru_statistics')).not.toBeNull();
        expect(localStorage.getItem('guessru_preferences')).not.toBeNull();
        
        // Verify no server calls were made
        expect(fetchCalls).toHaveLength(0);
        
        // Verify data can be retrieved from localStorage
        const storedGameState = JSON.parse(localStorage.getItem('guessru_game_state')!);
        const storedStats = JSON.parse(localStorage.getItem('guessru_statistics')!);
        const storedPrefs = JSON.parse(localStorage.getItem('guessru_preferences')!);
        
        // Note: saveGameState adds modeKey to the saved state
        expect(storedGameState.secretQueen).toEqual(gameState.secretQueen);
        expect(storedGameState.guesses).toEqual(gameState.guesses);
        expect(storedGameState.isComplete).toEqual(gameState.isComplete);
        expect(storedGameState.isWon).toEqual(gameState.isWon);
        expect(storedGameState.gameDate).toEqual(gameState.gameDate);
        expect(storedStats).toEqual(statistics);
        expect(storedPrefs).toEqual({ hasSeenInstructions: true, showSilhouette: false });
      }),
      { numRuns: 100 }
    );
  });
});
