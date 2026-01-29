import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Contestant, GameMode, DEFAULT_GAME_MODE } from '../types';
import { getContestantsByNameAndMode, getContestantsByMode } from '../utilities/contestantDatabase';

interface GuessInputProps {
  onGuessSubmit: (contestant: Contestant) => void;
  previousGuesses: Contestant[];
  disabled?: boolean;
  placeholder?: string;
  mode?: GameMode;
}

const GuessInput: React.FC<GuessInputProps> = ({
  onGuessSubmit,
  previousGuesses,
  disabled = false,
  placeholder = "Type a drag queen's name...",
  mode = DEFAULT_GAME_MODE
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredContestants, setFilteredContestants] = useState<Contestant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter contestants based on input value and mode
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setFilteredContestants([]);
      setShowDropdown(false);
      setSelectedIndex(-1);
      return;
    }

    const matches = getContestantsByNameAndMode(inputValue.trim(), mode.firstTenSeasons, mode.topFiveOnly);
    setFilteredContestants(matches);
    setShowDropdown(matches.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, mode.firstTenSeasons, mode.topFiveOnly]);

  // Clear error when input changes
  useEffect(() => {
    if (error && inputValue) {
      setError('');
    }
  }, [inputValue, error]);

  // Validate contestant data
  const validateContestant = (contestant: Contestant): boolean => {
    if (!contestant) return false;
    if (!contestant.id || !contestant.name) return false;
    if (!contestant.hometown || !contestant.headshotUrl || !contestant.silhouetteUrl) return false;
    if (contestant.season < 1 || contestant.season > 17) return false;
    if (contestant.ageAtShow < 18 || contestant.ageAtShow > 70) return false;
    if (contestant.finishingPosition < 1) return false;
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Prevent input that's too long (reasonable limit)
    if (value.length > 50) {
      return;
    }
    
    setInputValue(value);
  };

  const handleContestantSelect = (contestant: Contestant) => {
    // Validate contestant data integrity
    if (!validateContestant(contestant)) {
      setError('Invalid contestant data. Please try selecting a different contestant.');
      return;
    }

    // Check if contestant has already been guessed
    const alreadyGuessed = previousGuesses.some(guess => guess.id === contestant.id);
    
    if (alreadyGuessed) {
      setError(`You've already guessed ${contestant.name}!`);
      return;
    }

    // Clear input and dropdown
    setInputValue('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    setError('');
    
    // Submit the guess
    onGuessSubmit(contestant);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = inputValue.trim();
    
    // Validate input is not empty
    if (!trimmedInput) {
      setError('Please enter a drag queen\'s name.');
      return;
    }

    // Validate minimum length for submission (prevent single character guesses)
    if (trimmedInput.length < 2) {
      setError('Please enter at least 2 characters to make a guess.');
      return;
    }

    // Find exact match first (within mode-filtered contestants)
    const modeContestants = getContestantsByMode(mode.firstTenSeasons, mode.topFiveOnly);
    const exactMatch = modeContestants.find(
      contestant => contestant.name.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (exactMatch) {
      handleContestantSelect(exactMatch);
      return;
    }

    // If no exact match, check if there's only one filtered result
    if (filteredContestants.length === 1) {
      handleContestantSelect(filteredContestants[0]);
      return;
    }

    // If multiple matches or no matches, show appropriate error
    if (filteredContestants.length === 0) {
      setError('Contestant not found. Please check the spelling or select from the dropdown suggestions.');
    } else {
      setError(`Multiple matches found for "${trimmedInput}". Please select the specific contestant from the dropdown.`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredContestants.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredContestants.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredContestants.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredContestants.length) {
          handleContestantSelect(filteredContestants[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleDropdownClick = (contestant: Contestant, index: number) => {
    setSelectedIndex(index);
    handleContestantSelect(contestant);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative">
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full py-3 px-4 text-base border-2 border-text-dark rounded-lg bg-white transition-all duration-200 font-body min-h-[48px]
              ${error ? 'border-error-red' : 'border-text-dark'}
              focus:outline-none
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
            autoComplete="off"
            aria-label="Guess a drag queen"
            aria-expanded={showDropdown}
            aria-controls="contestant-suggestions"
            aria-haspopup="listbox"
            aria-describedby={error ? 'guess-error' : undefined}
            role="combobox"
          />
          
          {showDropdown && filteredContestants.length > 0 && (
            <div 
              ref={dropdownRef}
              id="contestant-suggestions"
              className="absolute top-full left-0 right-0 bg-white border-2 border-gray-300 border-t-0 rounded-b-lg max-h-[300px] overflow-y-auto z-[1000] shadow-medium md:max-h-[200px]"
              role="listbox"
              aria-label="Contestant suggestions"
            >
              {filteredContestants.slice(0, 10).map((contestant, index) => (
                <div
                  key={contestant.id}
                  className={`py-3 px-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 min-h-[44px] md:py-4
                    ${index === selectedIndex ? 'bg-primary-pink text-white' : 'hover:bg-gray-50'}
                    focus:bg-primary-pink focus:text-white focus:outline-none`}
                  onClick={() => handleDropdownClick(contestant, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDropdownClick(contestant, index);
                    }
                  }}
                  role="option"
                  aria-selected={index === selectedIndex}
                  tabIndex={0}
                >
                  <span className={`block font-semibold text-sm mb-0.5 md:text-[13px] sm:text-[13px]`}>
                    {contestant.name}
                  </span>
                  <span className={`block text-xs ${index === selectedIndex ? 'text-white/80' : 'text-gray-500'} md:text-[11px] sm:text-[11px]`}>
                    Season {contestant.season} • {contestant.hometown}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
      
      {error && (
        <div 
          id="guess-error"
          className="mt-2 py-2 px-3 bg-red-50 text-error-red border border-red-200 rounded text-sm" 
          role="alert" 
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default GuessInput;
