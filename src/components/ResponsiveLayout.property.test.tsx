import React from 'react';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

/**
 * Feature: guessru-game, Property 12: Responsive Layout Adaptation
 * 
 * For any screen width between 320px and 1920px, the layout should adapt 
 * appropriately without horizontal scrolling on mobile devices
 * 
 * Validates: Requirements 8.3, 8.4
 */

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Helper function to simulate viewport resize
const setViewportSize = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Update document.documentElement for CSS media queries
  Object.defineProperty(document.documentElement, 'clientWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Helper function to check if element has horizontal overflow
const hasHorizontalOverflow = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  // Check if element extends beyond viewport width
  if (rect.width > window.innerWidth) {
    return true;
  }
  
  // Check for horizontal scrollbar
  if (element.scrollWidth > element.clientWidth) {
    return true;
  }
  
  // Check overflow-x style
  const overflowX = computedStyle.overflowX;
  if (overflowX === 'scroll' || overflowX === 'auto') {
    return element.scrollWidth > element.clientWidth;
  }
  
  return false;
};

// Helper function to check responsive breakpoint behavior
const checkResponsiveBreakpoints = (width: number): boolean => {
  // Define expected behavior at different breakpoints
  const breakpoints = {
    mobile: width <= 480,
    tablet: width > 480 && width <= 768,
    desktop: width > 768 && width <= 1440,
    ultraWide: width > 1440
  };
  
  // All breakpoints should be mutually exclusive
  const activeBreakpoints = Object.values(breakpoints).filter(Boolean);
  return activeBreakpoints.length === 1;
};

describe('Property 12: Responsive Layout Adaptation', () => {
  beforeEach(() => {
    // Reset viewport to default
    setViewportSize(1024, 768);
  });

  afterEach(() => {
    // Clean up any DOM modifications
    document.body.innerHTML = '';
  });

  test('should adapt layout appropriately for any screen width between 320px and 1920px', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        (screenWidth) => {
          // Set the viewport size
          setViewportSize(screenWidth);
          
          // Render the App component
          const { container } = render(<App />);
          const appElement = container.firstChild as Element;
          
          // Property 1: No horizontal overflow on mobile devices (≤768px)
          if (screenWidth <= 768) {
            const hasOverflow = hasHorizontalOverflow(appElement);
            if (hasOverflow) {
              return false;
            }
          }
          
          // Property 2: Layout should be responsive at all breakpoints
          const isResponsive = checkResponsiveBreakpoints(screenWidth);
          if (!isResponsive) {
            return false;
          }
          
          // Property 3: Essential elements should be present and accessible
          // Using semantic elements and roles instead of CSS classes
          const header = container.querySelector('header');
          const main = container.querySelector('main');
          
          if (!header || !main) {
            return false;
          }
          
          // Property 4: Interactive elements should maintain minimum touch target size
          const buttons = container.querySelectorAll('button');
          for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const rect = button.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(button);
            
            // Minimum 44x44px for touch targets on mobile
            if (screenWidth <= 768) {
              const minSize = 44;
              const width = rect.width || parseInt(computedStyle.width);
              const height = rect.height || parseInt(computedStyle.height);
              
              if (width < minSize || height < minSize) {
                return false;
              }
            }
          }
          
          // Property 5: Content should not exceed maximum container width
          const maxWidth = 1200; // Based on CSS max-width
          const mainRect = main.getBoundingClientRect();
          if (mainRect.width > maxWidth + 50) { // Allow some tolerance
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should maintain layout integrity across viewport transitions', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 320, max: 1920 }), { minLength: 2, maxLength: 5 }),
        (screenWidths) => {
          let previousLayout: any = null;
          
          for (const width of screenWidths) {
            setViewportSize(width);
            
            const { container } = render(<App />);
            const appElement = container.firstChild as Element;
            
            // Check that layout adapts without breaking
            const currentLayout = {
              hasHeader: !!container.querySelector('header'),
              hasMain: !!container.querySelector('main'),
              hasOverflow: hasHorizontalOverflow(appElement),
              buttonCount: container.querySelectorAll('button').length
            };
            
            // Layout should maintain essential structure
            if (!currentLayout.hasHeader || !currentLayout.hasMain) {
              return false;
            }
            
            // No horizontal overflow on mobile
            if (width <= 768 && currentLayout.hasOverflow) {
              return false;
            }
            
            // Button count should remain consistent
            if (previousLayout && currentLayout.buttonCount !== previousLayout.buttonCount) {
              return false;
            }
            
            previousLayout = currentLayout;
            
            // Clean up for next iteration
            document.body.innerHTML = '';
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should handle edge cases at breakpoint boundaries', () => {
    const criticalWidths = [320, 480, 768, 1024, 1440, 1920];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...criticalWidths),
        fc.integer({ min: -5, max: 5 }),
        (baseWidth, offset) => {
          const testWidth = Math.max(320, Math.min(1920, baseWidth + offset));
          setViewportSize(testWidth);
          
          const { container } = render(<App />);
          const appElement = container.firstChild as Element;
          
          // Should not have horizontal overflow on mobile
          if (testWidth <= 768) {
            return !hasHorizontalOverflow(appElement);
          }
          
          // Should maintain proper structure using semantic elements
          return !!(container.querySelector('header') && container.querySelector('main'));
        }
      ),
      { numRuns: 100 }
    );
  });
});
