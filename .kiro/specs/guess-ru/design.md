# Design Document: GuessRu.com

## Overview

GuessRu.com is a React-based daily guessing game where players attempt to identify a secret RuPaul's Drag Race contestant using clues from their season, finishing position, age, and hometown. The game follows a Wordle-like format with 8 maximum guesses per day, color-coded feedback, and persistent local storage for game state.

## Architecture

### Client-Side React Application
The application is built as a single-page React application that runs entirely in the browser. All game logic, state management, and data persistence occur on the client side using browser localStorage. The application uses Tailwind CSS for all styling, providing utility-first CSS classes for responsive design and consistent theming.

### Component Hierarchy
```
App
├── InstructionsModal
├── SettingsModal
│   ├── FirstTenSeasonsToggle
│   └── TopFiveOnlyToggle
├── Header
│   ├── Logo
│   ├── InfoButton
│   ├── SettingsButton
│   └── StatsButton
├── GameArea
│   ├── SilhouetteSection
│   ├── InputSection
│   │   ├── GuessInput (with autocomplete)
│   │   ├── SilhouetteToggle
│   │   └── Timer
│   └── GuessHistory
│       └── GuessRow (multiple)
├── StatsModal
│   ├── ModeSelector
│   └── StatisticsDisplay
#### GameEndModal Component
- Displays win/loss results
- Shows final time and guess count
- Provides share button for copying results to clipboard
- Formats shareable results similar to Wordle format
- Generates visual pattern using emojis (⬛ for wrong, 🟨 for close, 🟩 for correct)
```

#### SettingsModal Component
- Displays game mode settings
- Contains toggle switches for "First 10 Seasons" and "Top 5 Only"
- Styled consistently with InstructionsModal (cream background, black borders)
- Persists mode selection to localStorage
- Triggers game state switch when mode changes

### State Management
The application uses React's built-in state management with useState and useEffect hooks. Key state includes:
- Current game session data
- Player's guess history
- Game completion status
- Timer state
- Statistics data
- UI preferences (silhouette visibility)

## Components and Interfaces

### Core Data Structures

#### Contestant Interface
```typescript
interface Contestant {
  id: string;
  name: string;
  season: number;
  finishingPosition: number;
  ageAtShow: number;
  hometown: string;
  hometownCoordinates: {
    latitude: number;
    longitude: number;
  };
  headshotUrl: string; // Full color headshot image
  silhouetteUrl: string; // Blacked-out silhouette version
}
```

#### Guess Interface
```typescript
interface Guess {
  contestant: Contestant;
  feedback: {
    season: 'correct' | 'close' | 'wrong';
    position: 'correct' | 'close' | 'wrong';
    age: 'correct' | 'close' | 'wrong';
    hometown: 'correct' | 'wrong';
    seasonDirection?: 'higher' | 'lower';
    positionDirection?: 'higher' | 'lower';
    ageDirection?: 'higher' | 'lower';
  };
}
```

#### GameState Interface
```typescript
interface GameState {
  secretQueen: Contestant;
  guesses: Guess[];
  isComplete: boolean;
  isWon: boolean;
  startTime: number;
  endTime?: number;
  gameDate: string;
}
```

#### Statistics Interface
```typescript
#### ShareResults Interface
```typescript
interface ShareResults {
  gameNumber: number;
  guessCount: number;
  totalGuesses: number; // Always 8
  timeElapsed: string; // MM:SS format
  guessPattern: string[][]; // Array of arrays representing color patterns for each guess
}
```

#### Statistics Interface
```typescript
interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winDistribution: number[]; // Index represents guess number (0-7 for guesses 1-8)
}
```

#### GameMode Interface
```typescript
interface GameMode {
  firstTenSeasons: boolean;  // Limit to seasons 1-10
  topFiveOnly: boolean;      // Limit to top 5 finishers
}

// Mode key for storage (e.g., "default", "first10", "top5", "first10-top5")
type GameModeKey = 'default' | 'first10' | 'top5' | 'first10-top5';

function getModeKey(mode: GameMode): GameModeKey {
  if (mode.firstTenSeasons && mode.topFiveOnly) return 'first10-top5';
  if (mode.firstTenSeasons) return 'first10';
  if (mode.topFiveOnly) return 'top5';
  return 'default';
}
```
```

### Component Specifications

#### App Component
- Manages global application state
- Handles daily game rotation based on Pacific Time
- Coordinates localStorage persistence
- Renders main layout and modals

#### InstructionsModal Component
- Displays game rules and mechanics
- Shows on first visit or when info button clicked
- Explains color coding system and game flow

#### Header Component
- Contains logo, info button, and stats button
- Responsive design for mobile and desktop
- Drag Race themed styling

#### SilhouetteSection Component
- Displays queen silhouette during gameplay when enabled
- Reveals full color headshot when player wins
- Implements slide-in/slide-out animations for toggle
- Implements smooth transition animation from silhouette to headshot on win
- Responsive image sizing

#### InputSection Component
- Contains guess input with autocomplete
- Silhouette toggle button
- Timer display
- Handles guess submission and validation

#### GuessInput Component
- Text input with real-time autocomplete
- Filters contestant database based on typed characters
- Handles selection from dropdown
- Prevents duplicate guesses

#### GuessHistory Component
- Displays all previous guesses with feedback
- Color-coded cells (green, yellow, gray)
- Directional arrows for numerical misses
- Responsive table layout

#### Timer Component
- Counts up from game start
- Persists across page refreshes
- Stops when game completes
- Displays in MM:SS format

#### StatsModal Component
- Shows comprehensive player statistics
- Win distribution chart
- Streak tracking
- Win percentage calculation

## Data Models

### Contestant Database
The application includes a static dataset of RuPaul's Drag Race contestants from main US seasons only (excluding All Stars and international versions). For contestants who appeared in multiple seasons, only their first appearance is included.

### Share Results Format
When players complete a game, they can share their results in a format similar to Wordle:

```
GuessRu #123 4/8 ⏱️ 02:45

⬛🟨🟩⬛
🟨⬛🟩🟨  
🟩🟨🟩⬛
🟩🟩🟩🟩

https://guessru.com
```

Format explanation:
- Game number (incremental daily counter)
- Guess count out of maximum (e.g., "4/8")
- Time taken in MM:SS format
- Visual grid showing feedback patterns:
  - ⬛ (black) for incorrect attributes
  - 🟨 (yellow) for close numerical attributes (within 3)
  - 🟩 (green) for exact matches
- Each row represents one guess with 4 columns (season, position, age, hometown)

### Daily Queen Selection
The secret queen is determined using a deterministic algorithm based on the current date in Pacific Time and the active game mode. This ensures all players worldwide see the same queen each day for each mode while maintaining unpredictability.

```typescript
function getDailyQueen(date: Date, mode: GameMode): Contestant {
  const pacificDate = new Date(date.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const daysSinceEpoch = Math.floor(pacificDate.getTime() / (1000 * 60 * 60 * 24));
  
  // Filter contestants based on mode
  let eligibleContestants = contestants;
  if (mode.firstTenSeasons) {
    eligibleContestants = eligibleContestants.filter(c => c.season <= 10);
  }
  if (mode.topFiveOnly) {
    eligibleContestants = eligibleContestants.filter(c => c.finishingPosition <= 5);
  }
  
  // Use mode in seed to get different queen per mode
  const modeOffset = (mode.firstTenSeasons ? 1000 : 0) + (mode.topFiveOnly ? 2000 : 0);
  const queenIndex = (daysSinceEpoch + modeOffset) % eligibleContestants.length;
  return eligibleContestants[queenIndex];
}
```

### Game Mode System
The application supports four independent game modes based on two toggle settings:

| Mode | First 10 Seasons | Top 5 Only | Description |
|------|------------------|------------|-------------|
| Default | Off | Off | All contestants from all seasons |
| First 10 | On | Off | Only contestants from seasons 1-10 |
| Top 5 | Off | On | Only contestants who placed top 5 |
| First 10 + Top 5 | On | On | Top 5 finishers from seasons 1-10 |

Each mode has:
- Its own daily secret queen (deterministically selected)
- Separate game state per day
- Separate statistics tracking
- Filtered autocomplete showing only eligible contestants

### Feedback Calculation
The feedback system compares each guess attribute against the secret queen:

- **Exact Match**: Green background
- **Close Match (±3)**: Yellow background for numerical values (season, position, age)
- **Wrong**: Gray background with directional arrows for numerical values
- **Hometown**: Green for exact match, yellow if within 75 miles (using Haversine formula), gray otherwise

### Distance Calculation
The system uses the Haversine formula to calculate the distance between two cities:

```typescript
function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in miles
}
```

### Local Storage Schema
```typescript
interface StoredData {
  // Game states keyed by mode (4 possible states per day)
  gameStates: {
    default?: GameState;
    first10?: GameState;
    top5?: GameState;
    'first10-top5'?: GameState;
  };
  // Statistics keyed by mode (4 separate stat trackers)
  statistics: {
    default: Statistics;
    first10: Statistics;
    top5: Statistics;
    'first10-top5': Statistics;
  };
  preferences: {
    hasSeenInstructions: boolean;
    showSilhouette: boolean;
    currentMode: GameMode; // Last selected mode
  };
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Daily Queen Consistency
*For any* given date in Pacific Time, all players should receive the same secret queen, and consecutive days should produce different queens
**Validates: Requirements 1.1, 1.2**

### Property 2: Game Session Limits
*For any* game session, the system should enforce the 8-guess maximum and prevent additional guesses after game completion
**Validates: Requirements 1.3, 1.4**

### Property 3: Daily Reset Behavior
*For any* transition from one day to the next at midnight Pacific Time, the system should clear previous game data and reset guess counts
**Validates: Requirements 1.5, 6.4**

### Property 4: Autocomplete Filtering
*For any* text input in the guess field, the autocomplete dropdown should show only contestant names that contain the typed characters as a substring
**Validates: Requirements 2.2, 2.3**

### Property 5: Guess Validation and Processing
*For any* submitted guess, the system should validate it against the contestant database, reject duplicates and invalid names, and properly process valid submissions
**Validates: Requirements 2.5, 2.6, 2.7, 2.8**

### Property 6: Feedback Color Coding
*For any* guess compared to the secret queen, attributes should receive correct color coding: green for exact matches, yellow for numerical values within 3 (or hometown within 75 miles), and gray with directional arrows for other misses
**Validates: Requirements 3.2, 3.3, 3.4, 3.6**

### Property 7: Contestant Data Constraints
*For any* contestant in the database, they should be from main US seasons only, with first-appearance data for multi-season contestants, include all required attributes, and have valid hometown coordinates
**Validates: Requirements 4.1, 4.2, 4.3, 4.6, 4.7**

### Property 8: Win Condition Handling
*For any* correct guess, the system should display congratulations, trigger celebration effects, and end the game session
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: Loss Condition Handling
*For any* game reaching 8 incorrect guesses, the system should reveal the secret queen and end the game session
**Validates: Requirements 5.4, 5.5**

### Property 10: Game State Persistence
*For any* game action (guess submission, preference changes), the system should immediately persist the state to localStorage and restore it correctly on page refresh
**Validates: Requirements 6.1, 6.2, 6.3, 6.5**

### Property 11: Silhouette Toggle Behavior
*For any* silhouette toggle action, the system should animate the silhouette in or out appropriately and persist the preference
**Validates: Requirements 7.3, 7.4, 7.5, 7.6**

### Property 12: Responsive Layout Adaptation
*For any* screen width between 320px and 1920px, the layout should adapt appropriately without horizontal scrolling on mobile devices
**Validates: Requirements 8.3, 8.4**

### Property 13: Touch Interface Sizing
*For any* interactive element, it should meet minimum touch target size requirements for mobile accessibility
**Validates: Requirements 8.5**

### Property 14: Color Contrast Compliance
*For any* color combination used in the interface, it should meet WCAG accessibility contrast ratio requirements
**Validates: Requirements 9.4**

### Property 15: Client-Side Architecture
*For any* game functionality, it should operate entirely in the browser without requiring server-side processing
**Validates: Requirements 10.2**

### Property 16: Instructions Display Logic
*For any* first-time visitor, the instructions popup should appear, and for returning visitors, it should not appear unless explicitly requested
**Validates: Requirements 11.1, 11.5**

### Property 17: Timer Functionality
*For any* game session, the timer should start at zero, count up during play, stop on completion, and persist across page refreshes
**Validates: Requirements 12.2, 12.3, 12.4, 12.5**

### Property 18: Statistics Tracking Accuracy
*For any* completed game, all relevant statistics (games played, win streak, win percentage, guess distribution) should be updated correctly and persisted
**Validates: Requirements 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8**

### Property 19: Guess History Round Trip
*For any* valid guess submitted to the system, storing it and then retrieving the game state should preserve the guess with identical feedback calculations
**Validates: Requirements 6.1, 6.2**

### Property 20: Share Results Formatting
*For any* completed game, the share results should format correctly with game number, guess count, time, and visual pattern using appropriate emojis for each attribute's feedback
**Validates: Requirements 5.1, 5.5**

### Property 21: Headshot Reveal Behavior
*For any* game session, the silhouette should display during gameplay and smoothly transition to the full headshot when the player wins
**Validates: Requirements 14.1, 14.2, 14.3**

### Property 22: Feedback Calculation Consistency
*For any* contestant compared against the secret queen, the feedback calculation should be deterministic and produce the same results for identical inputs
**Validates: Requirements 4.5**

### Property 23: Hometown Proximity Calculation
*For any* two cities with valid coordinates, the distance calculation should correctly identify cities within 75 miles and return consistent results
**Validates: Requirements 3.6, 4.7**

### Property 24: Game Mode Filtering
*For any* game mode configuration, the contestant pool should be correctly filtered to include only contestants matching the mode criteria (seasons 1-10 for First 10 Seasons, top 5 placement for Top 5 Only)
**Validates: Requirements 15.2, 15.3, 15.8**

### Property 25: Mode-Specific Daily Queen Selection
*For any* date and game mode combination, the daily queen selection should be deterministic, different from other modes on the same day, and always select a contestant valid for that mode
**Validates: Requirements 15.7**

### Property 26: Mode State Independence
*For any* game mode switch, the game state for each mode should be preserved independently, allowing players to switch between modes without losing progress
**Validates: Requirements 15.5, 15.6, 15.10**

### Property 27: Mode-Specific Statistics Isolation
*For any* completed game, statistics should only be updated for the mode in which the game was played, leaving other mode statistics unchanged
**Validates: Requirements 16.1, 16.3, 16.4**

## Error Handling

### Input Validation
- Invalid contestant names are rejected with clear error messages
- Duplicate guesses within a session are prevented
- Empty or whitespace-only inputs are rejected
- Autocomplete handles special characters and accents gracefully

### State Management Errors
- localStorage failures gracefully degrade to session-only storage
- Corrupted localStorage data is detected and reset
- Missing or invalid game state triggers fresh game initialization
- Timer persistence failures fall back to session-based timing

### UI Error States
- Network failures for silhouette images show placeholder content
- Animation failures degrade gracefully to instant state changes
- Responsive layout failures maintain core functionality
- Touch interaction failures provide keyboard alternatives

### Data Integrity
- Contestant database validation ensures all required fields are present
- Daily queen selection handles edge cases (leap years, timezone changes)
- Statistics calculations handle division by zero and overflow scenarios
- Date parsing errors default to current Pacific Time

## Testing Strategy

### Dual Testing Approach
The application will use both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples and edge cases
- Component integration points
- Error conditions and boundary cases
- UI interaction scenarios

**Property Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Correctness guarantees across the entire input space
- Regression prevention for core game logic

### Property-Based Testing Configuration
- **Library**: fast-check for JavaScript/TypeScript property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Test Tagging**: Each property test references its design document property
- **Tag Format**: `Feature: guessru-game, Property {number}: {property_text}`

### Testing Coverage Areas

#### Core Game Logic Testing
- Daily queen selection determinism
- Guess validation and feedback calculation
- Game state transitions and completion logic
- Statistics tracking accuracy

#### UI Component Testing
- Autocomplete filtering and selection
- Silhouette toggle animations
- Timer display and persistence
- Responsive layout behavior

#### Data Persistence Testing
- localStorage round-trip consistency
- State restoration after page refresh
- Daily reset functionality
- Statistics persistence across sessions

#### Integration Testing
- End-to-end game flow scenarios
- Cross-component state synchronization
- Error recovery and graceful degradation
- Accessibility compliance verification

Each correctness property will be implemented as a single property-based test that validates the universal behavior described in the property statement.