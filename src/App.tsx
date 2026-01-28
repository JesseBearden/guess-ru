import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GuessInput from './components/GuessInput';
import GuessHistory from './components/GuessHistory';
import SilhouetteSection from './components/SilhouetteSection';
import SilhouetteToggle from './components/SilhouetteToggle';
import Timer from './components/Timer';
import StatsModal from './components/StatsModal';
import GameEndSection from './components/GameEndSection';
import InstructionsModal from './components/InstructionsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useGameState } from './hooks/useGameState';
import { useSilhouettePreference } from './hooks/useSilhouettePreference';
import { getCurrentStatistics } from './utilities/statistics';
import { loadPreferences, updatePreference } from './utilities/localStorage';

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Initialize game state
  const { gameState, submitGuess, isGameComplete } = useGameState();
  
  // Initialize silhouette preference
  const { showSilhouette, toggleSilhouette, isLoading: silhouetteLoading } = useSilhouettePreference();

  // Get current statistics
  const statistics = getCurrentStatistics();

  // Check for first-time visitor and show instructions
  useEffect(() => {
    const preferences = loadPreferences();
    if (!preferences.hasSeenInstructions) {
      setShowInstructions(true);
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
              
              {/* Controls Row - Silhouette Toggle and Timer */}
              {!isGameComplete && (
                <div className="flex justify-between items-center mb-4">
                  <SilhouetteToggle
                    isEnabled={showSilhouette}
                    onToggle={toggleSilhouette}
                    disabled={silhouetteLoading}
                  />
                  <Timer
                    startTime={gameState.startTime}
                    endTime={gameState.endTime}
                    isGameComplete={isGameComplete}
                  />
                </div>
              )}

              {/* Guess Input Section - hidden when game is complete */}
              {!isGameComplete && (
                <div className="mb-6">
                  <GuessInput
                    onGuessSubmit={handleGuessSubmit}
                    previousGuesses={gameState.guesses.map(guess => guess.contestant)}
                    disabled={isGameComplete}
                    placeholder="Guess a queen..."
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

        {showStats && (
          <StatsModal
            statistics={statistics}
            isVisible={showStats}
            onClose={() => setShowStats(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
