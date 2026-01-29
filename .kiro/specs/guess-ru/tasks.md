# Implementation Tasks: Game Modes Feature

## Phase 1: Core Types and Settings Modal

### Task 1.1: Add GameMode types
- [x] 1.1.1 Add `GameMode` interface to `src/types/index.ts`
- [x] 1.1.2 Add `GameModeKey` type and `getModeKey` helper function
- [x] 1.1.3 Update `GameState` interface to include `mode` field

### Task 1.2: Create SettingsModal component
- [x] 1.2.1 Create `src/components/SettingsModal.tsx` with two toggle switches
- [x] 1.2.2 Style modal to match InstructionsModal (cream background, black borders)
- [x] 1.2.3 Add Lucide X icon for close button

### Task 1.3: Add settings button to Header
- [x] 1.3.1 Add gear icon button to Header component between info and stats buttons
- [x] 1.3.2 Wire up settings button to open SettingsModal in App.tsx

## Phase 2: Mode-Aware Game State

### Task 2.1: Update localStorage utilities
- [x] 2.1.1 Update `saveGameState` to accept mode key parameter
- [x] 2.1.2 Update `loadGameState` to accept mode key parameter
- [x] 2.1.3 Add migration logic for existing single game state to default mode

### Task 2.2: Update daily queen selection
- [x] 2.2.1 Add contestant filtering functions to `contestantDatabase.ts`
- [x] 2.2.2 Update `getDailyQueen` in `dailyQueenSelection.ts` to accept GameMode
- [x] 2.2.3 Use mode in seed calculation for different queens per mode

### Task 2.3: Update useGameState hook
- [x] 2.3.1 Add `mode` parameter to useGameState hook
- [x] 2.3.2 Load/save game state using mode key
- [x] 2.3.3 Reinitialize game state when mode changes

### Task 2.4: Update GuessInput autocomplete
- [x] 2.4.1 Add mode parameter to GuessInput component
- [x] 2.4.2 Filter autocomplete suggestions based on current mode

## Phase 3: Mode-Specific Statistics

### Task 3.1: Update statistics storage
- [x] 3.1.1 Update `saveStatistics` to accept mode key parameter
- [x] 3.1.2 Update `loadStatistics` to accept mode key parameter
- [x] 3.1.3 Add migration logic for existing statistics to default mode

### Task 3.2: Update statistics tracking
- [x] 3.2.1 Update `updateStatistics` to use mode key
- [x] 3.2.2 Update useGameState to pass mode to statistics functions

### Task 3.3: Update StatsModal
- [x] 3.3.1 Add mode selector dropdown to StatsModal (styled to match modal theme with cream background)
- [x] 3.3.2 Add state to track selected mode in StatsModal, load statistics for selected mode using getCurrentStatistics
- [x] 3.3.3 Pass current game mode as prop to StatsModal from App.tsx, default dropdown to current mode when opening
**Validates: Requirements 16.2, 16.5**

## Phase 4: Integration and Polish

### Task 4.1: Wire up App.tsx
- [x] 4.1.1 Add mode state to App component
- [x] 4.1.2 Pass mode to useGameState hook
- [x] 4.1.3 Pass mode to GuessInput component
- [x] 4.1.4 Handle mode changes from SettingsModal

### Task 4.2: Persist mode preference
- [x] 4.2.1 Save current mode to preferences in localStorage
- [x] 4.2.2 Load saved mode preference on app initialization
- [x] 4.2.3 Default new players to "First 10 Seasons" + "Top 5 Only" mode

### Task 4.3: Update Instructions
- [x] 4.3.1 Add mention of settings/gear icon for game modes to InstructionsModal content (add a "Game Modes" section explaining the gear icon opens settings for difficulty options)
**Validates: Requirements 11.6**

### Task 4.4: Testing and cleanup
- [x] 4.4.1 Write integration tests verifying all four mode combinations produce different daily queens
- [x] 4.4.2 Write integration tests verifying mode switching preserves game state for each mode independently
- [x] 4.4.3 Write integration tests verifying statistics are tracked separately per mode
- [x] 4.4.4 Write unit test verifying new players default to First 10 + Top 5 mode (DEFAULT_GAME_MODE)
- [x] 4.4.5 Run linter and fix any unused imports or lint warnings
**Validates: Requirements 15.4, 15.5, 15.6, 15.10, 15.11, 16.1, 16.3**
