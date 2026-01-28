import fc from 'fast-check';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstructionsModal from './InstructionsModal';
import {
  loadPreferences,
  savePreferences,
  updatePreference,
  Preferences
} from '../utilities/localStorage';

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
});

/**
 * Property 16: Instructions Display Logic
 * 
 * For any first-time visitor, the instructions popup should appear,
 * and for returning visitors, it should not appear unless explicitly requested.
 * 
 * **Validates: Requirements 11.1, 11.5**
 */
describe('Property 16: Instructions Display Logic', () => {
  test('Feature: guessru-game, Property 16: Instructions Display Logic - first-time visitors should see instructions by default', () => {
    fc.assert(
      fc.property(fc.boolean(), (showSilhouette) => {
        // Clear localStorage to simulate first-time visitor
        localStorage.clear();
        
        // Load preferences for a first-time visitor
        const preferences = loadPreferences();
        
        // Property: hasSeenInstructions should be false for first-time visitors
        expect(preferences.hasSeenInstructions).toBe(false);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - returning visitors should not see instructions automatically', () => {
    fc.assert(
      fc.property(fc.boolean(), (showSilhouette) => {
        // Clear first to ensure clean state
        localStorage.clear();
        
        // Simulate a returning visitor who has seen instructions
        const returningVisitorPrefs: Preferences = {
          hasSeenInstructions: true,
          showSilhouette: showSilhouette
        };
        savePreferences(returningVisitorPrefs);
        
        // Load preferences
        const preferences = loadPreferences();
        
        // Property: hasSeenInstructions should be true for returning visitors
        expect(preferences.hasSeenInstructions).toBe(true);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - closing instructions should persist the seen status', () => {
    // This test verifies the persistence behavior - run once since it's deterministic
    // Clear localStorage first
    localStorage.clear();
    
    // Verify initial state for first-time visitor
    let preferences = loadPreferences();
    expect(preferences.hasSeenInstructions).toBe(false);
    
    // Simulate closing the instructions (which should update the preference)
    updatePreference('hasSeenInstructions', true);
    
    // Verify the preference was persisted
    preferences = loadPreferences();
    expect(preferences.hasSeenInstructions).toBe(true);
    
    // Property: The preference should survive a "page refresh" (re-loading from storage)
    const reloadedPreferences = loadPreferences();
    expect(reloadedPreferences.hasSeenInstructions).toBe(true);
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - InstructionsModal visibility should be controlled by isVisible prop', () => {
    fc.assert(
      fc.property(fc.boolean(), (isVisible) => {
        // Clean up any previous renders
        cleanup();
        
        const mockOnClose = jest.fn();
        
        const { container } = render(
          <InstructionsModal isVisible={isVisible} onClose={mockOnClose} />
        );
        
        if (isVisible) {
          // Property: When isVisible is true, modal should be rendered
          const modal = container.querySelector('.fixed.inset-0');
          expect(modal).toBeInTheDocument();
          
          // Property: Modal should contain the "How to Play" heading
          const heading = container.querySelector('h2');
          expect(heading).toHaveTextContent('How to Play');
        } else {
          // Property: When isVisible is false, modal should not be rendered
          const modal = container.querySelector('.fixed.inset-0');
          expect(modal).not.toBeInTheDocument();
        }
        
        // Clean up after this iteration
        cleanup();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - close button should call onClose callback', () => {
    fc.assert(
      fc.property(fc.nat({ max: 10 }), (clickCount) => {
        // Clean up any previous renders
        cleanup();
        
        const mockOnClose = jest.fn();
        
        const { container } = render(
          <InstructionsModal isVisible={true} onClose={mockOnClose} />
        );
        
        const closeButton = container.querySelector('button[aria-label="Close instructions"]');
        expect(closeButton).toBeInTheDocument();
        
        // Click the close button the specified number of times
        for (let i = 0; i < clickCount; i++) {
          fireEvent.click(closeButton!);
        }
        
        // Property: onClose should be called exactly clickCount times
        expect(mockOnClose).toHaveBeenCalledTimes(clickCount);
        
        // Clean up after this iteration
        cleanup();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - clicking overlay should call onClose callback', () => {
    fc.assert(
      fc.property(fc.nat({ max: 5 }), (clickCount) => {
        // Clean up any previous renders
        cleanup();
        
        const mockOnClose = jest.fn();
        
        const { container } = render(
          <InstructionsModal isVisible={true} onClose={mockOnClose} />
        );
        
        const overlay = container.querySelector('.fixed.inset-0');
        expect(overlay).toBeInTheDocument();
        
        // Click the overlay the specified number of times
        for (let i = 0; i < clickCount; i++) {
          fireEvent.click(overlay!);
        }
        
        // Property: onClose should be called exactly clickCount times
        expect(mockOnClose).toHaveBeenCalledTimes(clickCount);
        
        // Clean up after this iteration
        cleanup();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - clicking modal content should not close the modal', () => {
    fc.assert(
      fc.property(fc.nat({ max: 10 }), (clickCount) => {
        // Clean up any previous renders
        cleanup();
        
        const mockOnClose = jest.fn();
        
        const { container } = render(
          <InstructionsModal isVisible={true} onClose={mockOnClose} />
        );
        
        // Find the modal content (the inner div that stops propagation)
        const modalContent = container.querySelector('.bg-gradient-secondary');
        expect(modalContent).toBeInTheDocument();
        
        // Click the modal content the specified number of times
        for (let i = 0; i < clickCount; i++) {
          fireEvent.click(modalContent!);
        }
        
        // Property: onClose should NOT be called when clicking modal content
        expect(mockOnClose).not.toHaveBeenCalled();
        
        // Clean up after this iteration
        cleanup();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - modal should contain all required instruction sections', () => {
    // Clean up any previous renders
    cleanup();
    
    const { container } = render(
      <InstructionsModal isVisible={true} onClose={jest.fn()} />
    );
    
    // Property: Modal should contain all required sections (using container queries to avoid duplicates)
    const sections = container.querySelectorAll('h3');
    const sectionTexts = Array.from(sections).map(s => s.textContent);
    
    expect(sectionTexts).toContain('🎯 Goal');
    expect(sectionTexts).toContain('✨ How to Guess');
    expect(sectionTexts).toContain('🎨 Color Coding');
    expect(sectionTexts).toContain('⬆️ Directional Arrows');
    expect(sectionTexts).toContain('📊 Attributes');
    expect(sectionTexts).toContain('💡 Optional Hints');
    expect(sectionTexts).toContain('🕛 Daily Reset');
    
    // Property: Modal should explain color coding system
    const colorSpans = container.querySelectorAll('span');
    const colorTexts = Array.from(colorSpans).map(s => s.textContent);
    
    expect(colorTexts).toContain('Green');
    expect(colorTexts).toContain('Yellow');
    expect(colorTexts).toContain('Gray');
    
    // Clean up
    cleanup();
  });

  test('Feature: guessru-game, Property 16: Instructions Display Logic - preferences should be independent of each other', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (hasSeenInstructions, showSilhouette) => {
          // Clear localStorage first
          localStorage.clear();
          
          // Set preferences
          const prefs: Preferences = {
            hasSeenInstructions,
            showSilhouette
          };
          savePreferences(prefs);
          
          // Update only hasSeenInstructions
          updatePreference('hasSeenInstructions', !hasSeenInstructions);
          
          // Load and verify
          const loadedPrefs = loadPreferences();
          
          // Property: hasSeenInstructions should be toggled
          expect(loadedPrefs.hasSeenInstructions).toBe(!hasSeenInstructions);
          
          // Property: showSilhouette should remain unchanged
          expect(loadedPrefs.showSilhouette).toBe(showSilhouette);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
