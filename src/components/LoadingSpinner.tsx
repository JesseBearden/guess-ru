import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

/**
 * Loading spinner component for async operations
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div 
        className={`${sizeClasses[size]} border-gray-200 border-t-primary-pink rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
