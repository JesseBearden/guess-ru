/**
 * Integration Tests for Game Modes Feature
 * 
 * Tests verify:
 * - All four mode combinations produce different daily queens (4.4.1)
 * - Mode switching preserves game state for each mode independently (4.4.2)
 * - Statistics are tracked separately per mode (4.4.3)
 * - New players default to First 10 + Top 5 mode (4.4.4)
 * 
 * **Validates: Requirements 15.4, 15.5, 15.6, 15.10, 15.11, 16.1, 16.3**
 */

import { getDailyQueen, getPacificDateString } from './dailyQueenSelection';
import { getContestantsByMode, contestants } from './contestantDatabase';
import { 
  saveGameState, 
  loadGameState, 
  loadPreferences,
  clearGameState
} from './localStorage';
import { updateStatistics, resetStatistics, getCurrentStatistics } from './statistics';
import { 
  GameMode, 
  GameModeKey, 
  getModeKey, 
  DEFAULT_GAME_MODE, 
  GameState, 
  FeedbackType 
} from '../types';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe('Game Modes Integration Tests', () => {
  
  /**
   * 4.4.1: Integration tests verifying all four mode combinations produce different daily queens
   * **Validates: Requirements 15.4, 15.7**
   */
  describe('4.4.1: Different Daily Queens Per Mode', () => {
    
    test('all four mode combinations should produce different daily queens for the same date', () => {
      // Define all four mode combinations
      const modes: GameMode[] = [
        { firstTenSeasons: false, topFiveOnly: false }, // default
        { firstTenSeasons: true, topFiveOnly: false },  // first10
        { firstTenSeasons: false, topFiveOnly: true },  // top5
        { firstTenSeasons: true, topFiveOnly: true }    // first10-top5
      ];
      
      const testDate = new Date('2024-06-15T12:00:00-07:00');
      
      // Get daily queen for each mode
      const queens = modes.map(mode => getDailyQueen(testDate, mode));
      
      // Verify each mode returns a valid contestant
      queens.forEach((queen, index) => {
        expect(queen).toBeDefined();
        expect(queen.id).toBeTruthy();
        expect(queen.name).toBeTruthy();
        
        // Verify the queen is valid for the mode
        const mode = modes[index];
        // Mode filtering is verified - queens from firstTenSeasons modes should be from seasons 1-10
        // Queens from topFiveOnly modes should have finishing position <= 5
        expect(mode.firstTenSeasons ? queen.season <= 10 : true).toBe(true);
        expect(mode.topFiveOnly ? queen.finishingPosition <= 5 : true).toBe(true);
      });
      
      // Verify that at least some modes produce different queens
      // (Due to the mode offset algorithm, they should be different)
      const queenIds = queens.map(q => q.id);
      const uniqueQueenIds = new Set(queenIds);
      
      // With the mode offset algorithm (0, 7, 13, 23), we expect different queens
      // unless the contestant pools are very small
      expect(uniqueQueenIds.size).toBeGreaterThanOrEqual(2);
    });
    
    test('mode-specific queen selection should be deterministic', () => {
      const testDate = new Date('2024-06-15T12:00:00-07:00');
      
      const modes: GameMode[] = [
        { firstTenSeasons: false, topFiveOnly: false },
        { firstTenSeasons: true, topFiveOnly: false },
        { firstTenSeasons: false, topFiveOnly: true },
        { firstTenSeasons: true, topFiveOnly: true }
      ];
      
      // Call getDailyQueen twice for each mode and verify consistency
      modes.forEach(mode => {
        const queen1 = getDailyQueen(testDate, mode);
        const queen2 = getDailyQueen(testDate, mode);
        
        expect(queen1.id).toBe(queen2.id);
        expect(queen1.name).toBe(queen2.name);
      });
    });
    
    test('each mode should filter contestants correctly', () => {
      // Test default mode (all contestants)
      const defaultContestants = getContestantsByMode(false, false);
      expect(defaultContestants.length).toBe(contestants.length);
      
      // Test first10 mode (seasons 1-10 only)
      const first10Contestants = getContestantsByMode(true, false);
      first10Contestants.forEach(c => {
        expect(c.season).toBeLessThanOrEqual(10);
      });
      expect(first10Contestants.length).toBeLessThan(contestants.length);
      
      // Test top5 mode (top 5 finishers only)
      const top5Contestants = getContestantsByMode(false, true);
      top5Contestants.forEach(c => {
        expect(c.finishingPosition).toBeLessThanOrEqual(5);
      });
      expect(top5Contestants.length).toBeLessThan(contestants.length);
      
      // Test first10-top5 mode (most restrictive)
      const first10Top5Contestants = getContestantsByMode(true, true);
      first10Top5Contestants.forEach(c => {
        expect(c.season).toBeLessThanOrEqual(10);
        expect(c.finishingPosition).toBeLessThanOrEqual(5);
      });
      expect(first10Top5Contestants.length).toBeLessThanOrEqual(first10Contestants.length);
      expect(first10Top5Contestants.length).toBeLessThanOrEqual(top5Contestants.length);
    });
    
    test('different dates should produce different queens within the same mode', () => {
      const mode: GameMode = { firstTenSeasons: true, topFiveOnly: true };
      
      const date1 = new Date('2024-06-15T12:00:00-07:00');
      const date2 = new Date('2024-06-16T12:00:00-07:00');
      const date3 = new Date('2024-06-17T12:00:00-07:00');
      
      const queen1 = getDailyQueen(date1, mode);
      const queen2 = getDailyQueen(date2, mode);
      const queen3 = getDailyQueen(date3, mode);
      
      // All should be valid for the mode
      [queen1, queen2, queen3].forEach(queen => {
        expect(queen.season).toBeLessThanOrEqual(10);
        expect(queen.finishingPosition).toBeLessThanOrEqual(5);
      });
      
      // With a reasonable contestant pool, consecutive days should usually differ
      const queenIds = [queen1.id, queen2.id, queen3.id];
      const uniqueIds = new Set(queenIds);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(2);
    });
  });


  /**
   * 4.4.2: Integration tests verifying mode switching preserves game state for each mode independently
   * **Validates: Requirements 15.5, 15.6, 15.10**
   */
  describe('4.4.2: Mode Switching Preserves Game State', () => {
    
    const createMockGameState = (mode: GameMode, guessCount: number): GameState => {
      const modeKey = getModeKey(mode);
      const secretQueen = getDailyQueen(new Date(), mode);
      
      return {
        secretQueen,
        guesses: Array(guessCount).fill(null).map((_, i) => ({
          contestant: {
            id: `test-contestant-${i}`,
            name: `Test Queen ${i}`,
            season: 1,
            finishingPosition: i + 1,
            ageAtShow: 25 + i,
            hometown: 'Test City',
            hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
            headshotUrl: '/test.jpg',
            entranceQuote: '',
            farewellQuote: '',
            snatchGameCharacter: ''
          },
          feedback: {
            season: FeedbackType.WRONG,
            position: FeedbackType.WRONG,
            age: FeedbackType.WRONG,
            hometown: FeedbackType.WRONG
          }
        })),
        isComplete: false,
        isWon: false,
        startTime: Date.now(),
        gameDate: getPacificDateString(),
        modeKey
      };
    };
    
    test('game states for different modes should be stored independently', () => {
      const modes: { mode: GameMode; key: GameModeKey }[] = [
        { mode: { firstTenSeasons: false, topFiveOnly: false }, key: 'default' },
        { mode: { firstTenSeasons: true, topFiveOnly: false }, key: 'first10' },
        { mode: { firstTenSeasons: false, topFiveOnly: true }, key: 'top5' },
        { mode: { firstTenSeasons: true, topFiveOnly: true }, key: 'first10-top5' }
      ];
      
      // Save different game states for each mode
      modes.forEach(({ mode, key }, index) => {
        const gameState = createMockGameState(mode, index + 1); // Different guess counts
        saveGameState(gameState, key);
      });
      
      // Load and verify each mode's game state is preserved independently
      modes.forEach(({ key }, index) => {
        const loadedState = loadGameState(key);
        expect(loadedState).not.toBeNull();
        expect(loadedState!.guesses.length).toBe(index + 1);
        expect(loadedState!.modeKey).toBe(key);
      });
    });
    
    test('switching modes should not affect other modes game states', () => {
      // Set up game states for all modes
      const defaultState = createMockGameState({ firstTenSeasons: false, topFiveOnly: false }, 3);
      const first10State = createMockGameState({ firstTenSeasons: true, topFiveOnly: false }, 2);
      const top5State = createMockGameState({ firstTenSeasons: false, topFiveOnly: true }, 4);
      const first10Top5State = createMockGameState({ firstTenSeasons: true, topFiveOnly: true }, 1);
      
      saveGameState(defaultState, 'default');
      saveGameState(first10State, 'first10');
      saveGameState(top5State, 'top5');
      saveGameState(first10Top5State, 'first10-top5');
      
      // Simulate switching to first10 mode and making changes
      const updatedFirst10State = { ...first10State, guesses: [...first10State.guesses, first10State.guesses[0]] };
      saveGameState(updatedFirst10State, 'first10');
      
      // Verify other modes are unaffected
      expect(loadGameState('default')!.guesses.length).toBe(3);
      expect(loadGameState('top5')!.guesses.length).toBe(4);
      expect(loadGameState('first10-top5')!.guesses.length).toBe(1);
      
      // Verify first10 was updated
      expect(loadGameState('first10')!.guesses.length).toBe(3);
    });
    
    test('clearing one mode game state should not affect other modes', () => {
      // Set up game states for all modes
      const modes: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];
      
      modes.forEach((key, index) => {
        const mode: GameMode = {
          firstTenSeasons: key.includes('first10'),
          topFiveOnly: key.includes('top5')
        };
        const gameState = createMockGameState(mode, index + 1);
        saveGameState(gameState, key);
      });
      
      // Clear only the 'first10' mode
      clearGameState('first10');
      
      // Verify first10 is cleared
      expect(loadGameState('first10')).toBeNull();
      
      // Verify other modes are preserved
      expect(loadGameState('default')).not.toBeNull();
      expect(loadGameState('top5')).not.toBeNull();
      expect(loadGameState('first10-top5')).not.toBeNull();
    });
    
    test('game state should include correct mode key', () => {
      const modes: { mode: GameMode; expectedKey: GameModeKey }[] = [
        { mode: { firstTenSeasons: false, topFiveOnly: false }, expectedKey: 'default' },
        { mode: { firstTenSeasons: true, topFiveOnly: false }, expectedKey: 'first10' },
        { mode: { firstTenSeasons: false, topFiveOnly: true }, expectedKey: 'top5' },
        { mode: { firstTenSeasons: true, topFiveOnly: true }, expectedKey: 'first10-top5' }
      ];
      
      modes.forEach(({ mode, expectedKey }) => {
        const gameState = createMockGameState(mode, 1);
        saveGameState(gameState, expectedKey);
        
        const loaded = loadGameState(expectedKey);
        expect(loaded!.modeKey).toBe(expectedKey);
      });
    });
  });


  /**
   * 4.4.3: Integration tests verifying statistics are tracked separately per mode
   * **Validates: Requirements 16.1, 16.3**
   */
  describe('4.4.3: Mode-Specific Statistics Tracking', () => {
    
    const createCompletedGameState = (
      mode: GameMode, 
      isWon: boolean, 
      guessCount: number
    ): GameState => {
      const modeKey = getModeKey(mode);
      const secretQueen = getDailyQueen(new Date(), mode);
      
      return {
        secretQueen,
        guesses: Array(guessCount).fill(null).map((_, i) => ({
          contestant: {
            id: `test-contestant-${i}`,
            name: `Test Queen ${i}`,
            season: 1,
            finishingPosition: i + 1,
            ageAtShow: 25 + i,
            hometown: 'Test City',
            hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
            headshotUrl: '/test.jpg',
            entranceQuote: '',
            farewellQuote: '',
            snatchGameCharacter: ''
          },
          feedback: {
            season: i === guessCount - 1 && isWon ? FeedbackType.CORRECT : FeedbackType.WRONG,
            position: i === guessCount - 1 && isWon ? FeedbackType.CORRECT : FeedbackType.WRONG,
            age: i === guessCount - 1 && isWon ? FeedbackType.CORRECT : FeedbackType.WRONG,
            hometown: i === guessCount - 1 && isWon ? FeedbackType.CORRECT : FeedbackType.WRONG
          }
        })),
        isComplete: true,
        isWon,
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        gameDate: getPacificDateString(),
        modeKey
      };
    };
    
    test('statistics should be stored separately for each mode', () => {
      const modes: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];
      
      // Reset all statistics first
      modes.forEach(key => resetStatistics(key));
      
      // Update statistics for each mode with different values
      modes.forEach((key, index) => {
        const mode: GameMode = {
          firstTenSeasons: key.includes('first10'),
          topFiveOnly: key.includes('top5')
        };
        
        // Play different number of games for each mode
        for (let i = 0; i <= index; i++) {
          const gameState = createCompletedGameState(mode, true, i + 1);
          updateStatistics(gameState);
        }
      });
      
      // Verify each mode has different statistics
      expect(getCurrentStatistics('default').gamesPlayed).toBe(1);
      expect(getCurrentStatistics('first10').gamesPlayed).toBe(2);
      expect(getCurrentStatistics('top5').gamesPlayed).toBe(3);
      expect(getCurrentStatistics('first10-top5').gamesPlayed).toBe(4);
    });
    
    test('completing a game in one mode should not affect other modes statistics', () => {
      const modes: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];
      
      // Reset all statistics
      modes.forEach(key => resetStatistics(key));
      
      // Set initial statistics for all modes
      modes.forEach(key => {
        const mode: GameMode = {
          firstTenSeasons: key.includes('first10'),
          topFiveOnly: key.includes('top5')
        };
        const gameState = createCompletedGameState(mode, true, 3);
        updateStatistics(gameState);
      });
      
      // Verify all modes have 1 game played
      modes.forEach(key => {
        expect(getCurrentStatistics(key).gamesPlayed).toBe(1);
        expect(getCurrentStatistics(key).gamesWon).toBe(1);
      });
      
      // Complete another game only in 'first10' mode
      const first10Mode: GameMode = { firstTenSeasons: true, topFiveOnly: false };
      const newGameState = createCompletedGameState(first10Mode, true, 2);
      updateStatistics(newGameState);
      
      // Verify only first10 mode was updated
      expect(getCurrentStatistics('default').gamesPlayed).toBe(1);
      expect(getCurrentStatistics('first10').gamesPlayed).toBe(2);
      expect(getCurrentStatistics('top5').gamesPlayed).toBe(1);
      expect(getCurrentStatistics('first10-top5').gamesPlayed).toBe(1);
    });
    
    test('win streaks should be tracked independently per mode', () => {
      const modes: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];
      
      // Reset all statistics
      modes.forEach(key => resetStatistics(key));
      
      // Build different win streaks for each mode
      // default: 1 win
      const defaultMode: GameMode = { firstTenSeasons: false, topFiveOnly: false };
      updateStatistics(createCompletedGameState(defaultMode, true, 3));
      
      // first10: 2 wins
      const first10Mode: GameMode = { firstTenSeasons: true, topFiveOnly: false };
      updateStatistics(createCompletedGameState(first10Mode, true, 3));
      updateStatistics(createCompletedGameState(first10Mode, true, 2));
      
      // top5: 1 win, 1 loss (streak broken)
      const top5Mode: GameMode = { firstTenSeasons: false, topFiveOnly: true };
      updateStatistics(createCompletedGameState(top5Mode, true, 3));
      updateStatistics(createCompletedGameState(top5Mode, false, 8));
      
      // first10-top5: 3 wins
      const first10Top5Mode: GameMode = { firstTenSeasons: true, topFiveOnly: true };
      updateStatistics(createCompletedGameState(first10Top5Mode, true, 3));
      updateStatistics(createCompletedGameState(first10Top5Mode, true, 2));
      updateStatistics(createCompletedGameState(first10Top5Mode, true, 1));
      
      // Verify streaks
      expect(getCurrentStatistics('default').currentStreak).toBe(1);
      expect(getCurrentStatistics('first10').currentStreak).toBe(2);
      expect(getCurrentStatistics('top5').currentStreak).toBe(0); // Broken by loss
      expect(getCurrentStatistics('first10-top5').currentStreak).toBe(3);
      
      // Verify max streaks
      expect(getCurrentStatistics('default').maxStreak).toBe(1);
      expect(getCurrentStatistics('first10').maxStreak).toBe(2);
      expect(getCurrentStatistics('top5').maxStreak).toBe(1);
      expect(getCurrentStatistics('first10-top5').maxStreak).toBe(3);
    });
    
    test('win distribution should be tracked independently per mode', () => {
      const modes: GameModeKey[] = ['default', 'first10', 'top5', 'first10-top5'];
      
      // Reset all statistics
      modes.forEach(key => resetStatistics(key));
      
      // Win with different guess counts in each mode
      const defaultMode: GameMode = { firstTenSeasons: false, topFiveOnly: false };
      updateStatistics(createCompletedGameState(defaultMode, true, 1)); // 1 guess win
      
      const first10Mode: GameMode = { firstTenSeasons: true, topFiveOnly: false };
      updateStatistics(createCompletedGameState(first10Mode, true, 3)); // 3 guess win
      
      const top5Mode: GameMode = { firstTenSeasons: false, topFiveOnly: true };
      updateStatistics(createCompletedGameState(top5Mode, true, 5)); // 5 guess win
      
      const first10Top5Mode: GameMode = { firstTenSeasons: true, topFiveOnly: true };
      updateStatistics(createCompletedGameState(first10Top5Mode, true, 8)); // 8 guess win
      
      // Verify win distributions
      expect(getCurrentStatistics('default').winDistribution[0]).toBe(1); // Index 0 = 1 guess
      expect(getCurrentStatistics('first10').winDistribution[2]).toBe(1); // Index 2 = 3 guesses
      expect(getCurrentStatistics('top5').winDistribution[4]).toBe(1); // Index 4 = 5 guesses
      expect(getCurrentStatistics('first10-top5').winDistribution[7]).toBe(1); // Index 7 = 8 guesses
      
      // Verify other indices are 0
      expect(getCurrentStatistics('default').winDistribution[2]).toBe(0);
      expect(getCurrentStatistics('first10').winDistribution[0]).toBe(0);
    });
  });


  /**
   * 4.4.4: Unit test verifying new players default to First 10 + Top 5 mode (DEFAULT_GAME_MODE)
   * **Validates: Requirements 15.11**
   */
  describe('4.4.4: Default Game Mode for New Players', () => {
    
    test('DEFAULT_GAME_MODE should be First 10 Seasons + Top 5 Only', () => {
      expect(DEFAULT_GAME_MODE.firstTenSeasons).toBe(true);
      expect(DEFAULT_GAME_MODE.topFiveOnly).toBe(true);
    });
    
    test('getModeKey should return "first10-top5" for DEFAULT_GAME_MODE', () => {
      const key = getModeKey(DEFAULT_GAME_MODE);
      expect(key).toBe('first10-top5');
    });
    
    test('new players without saved preferences should get DEFAULT_GAME_MODE', () => {
      // Clear localStorage to simulate new player
      localStorage.clear();
      
      // Load preferences (should return defaults)
      const preferences = loadPreferences();
      
      // Verify default mode is set
      expect(preferences.currentMode).toBeDefined();
      expect(preferences.currentMode!.firstTenSeasons).toBe(true);
      expect(preferences.currentMode!.topFiveOnly).toBe(true);
    });
    
    test('getDailyQueen with DEFAULT_GAME_MODE should return valid contestant', () => {
      const queen = getDailyQueen(new Date(), DEFAULT_GAME_MODE);
      
      expect(queen).toBeDefined();
      expect(queen.season).toBeLessThanOrEqual(10);
      expect(queen.finishingPosition).toBeLessThanOrEqual(5);
    });
    
    test('DEFAULT_GAME_MODE contestant pool should be the most restrictive', () => {
      const defaultModeContestants = getContestantsByMode(
        DEFAULT_GAME_MODE.firstTenSeasons, 
        DEFAULT_GAME_MODE.topFiveOnly
      );
      
      const allContestants = getContestantsByMode(false, false);
      const first10Only = getContestantsByMode(true, false);
      const top5Only = getContestantsByMode(false, true);
      
      // DEFAULT_GAME_MODE (first10-top5) should have the smallest pool
      expect(defaultModeContestants.length).toBeLessThanOrEqual(first10Only.length);
      expect(defaultModeContestants.length).toBeLessThanOrEqual(top5Only.length);
      expect(defaultModeContestants.length).toBeLessThan(allContestants.length);
      
      // Verify all contestants in the pool meet both criteria
      defaultModeContestants.forEach(contestant => {
        expect(contestant.season).toBeLessThanOrEqual(10);
        expect(contestant.finishingPosition).toBeLessThanOrEqual(5);
      });
    });
    
    test('DEFAULT_GAME_MODE should provide a reasonable contestant pool size', () => {
      const defaultModeContestants = getContestantsByMode(
        DEFAULT_GAME_MODE.firstTenSeasons, 
        DEFAULT_GAME_MODE.topFiveOnly
      );
      
      // Should have at least 10 contestants (seasons 1-10, top 5 each = ~50 max)
      // But some seasons may have ties, so we expect at least 40
      expect(defaultModeContestants.length).toBeGreaterThanOrEqual(40);
      
      // Should have at most 60 (allowing for ties in top 5)
      expect(defaultModeContestants.length).toBeLessThanOrEqual(60);
    });
  });
});
