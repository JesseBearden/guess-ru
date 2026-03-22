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
  entranceQuote?: string; // Optional entrance quote from the queen
  farewellQuote?: string; // Optional farewell/elimination quote
  snatchGameCharacter?: string; // Who they played in Snatch Game
  instagramHandle?: string; // Instagram handle (without @)
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

export interface HintsUsed {
  entranceQuote: boolean;
  snatchGame: boolean;
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
  hintsUsed?: HintsUsed; // Tracks which hints the player has revealed
}

export interface ShareResults {
  gameNumber: number;
  guessCount: number;
  totalGuesses: number; // Always 8
  timeElapsed: string; // MM:SS format
  guessPattern: string[][]; // Array of arrays representing color patterns for each guess
  modeKey?: GameModeKey; // The game mode for displaying mode icon
  hintsUsed?: number; // Number of hints used (0, 1, or 2)
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winDistribution: number[]; // Index represents guess number (0-7 for guesses 1-8)
}

// Game Mode types - simplified to Easy/Standard toggle
export type GameModeKey = 'easy' | 'standard';

// Easy = Top 7 from first 10 seasons, Standard = all queens all seasons
export const DEFAULT_GAME_MODE: GameModeKey = 'easy';

// Helper to get filtering params from mode key
export function getModeFilters(mode: GameModeKey): { firstTenSeasons: boolean; topSevenOnly: boolean } {
  if (mode === 'easy') return { firstTenSeasons: true, topSevenOnly: true };
  return { firstTenSeasons: false, topSevenOnly: false };
}