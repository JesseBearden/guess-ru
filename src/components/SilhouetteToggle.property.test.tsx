import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import SilhouetteToggle from './SilhouetteToggle';

/**
 * Feature: guessru-game, Property 11: Silhouette Toggle Behavior
 * 
 * For any silhouette toggle action, the system should animate the silhouette 
 * in or out appropriately and persist the preference
 * 
 * Validates: Requirements 7.3, 7.4, 7.5, 7.6
 */

describe('Property 11: Silhouette Toggle Behavior', () => {
  afterEach(() => {
    cleanup();
  });

  test('toggle state changes should be consistent and accessible', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial enabled state
        fc.boolean(), // disabled prop
        fc.string({ minLength: 0, maxLength: 50 }), // className
        (initialEnabled, disabled, className) => {
          let currentState = initialEnabled;
          const mockOnToggle = jest.fn((newState: boolean) => {
            currentState = newState;
          });

          const { container, rerender } = render(
            <SilhouetteToggle
              isEnabled={currentState}
              onToggle={mockOnToggle}
              disabled={disabled}
              className={className}
            />
          );

          const button = container.querySelector('button');
          if (!button) return false;

          // Property: Button should have correct accessibility attributes
          expect(button).toHaveAttribute('aria-pressed', currentState.toString());
          // The actual aria-label includes "hint" suffix
          expect(button).toHaveAttribute('aria-label', 
            currentState ? 'Hide queen silhouette hint' : 'Show queen silhouette hint'
          );

          // Property: Button should reflect disabled state
          if (disabled) {
            expect(button).toBeDisabled();
          } else {
            expect(button).not.toBeDisabled();
          }

          // Property: Toggle should work when not disabled
          if (!disabled) {
            const previousState = currentState;
            fireEvent.click(button);
            
            // Verify callback was called with opposite state
            expect(mockOnToggle).toHaveBeenCalledWith(!previousState);
            
            // Re-render with new state to simulate parent component update
            rerender(
              <SilhouetteToggle
                isEnabled={currentState}
                onToggle={mockOnToggle}
                disabled={disabled}
                className={className}
              />
            );

            // Verify UI reflects new state
            expect(button).toHaveAttribute('aria-pressed', currentState.toString());
          }

          // Property: Keyboard interaction should work when not disabled
          if (!disabled) {
            const previousState = currentState;
            mockOnToggle.mockClear();
            
            // Test Enter key
            fireEvent.keyDown(button, { key: 'Enter' });
            expect(mockOnToggle).toHaveBeenCalledWith(!previousState);
            
            mockOnToggle.mockClear();
            
            // Test Space key
            fireEvent.keyDown(button, { key: ' ' });
            expect(mockOnToggle).toHaveBeenCalledWith(!previousState);
          }

          // Property: No interaction should occur when disabled
          if (disabled) {
            mockOnToggle.mockClear();
            fireEvent.click(button);
            fireEvent.keyDown(button, { key: 'Enter' });
            fireEvent.keyDown(button, { key: ' ' });
            expect(mockOnToggle).not.toHaveBeenCalled();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('toggle text and icon should be consistent with state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // enabled state
        (enabled) => {
          const { container } = render(
            <SilhouetteToggle
              isEnabled={enabled}
              onToggle={() => {}}
              disabled={false}
            />
          );

          const button = container.querySelector('button');
          if (!button) return false;
          
          const expectedText = enabled ? 'Hide Silhouette' : 'Show Silhouette';
          
          // Property: Button text should match state
          expect(button).toHaveTextContent(expectedText);
          
          // Property: Button should have appropriate title attribute
          const expectedTitle = enabled ? 'Hide silhouette hint' : 'Show silhouette hint';
          expect(button).toHaveAttribute('title', expectedTitle);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('component should handle edge cases gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(undefined),
          fc.boolean()
        ), // disabled prop (including undefined)
        fc.oneof(
          fc.constant(''),
          fc.constant(undefined),
          fc.string({ minLength: 1, maxLength: 20 })
        ), // className prop (including empty/undefined)
        (disabled, className) => {
          const mockOnToggle = jest.fn();

          // Property: Component should render without errors for edge case props
          let container: any;
          expect(() => {
            const result = render(
              <SilhouetteToggle
                isEnabled={false}
                onToggle={mockOnToggle}
                disabled={disabled}
                className={className}
              />
            );
            container = result.container;
          }).not.toThrow();

          const button = container.querySelector('button');
          
          // Property: Component should handle undefined/empty className gracefully
          expect(button).toBeInTheDocument();
          
          // Property: Component should handle undefined disabled prop gracefully
          if (disabled === undefined || disabled === false) {
            expect(button).not.toBeDisabled();
          } else {
            expect(button).toBeDisabled();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
