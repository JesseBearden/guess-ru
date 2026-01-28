import * as fc from 'fast-check';
import { calculateDistance, isWithinProximity } from './distanceCalculation';
import { HometownCoordinates } from '../types';

/**
 * Feature: guessru-game
 * Property 23: Hometown Proximity Calculation
 * 
 * For any two cities with valid coordinates, the distance calculation should 
 * correctly identify cities within 75 miles and return consistent results.
 * 
 * **Validates: Requirements 3.6, 4.7**
 */
describe('Property 23: Hometown Proximity Calculation', () => {
  // Arbitrary for valid coordinates (latitude: -90 to 90, longitude: -180 to 180)
  const coordinatesArb = fc.record({
    latitude: fc.double({ min: -90, max: 90, noNaN: true }),
    longitude: fc.double({ min: -180, max: 180, noNaN: true })
  });

  it('should return zero distance for identical coordinates', () => {
    fc.assert(
      fc.property(coordinatesArb, (coord) => {
        const distance = calculateDistance(coord, coord);
        return distance === 0;
      }),
      { numRuns: 100 }
    );
  });

  it('should return symmetric distances (distance A to B equals B to A)', () => {
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, (coord1, coord2) => {
        const distanceAB = calculateDistance(coord1, coord2);
        const distanceBA = calculateDistance(coord2, coord1);
        // Allow for small floating point differences
        return Math.abs(distanceAB - distanceBA) < 0.0001;
      }),
      { numRuns: 100 }
    );
  });

  it('should always return non-negative distances', () => {
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, (coord1, coord2) => {
        const distance = calculateDistance(coord1, coord2);
        return distance >= 0;
      }),
      { numRuns: 100 }
    );
  });

  it('should return distances within Earth circumference bounds', () => {
    const maxEarthDistance = 12451; // Half Earth circumference in miles (approx)
    
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, (coord1, coord2) => {
        const distance = calculateDistance(coord1, coord2);
        return distance <= maxEarthDistance;
      }),
      { numRuns: 100 }
    );
  });

  it('should correctly identify cities within 75 miles as proximate', () => {
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, (coord1, coord2) => {
        const distance = calculateDistance(coord1, coord2);
        const isProximate = isWithinProximity(coord1, coord2, 75);
        
        if (distance <= 75) {
          return isProximate === true;
        } else {
          return isProximate === false;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return consistent results for the same inputs', () => {
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, (coord1, coord2) => {
        const distance1 = calculateDistance(coord1, coord2);
        const distance2 = calculateDistance(coord1, coord2);
        return distance1 === distance2;
      }),
      { numRuns: 100 }
    );
  });

  it('should satisfy triangle inequality', () => {
    fc.assert(
      fc.property(coordinatesArb, coordinatesArb, coordinatesArb, (a, b, c) => {
        const ab = calculateDistance(a, b);
        const bc = calculateDistance(b, c);
        const ac = calculateDistance(a, c);
        // Triangle inequality: distance(a,c) <= distance(a,b) + distance(b,c)
        // Allow small epsilon for floating point errors
        return ac <= ab + bc + 0.001;
      }),
      { numRuns: 100 }
    );
  });

  // Test with known real-world distances
  describe('Known distance verification', () => {
    it('should calculate approximately correct distance between NYC and LA', () => {
      const nyc: HometownCoordinates = { latitude: 40.7128, longitude: -74.0060 };
      const la: HometownCoordinates = { latitude: 34.0522, longitude: -118.2437 };
      
      const distance = calculateDistance(nyc, la);
      // NYC to LA is approximately 2,451 miles
      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2500);
    });

    it('should identify nearby cities as within proximity', () => {
      // Fort Lauderdale and Miami are about 30 miles apart
      const fortLauderdale: HometownCoordinates = { latitude: 26.1224, longitude: -80.1373 };
      const miami: HometownCoordinates = { latitude: 25.7617, longitude: -80.1918 };
      
      expect(isWithinProximity(fortLauderdale, miami, 75)).toBe(true);
    });

    it('should identify distant cities as not within proximity', () => {
      const nyc: HometownCoordinates = { latitude: 40.7128, longitude: -74.0060 };
      const la: HometownCoordinates = { latitude: 34.0522, longitude: -118.2437 };
      
      expect(isWithinProximity(nyc, la, 75)).toBe(false);
    });
  });
});
