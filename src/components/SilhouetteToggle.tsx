import React from 'react';

interface SilhouetteToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const SilhouetteToggle: React.FC<SilhouetteToggleProps> = ({
  isEnabled,
  onToggle,
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      onToggle(!isEnabled);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onToggle(!isEnabled);
    }
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-2 py-2 px-4 bg-white border-2 border-text-dark rounded-lg cursor-pointer 
        text-sm font-bold transition-all duration-200 min-h-[44px] min-w-[44px] whitespace-nowrap
        ${isEnabled 
          ? 'bg-warning-yellow border-text-dark text-text-dark' 
          : 'border-text-dark text-text-dark hover:enabled:bg-gray-50'
        }
        focus:enabled:outline-none focus-visible:outline-2 focus-visible:outline-primary-pink focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={`${isEnabled ? 'Hide' : 'Show'} queen silhouette hint`}
      aria-pressed={isEnabled}
      title={`${isEnabled ? 'Hide' : 'Show'} silhouette hint`}
    >
      <div className={`flex items-center justify-center flex-shrink-0 ${isEnabled ? 'animate-toggle-on' : ''}`}>
        {/* Person silhouette icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="transition-transform duration-200"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <span className="font-bold">
        {isEnabled ? 'Hide Silhouette' : 'Show Silhouette'}
      </span>
    </button>
  );
};

export default SilhouetteToggle;
