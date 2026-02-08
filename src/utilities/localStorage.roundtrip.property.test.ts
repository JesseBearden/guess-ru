import fc from 'fast-check';
import {
  saveGameState,
  loadGameState
} from './localStorage';
import { GameState, Guess, FeedbackType, DirectionType } from '../types/index';
import { getPacificDateString } from './dailyQueenSelection';

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

// Generators for property-based testing - using integers to avoid -0 issues
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
  entranceQuote: fc.string(),
  farewellQuote: fc.string(),
  snatchGameCharacter: fc.string()
});

// Feedback without optional undefined fields (JSON.stringify removes undefined)
const feedbackArb = fc.record({
  season: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  position: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  age: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
  hometown: fc.constantFrom(FeedbackType.CORRECT, FeedbackType.WRONG) as fc.Arbitrary<FeedbackType.CORRECT | FeedbackType.WRONG>,
  // Include direction fields only when they would be present
  seasonDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER),
  positionDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER),
  ageDirection: fc.constantFrom(DirectionType.HIGHER, DirectionType.LOWER)
});

const guessArb = fc.record({
  contestant: contestantArb,
  feedback: feedbackArb
});

const gameStateWithGuessesArb = fc.record({
  secretQueen: contestantArb,
  guesses: fc.array(guessArb, { minLength: 1, maxLength: 8 }), // Ensure at least one guess
  isComplete: fc.boolean(),
  isWon: fc.boolean(),
  startTime: fc.integer({ min: 1, max: Date.now() }),
  gameDate: fc.constant(getPacificDateString()) // Always use today's date for this test
});

describe('localStorage Round Trip Property Tests', () => {
  describe('Property 19: Guess History Round Trip', () => {
    test('Feature: guessru-game, Property 19: Guess History Round Trip - For any valid guess submitted to the system, storing it and then retrieving the game state should preserve the guess with identical feedback calculations', () => {
      fc.assert(
        fc.property(gameStateWithGuessesArb, (gameState) => {
          // Save the game state with guesses
          const saveResult = saveGameState(gameState);
          expect(saveResult).toBe(true);
          
          // Load the game state
          const loadedState = loadGameState();
          
          // The loaded state should not be null
          expect(loadedState).not.toBeNull();
          
          if (loadedState) {
            // The guess count should be preserved
            expect(loadedState.guesses.length).toBe(gameState.guesses.length);
            
            // Each guess should have identical feedback
            for (let i = 0; i < gameState.guesses.length; i++) {
              const originalGuess = gameState.guesses[i];
              const loadedGuess = loadedState.guesses[i];
              
              // Contestant ID should be identical
              expect(loadedGuess.contestant.id).toBe(originalGuess.contestant.id);
              
              // Specifically check each feedback property
              expect(loadedGuess.feedback.season).toBe(originalGuess.feedback.season);
              expect(loadedGuess.feedback.position).toBe(originalGuess.feedback.position);
              expect(loadedGuess.feedback.age).toBe(originalGuess.feedback.age);
              expect(loadedGuess.feedback.hometown).toBe(originalGuess.feedback.hometown);
              
              // Check directional feedback
              expect(loadedGuess.feedback.seasonDirection).toBe(originalGuess.feedback.seasonDirection);
              expect(loadedGuess.feedback.positionDirection).toBe(originalGuess.feedback.positionDirection);
              expect(loadedGuess.feedback.ageDirection).toBe(originalGuess.feedback.ageDirection);
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Feature: guessru-game, Property 19: Guess History Round Trip - For any sequence of guesses, the order should be preserved after round trip', () => {
      fc.assert(
        fc.property(
          fc.array(guessArb, { minLength: 2, maxLength: 8 }),
          contestantArb,
          (guesses, secretQueen) => {
            const gameState: GameState = {
              secretQueen,
              guesses,
              isComplete: false,
              isWon: false,
              startTime: Date.now(),
              gameDate: getPacificDateString()
            };
            
            // Save the game state
            const saveResult = saveGameState(gameState);
            expect(saveResult).toBe(true);
            
            // Load the game state
            const loadedState = loadGameState();
            
            if (loadedState) {
              // The guess order should be preserved
              expect(loadedState.guesses.length).toBe(guesses.length);
              
              for (let i = 0; i < guesses.length; i++) {
                // Check contestant ID to verify order
                expect(loadedState.guesses[i].contestant.id).toBe(guesses[i].contestant.id);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
