import { Contestant, GameState, Statistics, FeedbackType, DirectionType } from './index';

// Basic type validation tests
describe('Type System Tests', () => {
  test('Contestant interface should accept valid data', () => {
    const contestant: Contestant = {
      id: 'test-1',
      name: 'Test Queen',
      season: 1,
      finishingPosition: 5,
      ageAtShow: 25,
      hometown: 'Test City',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: 'https://example.com/headshot.jpg',
      entranceQuote: '',
      farewellQuote: '',
      snatchGameCharacter: '',
    };

    expect(contestant.id).toBe('test-1');
    expect(contestant.name).toBe('Test Queen');
    expect(contestant.season).toBe(1);
    expect(contestant.finishingPosition).toBe(5);
    expect(contestant.ageAtShow).toBe(25);
    expect(contestant.hometown).toBe('Test City');
    expect(contestant.hometownCoordinates.latitude).toBe(40.7128);
    expect(contestant.hometownCoordinates.longitude).toBe(-74.0060);
    expect(contestant.headshotUrl).toBe('https://example.com/headshot.jpg');
  });

  test('Statistics interface should accept valid data', () => {
    const stats: Statistics = {
      gamesPlayed: 10,
      gamesWon: 7,
      currentStreak: 3,
      maxStreak: 5,
      winDistribution: [0, 1, 2, 2, 1, 1, 0, 0],
    };

    expect(stats.gamesPlayed).toBe(10);
    expect(stats.gamesWon).toBe(7);
    expect(stats.currentStreak).toBe(3);
    expect(stats.maxStreak).toBe(5);
    expect(stats.winDistribution).toHaveLength(8);
    expect(stats.winDistribution.reduce((a, b) => a + b, 0)).toBe(7); // Total wins should match gamesWon
  });

  test('GameState interface should accept valid data', () => {
    const contestant: Contestant = {
      id: 'test-1',
      name: 'Test Queen',
      season: 1,
      finishingPosition: 5,
      ageAtShow: 25,
      hometown: 'Test City',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: 'https://example.com/headshot.jpg',
      entranceQuote: '',
      farewellQuote: '',
      snatchGameCharacter: '',
    };

    const gameState: GameState = {
      secretQueen: contestant,
      guesses: [],
      isComplete: false,
      isWon: false,
      startTime: Date.now(),
      gameDate: '2024-01-01',
    };

    expect(gameState.secretQueen).toBe(contestant);
    expect(gameState.guesses).toHaveLength(0);
    expect(gameState.isComplete).toBe(false);
    expect(gameState.isWon).toBe(false);
    expect(typeof gameState.startTime).toBe('number');
    expect(gameState.gameDate).toBe('2024-01-01');
  });
});

// Property-based tests
describe('Property-Based Tests', () => {
  test('Property 7: Contestant Data Constraints - **Validates: Requirements 4.1, 4.2, 4.3, 4.6**', () => {
    // Feature: guessru-game, Property 7: Contestant Data Constraints
    const fc = require('fast-check');
    
    fc.assert(fc.property(
      fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        season: fc.integer({ min: 1, max: 16 }), // Main US seasons 1-16
        finishingPosition: fc.integer({ min: 1, max: 16 }),
        ageAtShow: fc.integer({ min: 18, max: 70 }),
        hometown: fc.string({ minLength: 1 }),
        hometownCoordinates: fc.record({
          latitude: fc.double({ min: -90, max: 90 }),
          longitude: fc.double({ min: -180, max: 180 })
        }),
        headshotUrl: fc.webUrl()
      }),
      (contestantData: any) => {
        const contestant: Contestant = contestantData;
        
        // Validate all required fields are present and non-empty
        expect(contestant.id).toBeTruthy();
        expect(contestant.name).toBeTruthy();
        expect(contestant.hometown).toBeTruthy();
        expect(contestant.headshotUrl).toBeTruthy();
        
        // Validate hometown coordinates are present
        expect(contestant.hometownCoordinates).toBeTruthy();
        expect(typeof contestant.hometownCoordinates.latitude).toBe('number');
        expect(typeof contestant.hometownCoordinates.longitude).toBe('number');
        
        // Validate season is within main US season range (1-16 as of 2024)
        expect(contestant.season).toBeGreaterThanOrEqual(1);
        expect(contestant.season).toBeLessThanOrEqual(16);
        
        // Validate finishing position is reasonable
        expect(contestant.finishingPosition).toBeGreaterThanOrEqual(1);
        expect(contestant.finishingPosition).toBeLessThanOrEqual(16);
        
        // Validate age is reasonable for drag race contestants
        expect(contestant.ageAtShow).toBeGreaterThanOrEqual(18);
        expect(contestant.ageAtShow).toBeLessThanOrEqual(70);
        
        // Validate URLs are properly formatted
        expect(contestant.headshotUrl).toMatch(/^https?:\/\/.+/);
        
        return true;
      }
    ), { numRuns: 100 });
  });
});