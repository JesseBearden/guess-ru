import { useEffect, useCallback } from 'react';
import { loadGameState } from '../utilities/localStorage';

interface UseTimerSyncProps {
  onGameStateChange: (newGameState: any) => void;
}

/**
 * Custom hook for synchronizing timer state across browser tabs
 * Listens for localStorage changes and updates game state accordingly
 */
export const useTimerSync = ({ onGameStateChange }: UseTimerSyncProps) => {
  /**
   * Handle storage events from other tabs
   */
  const handleStorageChange = useCallback((event: StorageEvent) => {
    // Only handle changes to our game state key
    if (event.key === 'guessru_game_state' && event.newValue) {
      try {
        const newGameState = JSON.parse(event.newValue);
        onGameStateChange(newGameState);
      } catch (error) {
        console.warn('Failed to parse game state from storage event:', error);
      }
    }
  }, [onGameStateChange]);

  /**
   * Handle visibility change (when tab becomes active)
   * Sync with latest game state from localStorage
   */
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      // Tab became active, sync with latest game state
      const latestGameState = loadGameState();
      if (latestGameState) {
        onGameStateChange(latestGameState);
      }
    }
  }, [onGameStateChange]);

  /**
   * Set up event listeners for cross-tab synchronization
   */
  useEffect(() => {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for visibility changes to sync when tab becomes active
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleStorageChange, handleVisibilityChange]);
};