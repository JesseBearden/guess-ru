/**
 * Integration Tests for Game Modes Feature (Easy / Standard)
 * 
 * Tests verify:
 * - Both modes produce different daily queens (4.4.1)
 * - Mode switching preserves game state independently (4.4.2)
 * - Statistics are tracked separately per mode (4.4.3)
 * - New players default to Easy mode (4.4.4)
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
  GameModeKey, 
  getModeFilters,
  DEFAULT_GAME_MODE, 
  GameState, 
  FeedbackType 
} from '../types';

beforeEach(() => {
  localStorage.clear();
});

describe('Game Modes Integration Tests', () => {

  describe('4.4.1: Different Daily Queens Per Mode', () => {

    test('easy and standard modes should produce different daily queens for the same date', () => {
      const modes: GameModeKey[] = ['easy', 'standard'];
      const testDate = new Date('2024-06-15T12:00:00-07:00');

      const queens = modes.map(mode => getDailyQueen(testDate, mode));

      queens.forEach((queen, index) => {
        expect(queen).toBeDefined();
        expect(queen.id).toBeTruthy();
        const filters = getModeFilters(modes[index]);
        if (filters.firstTenSeasons) expect(queen.season).toBeLessThanOrEqual(10);
        if (filters.topSevenOnly) expect(queen.finishingPosition).toBeLessThanOrEqual(7);
      });

      // With mode offset, they should be different queens
      const uniqueIds = new Set(queens.map(q => q.id));
      expect(uniqueIds.size).toBe(2);
    });

    test('mode-specific queen selection should be deterministic', () => {
      const testDate = new Date('2024-06-15T12:00:00-07:00');
      const modes: GameModeKey[] = ['easy', 'standard'];

      modes.forEach(mode => {
        const queen1 = getDailyQueen(testDate, mode);
        const queen2 = getDailyQueen(testDate, mode);
        expect(queen1.id).toBe(queen2.id);
      });
    });

    test('each mode should filter contestants correctly', () => {
      // Standard mode = all contestants
      const standardContestants = getContestantsByMode(false, false);
      expect(standardContestants.length).toBe(contestants.length);

      // Easy mode = seasons 1-10, top 7
      const easyContestants = getContestantsByMode(true, true);
      easyContestants.forEach(c => {
        expect(c.season).toBeLessThanOrEqual(10);
        expect(c.finishingPosition).toBeLessThanOrEqual(7);
      });
      expect(easyContestants.length).toBeLessThan(contestants.length);
    });

    test('different dates should produce different queens within the same mode', () => {
      const date1 = new Date('2024-06-15T12:00:00-07:00');
      const date2 = new Date('2024-06-16T12:00:00-07:00');
      const date3 = new Date('2024-06-17T12:00:00-07:00');

      const queen1 = getDailyQueen(date1, 'easy');
      const queen2 = getDailyQueen(date2, 'easy');
      const queen3 = getDailyQueen(date3, 'easy');

      const uniqueIds = new Set([queen1.id, queen2.id, queen3.id]);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('4.4.2: Mode Switching Preserves Game State', () => {

    const createMockGameState = (mode: GameModeKey, guessCount: number): GameState => {
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
        modeKey: mode
      };
    };

    test('game states for different modes should be stored independently', () => {
      const modes: GameModeKey[] = ['easy', 'standard'];

      modes.forEach((key, index) => {
        const gameState = createMockGameState(key, index + 1);
        saveGameState(gameState, key);
      });

      modes.forEach((key, index) => {
        const loadedState = loadGameState(key);
        expect(loadedState).not.toBeNull();
        expect(loadedState!.guesses.length).toBe(index + 1);
        expect(loadedState!.modeKey).toBe(key);
      });
    });

    test('switching modes should not affect other mode game state', () => {
      const easyState = createMockGameState('easy', 3);
      const standardState = createMockGameState('standard', 2);

      saveGameState(easyState, 'easy');
      saveGameState(standardState, 'standard');

      // Update standard mode
      const updatedStandard = { ...standardState, guesses: [...standardState.guesses, standardState.guesses[0]] };
      saveGameState(updatedStandard, 'standard');

      // Easy mode should be unaffected
      expect(loadGameState('easy')!.guesses.length).toBe(3);
      expect(loadGameState('standard')!.guesses.length).toBe(3);
    });

    test('clearing one mode should not affect the other', () => {
      const modes: GameModeKey[] = ['easy', 'standard'];
      modes.forEach((key, index) => {
        saveGameState(createMockGameState(key, index + 1), key);
      });

      clearGameState('easy');
      expect(loadGameState('easy')).toBeNull();
      expect(loadGameState('standard')).not.toBeNull();
    });
  });

  describe('4.4.3: Mode-Specific Statistics Tracking', () => {

    const createCompletedGameState = (
      mode: GameModeKey,
      isWon: boolean,
      guessCount: number
    ): GameState => {
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
        modeKey: mode
      };
    };

    test('statistics should be stored separately for each mode', () => {
      resetStatistics('easy');
      resetStatistics('standard');

      updateStatistics(createCompletedGameState('easy', true, 2));
      updateStatistics(createCompletedGameState('standard', true, 3));
      updateStatistics(createCompletedGameState('standard', true, 4));

      expect(getCurrentStatistics('easy').gamesPlayed).toBe(1);
      expect(getCurrentStatistics('standard').gamesPlayed).toBe(2);
    });

    test('completing a game in one mode should not affect the other', () => {
      resetStatistics('easy');
      resetStatistics('standard');

      updateStatistics(createCompletedGameState('easy', true, 3));
      updateStatistics(createCompletedGameState('standard', true, 3));

      // Play another game only in easy
      updateStatistics(createCompletedGameState('easy', true, 2));

      expect(getCurrentStatistics('easy').gamesPlayed).toBe(2);
      expect(getCurrentStatistics('standard').gamesPlayed).toBe(1);
    });

    test('win streaks should be tracked independently per mode', () => {
      resetStatistics('easy');
      resetStatistics('standard');

      // Easy: 2 wins
      updateStatistics(createCompletedGameState('easy', true, 3));
      updateStatistics(createCompletedGameState('easy', true, 2));

      // Standard: 1 win then 1 loss
      updateStatistics(createCompletedGameState('standard', true, 3));
      updateStatistics(createCompletedGameState('standard', false, 8));

      expect(getCurrentStatistics('easy').currentStreak).toBe(2);
      expect(getCurrentStatistics('standard').currentStreak).toBe(0);
      expect(getCurrentStatistics('standard').maxStreak).toBe(1);
    });
  });

  describe('4.4.4: Default Game Mode for New Players', () => {

    test('DEFAULT_GAME_MODE should be easy', () => {
      expect(DEFAULT_GAME_MODE).toBe('easy');
    });

    test('new players without saved preferences should get easy mode', () => {
      localStorage.clear();
      const preferences = loadPreferences();
      expect(preferences.currentMode).toBe('easy');
    });

    test('getDailyQueen with easy mode should return valid contestant', () => {
      const queen = getDailyQueen(new Date(), 'easy');
      expect(queen).toBeDefined();
      expect(queen.season).toBeLessThanOrEqual(10);
      expect(queen.finishingPosition).toBeLessThanOrEqual(7);
    });

    test('easy mode contestant pool should be smaller than standard', () => {
      const easyContestants = getContestantsByMode(true, true);
      const allContestants = getContestantsByMode(false, false);

      expect(easyContestants.length).toBeLessThan(allContestants.length);
      easyContestants.forEach(c => {
        expect(c.season).toBeLessThanOrEqual(10);
        expect(c.finishingPosition).toBeLessThanOrEqual(7);
      });
    });
  });
});
