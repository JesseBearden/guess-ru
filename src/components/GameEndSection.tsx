import React, { useState } from 'react';
import { GameState } from '../types';
import { copyShareResults } from '../utilities/shareResults';

interface GameEndSectionProps {
  gameState: GameState;
}

const GameEndSection: React.FC<GameEndSectionProps> = ({ gameState }) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  if (!gameState.isComplete) {
    return null;
  }

  const handleShare = async () => {
    setShareStatus('copying');
    
    try {
      const success = await copyShareResults(gameState);
      if (success) {
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else {
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const formatTime = (startTime: number, endTime?: number): string => {
    if (!endTime) return '00:00';
    
    const totalSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeElapsed = formatTime(gameState.startTime, gameState.endTime);
  const guessCount = gameState.guesses.length;

  return (
    <div 
      className={`rounded-xl p-6 mb-8 text-center ${
        gameState.isWon 
          ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-hot-pink' 
          : 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500'
      }`}
      role="region"
      aria-label="Game results"
    >
      <h2 className={`text-2xl font-bold mb-2 ${gameState.isWon ? 'text-gold' : 'text-red-300'}`}>
        {gameState.isWon ? '🎉 Condragulations!' : '😔 Game Over'}
      </h2>

      {gameState.isWon ? (
        <>
          {/* Celebration Animation */}
          <div className="relative h-[40px] overflow-hidden mb-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="absolute w-2.5 h-2.5 animate-confetti-fall motion-reduce:animate-none"
                style={{
                  left: `${10 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  backgroundColor: ['#ff69b4', '#ffd700', '#00ff7f', '#ff1493', '#00bfff'][i]
                }}
              />
            ))}
          </div>
          
          <p className="text-3xl font-bold text-white drop-shadow-lg mb-2">{gameState.secretQueen.name}</p>
        </>
      ) : (
        <>
          <p className="text-lg text-white/80 mb-2">Better luck tomorrow! 💪</p>
          <p className="text-sm text-white/60 mb-1">The answer was:</p>
          <p className="text-3xl font-bold text-white drop-shadow-lg mb-4">{gameState.secretQueen.name}</p>
        </>
      )}

      {/* Queen Headshot Reveal */}
      <div className="mb-6">
        <img 
          src={gameState.secretQueen.headshotUrl} 
          alt={gameState.secretQueen.name}
          className={`w-[120px] h-[120px] mx-auto rounded-full object-cover border-4 shadow-lg ${
            gameState.isWon 
              ? 'border-gold animate-headshot-reveal motion-reduce:animate-none' 
              : 'border-gray-400 opacity-90'
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Prevent infinite loop by only setting fallback once
            if (!target.dataset.fallback) {
              target.dataset.fallback = 'true';
              target.style.display = 'none';
            }
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-6 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{guessCount}{!gameState.isWon && '/8'}</div>
          <div className="text-xs text-white/70 uppercase tracking-wide">Guesses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{timeElapsed}</div>
          <div className="text-xs text-white/70 uppercase tracking-wide">Time</div>
        </div>
      </div>

      {/* Queen Details (shown on loss) */}
      {!gameState.isWon && (
        <div className="bg-white/10 rounded-lg p-3 mb-6 backdrop-blur-sm text-left max-w-[300px] mx-auto">
          <p className="my-1 text-sm text-white/90"><strong className="text-hot-pink">Season:</strong> {gameState.secretQueen.season}</p>
          <p className="my-1 text-sm text-white/90"><strong className="text-hot-pink">Position:</strong> {gameState.secretQueen.finishingPosition}</p>
          <p className="my-1 text-sm text-white/90"><strong className="text-hot-pink">Age:</strong> {gameState.secretQueen.ageAtShow}</p>
          <p className="my-1 text-sm text-white/90"><strong className="text-hot-pink">Hometown:</strong> {gameState.secretQueen.hometown}</p>
        </div>
      )}

      {/* Share Button */}
      <button 
        className={`py-3 px-8 rounded-full font-semibold text-base transition-all duration-300 cursor-pointer border-none min-w-[160px] min-h-[44px] text-white
          ${shareStatus === 'success' 
            ? 'bg-green-500 shadow-lg' 
            : shareStatus === 'error'
              ? 'bg-red-500 shadow-lg'
              : 'bg-gradient-to-r from-hot-pink to-purple-600 shadow-lg hover:enabled:-translate-y-0.5 hover:enabled:shadow-xl'
          }
          disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
        onClick={handleShare}
        disabled={shareStatus === 'copying'}
        aria-label="Share results"
      >
        {shareStatus === 'copying' && '⏳ Copying...'}
        {shareStatus === 'success' && '✅ Copied!'}
        {shareStatus === 'error' && '❌ Failed'}
        {shareStatus === 'idle' && '📋 Share Results'}
      </button>
    </div>
  );
};

export default GameEndSection;
