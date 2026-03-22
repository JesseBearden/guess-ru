import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GuessInput from './components/GuessInput';
import GuessHistory from './components/GuessHistory';
import SilhouetteSection from './components/SilhouetteSection';
import Timer from './components/Timer';
import StatsModal from './components/StatsModal';
import GameEndSection from './components/GameEndSection';
import InstructionsModal from './components/InstructionsModal';
import ErrorBoundary from './components/ErrorBoundary';
import HintButtons from './components/HintButtons';
import { useGameState } from './hooks/useGameState';
import { useSilhouettePreference } from './hooks/useSilhouettePreference';
import { loadPreferences, updatePreference } from './utilities/localStorage';
import { GameModeKey, DEFAULT_GAME_MODE } from './types';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [gameMode, setGameMode] = useState<GameModeKey>(DEFAULT_GAME_MODE);
  
  // Initialize game state with current mode
  const { gameState, submitGuess, markHintUsed, isGameComplete } = useGameState(gameMode);
  
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
    updatePreference('hasSeenInstructions', true);
  };

  const handleModeChange = (newMode: GameModeKey) => {
    setGameMode(newMode);
    updatePreference('currentMode', newMode);
  };

  const handleGuessSubmit = (contestant: any) => {
    submitGuess(contestant.id);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <a 
          href="#main-content" 
          className="skip-link"
          tabIndex={0}
        >
          Skip to main content
        </a>
        
        <Header 
          onShowInstructions={() => setShowInstructions(true)}
          onShowStats={() => setShowStats(true)}
          gameMode={gameMode}
          onModeChange={handleModeChange}
        />
        
        <main 
          id="main-content"
          className="flex-1 max-w-[700px] mx-auto px-4 py-6 w-full"
          role="main"
          aria-label="GuessRu game area"
        >
          <ErrorBoundary>
            <div className="bg-[#f5f0e8] rounded-xl p-6 shadow-heavy">
              {isGameComplete && (
                <GameEndSection gameState={gameState} />
              )}

              {showSilhouette && !isGameComplete && (
                <SilhouetteSection
                  secretQueen={gameState.secretQueen}
                  isVisible={showSilhouette}
                  isGameWon={gameState.isWon}
                  className={showSilhouette ? 'animate-slide-in' : 'animate-slide-out'}
                />
              )}

              {!isGameComplete && (
                <>
                  <HintButtons
                    entranceQuote={gameState.secretQueen.entranceQuote || ''}
                    snatchGameCharacter={gameState.secretQueen.snatchGameCharacter || ''}
                    hintsUsed={gameState.hintsUsed || { entranceQuote: false, snatchGame: false }}
                    onHintUsed={markHintUsed}
                    disabled={isGameComplete}
                    className="mb-3 flex-1"
                    modeKey={gameState.modeKey}
                    timerSlot={
                      <Timer
                        startTime={gameState.startTime}
                        endTime={gameState.endTime}
                        isGameComplete={isGameComplete}
                        className="flex-shrink-0 hidden sm:flex"
                      />
                    }
                  />
                  
                  <div className="mb-4 flex gap-2 items-stretch">
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
                      className="flex-shrink-0 sm:hidden"
                    />
                  </div>
                </>
              )}
              
              <GuessHistory guesses={gameState.guesses} />
            </div>
          </ErrorBoundary>
        </main>

        <InstructionsModal
          isVisible={showInstructions}
          onClose={handleCloseInstructions}
        />

        {showStats && (
          <StatsModal
            currentModeKey={gameMode}
            isVisible={showStats}
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
