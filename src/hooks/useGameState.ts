import { useState, useEffect, useCallback } from 'react';
import { GameState, Contestant, Guess, FeedbackType, DirectionType } from '../types';
import { getDailyQueen, getPacificDateString } from '../utilities/dailyQueenSelection';
import { getContestantById } from '../utilities/contestantDatabase';
import { saveGameState, loadGameState, performDailyCleanup } from '../utilities/localStorage';
import { updateStatistics } from '../utilities/statistics';
import { isWithinProximity } from '../utilities/distanceCalculation';
import { useTimerSync } from './useTimerSync';

const MAX_GUESSES = 8;

interface UseGameStateReturn {
  gameState: GameState;
  submitGuess: (contestantId: string) => boolean;
  resetGame: () => void;
  isGameComplete: boolean;
  isGameWon: boolean;
  remainingGuesses: number;
}

/**
 * Custom hook for managing game state
 * Handles guess submission, validation, feedback calculation, and win/loss conditions
 */
export const useGameState = (): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Perform daily cleanup first
    performDailyCleanup();
    
    // Try to load existing game state
    const savedGameState = loadGameState();
    if (savedGameState) {
      return savedGameState;
    }
    
    // Initialize new game state if no saved state found
    const today = getPacificDateString();
    const secretQueen = getDailyQueen();
    
    return {
      secretQueen,
      guesses: [],
      isComplete: false,
      isWon: false,
      startTime: Date.now(),
      gameDate: today
    };
  });

  /**
   * Calculate feedback for a guess compared to the secret queen
   */
  const calculateFeedback = useCallback((guessedContestant: Contestant, secretQueen: Contestant) => {
    const feedback: Guess['feedback'] = {
      season: FeedbackType.WRONG,
      position: FeedbackType.WRONG,
      age: FeedbackType.WRONG,
      hometown: FeedbackType.WRONG
    };

    // Season feedback
    if (guessedContestant.season === secretQueen.season) {
      feedback.season = FeedbackType.CORRECT;
    } else if (Math.abs(guessedContestant.season - secretQueen.season) <= 3) {
      feedback.season = FeedbackType.CLOSE;
      feedback.seasonDirection = guessedContestant.season < secretQueen.season ? DirectionType.HIGHER : DirectionType.LOWER;
    } else {
      feedback.seasonDirection = guessedContestant.season < secretQueen.season ? DirectionType.HIGHER : DirectionType.LOWER;
    }

    // Position feedback (inverted - lower number = higher placement)
    if (guessedContestant.finishingPosition === secretQueen.finishingPosition) {
      feedback.position = FeedbackType.CORRECT;
    } else if (Math.abs(guessedContestant.finishingPosition - secretQueen.finishingPosition) <= 3) {
      feedback.position = FeedbackType.CLOSE;
      // Inverted: if secret is lower number (better placement), show UP arrow
      feedback.positionDirection = guessedContestant.finishingPosition > secretQueen.finishingPosition ? DirectionType.HIGHER : DirectionType.LOWER;
    } else {
      // Inverted: if secret is lower number (better placement), show UP arrow
      feedback.positionDirection = guessedContestant.finishingPosition > secretQueen.finishingPosition ? DirectionType.HIGHER : DirectionType.LOWER;
    }

    // Age feedback
    if (guessedContestant.ageAtShow === secretQueen.ageAtShow) {
      feedback.age = FeedbackType.CORRECT;
    } else if (Math.abs(guessedContestant.ageAtShow - secretQueen.ageAtShow) <= 3) {
      feedback.age = FeedbackType.CLOSE;
      feedback.ageDirection = guessedContestant.ageAtShow < secretQueen.ageAtShow ? DirectionType.HIGHER : DirectionType.LOWER;
    } else {
      feedback.ageDirection = guessedContestant.ageAtShow < secretQueen.ageAtShow ? DirectionType.HIGHER : DirectionType.LOWER;
    }

    // Hometown feedback (exact match or within 75 miles)
    if (guessedContestant.hometown === secretQueen.hometown) {
      feedback.hometown = FeedbackType.CORRECT;
    } else if (
      guessedContestant.hometownCoordinates && 
      secretQueen.hometownCoordinates &&
      isWithinProximity(guessedContestant.hometownCoordinates, secretQueen.hometownCoordinates, 75)
    ) {
      feedback.hometown = FeedbackType.CLOSE;
    }

    return feedback;
  }, []);

  /**
   * Check if the guess is a winning guess (all attributes correct)
   */
  const isWinningGuess = useCallback((feedback: Guess['feedback']): boolean => {
    return (
      feedback.season === FeedbackType.CORRECT &&
      feedback.position === FeedbackType.CORRECT &&
      feedback.age === FeedbackType.CORRECT &&
      feedback.hometown === FeedbackType.CORRECT
    );
  }, []);

  /**
   * Submit a guess and update game state
   * Returns true if guess was valid and submitted, false if invalid
   */
  const submitGuess = useCallback((contestantId: string): boolean => {
    // Validate contestant exists first
    const contestant = getContestantById(contestantId);
    if (!contestant) {
      return false;
    }

    let wasSubmitted = false;

    setGameState(prevState => {
      // Check if game is already complete
      if (prevState.isComplete) {
        return prevState;
      }

      // Check if max guesses reached
      if (prevState.guesses.length >= MAX_GUESSES) {
        return prevState;
      }

      // Check for duplicate guess
      const isDuplicate = prevState.guesses.some(guess => guess.contestant.id === contestantId);
      if (isDuplicate) {
        return prevState;
      }

      // Calculate feedback
      const feedback = calculateFeedback(contestant, prevState.secretQueen);
      
      // Create new guess
      const newGuess: Guess = {
        contestant,
        feedback
      };

      // Check if this is a winning guess
      const isWin = isWinningGuess(feedback);
      const newGuessCount = prevState.guesses.length + 1;
      const isGameOver = isWin || newGuessCount >= MAX_GUESSES;

      wasSubmitted = true;

      // Return updated state
      return {
        ...prevState,
        guesses: [...prevState.guesses, newGuess],
        isComplete: isGameOver,
        isWon: isWin,
        endTime: isGameOver ? Date.now() : undefined,
        statsRecorded: false // Will be set to true after stats are recorded
      };
    });

    return wasSubmitted;
  }, [calculateFeedback, isWinningGuess]);

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback(() => {
    const today = getPacificDateString();
    const secretQueen = getDailyQueen();
    
    setGameState({
      secretQueen,
      guesses: [],
      isComplete: false,
      isWon: false,
      startTime: Date.now(),
      gameDate: today
    });
  }, []);

  /**
   * Check if a new day has started and reset if needed
   */
  useEffect(() => {
    const today = getPacificDateString();
    if (gameState.gameDate !== today) {
      resetGame();
    }
  }, [gameState.gameDate, resetGame]);

  /**
   * Save game state to localStorage whenever it changes
   */
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  /**
   * Update statistics when game completes
   */
  useEffect(() => {
    if (gameState.isComplete && gameState.endTime && !gameState.statsRecorded) {
      // Update statistics only once per game completion
      updateStatistics(gameState);
      // Mark stats as recorded to prevent duplicate counting on refresh
      setGameState(prev => ({ ...prev, statsRecorded: true }));
    }
  }, [gameState.isComplete, gameState.endTime, gameState.statsRecorded]);

  /**
   * Handle cross-tab synchronization
   */
  const handleGameStateSync = useCallback((newGameState: GameState) => {
    // Only update if the new state is different and from the same day
    const today = getPacificDateString();
    if (newGameState.gameDate === today && 
        (newGameState.startTime !== gameState.startTime || 
         newGameState.endTime !== gameState.endTime ||
         newGameState.guesses.length !== gameState.guesses.length)) {
      setGameState(newGameState);
    }
  }, [gameState]);

  useTimerSync({ onGameStateChange: handleGameStateSync });

  return {
    gameState,
    submitGuess,
    resetGame,
    isGameComplete: gameState.isComplete,
    isGameWon: gameState.isWon,
    remainingGuesses: MAX_GUESSES - gameState.guesses.length
  };
};