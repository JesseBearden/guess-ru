import {
  saveGameState,
  loadGameState,
  clearGameState,
  saveStatistics,
  loadStatistics,
  savePreferences,
  loadPreferences,
  updatePreference,
  performDailyCleanup,
  isLocalStorageAvailable,
  getStorageInfo,
  Preferences
} from './localStorage';
import { GameState, Statistics, FeedbackType } from '../types/index';
import { getDailyQueen, getPacificDateString } from './dailyQueenSelection';

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

describe('localStorage utilities', () => {
  const mockGameState: GameState = {
    secretQueen: getDailyQueen(),
    guesses: [],
    isComplete: false,
    isWon: false,
    startTime: Date.now(),
    gameDate: getPacificDateString()
  };

  const mockStatistics: Statistics = {
    gamesPlayed: 5,
    gamesWon: 3,
    currentStreak: 2,
    maxStreak: 3,
    winDistribution: [0, 1, 1, 1, 0, 0, 0, 0]
  };

  const mockPreferences: Preferences = {
    hasSeenInstructions: true,
    showSilhouette: true
  };

  describe('Game State Management', () => {
    test('should save and load game state correctly', () => {
      const saved = saveGameState(mockGameState);
      expect(saved).toBe(true);

      const loaded = loadGameState();
      // saveGameState adds modeKey to the saved state
      expect(loaded).toBeDefined();
      expect(loaded?.secretQueen).toEqual(mockGameState.secretQueen);
      expect(loaded?.guesses).toEqual(mockGameState.guesses);
      expect(loaded?.isComplete).toEqual(mockGameState.isComplete);
      expect(loaded?.isWon).toEqual(mockGameState.isWon);
      expect(loaded?.gameDate).toEqual(mockGameState.gameDate);
    });

    test('should return null when no game state exists', () => {
      const loaded = loadGameState();
      expect(loaded).toBeNull();
    });

    test('should return null and clear old game state from different day', () => {
      const oldGameState = {
        ...mockGameState,
        gameDate: '2023-01-01' // Different day
      };

      saveGameState(oldGameState);
      const loaded = loadGameState();
      
      expect(loaded).toBeNull();
      // Check that the old game state was cleared
      expect(localStorage.getItem('guessru_game_state')).toBeNull();
    });

    test('should clear game state successfully', () => {
      saveGameState(mockGameState);
      const cleared = clearGameState();
      
      expect(cleared).toBe(true);
      expect(loadGameState()).toBeNull();
    });
  });

  describe('Statistics Management', () => {
    test('should save and load statistics correctly', () => {
      const saved = saveStatistics(mockStatistics);
      expect(saved).toBe(true);

      const loaded = loadStatistics();
      expect(loaded).toEqual(mockStatistics);
    });

    test('should return default statistics when none exist', () => {
      const loaded = loadStatistics();
      expect(loaded).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        winDistribution: [0, 0, 0, 0, 0, 0, 0, 0]
      });
    });
  });

  describe('Preferences Management', () => {
    test('should save and load preferences correctly', () => {
      const saved = savePreferences(mockPreferences);
      expect(saved).toBe(true);

      const loaded = loadPreferences();
      expect(loaded).toEqual(mockPreferences);
    });

    test('should return default preferences when none exist', () => {
      const loaded = loadPreferences();
      // Default preferences now include currentMode
      expect(loaded.hasSeenInstructions).toBe(false);
      expect(loaded.showSilhouette).toBe(false);
      expect(loaded.currentMode).toBeDefined();
    });

    test('should update individual preference correctly', () => {
      const updated = updatePreference('hasSeenInstructions', true);
      expect(updated).toBe(true);

      const loaded = loadPreferences();
      expect(loaded.hasSeenInstructions).toBe(true);
      expect(loaded.showSilhouette).toBe(false); // Should remain default
    });
  });

  describe('Daily Cleanup', () => {
    test('should perform cleanup on first run', () => {
      const oldGameState = {
        ...mockGameState,
        gameDate: '2023-01-01'
      };

      saveGameState(oldGameState);
      performDailyCleanup();

      expect(loadGameState()).toBeNull();
    });

    test('should not perform cleanup if already done today', () => {
      saveGameState(mockGameState);
      
      // First cleanup
      performDailyCleanup();
      
      // Second cleanup (should not remove current game state)
      performDailyCleanup();
      
      const loaded = loadGameState();
      // saveGameState adds modeKey to the saved state
      expect(loaded).toBeDefined();
      expect(loaded?.secretQueen).toEqual(mockGameState.secretQueen);
      expect(loaded?.guesses).toEqual(mockGameState.guesses);
      expect(loaded?.isComplete).toEqual(mockGameState.isComplete);
      expect(loaded?.isWon).toEqual(mockGameState.isWon);
      expect(loaded?.gameDate).toEqual(mockGameState.gameDate);
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors by replacing setItem
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const saved = saveGameState(mockGameState);
      expect(saved).toBe(false);
      expect(console.warn).toHaveBeenCalled();

      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });

    test('should handle JSON parse errors gracefully', () => {
      // Set invalid JSON directly
      localStorage.setItem('guessru_game_state', 'invalid json');

      const loaded = loadGameState();
      expect(loaded).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    test('should detect localStorage availability', () => {
      expect(isLocalStorageAvailable()).toBe(true);

      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });

      expect(isLocalStorageAvailable()).toBe(false);

      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Storage Info', () => {
    test('should return storage information when available', () => {
      saveGameState(mockGameState);
      saveStatistics(mockStatistics);
      savePreferences(mockPreferences);

      const info = getStorageInfo();
      expect(info.isAvailable).toBe(true);
      expect(info.gameStateSize).toBeGreaterThan(0);
      expect(info.statisticsSize).toBeGreaterThan(0);
      expect(info.preferencesSize).toBeGreaterThan(0);
    });

    test('should return zero sizes when localStorage unavailable', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });

      const info = getStorageInfo();
      expect(info.isAvailable).toBe(false);
      expect(info.gameStateSize).toBe(0);
      expect(info.statisticsSize).toBe(0);
      expect(info.preferencesSize).toBe(0);

      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });
  });
});