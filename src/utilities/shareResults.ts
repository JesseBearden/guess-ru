import { GameState, ShareResults, FeedbackType, GameModeKey } from '../types';
import { getGameNumber } from './dailyQueenSelection';

/**
 * Mode icons for share results
 * 👑 = All Queens (hardest - crown worthy)
 * 🔟 = First 10 Seasons
 * 🔝 = Top 5 Only
 */
const getModeIcon = (modeKey: GameModeKey): string => {
  switch (modeKey) {
    case 'default':
      return '👑'; // All queens - hardest mode gets the crown
    case 'first10':
      return '🔟'; // First 10 seasons only
    case 'top5':
      return '🔝'; // Top 5 only
    case 'first10-top5':
      return '🔟🔝'; // Both filters
    default:
      return '';
  }
};

/**
 * Formats elapsed time from milliseconds to MM:SS format
 * @param startTime Game start time in milliseconds
 * @param endTime Game end time in milliseconds
 * @returns Formatted time string in MM:SS format (capped at 99:59)
 */
export const formatElapsedTime = (startTime: number, endTime?: number): string => {
  if (!endTime) return '00:00';
  
  const totalSeconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.min(Math.floor(totalSeconds / 60), 99); // Cap at 99 minutes
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Converts feedback type to emoji for sharing
 * @param feedback The feedback type
 * @returns Emoji representing the feedback
 */
export const feedbackToEmoji = (feedback: FeedbackType): string => {
  switch (feedback) {
    case FeedbackType.CORRECT:
      return '🟩';
    case FeedbackType.CLOSE:
      return '🟨';
    case FeedbackType.WRONG:
      return '⬛';
    default:
      return '⬛';
  }
};

/**
 * Generates the visual pattern for a single guess
 * @param guess The guess to convert to emoji pattern
 * @returns Array of emojis representing the guess feedback
 */
export const generateGuessPattern = (guess: any): string[] => {
  return [
    feedbackToEmoji(guess.feedback.season),
    feedbackToEmoji(guess.feedback.position),
    feedbackToEmoji(guess.feedback.age),
    feedbackToEmoji(guess.feedback.hometown)
  ];
};

/**
 * Generates share results data from game state
 * @param gameState The completed game state
 * @returns ShareResults object with all sharing data
 */
export const generateShareResults = (gameState: GameState): ShareResults => {
  if (!gameState.isComplete) {
    throw new Error('Cannot generate share results for incomplete game');
  }

  const gameDate = new Date(gameState.gameDate + 'T00:00:00-08:00'); // Pacific Time
  const gameNumber = getGameNumber(gameDate);
  const guessCount = gameState.guesses.length;
  const timeElapsed = formatElapsedTime(gameState.startTime, gameState.endTime);
  const modeKey = gameState.modeKey || 'default';
  
  // Generate pattern for each guess
  const guessPattern = gameState.guesses.map(guess => generateGuessPattern(guess));
  
  // Count hints used
  const hintsUsed = gameState.hintsUsed 
    ? (gameState.hintsUsed.entranceQuote ? 1 : 0) + (gameState.hintsUsed.snatchGame ? 1 : 0)
    : 0;
  
  return {
    gameNumber,
    guessCount,
    totalGuesses: 8,
    timeElapsed,
    guessPattern,
    modeKey,
    hintsUsed
  };
};

/**
 * Formats share results as text for copying to clipboard
 * @param shareResults The share results data
 * @param isWon Whether the player won the game
 * @param hintsUsedDetail Optional detail about which hints were used
 * @returns Formatted text string ready for sharing
 */
export const formatShareText = (shareResults: ShareResults, isWon: boolean, hintsUsedDetail?: { entranceQuote: boolean; snatchGame: boolean }): string => {
  const { gameNumber, guessCount, totalGuesses, timeElapsed, guessPattern, modeKey } = shareResults;
  
  // Header line with game number, mode icon, hints indicator, and result
  const resultText = isWon ? `${guessCount}/${totalGuesses}` : 'X/8';
  const modeIcon = getModeIcon(modeKey || 'default');
  
  // Build hints indicator with specific icons
  let hintsIndicator = '';
  if (hintsUsedDetail) {
    if (hintsUsedDetail.entranceQuote) hintsIndicator += '🎤';
    if (hintsUsedDetail.snatchGame) hintsIndicator += '🎭';
  }
  
  const header = `GuessRu #${gameNumber} ${modeIcon}${hintsIndicator ? ' ' + hintsIndicator : ''} ${resultText} ⏱️ ${timeElapsed}`;
  
  // Empty line
  const emptyLine = '';
  
  // Visual pattern - each guess on its own line
  const patternLines = guessPattern.map(pattern => pattern.join(''));
  
  // Website link
  const websiteLink = 'https://guessru.com';
  
  // Combine all parts
  return [header, emptyLine, ...patternLines, emptyLine, websiteLink].join('\n');
};

/**
 * Copies share results to clipboard
 * @param gameState The completed game state
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const copyShareResults = async (gameState: GameState): Promise<boolean> => {
  try {
    const shareResults = generateShareResults(gameState);
    const shareText = formatShareText(shareResults, gameState.isWon, gameState.hintsUsed);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy share results:', error);
    return false;
  }
};

/**
 * Validates share results format
 * @param shareResults The share results to validate
 * @returns Validation result with any errors found
 */
export const validateShareResults = (shareResults: ShareResults): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Validate game number
  if (!Number.isInteger(shareResults.gameNumber) || shareResults.gameNumber < 1) {
    errors.push('Game number must be a positive integer');
  }
  
  // Validate guess count
  if (!Number.isInteger(shareResults.guessCount) || 
      shareResults.guessCount < 1 || 
      shareResults.guessCount > shareResults.totalGuesses) {
    errors.push(`Guess count must be between 1 and ${shareResults.totalGuesses}`);
  }
  
  // Validate total guesses
  if (shareResults.totalGuesses !== 8) {
    errors.push('Total guesses must be 8');
  }
  
  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(shareResults.timeElapsed)) {
    errors.push('Time elapsed must be in MM:SS format');
  }
  
  // Validate guess pattern
  if (!Array.isArray(shareResults.guessPattern)) {
    errors.push('Guess pattern must be an array');
  } else {
    if (shareResults.guessPattern.length !== shareResults.guessCount) {
      errors.push('Guess pattern length must match guess count');
    }
    
    shareResults.guessPattern.forEach((pattern, index) => {
      if (!Array.isArray(pattern)) {
        errors.push(`Guess pattern ${index + 1} must be an array`);
      } else if (pattern.length !== 4) {
        errors.push(`Guess pattern ${index + 1} must have exactly 4 elements`);
      } else {
        pattern.forEach((emoji, emojiIndex) => {
          if (!['🟩', '🟨', '⬛'].includes(emoji)) {
            errors.push(`Invalid emoji in guess pattern ${index + 1}, position ${emojiIndex + 1}`);
          }
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};