import { GameState, Statistics } from '../types/index';
import { getPacificDateString } from './dailyQueenSelection';

// Storage keys
const STORAGE_KEYS = {
  GAME_STATE: 'guessru_game_state',
  STATISTICS: 'guessru_statistics',
  PREFERENCES: 'guessru_preferences',
  LAST_CLEANUP: 'guessru_last_cleanup'
} as const;

// Preferences interface
export interface Preferences {
  hasSeenInstructions: boolean;
  showSilhouette: boolean;
}

// Default values
const DEFAULT_STATISTICS: Statistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  winDistribution: [0, 0, 0, 0, 0, 0, 0, 0] // 8 slots for guesses 1-8
};

const DEFAULT_PREFERENCES: Preferences = {
  hasSeenInstructions: false,
  showSilhouette: false
};

/**
 * Safely parse JSON from localStorage with error handling
 */
function safeParseJSON<T>(value: string | null, defaultValue: T): T {
  if (!value) {
    return defaultValue;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse localStorage value:', error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage with error handling
 */
function safeSetItem(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Safely get item from localStorage with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

/**
 * Safely remove item from localStorage with error handling
 */
function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
}

/**
 * Save game state to localStorage
 */
export function saveGameState(gameState: GameState): boolean {
  return safeSetItem(STORAGE_KEYS.GAME_STATE, gameState);
}

/**
 * Load game state from localStorage
 * Returns null if no valid game state found or if it's from a different day
 */
export function loadGameState(): GameState | null {
  const stored = safeGetItem(STORAGE_KEYS.GAME_STATE);
  if (!stored) {
    return null;
  }

  const gameState = safeParseJSON<GameState | null>(stored, null);
  if (!gameState) {
    return null;
  }

  // Check if the game state is from today
  const today = getPacificDateString();
  if (gameState.gameDate !== today) {
    // Game state is from a different day, remove it
    safeRemoveItem(STORAGE_KEYS.GAME_STATE);
    return null;
  }

  return gameState;
}

/**
 * Clear game state from localStorage
 */
export function clearGameState(): boolean {
  return safeRemoveItem(STORAGE_KEYS.GAME_STATE);
}

/**
 * Save statistics to localStorage
 */
export function saveStatistics(statistics: Statistics): boolean {
  return safeSetItem(STORAGE_KEYS.STATISTICS, statistics);
}

/**
 * Load statistics from localStorage
 */
export function loadStatistics(): Statistics {
  const stored = safeGetItem(STORAGE_KEYS.STATISTICS);
  return safeParseJSON(stored, DEFAULT_STATISTICS);
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(preferences: Preferences): boolean {
  return safeSetItem(STORAGE_KEYS.PREFERENCES, preferences);
}

/**
 * Load preferences from localStorage
 */
export function loadPreferences(): Preferences {
  const stored = safeGetItem(STORAGE_KEYS.PREFERENCES);
  return safeParseJSON(stored, DEFAULT_PREFERENCES);
}

/**
 * Update a specific preference
 */
export function updatePreference<K extends keyof Preferences>(
  key: K,
  value: Preferences[K]
): boolean {
  const preferences = loadPreferences();
  preferences[key] = value;
  return savePreferences(preferences);
}

/**
 * Perform daily cleanup of old game data
 * Should be called on app initialization
 */
export function performDailyCleanup(): void {
  const today = getPacificDateString();
  const lastCleanup = safeGetItem(STORAGE_KEYS.LAST_CLEANUP);

  // If we haven't cleaned up today, perform cleanup
  if (lastCleanup !== today) {
    // Remove old game state (loadGameState already handles this, but let's be explicit)
    const currentGameState = safeGetItem(STORAGE_KEYS.GAME_STATE);
    if (currentGameState) {
      const gameState = safeParseJSON<GameState | null>(currentGameState, null);
      if (gameState && gameState.gameDate !== today) {
        clearGameState();
      }
    }

    // Mark cleanup as completed for today
    safeSetItem(STORAGE_KEYS.LAST_CLEANUP, today);
  }
}

/**
 * Check if localStorage is available and working
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__guessru_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage usage information (for debugging)
 */
export function getStorageInfo(): {
  isAvailable: boolean;
  gameStateSize: number;
  statisticsSize: number;
  preferencesSize: number;
} {
  const isAvailable = isLocalStorageAvailable();
  
  if (!isAvailable) {
    return {
      isAvailable: false,
      gameStateSize: 0,
      statisticsSize: 0,
      preferencesSize: 0
    };
  }

  const gameState = safeGetItem(STORAGE_KEYS.GAME_STATE);
  const statistics = safeGetItem(STORAGE_KEYS.STATISTICS);
  const preferences = safeGetItem(STORAGE_KEYS.PREFERENCES);

  return {
    isAvailable: true,
    gameStateSize: gameState ? gameState.length : 0,
    statisticsSize: statistics ? statistics.length : 0,
    preferencesSize: preferences ? preferences.length : 0
  };
}