# Implementation Tasks: Game Modes Feature

## Phase 1: Core Types and Settings Modal

### Task 1.1: Add GameMode types
- [ ] 1.1.1 Add `GameMode` interface to `src/types/index.ts`
- [ ] 1.1.2 Add `GameModeKey` type and `getModeKey` helper function
- [ ] 1.1.3 Update `GameState` interface to include `mode` field

### Task 1.2: Create SettingsModal component
- [ ] 1.2.1 Create `src/components/SettingsModal.tsx` with two toggle switches
- [ ] 1.2.2 Style modal to match InstructionsModal (cream background, black borders)
- [ ] 1.2.3 Add Lucide X icon for close button

### Task 1.3: Add settings button to Header
- [ ] 1.3.1 Add gear icon button to Header component between info and stats buttons
- [ ] 1.3.2 Wire up settings button to open SettingsModal in App.tsx

## Phase 2: Mode-Aware Game State

### Task 2.1: Update localStorage utilities
- [ ] 2.1.1 Update `saveGameState` to accept mode key parameter
- [ ] 2.1.2 Update `loadGameState` to accept mode key parameter
- [ ] 2.1.3 Add migration logic for existing single game state to default mode

### Task 2.2: Update daily queen selection
- [ ] 2.2.1 Add contestant filtering functions to `contestantDatabase.ts`
- [ ] 2.2.2 Update `getDailyQueen` in `dailyQueenSelection.ts` to accept GameMode
- [ ] 2.2.3 Use mode in seed calculation for different queens per mode

### Task 2.3: Update useGameState hook
- [ ] 2.3.1 Add `mode` parameter to useGameState hook
- [ ] 2.3.2 Load/save game state using mode key
- [ ] 2.3.3 Reinitialize game state when mode changes

### Task 2.4: Update GuessInput autocomplete
- [ ] 2.4.1 Add mode parameter to GuessInput component
- [ ] 2.4.2 Filter autocomplete suggestions based on current mode

## Phase 3: Mode-Specific Statistics

### Task 3.1: Update statistics storage
- [ ] 3.1.1 Update `saveStatistics` to accept mode key parameter
- [ ] 3.1.2 Update `loadStatistics` to accept mode key parameter
- [ ] 3.1.3 Add migration logic for existing statistics to default mode

### Task 3.2: Update statistics tracking
- [ ] 3.2.1 Update `updateStatistics` to use mode key
- [ ] 3.2.2 Update useGameState to pass mode to statistics functions

### Task 3.3: Update StatsModal
- [ ] 3.3.1 Add mode selector dropdown to StatsModal
- [ ] 3.3.2 Load and display statistics for selected mode
- [ ] 3.3.3 Default to current game mode when opening modal

## Phase 4: Integration and Polish

### Task 4.1: Wire up App.tsx
- [ ] 4.1.1 Add mode state to App component
- [ ] 4.1.2 Pass mode to useGameState hook
- [ ] 4.1.3 Pass mode to GuessInput component
- [ ] 4.1.4 Handle mode changes from SettingsModal

### Task 4.2: Persist mode preference
- [ ] 4.2.1 Save current mode to preferences in localStorage
- [ ] 4.2.2 Load saved mode preference on app initialization
- [ ] 4.2.3 Default new players to "First 10 Seasons" + "Top 5 Only" mode

### Task 4.3: Update Instructions
- [ ] 4.3.1 Add mention of settings/gear icon for game modes to InstructionsModal

### Task 4.4: Testing and cleanup
- [ ] 4.4.1 Test all four mode combinations
- [ ] 4.4.2 Test mode switching preserves game state
- [ ] 4.4.3 Test statistics are tracked separately per mode
- [ ] 4.4.4 Test new players default to First 10 + Top 5 mode
- [ ] 4.4.5 Clean up any unused imports and lint warnings
