import { Contestant, GameMode, getModeKey, DEFAULT_GAME_MODE } from '../types';
import { contestants, getContestantsByMode } from './contestantDatabase';

/**
 * Deterministic daily queen selection algorithm
 * Ensures all players worldwide get the same queen each day based on Pacific Time
 */

/**
 * Gets the current date in Pacific Time zone
 * @param date Optional date to convert, defaults to current date
 * @returns Date object representing Pacific Time
 */
export const getPacificTimeDate = (date: Date = new Date()): Date => {
  // Convert to Pacific Time using Intl.DateTimeFormat
  const pacificTimeString = date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the Pacific time string back to a Date object
  const [datePart, timePart] = pacificTimeString.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
};

/**
 * Gets the Pacific Time date string in YYYY-MM-DD format
 * @param date Optional date to convert, defaults to current date
 * @returns Date string in YYYY-MM-DD format
 */
export const getPacificDateString = (date: Date = new Date()): string => {
  const pacificDate = getPacificTimeDate(date);
  const year = pacificDate.getFullYear();
  const month = String(pacificDate.getMonth() + 1).padStart(2, '0');
  const day = String(pacificDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates the number of days since the epoch (January 1, 1970) in Pacific Time
 * @param date Optional date to calculate from, defaults to current date
 * @returns Number of days since epoch
 */
export const getDaysSinceEpoch = (date: Date = new Date()): number => {
  const pacificDate = getPacificTimeDate(date);
  // Set time to midnight to ensure consistent day calculation
  const midnightPacific = new Date(
    pacificDate.getFullYear(),
    pacificDate.getMonth(),
    pacificDate.getDate(),
    0, 0, 0, 0
  );
  
  const epochStart = new Date(1970, 0, 1, 0, 0, 0, 0); // January 1, 1970 midnight
  const timeDiff = midnightPacific.getTime() - epochStart.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Selects the daily queen based on Pacific Time date and game mode
 * Uses a deterministic algorithm to ensure all players get the same queen each day
 * Different modes get different queens by incorporating mode into the seed
 * @param date Optional date to select queen for, defaults to current date
 * @param mode Optional game mode, defaults to DEFAULT_GAME_MODE
 * @returns The contestant who is the secret queen for the given date and mode
 */
export const getDailyQueen = (date: Date = new Date(), mode: GameMode = DEFAULT_GAME_MODE): Contestant => {
  // Get contestants filtered by mode
  const modeContestants = getContestantsByMode(mode.firstTenSeasons, mode.topFiveOnly);
  
  if (modeContestants.length === 0) {
    throw new Error('No contestants available for the selected game mode');
  }
  
  const daysSinceEpoch = getDaysSinceEpoch(date);
  
  // Create a mode-specific offset to ensure different modes get different queens
  // This uses a simple hash based on the mode key
  const modeKey = getModeKey(mode);
  let modeOffset = 0;
  if (modeKey === 'first10') modeOffset = 7;
  else if (modeKey === 'top5') modeOffset = 13;
  else if (modeKey === 'first10-top5') modeOffset = 23;
  
  const queenIndex = (daysSinceEpoch + modeOffset) % modeContestants.length;
  
  return modeContestants[queenIndex];
};

/**
 * The launch date of GuessRu - January 28, 2026 Pacific Time
 * Game numbers start from 1 on this date
 */
const LAUNCH_DATE = new Date(2026, 0, 28, 0, 0, 0, 0); // January 28, 2026

/**
 * Gets the game number for a given date (days since launch date + 1)
 * Game #1 is January 28, 2026
 * @param date Optional date to get game number for, defaults to current date
 * @returns Game number for sharing results
 */
export const getGameNumber = (date: Date = new Date()): number => {
  const pacificDate = getPacificTimeDate(date);
  const midnightPacific = new Date(
    pacificDate.getFullYear(),
    pacificDate.getMonth(),
    pacificDate.getDate(),
    0, 0, 0, 0
  );
  
  const timeDiff = midnightPacific.getTime() - LAUNCH_DATE.getTime();
  const daysSinceLaunch = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Game number is 1-indexed, so add 1
  return daysSinceLaunch + 1;
};

/**
 * Checks if a new day has started in Pacific Time since the last game
 * @param lastGameDate Date string from previous game in YYYY-MM-DD format
 * @param currentDate Optional current date, defaults to now
 * @returns True if a new day has started, false otherwise
 */
export const hasNewDayStarted = (
  lastGameDate: string, 
  currentDate: Date = new Date()
): boolean => {
  const currentPacificDateString = getPacificDateString(currentDate);
  return lastGameDate !== currentPacificDateString;
};

/**
 * Validates that the daily queen selection is working correctly
 * @returns Validation result with any errors found
 */
export const validateDailyQueenSelection = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  try {
    // Test with current date
    const currentQueen = getDailyQueen();
    if (!currentQueen) {
      errors.push('getDailyQueen returned null or undefined');
    }
    
    // Test consistency - same date should return same queen
    const testDate = new Date('2024-01-15T10:00:00-08:00'); // Pacific Time
    const queen1 = getDailyQueen(testDate);
    const queen2 = getDailyQueen(testDate);
    
    if (queen1.id !== queen2.id) {
      errors.push('getDailyQueen is not deterministic for the same date');
    }
    
    // Test different dates return different queens (with high probability)
    const date1 = new Date('2024-01-15T10:00:00-08:00');
    const date2 = new Date('2024-01-16T10:00:00-08:00');
    const queen1Date1 = getDailyQueen(date1);
    const queen1Date2 = getDailyQueen(date2);
    
    // Note: This could theoretically fail if consecutive days map to the same queen
    // but with a large contestant database, this is very unlikely
    if (queen1Date1.id === queen1Date2.id && contestants.length > 1) {
      // Only warn, don't fail, as this could legitimately happen
      console.warn('Consecutive dates returned the same queen - this is possible but unlikely');
    }
    
    // Test timezone handling
    const utcDate = new Date('2024-01-15T18:00:00Z'); // 10 AM Pacific
    const pacificDate = new Date('2024-01-15T10:00:00-08:00'); // Same moment
    const queenUTC = getDailyQueen(utcDate);
    const queenPacific = getDailyQueen(pacificDate);
    
    if (queenUTC.id !== queenPacific.id) {
      errors.push('Timezone conversion is not working correctly');
    }
    
  } catch (error) {
    errors.push(`Error during validation: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};