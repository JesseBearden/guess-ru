import React, { useState, useEffect } from 'react';
import { Contestant } from '../types/index';

interface SilhouetteSectionProps {
  secretQueen: Contestant;
  isVisible: boolean;
  isGameWon: boolean;
  className?: string;
}

const SilhouetteSection: React.FC<SilhouetteSectionProps> = ({
  secretQueen,
  isVisible,
  isGameWon,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showHeadshot, setShowHeadshot] = useState(false);

  // Reset image states when secret queen changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setShowHeadshot(false);
  }, [secretQueen.id]);

  // Handle headshot reveal when game is won
  useEffect(() => {
    if (isGameWon && imageLoaded && !imageError) {
      // Add a small delay for better visual effect
      const timer = setTimeout(() => {
        setShowHeadshot(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isGameWon) {
      setShowHeadshot(false);
    }
  }, [isGameWon, imageLoaded, imageError]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`w-full mb-4 transition-all duration-300 ${className}`}
      role="img"
      aria-label={isGameWon ? `${secretQueen.name} headshot revealed` : 'Mystery queen silhouette hint'}
    >
      <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-medium md:max-w-[150px] sm:max-w-[120px]">
        {imageError ? (
          // Fallback content for failed image loading
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600">
            <div className="text-5xl mb-2 opacity-70 md:text-4xl" aria-hidden="true">👑</div>
            <p className="text-sm text-center m-0 opacity-80 md:text-xs">Image not available</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Headshot image - shown as silhouette until game is won */}
            <img
              src={secretQueen.headshotUrl}
              alt={isGameWon ? `${secretQueen.name} headshot` : 'Queen silhouette hint'}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 ${showHeadshot ? '' : 'brightness-0'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}
        
        {/* Loading indicator */}
        {!imageLoaded && !imageError && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white/90 z-10" role="status" aria-live="polite">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-primary-pink rounded-full animate-spin mb-2 sm:w-6 sm:h-6" aria-hidden="true"></div>
            <p className="text-sm text-gray-500 m-0">Loading image...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SilhouetteSection;
