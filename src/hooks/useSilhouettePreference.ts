import { useState, useEffect } from 'react';
import { loadPreferences, updatePreference } from '../utilities/localStorage';

/**
 * Hook to manage silhouette visibility preference
 * Handles localStorage persistence and provides toggle functionality
 */
export function useSilhouettePreference() {
  const [showSilhouette, setShowSilhouette] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const preferences = loadPreferences();
      setShowSilhouette(preferences.showSilhouette);
    } catch (error) {
      console.warn('Failed to load silhouette preference:', error);
      // Default to false if loading fails
      setShowSilhouette(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle silhouette visibility and persist to localStorage
  const toggleSilhouette = (enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !showSilhouette;
    
    try {
      // Update localStorage
      const success = updatePreference('showSilhouette', newValue);
      
      if (success) {
        setShowSilhouette(newValue);
      } else {
        console.warn('Failed to save silhouette preference to localStorage');
        // Still update state even if localStorage fails
        setShowSilhouette(newValue);
      }
    } catch (error) {
      console.error('Error updating silhouette preference:', error);
      // Still update state even if there's an error
      setShowSilhouette(newValue);
    }
  };

  return {
    showSilhouette,
    toggleSilhouette,
    isLoading
  };
}