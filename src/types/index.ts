// Core data structures for GuessRu game

// Feedback enums for type safety
export enum FeedbackType {
  CORRECT = 'correct',
  CLOSE = 'close',
  WRONG = 'wrong'
}

export enum DirectionType {
  HIGHER = 'higher',
  LOWER = 'lower'
}

export interface HometownCoordinates {
  latitude: number;
  longitude: number;
}

export interface Contestant {
  id: string;
  name: string;
  season: number;
  finishingPosition: number;
  ageAtShow: number;
  hometown: string;
  hometownCoordinates: HometownCoordinates;
  headshotUrl: string; // Full color headshot image
  silhouetteUrl: string; // Blacked-out silhouette version
  entranceQuote?: string; // Optional entrance quote from the queen
}

export interface Guess {
  contestant: Contestant;
  feedback: {
    season: FeedbackType;
    position: FeedbackType;
    age: FeedbackType;
    hometown: FeedbackType;
    seasonDirection?: DirectionType;
    positionDirection?: DirectionType;
    ageDirection?: DirectionType;
  };
}

export interface GameState {
  secretQueen: Contestant;
  guesses: Guess[];
  isComplete: boolean;
  isWon: boolean;
  startTime: number;
  endTime?: number;
  gameDate: string;
  statsRecorded?: boolean; // Flag to prevent duplicate stats recording on refresh
  modeKey?: GameModeKey; // Which mode this game state belongs to (optional for backward compatibility)
}

export interface ShareResults {
  gameNumber: number;
  guessCount: number;
  totalGuesses: number; // Always 8
  timeElapsed: string; // MM:SS format
  guessPattern: string[][]; // Array of arrays representing color patterns for each guess
  modeKey?: GameModeKey; // The game mode for displaying mode icon
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winDistribution: number[]; // Index represents guess number (0-7 for guesses 1-8)
}

// Game Mode types
export interface GameMode {
  firstTenSeasons: boolean;  // Limit to seasons 1-10
  topFiveOnly: boolean;      // Limit to top 5 finishers
}

// Mode key for storage (e.g., "default", "first10", "top5", "first10-top5")
export type GameModeKey = 'default' | 'first10' | 'top5' | 'first10-top5';

// Helper function to get mode key from GameMode
export function getModeKey(mode: GameMode): GameModeKey {
  if (mode.firstTenSeasons && mode.topFiveOnly) return 'first10-top5';
  if (mode.firstTenSeasons) return 'first10';
  if (mode.topFiveOnly) return 'top5';
  return 'default';
}

// Helper function to get GameMode from key
export function getModeFromKey(key: GameModeKey): GameMode {
  switch (key) {
    case 'first10-top5':
      return { firstTenSeasons: true, topFiveOnly: true };
    case 'first10':
      return { firstTenSeasons: true, topFiveOnly: false };
    case 'top5':
      return { firstTenSeasons: false, topFiveOnly: true };
    default:
      return { firstTenSeasons: false, topFiveOnly: false };
  }
}

// Default mode for new players (easiest mode)
export const DEFAULT_GAME_MODE: GameMode = {
  firstTenSeasons: true,
  topFiveOnly: true
};