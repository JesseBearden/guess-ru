import { HometownCoordinates } from '../types';

/**
 * Converts degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * Returns the distance in miles.
 * 
 * @param coord1 - First coordinate pair (latitude, longitude)
 * @param coord2 - Second coordinate pair (latitude, longitude)
 * @returns Distance in miles between the two coordinates
 */
export const calculateDistance = (
  coord1: HometownCoordinates,
  coord2: HometownCoordinates
): number => {
  const R = 3959; // Earth's radius in miles
  
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
};

/**
 * Checks if two cities are within a specified proximity (default 75 miles)
 * 
 * @param coord1 - First coordinate pair
 * @param coord2 - Second coordinate pair
 * @param proximityMiles - Maximum distance to be considered "close" (default: 75)
 * @returns true if cities are within the proximity threshold
 */
export const isWithinProximity = (
  coord1: HometownCoordinates,
  coord2: HometownCoordinates,
  proximityMiles: number = 75
): boolean => {
  const distance = calculateDistance(coord1, coord2);
  return distance <= proximityMiles;
};
