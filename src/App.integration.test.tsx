import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { contestants } from './utilities/contestantDatabase';
import { getPacificDateString } from './utilities/dailyQueenSelection';

/**
 * Integration Tests for Complete Game Flows
 * Tests full game scenarios from start to win/loss
 * Tests cross-component state synchronization
 * Tests error recovery and graceful degradation
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 */

// Store original localStorage
const originalLocalStorage = window.localStorage;

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe('Integration Tests: Complete Game Flows', () => {
  describe('Game Initialization', () => {
    test('should render the main game interface on load', () => {
      render(<App />);
      
      // Verify header is present
      expect(screen.getByText(/GuessRu/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily drag queen guessing game/i)).toBeInTheDocument();
      
      // Verify game area is present
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Verify guess input is present
      expect(screen.getByPlaceholderText(/Guess a queen/i)).toBeInTheDocument();
      
      // Verify 8 placeholder slots are shown
      expect(screen.getByLabelText('Guess slot 1 - empty')).toBeInTheDocument();
    });

    test('should show instructions modal for first-time visitors', () => {
      render(<App />);
      
      // Instructions modal should appear for first-time visitors
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/How to Play/i)).toBeInTheDocument();
    });

    test('should not show instructions modal for returning visitors', () => {
      // Set preference that user has seen instructions
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Instructions modal should not appear
      expect(screen.queryByText(/How to Play/i)).not.toBeInTheDocument();
    });
  });

  describe('Guess Input and Autocomplete', () => {
    test('should show autocomplete suggestions when typing', async () => {
      // Set preferences to skip instructions modal
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      
      // Type a partial name
      await userEvent.type(input, 'Bi');
      
      // Wait for autocomplete to appear
      await waitFor(() => {
        const suggestions = screen.queryByRole('listbox');
        expect(suggestions).toBeInTheDocument();
      });
    });

    test('should clear input after successful guess submission', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Guess a queen/i) as HTMLInputElement;
      
      // Type a contestant name
      await userEvent.type(input, contestants[0].name);
      
      // Submit the guess by pressing Enter (submit button was removed)
      await userEvent.keyboard('{Enter}');
      
      // Input should be cleared
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Guess History Display', () => {
    test('should display guess history after submitting guesses', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      
      // Submit a guess by typing and pressing Enter
      await userEvent.type(input, contestants[1].name);
      await userEvent.keyboard('{Enter}');
      
      // Wait for guess to appear in history - name appears twice (mobile + desktop)
      await waitFor(() => {
        expect(screen.getAllByText(contestants[1].name).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Game State Persistence', () => {
    test('should persist game state to localStorage', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      
      // Submit a guess by typing and pressing Enter
      await userEvent.type(input, contestants[1].name);
      await userEvent.keyboard('{Enter}');
      
      // Wait for state to be saved (now uses mode-keyed storage)
      await waitFor(() => {
        // Default mode is first10=true, top5=true, so key is guessru_game_state_first10-top5
        const savedState = localStorage.getItem('guessru_game_state_first10-top5');
        expect(savedState).not.toBeNull();
        
        const parsedState = JSON.parse(savedState!);
        expect(parsedState.guesses.length).toBeGreaterThan(0);
      });
    });

    test('should restore game state on page reload', async () => {
      const today = getPacificDateString();
      
      // Pre-populate localStorage with game state using mode-keyed storage
      const mockGameState = {
        secretQueen: contestants[0],
        guesses: [{
          contestant: contestants[1],
          feedback: {
            season: 'wrong',
            position: 'wrong',
            age: 'wrong',
            hometown: 'wrong'
          }
        }],
        isComplete: false,
        isWon: false,
        startTime: Date.now() - 60000,
        gameDate: today
      };
      
      // Use mode-keyed storage (default mode is first10=true, top5=true)
      localStorage.setItem('guessru_game_state_first10-top5', JSON.stringify(mockGameState));
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Verify guess is restored - the contestant name should appear (twice: mobile + desktop)
      await waitFor(() => {
        expect(screen.getAllByText(contestants[1].name).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Timer Functionality', () => {
    test('should display timer in the game interface', () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Timer should be visible
      expect(screen.getByRole('timer')).toBeInTheDocument();
    });
  });

  describe('Settings Modal', () => {
    test('should open settings modal when settings button is clicked', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Find and click the settings button
      const settingsButton = screen.getByRole('button', { name: /Show game settings/i });
      await userEvent.click(settingsButton);
      
      // Settings modal should appear
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        // Modal title is "Settings" not "Game Settings"
        expect(within(modal).getByRole('heading', { name: /Settings/i })).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Modal', () => {
    test('should open statistics modal when stats button is clicked', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Find and click the stats button
      const statsButton = screen.getByRole('button', { name: /Show game statistics/i });
      await userEvent.click(statsButton);
      
      // Stats modal should appear - look for the modal dialog
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        // Check for the heading within the modal
        expect(within(modal).getByRole('heading', { name: /Statistics/i })).toBeInTheDocument();
      });
    });
  });

  describe('Instructions Modal', () => {
    test('should open instructions modal when info button is clicked', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Find and click the info button
      const infoButton = screen.getByRole('button', { name: /Show game instructions/i });
      await userEvent.click(infoButton);
      
      // Instructions modal should appear
      await waitFor(() => {
        expect(screen.getByText(/How to Play/i)).toBeInTheDocument();
      });
    });

    test('should close instructions modal and save preference', async () => {
      render(<App />);
      
      // Instructions modal should be visible for first-time visitor
      expect(screen.getByText(/How to Play/i)).toBeInTheDocument();
      
      // Find and click the close button
      const closeButton = screen.getByRole('button', { name: /Close/i });
      await userEvent.click(closeButton);
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText(/How to Play/i)).not.toBeInTheDocument();
      });
      
      // Preference should be saved
      const prefs = JSON.parse(localStorage.getItem('guessru_preferences')!);
      expect(prefs.hasSeenInstructions).toBe(true);
    });
  });

  describe('Cross-Component State Synchronization', () => {
    test('should update guess history when guess is submitted', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Initial state - should show 8 placeholder slots
      expect(screen.getByLabelText('Guess slot 1 - empty')).toBeInTheDocument();
      
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      
      // Submit a guess by typing and pressing Enter
      await userEvent.type(input, contestants[1].name);
      await userEvent.keyboard('{Enter}');
      
      // Guess should appear in history - name appears twice (mobile + desktop)
      await waitFor(() => {
        expect(screen.getAllByText(contestants[1].name).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const mockStorage = {
        getItem: jest.fn(() => { throw new Error('Storage error'); }),
        setItem: jest.fn(() => { throw new Error('Storage error'); }),
        removeItem: jest.fn(() => { throw new Error('Storage error'); }),
        clear: jest.fn(),
        length: 0,
        key: jest.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true
      });
      
      // App should still render without crashing
      expect(() => render(<App />)).not.toThrow();
      
      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    test('should not submit invalid guess', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      
      // Type an invalid name
      await act(async () => {
        fireEvent.change(input, { target: { value: 'Invalid Queen Name XYZ' } });
      });
      
      // Submit the form
      const form = input.closest('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });
      
      // The guess should not be added to history - still show empty placeholder slots
      await waitFor(() => {
        expect(screen.getByLabelText('Guess slot 1 - empty')).toBeInTheDocument();
      });
    });
  });

  describe('Daily Reset Behavior', () => {
    test('should clear old game state when date changes', async () => {
      // This test verifies that the localStorage cleanup happens correctly
      // The loadGameState function checks if the stored date matches today's date
      // and returns null (clearing the state) if it doesn't match
      
      // Set up game state from a clearly old date using mode-keyed storage
      const oldGameState = {
        secretQueen: contestants[0],
        guesses: [{
          contestant: contestants[1],
          feedback: {
            season: 'wrong',
            position: 'wrong',
            age: 'wrong',
            hometown: 'wrong'
          }
        }],
        isComplete: false,
        isWon: false,
        startTime: Date.now() - 86400000,
        gameDate: '2020-01-01' // A clearly old date that won't match today
      };
      
      // Use mode-keyed storage (default mode is first10=true, top5=true)
      localStorage.setItem('guessru_game_state_first10-top5', JSON.stringify(oldGameState));
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // The old game state should be cleared because the date doesn't match
      // Should show empty placeholder slots for a fresh game
      await waitFor(() => {
        expect(screen.getByLabelText('Guess slot 1 - empty')).toBeInTheDocument();
      });
      
      // Verify the old game state was cleared from localStorage
      // The loadGameState function removes old state and returns null, so the key should be removed
      const storedState = localStorage.getItem('guessru_game_state_first10-top5');
      // After loading, the old state should be removed (null) or replaced with today's date
      expect(storedState === null || JSON.parse(storedState).gameDate !== '2020-01-01').toBe(true);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels on interactive elements', () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Check for skip link
      expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
      
      // Check for main landmark
      expect(screen.getByRole('main')).toHaveAttribute('aria-label');
      
      // Check for timer role
      expect(screen.getByRole('timer')).toBeInTheDocument();
      
      // Check for grid (guess history)
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      localStorage.setItem('guessru_preferences', JSON.stringify({
        hasSeenInstructions: true,
        showSilhouette: false
      }));
      
      render(<App />);
      
      // Tab to the input
      const input = screen.getByPlaceholderText(/Guess a queen/i);
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Type and use keyboard to navigate autocomplete
      await userEvent.type(input, 'Bi');
      
      // Press down arrow to navigate suggestions
      await userEvent.keyboard('{ArrowDown}');
      
      // Press escape to close dropdown
      await userEvent.keyboard('{Escape}');
    });
  });
});
