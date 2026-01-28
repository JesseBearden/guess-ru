import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import * as fc from 'fast-check';
import Timer from './Timer';

/**
 * Feature: guessru-game, Property 17: Timer Functionality
 * 
 * For any game session, the timer should start at zero, count up during play, 
 * stop on completion, and persist across page refreshes
 * 
 * Validates: Requirements 12.2, 12.3, 12.4, 12.5
 */

describe('Property 17: Timer Functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  test('timer should display correct elapsed time format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7200000 }), // 0 to 2 hours in milliseconds
        fc.boolean(), // isGameComplete
        (elapsedMs, isGameComplete) => {
          const startTime = Date.now() - elapsedMs;
          const endTime = isGameComplete ? startTime + elapsedMs : undefined;

          const { container } = render(
            <Timer
              startTime={startTime}
              endTime={endTime}
              isGameComplete={isGameComplete}
            />
          );

          // Find the timer element by role
          const timerElement = container.querySelector('[role="timer"]');
          expect(timerElement).toBeInTheDocument();

          // Property: Timer should display time in HH:MM:SS format
          const displayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
          expect(displayedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('timer should handle game completion correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 300000 }), // 1 second to 5 minutes
        fc.integer({ min: 1000, max: 60000 }), // additional time after completion
        (gameTimeMs, additionalTimeMs) => {
          const startTime = Date.now();
          const endTime = startTime + gameTimeMs;

          // Render timer for active game
          const { container, rerender } = render(
            <Timer
              startTime={startTime}
              endTime={undefined}
              isGameComplete={false}
            />
          );

          // Advance time during active game
          act(() => {
            jest.advanceTimersByTime(gameTimeMs);
          });

          // Complete the game
          rerender(
            <Timer
              startTime={startTime}
              endTime={endTime}
              isGameComplete={true}
            />
          );

          // Advance time after game completion
          act(() => {
            jest.advanceTimersByTime(additionalTimeMs);
          });

          const timerElement = container.querySelector('[role="timer"]');
          expect(timerElement).toBeInTheDocument();

          // Property: Timer should show final game time in HH:MM:SS format
          const displayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
          const totalSeconds = Math.floor(Math.max(0, gameTimeMs) / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          expect(displayedTime).toBe(expectedDisplay);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('timer should update consistently during active game', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1000, max: 10000 }), { minLength: 1, maxLength: 5 }), // time intervals
        (timeIntervals) => {
          const startTime = Date.now();
          let currentTime = startTime;

          const { container } = render(
            <Timer
              startTime={startTime}
              endTime={undefined}
              isGameComplete={false}
            />
          );

          const timerElement = container.querySelector('[role="timer"]');
          expect(timerElement).toBeInTheDocument();

          // Property: Timer should update as time progresses
          for (const interval of timeIntervals) {
            act(() => {
              jest.advanceTimersByTime(interval);
            });
            
            currentTime += interval;
            const elapsedMs = Math.max(0, currentTime - startTime);
            const totalSeconds = Math.floor(elapsedMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const displayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
            expect(displayedTime).toBe(expectedDisplay);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('timer should handle startTime changes correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 60000 }), // first game duration
        fc.integer({ min: 1000, max: 60000 }), // second game duration
        (firstGameMs, secondGameMs) => {
          const firstStartTime = Date.now();

          // Render timer for first game
          const { container, rerender } = render(
            <Timer
              startTime={firstStartTime}
              endTime={undefined}
              isGameComplete={false}
            />
          );

          // Advance time in first game
          act(() => {
            jest.advanceTimersByTime(firstGameMs);
          });

          // Start new game with new startTime
          const secondStartTime = Date.now();
          rerender(
            <Timer
              startTime={secondStartTime}
              endTime={undefined}
              isGameComplete={false}
            />
          );

          // Property: Timer should reset to 00:00:00 for new game
          const timerElement = container.querySelector('[role="timer"]');
          expect(timerElement).toBeInTheDocument();
          
          const displayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
          expect(displayedTime).toBe('00:00:00');

          // Advance time in second game
          act(() => {
            jest.advanceTimersByTime(secondGameMs);
          });

          // Property: Timer should show correct time for second game
          const totalSeconds = Math.floor(Math.max(0, secondGameMs) / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          const expectedDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          const newDisplayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
          expect(newDisplayedTime).toBe(expectedDisplay);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('timer should have correct accessibility attributes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3600000 }), // 0 to 1 hour
        fc.boolean(), // isGameComplete
        fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 20 })), // className
        (elapsedMs, isGameComplete, className) => {
          const startTime = Date.now() - elapsedMs;
          const endTime = isGameComplete ? startTime + elapsedMs : undefined;

          const { container } = render(
            <Timer
              startTime={startTime}
              endTime={endTime}
              isGameComplete={isGameComplete}
              className={className}
            />
          );

          const timerElement = container.querySelector('[role="timer"]');
          expect(timerElement).toBeInTheDocument();

          // Property: Timer should have correct ARIA attributes
          expect(timerElement).toHaveAttribute('role', 'timer');
          expect(timerElement).toHaveAttribute('aria-label');
          
          // aria-label should contain "Game timer"
          const ariaLabel = timerElement?.getAttribute('aria-label');
          expect(ariaLabel).toContain('Game timer');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('timer should handle edge cases gracefully', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: Date.now() - 86400000, max: Date.now() }), // within last 24 hours
        fc.oneof(
          fc.constant(undefined), // no end time
          fc.integer({ min: 0, max: 7200000 }) // 0 to 2 hours in milliseconds
        ),
        (startTime, elapsedMs) => {
          const endTime = elapsedMs !== undefined ? startTime + elapsedMs : undefined;
          
          // Property: Timer should render without errors for edge case inputs
          let container: any;
          expect(() => {
            const result = render(
              <Timer
                startTime={startTime}
                endTime={endTime}
                isGameComplete={!!endTime}
              />
            );
            container = result.container;
          }).not.toThrow();

          const timerElement = container.querySelector('[role="timer"]');
          
          // Property: Timer should always render required elements
          expect(timerElement).toBeInTheDocument();

          // Property: Timer text should always be in HH:MM:SS format
          const displayedTime = timerElement?.textContent?.match(/\d{2}:\d{2}:\d{2}/)?.[0];
          expect(displayedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
