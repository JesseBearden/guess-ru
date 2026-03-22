import { GameState, Statistics, GameModeKey, DEFAULT_GAME_MODE } from '../types/index';
import { getPacificDateString } from './dailyQueenSelection';

// Storage keys
const STORAGE_KEYS = {
  GAME_STATE: 'guessru_game_state',
  STATISTICS: 'guessru_statistics',
  PREFERENCES: 'guessru_preferences',
  LAST_CLEANUP: 'guessru_last_cleanup'
} as const;

// Helper to get mode-specific storage key
const getModeStorageKey = (baseKey: string, modeKey: GameModeKey): string => {
  if (modeKey === 'easy') return `${baseKey}_easy`;
  return `${baseKey}_standard`;
};

// Preferences interface
export interface Preferences {
  hasSeenInstructions: boolean;
  showSilhouette: boolean;
  currentMode?: GameModeKey;
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
  showSilhouette: false,
  currentMode: DEFAULT_GAME_MODE
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
 * @param gameState The game state to save
 * @param modeKey Optional mode key, defaults to 'default'
 */
export function saveGameState(gameState: GameState, modeKey: GameModeKey = 'easy'): boolean {
  const storageKey = getModeStorageKey(STORAGE_KEYS.GAME_STATE, modeKey);
  return safeSetItem(storageKey, { ...gameState, modeKey });
}

/**
 * Load game state from localStorage
 * Returns null if no valid game state found or if it's from a different day
 * @param modeKey Optional mode key, defaults to 'default'
 */
export function loadGameState(modeKey: GameModeKey = 'easy'): GameState | null {
  const storageKey = getModeStorageKey(STORAGE_KEYS.GAME_STATE, modeKey);
  const stored = safeGetItem(storageKey);
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
    safeRemoveItem(storageKey);
    return null;
  }

  return gameState;
}

/**
 * Clear game state from localStorage
 * @param modeKey Optional mode key, defaults to 'default'
 */
export function clearGameState(modeKey: GameModeKey = 'easy'): boolean {
  const storageKey = getModeStorageKey(STORAGE_KEYS.GAME_STATE, modeKey);
  return safeRemoveItem(storageKey);
}

/**
 * Save statistics to localStorage
 * @param statistics The statistics to save
 * @param modeKey Optional mode key, defaults to 'default'
 */
export function saveStatistics(statistics: Statistics, modeKey: GameModeKey = 'easy'): boolean {
  const storageKey = getModeStorageKey(STORAGE_KEYS.STATISTICS, modeKey);
  return safeSetItem(storageKey, statistics);
}

/**
 * Load statistics from localStorage
 * @param modeKey Optional mode key, defaults to 'default'
 */
export function loadStatistics(modeKey: GameModeKey = 'easy'): Statistics {
  const storageKey = getModeStorageKey(STORAGE_KEYS.STATISTICS, modeKey);
  const stored = safeGetItem(storageKey);
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
 * Handles migration from old GameMode object format to new GameModeKey string format
 */
export function loadPreferences(): Preferences {
  const stored = safeGetItem(STORAGE_KEYS.PREFERENCES);
  const prefs = safeParseJSON(stored, DEFAULT_PREFERENCES);
  
  // Migrate old GameMode object format to new GameModeKey string
  if (prefs.currentMode && typeof prefs.currentMode !== 'string') {
    // Old format was { firstTenSeasons: boolean, topFiveOnly: boolean }
    prefs.currentMode = 'easy'; // Map old default to new easy mode
    savePreferences(prefs);
  }
  
  // Validate currentMode is a valid GameModeKey
  if (prefs.currentMode !== 'easy' && prefs.currentMode !== 'standard') {
    prefs.currentMode = DEFAULT_GAME_MODE;
  }
  
  return prefs;
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
 * Also handles one-time migration from old 4-mode system to new 2-mode system
 * Should be called on app initialization
 */
export function performDailyCleanup(): void {
  // One-time migration from old mode keys to new ones
  const migrated = safeGetItem('guessru_modes_migrated');
  if (!migrated) {
    // Migrate old statistics: first10-top5 -> easy, default -> standard
    const oldEasyStats = safeGetItem('guessru_statistics_first10-top5');
    const oldStandardStats = safeGetItem('guessru_statistics');
    
    if (oldEasyStats && !safeGetItem('guessru_statistics_easy')) {
      try { localStorage.setItem('guessru_statistics_easy', oldEasyStats); } catch {}
    }
    if (oldStandardStats && !safeGetItem('guessru_statistics_standard')) {
      try { localStorage.setItem('guessru_statistics_standard', oldStandardStats); } catch {}
    }
    
    // Migrate old game states similarly
    const oldEasyGame = safeGetItem('guessru_game_state_first10-top5');
    const oldStandardGame = safeGetItem('guessru_game_state');
    
    if (oldEasyGame && !safeGetItem('guessru_game_state_easy')) {
      try { localStorage.setItem('guessru_game_state_easy', oldEasyGame); } catch {}
    }
    if (oldStandardGame && !safeGetItem('guessru_game_state_standard')) {
      try { localStorage.setItem('guessru_game_state_standard', oldStandardGame); } catch {}
    }
    
    safeSetItem('guessru_modes_migrated', 'true');
  }

  const today = getPacificDateString();
  const lastCleanup = safeGetItem(STORAGE_KEYS.LAST_CLEANUP);

  // If we haven't cleaned up today, perform cleanup
  if (lastCleanup !== today) {
    // Clean up game states for all modes
    const modeKeys: GameModeKey[] = ['easy', 'standard'];
    
    for (const modeKey of modeKeys) {
      const storageKey = getModeStorageKey(STORAGE_KEYS.GAME_STATE, modeKey);
      const currentGameState = safeGetItem(storageKey);
      if (currentGameState) {
        const gameState = safeParseJSON<GameState | null>(currentGameState, null);
        if (gameState && gameState.gameDate !== today) {
          safeRemoveItem(storageKey);
        }
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