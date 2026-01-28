import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  startTime: number;
  endTime?: number;
  isGameComplete: boolean;
  className?: string;
}

/**
 * Timer component that displays elapsed time in MM:SS format
 * Counts up from game start and stops when game completes
 */
const Timer: React.FC<TimerProps> = ({ 
  startTime, 
  endTime, 
  isGameComplete, 
  className = '' 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Format time in HH:MM:SS format
   */
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate elapsed time based on current time or end time
   */
  const calculateElapsedTime = useCallback((): number => {
    if (endTime && endTime >= startTime) {
      return endTime - startTime;
    }
    if (startTime > 0) {
      return Math.max(0, Date.now() - startTime);
    }
    return 0;
  }, [endTime, startTime]);

  /**
   * Update timer display
   */
  const updateTimer = useCallback(() => {
    const elapsed = calculateElapsedTime();
    setElapsedTime(elapsed);
  }, [calculateElapsedTime]);

  /**
   * Stop the timer interval
   */
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Start the timer interval
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update immediately
    updateTimer();
    
    // Set up interval to update every second
    intervalRef.current = setInterval(updateTimer, 1000);
  }, [updateTimer]);

  /**
   * Effect to manage timer lifecycle
   */
  useEffect(() => {
    if (isGameComplete) {
      // Game is complete, stop timer and show final time
      stopTimer();
      updateTimer(); // Final update to show correct end time
    } else {
      // Game is active, start timer
      startTimer();
    }

    // Cleanup on unmount
    return () => {
      stopTimer();
    };
  }, [startTime, endTime, isGameComplete, startTimer, stopTimer, updateTimer]);

  /**
   * Effect to handle startTime changes (new game)
   */
  useEffect(() => {
    if (!isGameComplete) {
      startTimer();
    }
  }, [startTime, isGameComplete, startTimer]);

  return (
    <div 
      className={`flex items-center justify-center bg-white border-2 border-text-dark rounded-lg 
        py-2 px-4 min-w-[110px] min-h-[44px] font-mono font-bold text-lg text-text-dark
        ${className}`}
      role="timer" 
      aria-label={`Game timer: ${formatTime(elapsedTime)}`}
      aria-live="off"
    >
      {formatTime(elapsedTime)}
    </div>
  );
};

export default Timer;
