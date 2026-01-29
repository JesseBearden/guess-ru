# Requirements Document

## Introduction

GuessRu.com is a daily drag queen guessing game inspired by Wordle and Poeltl. Players have 8 attempts to guess the secret drag queen of the day using clues from RuPaul's Drag Race contestant data including season, finishing position, age, and hometown. The game features color-coded feedback, guess persistence, and daily rotation of the target queen.

## Glossary

- **Game_System**: The complete GuessRu.com web application
- **Player**: A user playing the daily guessing game
- **Secret_Queen**: The target drag queen that players must guess each day
- **Guess**: A player's attempt to identify the Secret_Queen
- **Game_Data**: Contestant information including season, finishing position, age at time of show, and hometown
- **Feedback_System**: The color-coding and arrow system that provides clues after each guess
- **Game_Session**: A single day's gameplay for a specific player
- **Local_Storage**: Browser-based data persistence for maintaining game state

## Requirements

### Requirement 1: Daily Game Structure

**User Story:** As a player, I want to play one guessing game per day with a new drag queen, so that I have a consistent daily challenge.

#### Acceptance Criteria

1. THE Game_System SHALL present exactly one Secret_Queen per calendar day that is identical for all Players
2. WHEN midnight Pacific Time occurs, THE Game_System SHALL rotate to a different Secret_Queen for all Players
3. THE Game_System SHALL limit each Player to a maximum of 8 guesses per Game_Session
4. WHEN a Player completes a Game_Session, THE Game_System SHALL prevent additional guesses until the next day
5. WHEN midnight Pacific Time occurs, THE Game_System SHALL reset the guess count to zero for all Players

### Requirement 2: Guess Input and Validation

**User Story:** As a player, I want to input my guesses for drag queens with autocomplete assistance, so that I can easily find and select contestants.

#### Acceptance Criteria

1. THE Game_System SHALL provide an input box at the top of the game interface for Players to type drag queen names
2. WHEN a Player begins typing in the input box, THE Game_System SHALL display an autocomplete dropdown list below the input
3. THE Game_System SHALL filter the autocomplete list to show only drag queen names that match the typed characters
4. WHEN a Player selects a name from the autocomplete list, THE Game_System SHALL populate the input box with the selected name
5. WHEN a Player submits a guess, THE Game_System SHALL validate it against the known contestant database
6. IF a Player submits an invalid contestant name, THEN THE Game_System SHALL reject the guess and display an error message
7. WHEN a valid guess is submitted, THE Game_System SHALL add it to the Player's guess history and clear the input box
8. THE Game_System SHALL prevent duplicate guesses within the same Game_Session

### Requirement 3: Feedback and Clue System

**User Story:** As a player, I want to receive color-coded feedback on my guesses, so that I can make more informed subsequent guesses.

#### Acceptance Criteria

1. WHEN a Player submits a guess, THE Feedback_System SHALL display the guess with Game_Data attributes
2. FOR each attribute that exactly matches the Secret_Queen, THE Feedback_System SHALL display it with green color coding
3. FOR numerical attributes within 3 of the correct value, THE Feedback_System SHALL display them with yellow color coding
4. FOR numerical attributes that do not match, THE Feedback_System SHALL display directional arrows indicating higher or lower
5. THE Feedback_System SHALL display all previous guesses with their respective feedback in chronological order
6. FOR hometown attributes where the guessed city is within 75 miles of the Secret_Queen's city, THE Feedback_System SHALL display it with yellow color coding

### Requirement 4: Game Data Management

**User Story:** As a player, I want the game to use accurate RuPaul's Drag Race contestant data from main US seasons only, so that the clues are meaningful and consistent.

#### Acceptance Criteria

1. THE Game_System SHALL store contestant data only from main US RuPaul's Drag Race seasons (excluding All Stars, international versions, and spin-offs)
2. FOR contestants who appeared in multiple seasons, THE Game_System SHALL use data from their first appearance only
3. THE Game_System SHALL store contestant data including season number, finishing position, age at time of show, and hometown
4. THE Game_System SHALL ensure all Game_Data is accurate and corresponds to actual main season contestants
5. WHEN displaying feedback, THE Game_System SHALL use the stored Game_Data for comparison calculations
6. THE Game_System SHALL maintain a comprehensive database of main season contestants for guess validation
7. THE Game_System SHALL store latitude and longitude coordinates for each contestant's hometown to enable proximity calculations

### Requirement 5: Win and Loss Conditions

**User Story:** As a player, I want clear win and loss feedback, so that I know when the game is complete.

#### Acceptance Criteria

1. WHEN a Player correctly guesses the Secret_Queen, THE Game_System SHALL display a congratulations message
2. WHEN a Player wins, THE Game_System SHALL trigger a celebration animation or visual effect
3. WHEN a Player wins, THE Game_System SHALL end the current Game_Session
4. WHEN a Player reaches 8 incorrect guesses, THE Game_System SHALL reveal the Secret_Queen and end the Game_Session
5. WHEN a Game_Session ends, THE Game_System SHALL display the final results

### Requirement 6: Data Persistence

**User Story:** As a player, I want my guesses to be saved if I refresh the page, so that I don't lose my progress.

#### Acceptance Criteria

1. WHEN a Player submits a guess, THE Game_System SHALL immediately save it to Local_Storage
2. WHEN a Player refreshes the page, THE Game_System SHALL restore all guesses from the current Game_Session
3. WHEN a Player returns to the game on the same day, THE Game_System SHALL display their previous guesses and feedback
4. WHEN midnight Pacific Time occurs, THE Game_System SHALL clear the previous day's Local_Storage data
5. THE Game_System SHALL maintain game state persistence without requiring user accounts or server storage

### Requirement 7: Optional Visual Hints

**User Story:** As a player, I want the option to see a silhouette of the secret queen positioned above the input area, so that I can choose my preferred difficulty level.

#### Acceptance Criteria

1. THE Game_System SHALL display the Secret_Queen's silhouette above the guess input box when enabled
2. THE Game_System SHALL provide a "Show Silhouette" toggle button positioned to the right of the input box
3. WHEN a Player clicks the silhouette toggle button, THE Game_System SHALL animate the silhouette sliding in or out
4. WHEN the silhouette toggle is enabled, THE Game_System SHALL display the visual silhouette with a smooth slide-in animation
5. WHEN the silhouette toggle is disabled, THE Game_System SHALL hide the silhouette with a smooth slide-out animation
6. THE Game_System SHALL remember the Player's silhouette preference in Local_Storage
7. THE Game_System SHALL allow Players to toggle the silhouette on or off at any time during gameplay

### Requirement 8: Responsive Design and Accessibility

**User Story:** As a player using various devices, I want the game to work well on mobile and desktop, so that I can play anywhere.

#### Acceptance Criteria

1. THE Game_System SHALL display correctly on mobile devices with screen widths of 320px and above
2. THE Game_System SHALL display correctly on desktop devices with screen widths up to 1920px
3. WHEN viewed on mobile devices, THE Game_System SHALL maintain full functionality without horizontal scrolling
4. THE Game_System SHALL use responsive CSS layouts that adapt to different screen sizes
5. THE Game_System SHALL ensure all interactive elements are appropriately sized for touch interfaces

### Requirement 9: Visual Theme and Styling

**User Story:** As a RuPaul's Drag Race fan, I want the game to have appropriate theming, so that it feels authentic to the show.

#### Acceptance Criteria

1. THE Game_System SHALL use a color scheme and visual design inspired by RuPaul's Drag Race
2. THE Game_System SHALL incorporate drag race themed visual elements and typography
3. THE Game_System SHALL maintain visual consistency across all game screens and components
4. THE Game_System SHALL ensure sufficient color contrast for accessibility while maintaining the theme
5. THE Game_System SHALL use appropriate fonts and styling that reflect the drag race aesthetic

### Requirement 10: Technical Architecture

**User Story:** As a developer, I want the game to be built as a React client-side application, so that it can be deployed easily and run entirely in the browser.

#### Acceptance Criteria

1. THE Game_System SHALL be implemented as a React single-page application
2. THE Game_System SHALL run entirely in the client browser without requiring server-side processing
3. THE Game_System SHALL use React components for all user interface elements
4. THE Game_System SHALL manage application state using React state management patterns
5. THE Game_System SHALL be deployable as static files to any web hosting service
6. THE Game_System SHALL use Tailwind CSS for all styling and visual design

### Requirement 11: Game Instructions and Help

**User Story:** As a new player, I want to understand how to play the game, so that I can participate effectively.

#### Acceptance Criteria

1. WHEN a Player visits the website for the first time, THE Game_System SHALL display a popup box explaining the game rules and mechanics
2. THE Game_System SHALL provide an information button in the top right corner of the game interface
3. WHEN a Player clicks the information button, THE Game_System SHALL display the game instructions popup
4. THE Game_System SHALL allow Players to close the instructions popup and return to gameplay
5. THE Game_System SHALL remember that a Player has seen the initial instructions and not show the popup on subsequent visits
6. THE Game_System SHALL mention in the instructions that game mode settings are available via the settings (gear) icon

### Requirement 12: Game Timer

**User Story:** As a player, I want to see how long I've been playing, so that I can track my solving time.

#### Acceptance Criteria

1. THE Game_System SHALL display a timer to the right of the silhouette toggle button
2. WHEN a Player starts a new Game_Session, THE Game_System SHALL start the timer counting up from zero
3. THE Game_System SHALL display the elapsed time in minutes and seconds format
4. WHEN a Player completes the game, THE Game_System SHALL stop the timer and display the final time
5. THE Game_System SHALL persist the timer state in Local_Storage to maintain accuracy across page refreshes

### Requirement 13: Player Statistics

**User Story:** As a player, I want to view my game statistics, so that I can track my performance over time.

#### Acceptance Criteria

1. THE Game_System SHALL provide a statistics button that displays the Player's game statistics
2. THE Game_System SHALL track and display the total number of games played
3. THE Game_System SHALL track and display the Player's current win streak
4. THE Game_System SHALL track and display the Player's longest win streak achieved
5. THE Game_System SHALL calculate and display the Player's win percentage
6. THE Game_System SHALL track and display a breakdown of wins by number of guesses (1-8 guesses)
7. THE Game_System SHALL persist all statistics data in Local_Storage
8. WHEN a Player completes a game, THE Game_System SHALL update the relevant statistics immediately

### Requirement 14: Headshot Reveal Feature

**User Story:** As a player, I want to see the queen's actual headshot revealed when I win, so that I get a satisfying visual reward for solving the puzzle.

#### Acceptance Criteria

1. WHILE a Player is still guessing, THE Game_System SHALL display only a blacked-out silhouette version of the Secret_Queen's headshot
2. WHEN a Player correctly guesses the Secret_Queen, THE Game_System SHALL reveal the actual color headshot image
3. THE Game_System SHALL animate the transition from silhouette to full headshot smoothly
4. THE Game_System SHALL maintain the headshot reveal state if the Player refreshes the page after winning
5. THE Game_System SHALL reset to silhouette mode when a new daily game begins

### Requirement 15: Game Mode Settings

**User Story:** As a player, I want to customize my game experience with different modes, so that I can play multiple variations each day and adjust the difficulty.

#### Acceptance Criteria

1. THE Game_System SHALL provide a settings button (gear icon) in the header that opens a settings modal
2. THE Game_System SHALL provide a "First 10 Seasons" toggle that limits contestants to seasons 1-10 when enabled
3. THE Game_System SHALL provide a "Top 5 Only" toggle that limits contestants to those who placed in the top 5 when enabled
4. THE Game_System SHALL support all four combinations of these toggles as independent game modes
5. WHEN a Player changes mode settings, THE Game_System SHALL switch to the game state for that mode combination
6. THE Game_System SHALL maintain separate game states for each of the four mode combinations per day
7. THE Game_System SHALL select a different deterministic Secret_Queen for each mode combination each day
8. THE Game_System SHALL filter the autocomplete dropdown to show only contestants valid for the current mode
9. THE Game_System SHALL persist the Player's current mode selection in Local_Storage
10. THE Game_System SHALL allow Players to switch between modes at any time, preserving progress in each mode
11. FOR new Players without saved preferences, THE Game_System SHALL default to both "First 10 Seasons" and "Top 5 Only" enabled

### Requirement 16: Mode-Specific Statistics

**User Story:** As a player, I want to track my statistics separately for each game mode, so that I can see my performance across different difficulty levels.

#### Acceptance Criteria

1. THE Game_System SHALL maintain separate statistics for each of the four game mode combinations
2. THE Game_System SHALL display a mode selector in the statistics modal to view stats for different modes
3. WHEN a Player completes a game in a specific mode, THE Game_System SHALL update only the statistics for that mode
4. THE Game_System SHALL persist mode-specific statistics separately in Local_Storage
5. THE Game_System SHALL display the currently selected mode's statistics by default in the stats modal