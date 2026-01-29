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
}

export interface ShareResults {
  gameNumber: number;
  guessCount: number;
  totalGuesses: number; // Always 8
  timeElapsed: string; // MM:SS format
  guessPattern: string[][]; // Array of arrays representing color patterns for each guess
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winDistribution: number[]; // Index represents guess number (0-7 for guesses 1-8)
}