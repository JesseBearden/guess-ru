import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import SilhouetteSection from './SilhouetteSection';
import { Contestant } from '../types/index';

/**
 * Feature: guessru-game, Property 21: Headshot Reveal Behavior
 * 
 * For any game session, the silhouette should display during gameplay and 
 * smoothly transition to the full headshot when the player wins
 * 
 * Validates: Requirements 14.1, 14.2, 14.3
 */

// Mock contestant generator for testing
const mockContestantArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  season: fc.integer({ min: 1, max: 16 }),
  finishingPosition: fc.integer({ min: 1, max: 14 }),
  ageAtShow: fc.integer({ min: 18, max: 65 }),
  hometown: fc.string({ minLength: 1, maxLength: 100 }),
  hometownCoordinates: fc.record({
    latitude: fc.double({ min: -90, max: 90 }),
    longitude: fc.double({ min: -180, max: 180 })
  }),
  headshotUrl: fc.constant('https://example.com/headshot.jpg'),
  silhouetteUrl: fc.constant('https://example.com/silhouette.jpg')
});

describe('Property 21: Headshot Reveal Behavior', () => {
  afterEach(() => {
    cleanup();
  });

  test('component visibility should be controlled by isVisible prop', () => {
    fc.assert(
      fc.property(
        mockContestantArbitrary,
        fc.boolean(), // isVisible
        fc.boolean(), // isGameWon
        (secretQueen, isVisible, isGameWon) => {
          const { container } = render(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={isVisible}
              isGameWon={isGameWon}
            />
          );

          // Property: Component should only render when visible
          if (isVisible) {
            // Component renders a div with role="img"
            const section = container.querySelector('[role="img"]');
            expect(section).toBeInTheDocument();
          } else {
            expect(container.firstChild).toBeNull();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('silhouette image should be present when component is visible', () => {
    fc.assert(
      fc.property(
        mockContestantArbitrary,
        fc.boolean(), // isGameWon
        (secretQueen, isGameWon) => {
          const { container } = render(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={isGameWon}
            />
          );

          // Property: Silhouette image should be present when visible
          const silhouetteImage = container.querySelector('img[src="' + secretQueen.silhouetteUrl + '"]');
          expect(silhouetteImage).toBeInTheDocument();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('headshot image element should be rendered only when game is won', () => {
    fc.assert(
      fc.property(
        mockContestantArbitrary,
        fc.boolean(), // isGameWon
        (secretQueen, isGameWon) => {
          const { container } = render(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={isGameWon}
            />
          );

          const headshotImage = container.querySelector('img[src="' + secretQueen.headshotUrl + '"]');

          // Property: Headshot image should only be present when game is won
          if (isGameWon) {
            expect(headshotImage).toBeInTheDocument();
          } else {
            expect(headshotImage).not.toBeInTheDocument();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('component should handle game state transitions correctly', () => {
    fc.assert(
      fc.property(
        mockContestantArbitrary,
        (secretQueen) => {
          const { container, rerender } = render(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={false}
            />
          );

          // Property: Initially no headshot when game not won
          let headshotImage = container.querySelector('img[src="' + secretQueen.headshotUrl + '"]');
          expect(headshotImage).not.toBeInTheDocument();

          // Change to game won state
          rerender(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={true}
            />
          );

          // Property: Headshot should appear when game is won
          headshotImage = container.querySelector('img[src="' + secretQueen.headshotUrl + '"]');
          expect(headshotImage).toBeInTheDocument();

          // Change back to game not won
          rerender(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={false}
            />
          );

          // Property: Headshot should disappear when game is not won
          headshotImage = container.querySelector('img[src="' + secretQueen.headshotUrl + '"]');
          expect(headshotImage).not.toBeInTheDocument();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('component should have correct accessibility attributes', () => {
    fc.assert(
      fc.property(
        mockContestantArbitrary,
        fc.boolean(), // isGameWon
        (secretQueen, isGameWon) => {
          const { container } = render(
            <SilhouetteSection
              secretQueen={secretQueen}
              isVisible={true}
              isGameWon={isGameWon}
            />
          );

          const section = container.querySelector('[role="img"]');
          expect(section).toBeInTheDocument();
          expect(section).toHaveAttribute('aria-label');

          // Property: aria-label should reflect game state
          const ariaLabel = section?.getAttribute('aria-label');
          if (isGameWon) {
            expect(ariaLabel).toContain('headshot revealed');
          } else {
            expect(ariaLabel).toContain('silhouette');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
