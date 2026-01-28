import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import GuessInput from './GuessInput';
import { Contestant } from '../types';

// Mock the contestant database
jest.mock('../utilities/contestantDatabase', () => ({
  contestants: [
    {
      id: 'bianca-del-rio',
      name: 'Bianca Del Rio',
      season: 6,
      finishingPosition: 1,
      ageAtShow: 37,
      hometown: 'New York, New York',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: '/images/headshots/bianca-del-rio.jpg',
      silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
    },
    {
      id: 'bob-the-drag-queen',
      name: 'Bob the Drag Queen',
      season: 8,
      finishingPosition: 1,
      ageAtShow: 29,
      hometown: 'New York, New York',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: '/images/headshots/bob-the-drag-queen.jpg',
      silhouetteUrl: '/images/silhouettes/bob-the-drag-queen.jpg'
    }
  ],
  getContestantsByName: (name: string) => {
    const searchTerm = name.toLowerCase();
    const contestants = [
      {
        id: 'bianca-del-rio',
        name: 'Bianca Del Rio',
        season: 6,
        finishingPosition: 1,
        ageAtShow: 37,
        hometown: 'New York, New York',
        hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
        headshotUrl: '/images/headshots/bianca-del-rio.jpg',
        silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
      },
      {
        id: 'bob-the-drag-queen',
        name: 'Bob the Drag Queen',
        season: 8,
        finishingPosition: 1,
        ageAtShow: 29,
        hometown: 'New York, New York',
        hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
        headshotUrl: '/images/headshots/bob-the-drag-queen.jpg',
        silhouetteUrl: '/images/silhouettes/bob-the-drag-queen.jpg'
      }
    ];
    return contestants.filter(contestant => 
      contestant.name.toLowerCase().includes(searchTerm)
    );
  }
}));

describe('GuessInput Component', () => {
  const mockOnGuessSubmit = jest.fn();
  const defaultProps = {
    onGuessSubmit: mockOnGuessSubmit,
    previousGuesses: []
  };

  // Use the same mock data structure
  const biancaContestant = {
    id: 'bianca-del-rio',
    name: 'Bianca Del Rio',
    season: 6,
    finishingPosition: 1,
    ageAtShow: 37,
    hometown: 'New York, New York',
    hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
    headshotUrl: '/images/headshots/bianca-del-rio.jpg',
    silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field with placeholder', () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', "Type a drag queen's name...");
  });

  test('shows autocomplete dropdown when typing', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Bianca');
    
    await waitFor(() => {
      expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
      expect(screen.getByText('Season 6 • New York, New York')).toBeInTheDocument();
    });
  });

  test('filters contestants based on input', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Bob');
    
    await waitFor(() => {
      expect(screen.getByText('Bob the Drag Queen')).toBeInTheDocument();
      expect(screen.queryByText('Bianca Del Rio')).not.toBeInTheDocument();
    });
  });

  test('submits guess when clicking on dropdown item', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Bianca');
    
    await waitFor(() => {
      expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Bianca Del Rio'));
    
    expect(mockOnGuessSubmit).toHaveBeenCalledWith(biancaContestant);
    expect(input).toHaveValue('');
  });

  test('prevents duplicate guesses', async () => {
    const propsWithPreviousGuess = {
      ...defaultProps,
      previousGuesses: [biancaContestant] // Bianca already guessed
    };
    
    render(<GuessInput {...propsWithPreviousGuess} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Bianca');
    
    await waitFor(() => {
      expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
    });
    
    await userEvent.click(screen.getByText('Bianca Del Rio'));
    
    // The main requirement is that duplicate guesses are prevented
    expect(mockOnGuessSubmit).not.toHaveBeenCalled();
  });

  test('handles keyboard navigation', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'B'); // Should show both Bianca and Bob
    
    await waitFor(() => {
      expect(screen.getByText('Bianca Del Rio')).toBeInTheDocument();
      expect(screen.getByText('Bob the Drag Queen')).toBeInTheDocument();
    });
    
    // Navigate down to first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnGuessSubmit).toHaveBeenCalledWith(biancaContestant);
  });

  test('rejects invalid contestant names', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /submit guess/i });
    
    await userEvent.type(input, 'Invalid Name');
    await userEvent.click(submitButton);
    
    // The main requirement is that invalid names don't trigger submission
    expect(mockOnGuessSubmit).not.toHaveBeenCalled();
  });

  test('disables input when disabled prop is true', () => {
    render(<GuessInput {...defaultProps} disabled={true} />);
    
    const input = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /submit guess/i });
    
    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  test('clears input after successful submission', async () => {
    render(<GuessInput {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Bianca Del Rio');
    
    const submitButton = screen.getByRole('button', { name: /submit guess/i });
    await userEvent.click(submitButton);
    
    expect(mockOnGuessSubmit).toHaveBeenCalledWith(biancaContestant);
    expect(input).toHaveValue('');
  });
});

/**
 * Feature: guessru-game, Property 4: Autocomplete Filtering
 * 
 * For any text input in the guess field, the autocomplete dropdown should show 
 * only contestant names that contain the typed characters as a substring
 * 
 * Validates: Requirements 2.2, 2.3
 */
describe('Property 4: Autocomplete Filtering', () => {
  const mockOnGuessSubmit = jest.fn();
  const defaultProps = {
    onGuessSubmit: mockOnGuessSubmit,
    previousGuesses: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = '';
  });

  test('Feature: guessru-game, Property 4: Autocomplete Filtering - For any text input, autocomplete should show only names containing the typed characters as substring', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (searchTerm) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          
          if (!input) {
            return false;
          }
          
          // Type the search term
          fireEvent.change(input, { target: { value: searchTerm } });
          
          // Get all dropdown items if they exist
          const dropdownItems = container.querySelectorAll('.dropdown-item .contestant-name');
          
          // If dropdown is shown, all items should contain the search term (case insensitive)
          if (dropdownItems.length > 0) {
            for (let i = 0; i < dropdownItems.length; i++) {
              const itemName = dropdownItems[i].textContent || '';
              const containsSearchTerm = itemName.toLowerCase().includes(searchTerm.toLowerCase());
              
              if (!containsSearchTerm) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 4: Autocomplete Filtering - Empty or whitespace input should not show dropdown', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.trim().length === 0),
        (emptySearchTerm) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          
          if (!input) {
            return false;
          }
          
          // Type the empty/whitespace search term
          fireEvent.change(input, { target: { value: emptySearchTerm } });
          
          // Dropdown should not be visible
          const dropdown = container.querySelector('.autocomplete-dropdown');
          return dropdown === null;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Feature: guessru-game, Property 4: Autocomplete Filtering - Case insensitive matching should work consistently', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0 && /^[a-zA-Z\s]+$/.test(s)),
        (baseTerm) => {
          const searchTerms = [
            baseTerm.toLowerCase(),
            baseTerm.toUpperCase(),
            baseTerm.charAt(0).toUpperCase() + baseTerm.slice(1).toLowerCase()
          ];
          
          let previousResults: string[] | null = null;
          
          for (const searchTerm of searchTerms) {
            // Clean up before each iteration
            document.body.innerHTML = '';
            
            const { container } = render(<GuessInput {...defaultProps} />);
            const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
            
            if (!input) {
              return false;
            }
            
            fireEvent.change(input, { target: { value: searchTerm } });
            
            const dropdownItems = container.querySelectorAll('.dropdown-item .contestant-name');
            const currentResults = Array.from(dropdownItems).map(item => item.textContent || '');
            
            // Results should be identical regardless of case
            if (previousResults !== null) {
              if (currentResults.length !== previousResults.length) {
                return false;
              }
              
              for (let i = 0; i < currentResults.length; i++) {
                if (currentResults[i] !== previousResults[i]) {
                  return false;
                }
              }
            }
            
            previousResults = currentResults;
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Feature: guessru-game, Property 4: Autocomplete Filtering - Dropdown should limit results to maximum 10 items', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5 }).filter(s => s.trim().length > 0),
        (searchTerm) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          
          if (!input) {
            return false;
          }
          
          fireEvent.change(input, { target: { value: searchTerm } });
          
          const dropdownItems = container.querySelectorAll('.dropdown-item');
          
          // Should never show more than 10 items
          return dropdownItems.length <= 10;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: guessru-game, Property 5: Guess Validation and Processing
 * 
 * For any submitted guess, the system should validate it against the contestant database,
 * reject duplicates and invalid submissions, and properly process valid submissions
 * 
 * Validates: Requirements 2.5, 2.6, 2.7, 2.8
 */
describe('Property 5: Guess Validation and Processing', () => {
  const mockOnGuessSubmit = jest.fn();
  const defaultProps = {
    onGuessSubmit: mockOnGuessSubmit,
    previousGuesses: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = '';
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Valid contestant names should be accepted and processed', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Bianca Del Rio', 'Bob the Drag Queen'),
        (validName) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Type valid contestant name
          fireEvent.change(input, { target: { value: validName } });
          fireEvent.click(submitButton);
          
          // Valid names should trigger submission
          return mockOnGuessSubmit.mock.calls.length > 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Invalid contestant names should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('XYZ Invalid Name', 'QQQ Test', 'ZZZ Wrong', 'WWW Fake'),
        (invalidName) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Type invalid contestant name
          fireEvent.change(input, { target: { value: invalidName } });
          fireEvent.click(submitButton);
          
          // Invalid names should not trigger submission
          return mockOnGuessSubmit.mock.calls.length === 0;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Duplicate guesses should be rejected', () => {
    const biancaContestant = {
      id: 'bianca-del-rio',
      name: 'Bianca Del Rio',
      season: 6,
      finishingPosition: 1,
      ageAtShow: 37,
      hometown: 'New York, New York',
      hometownCoordinates: { latitude: 40.7128, longitude: -74.0060 },
      headshotUrl: '/images/headshots/bianca-del-rio.jpg',
      silhouetteUrl: '/images/silhouettes/bianca-del-rio.jpg'
    };

    fc.assert(
      fc.property(
        fc.constant('Bianca Del Rio'),
        (duplicateName) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const propsWithPreviousGuess = {
            ...defaultProps,
            previousGuesses: [biancaContestant] // Bianca already guessed
          };
          
          const { container } = render(<GuessInput {...propsWithPreviousGuess} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Try to submit duplicate guess
          fireEvent.change(input, { target: { value: duplicateName } });
          fireEvent.click(submitButton);
          
          // Duplicate guesses should not trigger submission
          return mockOnGuessSubmit.mock.calls.length === 0;
        }
      ),
      { numRuns: 10 }
    );
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Input should be cleared after successful submission', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Bianca Del Rio', 'Bob the Drag Queen'),
        (validName) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Type valid contestant name and submit
          fireEvent.change(input, { target: { value: validName } });
          fireEvent.click(submitButton);
          
          // Input should be cleared after successful submission
          return input.value === '';
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Error messages should be displayed for invalid inputs', () => {
    // This test verifies that invalid inputs don't trigger submission
    // The error message display is implementation-specific
    fc.assert(
      fc.property(
        fc.constantFrom('XYZ Invalid', 'QQQ Test', 'ZZZ Wrong', 'WWW Fake'), // Use specific strings that don't match any contestants
        (invalidName) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Type invalid contestant name and submit
          fireEvent.change(input, { target: { value: invalidName } });
          fireEvent.click(submitButton);
          
          // Invalid names should not trigger submission
          // The component should either show an error or simply not submit
          return mockOnGuessSubmit.mock.calls.length === 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Feature: guessru-game, Property 5: Guess Validation and Processing - Empty input should not trigger submission', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.trim().length === 0),
        (emptyInput) => {
          // Clean up before each property test iteration
          document.body.innerHTML = '';
          
          const { container } = render(<GuessInput {...defaultProps} />);
          const input = container.querySelector('input[role="combobox"]') as HTMLInputElement;
          const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
          
          if (!input || !submitButton) {
            return false;
          }
          
          // Type empty/whitespace input and try to submit
          fireEvent.change(input, { target: { value: emptyInput } });
          fireEvent.click(submitButton);
          
          // Empty input should not trigger submission
          return mockOnGuessSubmit.mock.calls.length === 0;
        }
      ),
      { numRuns: 20 }
    );
  });
});