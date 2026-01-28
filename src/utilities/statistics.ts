import { Statistics, GameState } from '../types';
import { loadStatistics, saveStatistics } from './localStorage';

/**
 * Update statistics after a game completion
 * @param gameState The completed game state
 * @returns Updated statistics object
 */
export function updateStatistics(gameState: GameState): Statistics {
  if (!gameState.isComplete) {
    throw new Error('Cannot update statistics for incomplete game');
  }

  const currentStats = loadStatistics();
  const newStats: Statistics = { ...currentStats };

  // Increment games played
  newStats.gamesPlayed += 1;

  // Update win-related statistics
  if (gameState.isWon) {
    newStats.gamesWon += 1;
    newStats.currentStreak += 1;
    
    // Update max streak if current streak is higher
    if (newStats.currentStreak > newStats.maxStreak) {
      newStats.maxStreak = newStats.currentStreak;
    }

    // Update win distribution (guess count - 1 for 0-based index)
    const guessCount = gameState.guesses.length;
    if (guessCount >= 1 && guessCount <= 8) {
      newStats.winDistribution[guessCount - 1] += 1;
    }
  } else {
    // Reset current streak on loss
    newStats.currentStreak = 0;
  }

  // Save updated statistics
  saveStatistics(newStats);
  
  return newStats;
}

/**
 * Calculate win percentage from statistics
 * @param statistics Statistics object
 * @returns Win percentage as a number between 0 and 100
 */
export function calculateWinPercentage(statistics: Statistics): number {
  if (statistics.gamesPlayed === 0) {
    return 0;
  }
  return Math.round((statistics.gamesWon / statistics.gamesPlayed) * 100);
}

/**
 * Get the most common guess count for wins
 * @param statistics Statistics object
 * @returns The guess count (1-8) that has the most wins, or null if no wins
 */
export function getMostCommonWinGuessCount(statistics: Statistics): number | null {
  if (statistics.gamesWon === 0) {
    return null;
  }

  let maxCount = 0;
  let mostCommonGuessCount = null;

  for (let i = 0; i < statistics.winDistribution.length; i++) {
    if (statistics.winDistribution[i] > maxCount) {
      maxCount = statistics.winDistribution[i];
      mostCommonGuessCount = i + 1; // Convert from 0-based index to 1-based guess count
    }
  }

  return mostCommonGuessCount;
}

/**
 * Reset all statistics to default values
 * @returns Default statistics object
 */
export function resetStatistics(): Statistics {
  const defaultStats: Statistics = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    winDistribution: [0, 0, 0, 0, 0, 0, 0, 0]
  };

  saveStatistics(defaultStats);
  return defaultStats;
}

/**
 * Get current statistics from localStorage
 * @returns Current statistics object
 */
export function getCurrentStatistics(): Statistics {
  return loadStatistics();
}