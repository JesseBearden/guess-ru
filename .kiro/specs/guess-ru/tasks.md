# Implementation Plan: GuessRu.com

## Overview

This implementation plan breaks down the GuessRu.com drag queen guessing game into discrete React development tasks. The approach follows a component-first strategy, building core functionality incrementally and adding features progressively. Each task builds on previous work to create a cohesive, fully-functional daily guessing game.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - Initialize React project with TypeScript and required dependencies
  - Set up project structure with components, types, and utilities folders
  - Configure build tools and development environment
  - Install testing libraries (Jest, React Testing Library, fast-check for property-based testing)
  - _Requirements: 10.1, 10.3, 10.5_

- [x] 2. Data Models and Contestant Database
  - [x] 2.1 Create TypeScript interfaces for core data structures
    - Define Contestant, Guess, GameState, Statistics, and ShareResults interfaces
    - Create feedback type definitions and enums
    - _Requirements: 4.3, 4.6_
  
  - [x] 2.2 Write property test for data model completeness
    - **Property 7: Contestant Data Constraints**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.6**
  
  - [x] 2.3 Implement contestant database with main US season data
    - Create static dataset of RuPaul's Drag Race contestants (main seasons only)
    - Ensure first-appearance-only data for multi-season contestants
    - Include season, position, age, hometown, headshot URL, and silhouette URL for each contestant
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [x] 2.4 Write unit tests for contestant database validation
    - Test data completeness and accuracy
    - Verify no All Stars or international seasons included
    - _Requirements: 4.1, 4.2_

- [x] 3. Daily Queen Selection Logic
  - [x] 3.1 Implement deterministic daily queen selection algorithm
    - Create function to select queen based on Pacific Time date
    - Ensure all players get same queen each day
    - Handle timezone conversion and edge cases
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.2 Write property test for daily queen consistency
    - **Property 1: Daily Queen Consistency**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 3.3 Write property test for daily reset behavior
    - **Property 3: Daily Reset Behavior**
    - **Validates: Requirements 1.5, 6.4**

- [x] 4. Core Game Logic and State Management
  - [x] 4.1 Implement game state management with React hooks
    - Create useGameState hook for managing current game
    - Handle guess submission, validation, and feedback calculation
    - Implement win/loss condition checking
    - _Requirements: 1.3, 1.4, 5.1, 5.3, 5.4, 5.5_
  
  - [x] 4.2 Write property test for game session limits
    - **Property 2: Game Session Limits**
    - **Validates: Requirements 1.3, 1.4**
  
  - [x] 4.3 Implement feedback calculation system
    - Create function to compare guess against secret queen
    - Generate color coding and directional arrows for each attribute
    - Handle exact matches, close matches (±3), and misses
    - _Requirements: 3.2, 3.3, 3.4, 4.5_
  
  - [x] 4.4 Write property test for feedback color coding
    - **Property 6: Feedback Color Coding**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [x] 4.5 Write property test for feedback calculation consistency
    - **Property 22: Feedback Calculation Consistency**
    - **Validates: Requirements 4.5**

- [x] 5. Local Storage and Persistence
  - [x] 5.1 Implement localStorage utilities for game state persistence
    - Create functions to save/load game state, statistics, and preferences
    - Handle localStorage errors and fallback scenarios
    - Implement daily cleanup of old game data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 5.2 Write property test for game state persistence
    - **Property 10: Game State Persistence**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
  
  - [x] 5.3 Write property test for guess history round trip
    - **Property 19: Guess History Round Trip**
    - **Validates: Requirements 6.1, 6.2**

- [x] 6. Checkpoint - Core Logic Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Basic UI Components and Layout
  - [x] 7.1 Create App component with main layout structure
    - Implement header with logo and action buttons
    - Set up main game area container
    - Add modal overlay system for popups
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 7.2 Implement Header component
    - Create logo display
    - Add info and stats buttons with proper positioning
    - Ensure responsive design for mobile and desktop
    - _Requirements: 11.2_
  
  - [x] 7.3 Create responsive CSS foundation
    - Implement mobile-first responsive design
    - Ensure layouts work from 320px to 1920px width
    - Set up drag race themed color scheme and typography
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.5_
  
  - [x] 7.4 Write property test for responsive layout adaptation
    - **Property 12: Responsive Layout Adaptation**
    - **Validates: Requirements 8.3, 8.4**

- [ ] 8. Guess Input and Autocomplete System
  - [x] 8.1 Create GuessInput component with autocomplete functionality
    - Implement text input with real-time filtering
    - Create dropdown list showing matching contestant names
    - Handle selection from autocomplete list
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 8.2 Write property test for autocomplete filtering
    - **Property 4: Autocomplete Filtering**
    - **Validates: Requirements 2.2, 2.3**
  
  - [x] 8.3 Implement guess validation and submission logic
    - Validate guesses against contestant database
    - Prevent duplicate guesses and invalid submissions
    - Clear input after successful submission
    - Display error messages for invalid inputs
    - _Requirements: 2.5, 2.6, 2.7, 2.8_
  
  - [x] 8.4 Write property test for guess validation and processing
    - **Property 5: Guess Validation and Processing**
    - **Validates: Requirements 2.5, 2.6, 2.7, 2.8**

- [x] 9. Guess History Display
  - [x] 9.1 Create GuessHistory and GuessRow components
    - Display all previous guesses in chronological order
    - Show contestant attributes with appropriate color coding
    - Add directional arrows for numerical misses
    - Ensure responsive table layout for mobile
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 9.2 Write unit tests for guess history display
    - Test color coding application
    - Test chronological ordering
    - Test responsive table behavior
    - _Requirements: 3.1, 3.5_

- [x] 10. Silhouette and Headshot Reveal Feature
  - [x] 10.1 Create SilhouetteSection component
    - Display queen silhouette above input area when enabled during gameplay
    - Reveal full color headshot when player wins with smooth transition animation
    - Implement slide-in/slide-out animations for toggle functionality
    - Handle missing or failed image loading gracefully
    - _Requirements: 7.1, 7.4, 7.5, 14.1, 14.2, 14.3_
  
  - [x] 10.2 Implement silhouette toggle button
    - Create toggle button positioned right of input box
    - Handle toggle state changes with animations
    - Persist silhouette preference in localStorage
    - _Requirements: 7.2, 7.3, 7.6, 7.7_
  
  - [x] 10.3 Write property test for silhouette toggle behavior
    - **Property 11: Silhouette Toggle Behavior**
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**
  
  - [x] 10.4 Write property test for headshot reveal behavior
    - **Property 21: Headshot Reveal Behavior**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 11. Timer Implementation
  - [x] 11.1 Create Timer component
    - Display timer to the right of silhouette toggle
    - Count up from zero in MM:SS format
    - Start timer on new game session
    - Stop timer when game completes
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 11.2 Implement timer persistence
    - Save timer state to localStorage
    - Restore timer accurately after page refresh
    - Handle timer synchronization across browser tabs
    - _Requirements: 12.5_
  
  - [x] 11.3 Write property test for timer functionality
    - **Property 17: Timer Functionality**
    - **Validates: Requirements 12.2, 12.3, 12.4, 12.5**

- [x] 12. Statistics Tracking System
  - [x] 12.1 Implement statistics calculation and storage
    - Track games played, wins, streaks, and guess distribution
    - Update statistics immediately after game completion
    - Persist all statistics data in localStorage
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_
  
  - [x] 12.2 Create StatsModal component
    - Display comprehensive player statistics
    - Show win distribution chart/bars
    - Format statistics in user-friendly layout
    - _Requirements: 13.1_
  
  - [x] 12.3 Write property test for statistics tracking accuracy
    - **Property 18: Statistics Tracking Accuracy**
    - **Validates: Requirements 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8**

- [x] 13. Game End and Sharing Features
  - [x] 13.1 Create GameEndModal component
    - Display win/loss results with final time and guess count
    - Show congratulations or reveal secret queen
    - Trigger celebration animations for wins
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 13.2 Implement share results functionality
    - Generate shareable text with game number, guess count, and time
    - Create visual pattern using emojis (⬛🟨🟩) for each guess
    - Copy formatted results to clipboard
    - _Requirements: 5.1, 5.5_
  
  - [x] 13.3 Write property test for win condition handling
    - **Property 8: Win Condition Handling**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [x] 13.4 Write property test for loss condition handling
    - **Property 9: Loss Condition Handling**
    - **Validates: Requirements 5.4, 5.5**
  
  - [x] 13.5 Write property test for share results formatting
    - **Property 20: Share Results Formatting**
    - **Validates: Requirements 5.1, 5.5**

- [x] 14. Tailwind CSS Migration
  - [x] 14.1 Install and configure Tailwind CSS
    - Install tailwindcss, postcss, and autoprefixer
    - Create tailwind.config.js with drag race themed colors
    - Configure postcss.config.js
    - Add Tailwind directives to main CSS file
    - _Requirements: 10.6_
  
  - [x] 14.2 Migrate existing components to Tailwind
    - Convert App.css styles to Tailwind utility classes
    - Convert all component CSS files to Tailwind
    - Remove old CSS files after migration
    - Ensure visual consistency with original design
    - _Requirements: 10.6, 9.1, 9.2, 9.3_
  
  - [x] 14.3 Verify responsive design with Tailwind
    - Test all breakpoints (320px to 1920px)
    - Ensure mobile-first responsive behavior
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 15. Hometown Proximity Feature
  - [x] 15.1 Add hometown coordinates to contestant database
    - Add latitude/longitude for each contestant's hometown
    - Verify coordinate accuracy for all cities
    - _Requirements: 4.7_
  
  - [x] 15.2 Implement distance calculation utility
    - Create Haversine formula function for distance calculation
    - Return distance in miles between two coordinate pairs
    - _Requirements: 3.6, 4.7_
  
  - [x] 15.3 Write property test for hometown proximity calculation
    - **Property 23: Hometown Proximity Calculation**
    - **Validates: Requirements 3.6, 4.7**
  
  - [x] 15.4 Update feedback calculation for hometown proximity
    - Modify feedback logic to check 75-mile proximity
    - Return yellow for cities within 75 miles, gray otherwise
    - Update GuessRow component to display proximity feedback
    - _Requirements: 3.6_
  
  - [x] 15.5 Update property test for feedback color coding
    - Update **Property 6: Feedback Color Coding** to include hometown proximity
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.6**

- [x] 16. Instructions and Help System
  - [x] 16.1 Create InstructionsModal component
    - Display comprehensive game rules and mechanics
    - Explain color coding system and game flow
    - Show on first visit and when info button clicked
    - _Requirements: 11.1, 11.3, 11.4_
  
  - [x] 16.2 Implement first-visit detection
    - Track whether player has seen instructions
    - Show popup automatically for new players
    - Remember instruction viewing status in localStorage
    - _Requirements: 11.1, 11.5_
  
  - [x] 16.3 Write property test for instructions display logic
    - **Property 16: Instructions Display Logic**
    - **Validates: Requirements 11.1, 11.5**

- [-] 17. Accessibility and Polish
  - [x] 17.1 Implement accessibility features
    - Ensure proper color contrast ratios (WCAG compliance)
    - Add appropriate ARIA labels and roles
    - Make all interactive elements keyboard accessible
    - Set minimum touch target sizes for mobile
    - _Requirements: 8.5, 9.4_
  
  - [-] 17.2 Write property test for color contrast compliance
    - **Property 14: Color Contrast Compliance**
    - **Validates: Requirements 9.4**
  
  - [x] 17.3 Write property test for touch interface sizing
    - **Property 13: Touch Interface Sizing**
    - **Validates: Requirements 8.5**
  
  - [x] 17.4 Add loading states and error boundaries
    - Implement loading indicators for async operations
    - Add error boundaries for graceful error handling
    - Provide fallback UI for failed operations
    - _Requirements: 10.2_

- [x] 18. Final Integration and Testing
  - [x] 18.1 Wire all components together in main App
    - Connect all state management and data flow
    - Ensure proper component communication
    - Test complete game flow from start to finish
    - _Requirements: 10.3, 10.4_
  
  - [x] 18.2 Write property test for client-side architecture
    - **Property 15: Client-Side Architecture**
    - **Validates: Requirements 10.2**
  
  - [x] 18.3 Write integration tests for complete game flows
    - Test full game scenarios from start to win/loss
    - Test cross-component state synchronization
    - Test error recovery and graceful degradation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 19. Final Checkpoint - Complete Application
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are now required for comprehensive implementation from start
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation follows React best practices with TypeScript for type safety
- All game logic runs client-side without server dependencies