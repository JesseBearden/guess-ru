import fc from 'fast-check';
import { GameState, FeedbackType, DirectionType, ShareResults } from '../types';
import { 
  generateShareResults, 
  formatShareText, 
  formatElapsedTime, 
  feedbackToEmoji, 
  generateGuessPattern,
  validateShareResults 
} from './shareResults';

// Mock the daily queen selection for consistent game numbers
jest.mock('./dailyQueenSelection', () => ({
  getGameNumber: (date?: Date) => {
    if (!date) return 123;
    // Simple deterministic game number based on date
    const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    return daysSinceEpoch + 1;
  }
}));

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
  silhouetteUrl: fc.webUrl()
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
  gameDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }).map(d => d.toISOString().split('T')[0])
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
      id: 'test-contestant',
      name: 'Test Contestant',
      season: 1,
      finishingPosition: 8,
      ageAtShow: 25,
      hometown: 'Test City',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: 'https://example.com/test.jpg',
      silhouetteUrl: 'https://example.com/test-silhouette.jpg'
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

describe('Feature: guessru-game, Property 20: Share Results Formatting', () => {
  test('Property 20: Share results should format correctly with game number, guess count, time, and visual pattern', () => {
    fc.assert(
      fc.property(
        completedGameStateArb,
        (gameState) => {
          const shareResults = generateShareResults(gameState);
          const shareText = formatShareText(shareResults, gameState.isWon);
          
          // Verify share results structure
          expect(shareResults.gameNumber).toBeGreaterThan(0);
          expect(shareResults.guessCount).toBe(gameState.guesses.length);
          expect(shareResults.totalGuesses).toBe(8);
          expect(shareResults.timeElapsed).toMatch(/^\d{2}:\d{2}$/);
          expect(shareResults.guessPattern).toHaveLength(gameState.guesses.length);
          
          // Verify each guess pattern has 4 emojis
          shareResults.guessPattern.forEach(pattern => {
            expect(pattern).toHaveLength(4);
            pattern.forEach(emoji => {
              expect(['🟩', '🟨', '⬛']).toContain(emoji);
            });
          });
          
          // Verify share text format
          const lines = shareText.split('\n');
          expect(lines.length).toBeGreaterThanOrEqual(4); // Header + empty + patterns + empty + link
          
          // Verify header format
          const headerRegex = /^GuessRu #\d+ (X\/8|\d+\/8) ⏱️ \d{2}:\d{2}$/;
          expect(lines[0]).toMatch(headerRegex);
          
          // Verify empty line after header
          expect(lines[1]).toBe('');
          
          // Verify pattern lines
          for (let i = 2; i < 2 + gameState.guesses.length; i++) {
            expect(lines[i]).toMatch(/^(🟩|🟨|⬛){4}$/);
          }
          
          // Verify website link at the end
          expect(lines[lines.length - 1]).toBe('https://guessru.com');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20a: Feedback to emoji conversion should be consistent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(FeedbackType.CORRECT, FeedbackType.CLOSE, FeedbackType.WRONG),
        (feedbackType) => {
          const emoji = feedbackToEmoji(feedbackType);
          
          switch (feedbackType) {
            case FeedbackType.CORRECT:
              expect(emoji).toBe('🟩');
              break;
            case FeedbackType.CLOSE:
              expect(emoji).toBe('🟨');
              break;
            case FeedbackType.WRONG:
              expect(emoji).toBe('⬛');
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20b: Time formatting should be consistent and valid', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000000000000, max: 9999999999999 }),
        fc.integer({ min: 0, max: 3600000 }), // 0 to 1 hour in milliseconds
        (startTime, duration) => {
          const endTime = startTime + duration;
          const formattedTime = formatElapsedTime(startTime, endTime);
          
          // Should match MM:SS format
          expect(formattedTime).toMatch(/^\d{2}:\d{2}$/);
          
          // Parse and verify time components
          const [minutes, seconds] = formattedTime.split(':').map(Number);
          expect(minutes).toBeGreaterThanOrEqual(0);
          expect(minutes).toBeLessThanOrEqual(99); // Cap at 99 minutes as per implementation
          expect(seconds).toBeGreaterThanOrEqual(0);
          expect(seconds).toBeLessThan(60);
          
          // Verify total seconds calculation
          const totalSeconds = Math.floor(duration / 1000);
          const expectedMinutes = Math.floor(totalSeconds / 60);
          const expectedSeconds = totalSeconds % 60;
          
          expect(minutes).toBe(expectedMinutes);
          expect(seconds).toBe(expectedSeconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20c: Guess pattern generation should match feedback', () => {
    fc.assert(
      fc.property(
        guessArb,
        (guess) => {
          const pattern = generateGuessPattern(guess);
          
          expect(pattern).toHaveLength(4);
          expect(pattern[0]).toBe(feedbackToEmoji(guess.feedback.season));
          expect(pattern[1]).toBe(feedbackToEmoji(guess.feedback.position));
          expect(pattern[2]).toBe(feedbackToEmoji(guess.feedback.age));
          expect(pattern[3]).toBe(feedbackToEmoji(guess.feedback.hometown));
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20d: Win vs loss formatting should be distinct', () => {
    fc.assert(
      fc.property(
        fc.oneof(winningGameStateArb, losingGameStateArb),
        (gameState) => {
          const shareResults = generateShareResults(gameState);
          const shareText = formatShareText(shareResults, gameState.isWon);
          
          const headerLine = shareText.split('\n')[0];
          
          if (gameState.isWon) {
            // Winning games should show guess count out of 8
            expect(headerLine).toMatch(/GuessRu #\d+ \d+\/8 ⏱️ \d{2}:\d{2}/);
            expect(headerLine).not.toContain('X/8');
          } else {
            // Losing games should show X/8
            expect(headerLine).toMatch(/GuessRu #\d+ X\/8 ⏱️ \d{2}:\d{2}/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20e: Game number should be deterministic for same date', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        completedGameStateArb,
        (testDate, gameState) => {
          const gameStateWithDate = {
            ...gameState,
            gameDate: testDate.toISOString().split('T')[0]
          };
          
          const shareResults1 = generateShareResults(gameStateWithDate);
          const shareResults2 = generateShareResults(gameStateWithDate);
          
          // Same date should produce same game number
          expect(shareResults1.gameNumber).toBe(shareResults2.gameNumber);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20f: Share results validation should catch invalid data', () => {
    fc.assert(
      fc.property(
        fc.record({
          gameNumber: fc.oneof(
            fc.integer({ min: 1, max: 10000 }), // valid
            fc.integer({ max: 0 }), // invalid
            fc.float() // invalid
          ),
          guessCount: fc.oneof(
            fc.integer({ min: 1, max: 8 }), // valid
            fc.integer({ max: 0 }), // invalid
            fc.integer({ min: 9 }) // invalid
          ),
          totalGuesses: fc.oneof(
            fc.constant(8), // valid
            fc.integer().filter(n => n !== 8) // invalid
          ),
          timeElapsed: fc.oneof(
            fc.string().map(s => '05:30'), // valid format
            fc.string().filter(s => !/^\d{2}:\d{2}$/.test(s)) // invalid format
          ),
          guessPattern: fc.oneof(
            fc.array(fc.array(fc.constantFrom('🟩', '🟨', '⬛'), { minLength: 4, maxLength: 4 }), { minLength: 1, maxLength: 8 }), // valid
            fc.array(fc.array(fc.string(), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 10 }) // potentially invalid
          )
        }),
        (shareResults) => {
          const validation = validateShareResults(shareResults);
          
          // Check if validation correctly identifies issues
          const hasValidGameNumber = Number.isInteger(shareResults.gameNumber) && shareResults.gameNumber >= 1;
          const hasValidGuessCount = Number.isInteger(shareResults.guessCount) && 
                                   shareResults.guessCount >= 1 && 
                                   shareResults.guessCount <= shareResults.totalGuesses;
          const hasValidTotalGuesses = shareResults.totalGuesses === 8;
          const hasValidTimeFormat = /^\d{2}:\d{2}$/.test(shareResults.timeElapsed);
          const hasValidPattern = Array.isArray(shareResults.guessPattern) &&
                                shareResults.guessPattern.length === shareResults.guessCount &&
                                shareResults.guessPattern.every(pattern => 
                                  Array.isArray(pattern) && 
                                  pattern.length === 4 &&
                                  pattern.every(emoji => ['🟩', '🟨', '⬛'].includes(emoji))
                                );
          
          const shouldBeValid = hasValidGameNumber && hasValidGuessCount && hasValidTotalGuesses && 
                              hasValidTimeFormat && hasValidPattern;
          
          expect(validation.isValid).toBe(shouldBeValid);
          
          if (!shouldBeValid) {
            expect(validation.errors.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20g: Share text should contain all required elements', () => {
    fc.assert(
      fc.property(
        completedGameStateArb,
        (gameState) => {
          const shareResults = generateShareResults(gameState);
          const shareText = formatShareText(shareResults, gameState.isWon);
          
          // Should contain game number
          expect(shareText).toMatch(/GuessRu #\d+/);
          
          // Should contain result (either X/8 or number/8)
          expect(shareText).toMatch(/(X\/8|\d+\/8)/);
          
          // Should contain time (allowing up to 99:59)
          expect(shareText).toMatch(/⏱️ \d{2}:\d{2}/);
          
          // Should contain emoji patterns
          expect(shareText).toMatch(/[🟩🟨⬛]/);
          
          // Should contain website link
          expect(shareText).toContain('https://guessru.com');
          
          // Should have proper line structure
          const lines = shareText.split('\n');
          expect(lines.length).toBeGreaterThanOrEqual(4);
          expect(lines[1]).toBe(''); // Empty line after header
          expect(lines[lines.length - 2]).toBe(''); // Empty line before link
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 20h: Share results should handle edge cases correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          startTime: fc.integer({ min: 1000000000000, max: 9999999999999 }),
          duration: fc.oneof(
            fc.constant(0), // Instant completion
            fc.integer({ min: 1, max: 1000 }), // Very fast
            fc.integer({ min: 3600000, max: 7200000 }) // Very slow (1-2 hours)
          )
        }),
        ({ startTime, duration }) => {
          const endTime = startTime + duration;
          const formattedTime = formatElapsedTime(startTime, endTime);
          
          // Should always produce valid MM:SS format (allowing up to 99:59)
          expect(formattedTime).toMatch(/^\d{2}:\d{2}$/);
          
          // Should handle zero duration
          if (duration === 0) {
            expect(formattedTime).toBe('00:00');
          }
          
          // Should handle very long durations (cap at 99:59)
          const [minutes] = formattedTime.split(':').map(Number);
          expect(minutes).toBeGreaterThanOrEqual(0);
          expect(minutes).toBeLessThanOrEqual(99);
        }
      ),
      { numRuns: 100 }
    );
  });
});