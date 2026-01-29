import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GuessInput from './components/GuessInput';
import GuessHistory from './components/GuessHistory';
import SilhouetteSection from './components/SilhouetteSection';
import Timer from './components/Timer';
import StatsModal from './components/StatsModal';
import GameEndSection from './components/GameEndSection';
import InstructionsModal from './components/InstructionsModal';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useGameState } from './hooks/useGameState';
import { useSilhouettePreference } from './hooks/useSilhouettePreference';
import { loadPreferences, updatePreference } from './utilities/localStorage';
import { GameMode, DEFAULT_GAME_MODE, getModeKey } from './types';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_GAME_MODE);
  
  // Initialize game state with current mode
  const { gameState, submitGuess, isGameComplete } = useGameState(gameMode);
  
  // Initialize silhouette preference
  const { showSilhouette } = useSilhouettePreference();

  // Check for first-time visitor and show instructions
  useEffect(() => {
    const preferences = loadPreferences();
    if (!preferences.hasSeenInstructions) {
      setShowInstructions(true);
    }
    // Load saved mode preference
    if (preferences.currentMode) {
      setGameMode(preferences.currentMode);
    }
  }, []);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    // Mark that user has seen instructions
    updatePreference('hasSeenInstructions', true);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
    updatePreference('currentMode', newMode);
  };

  const handleGuessSubmit = (contestant: any) => {
    submitGuess(contestant.id);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {/* Skip link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="skip-link"
          tabIndex={0}
        >
          Skip to main content
        </a>
        
        <Header 
          onShowInstructions={handleShowInstructions}
          onShowStats={() => setShowStats(true)}
          onShowSettings={() => setShowSettings(true)}
        />
        
        <main 
          id="main-content"
          className="flex-1 max-w-[700px] mx-auto px-4 py-6 w-full"
          role="main"
          aria-label="GuessRu game area"
        >
          <ErrorBoundary>
            <div className="bg-[#f5f0e8] rounded-xl p-6 shadow-heavy">
              {/* Game End Section - shown inline when game is complete */}
              {isGameComplete && (
                <GameEndSection gameState={gameState} />
              )}

              {/* Silhouette Section - hidden when game is complete (headshot shown in GameEndSection) */}
              {showSilhouette && !isGameComplete && (
                <SilhouetteSection
                  secretQueen={gameState.secretQueen}
                  isVisible={showSilhouette}
                  isGameWon={gameState.isWon}
                  className={showSilhouette ? 'animate-slide-in' : 'animate-slide-out'}
                />
              )}

              {/* Guess Input Section with Timer - hidden when game is complete */}
              {!isGameComplete && (
                <div className="mb-6 flex gap-3 items-stretch">
                  <GuessInput
                    onGuessSubmit={handleGuessSubmit}
                    previousGuesses={gameState.guesses.map(guess => guess.contestant)}
                    disabled={isGameComplete}
                    placeholder="Guess a queen..."
                    mode={gameMode}
                  />
                  <Timer
                    startTime={gameState.startTime}
                    endTime={gameState.endTime}
                    isGameComplete={isGameComplete}
                    className="flex-shrink-0"
                  />
                </div>
              )}
              
              {/* Guess History */}
              <GuessHistory guesses={gameState.guesses} />
            </div>
          </ErrorBoundary>
        </main>

        {/* Modal overlay system */}
        <InstructionsModal
          isVisible={showInstructions}
          onClose={handleCloseInstructions}
        />

        <SettingsModal
          isVisible={showSettings}
          onClose={() => setShowSettings(false)}
          mode={gameMode}
          onModeChange={handleModeChange}
        />

        {showStats && (
          <StatsModal
            currentModeKey={getModeKey(gameMode)}
            isVisible={showStats}
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
