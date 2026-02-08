import { 
  contestants, 
  getContestantById, 
  getContestantsByName, 
  getContestantsBySeason,
  getAllContestantNames,
  getRandomContestant,
  validateContestantDatabase 
} from './contestantDatabase';

describe('Contestant Database Tests', () => {
  describe('Database Validation', () => {
    test('should have valid database structure', () => {
      const validation = validateContestantDatabase();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should contain only main US season contestants', () => {
      contestants.forEach(contestant => {
        // Main US seasons are 1-17 (as of 2025)
        expect(contestant.season).toBeGreaterThanOrEqual(1);
        expect(contestant.season).toBeLessThanOrEqual(17);
      });
    });

    test('should have all required fields for each contestant', () => {
      contestants.forEach(contestant => {
        expect(contestant.id).toBeTruthy();
        expect(contestant.name).toBeTruthy();
        expect(contestant.season).toBeGreaterThan(0);
        expect(contestant.finishingPosition).toBeGreaterThan(0);
        expect(contestant.ageAtShow).toBeGreaterThanOrEqual(18);
        expect(contestant.hometown).toBeTruthy();
        expect(contestant.headshotUrl).toBeTruthy();
        // entranceQuote should be defined (even if empty string)
        expect(contestant.entranceQuote).toBeDefined();
        // farewellQuote and snatchGameCharacter are optional and may be undefined
      });
    });

    test('should have unique contestant IDs', () => {
      const ids = contestants.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should have reasonable age ranges', () => {
      contestants.forEach(contestant => {
        expect(contestant.ageAtShow).toBeGreaterThanOrEqual(18);
        expect(contestant.ageAtShow).toBeLessThanOrEqual(70);
      });
    });

    test('should have valid finishing positions', () => {
      contestants.forEach(contestant => {
        expect(contestant.finishingPosition).toBeGreaterThan(0);
        expect(contestant.finishingPosition).toBeLessThanOrEqual(16); // Max contestants per season
      });
    });

    test('should have proper URL formats', () => {
      contestants.forEach(contestant => {
        expect(contestant.headshotUrl).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });
    });
  });

  describe('Database Query Functions', () => {
    test('getContestantById should return correct contestant', () => {
      const bebe = getContestantById('bebe-zahara-benet');
      expect(bebe).toBeDefined();
      expect(bebe?.name).toBe('BeBe Zahara Benet');
      expect(bebe?.season).toBe(1);
      expect(bebe?.finishingPosition).toBe(1);
    });

    test('getContestantById should return undefined for non-existent ID', () => {
      const nonExistent = getContestantById('non-existent-queen');
      expect(nonExistent).toBeUndefined();
    });

    test('getContestantsByName should return matching contestants', () => {
      const rajaResults = getContestantsByName('Raja');
      expect(rajaResults).toHaveLength(1);
      expect(rajaResults[0].name).toBe('Raja');

      const partialResults = getContestantsByName('ra');
      expect(partialResults.length).toBeGreaterThan(0);
      partialResults.forEach(contestant => {
        expect(contestant.name.toLowerCase()).toContain('ra');
      });
    });

    test('getContestantsByName should be case insensitive', () => {
      const upperCase = getContestantsByName('RAJA');
      const lowerCase = getContestantsByName('raja');
      const mixedCase = getContestantsByName('RaJa');
      
      expect(upperCase).toEqual(lowerCase);
      expect(lowerCase).toEqual(mixedCase);
    });

    test('getContestantsBySeason should return correct contestants', () => {
      const season1 = getContestantsBySeason(1);
      expect(season1).toHaveLength(9); // Season 1 had 9 contestants
      season1.forEach(contestant => {
        expect(contestant.season).toBe(1);
      });

      const season2 = getContestantsBySeason(2);
      expect(season2).toHaveLength(12); // Season 2 had 12 contestants
      season2.forEach(contestant => {
        expect(contestant.season).toBe(2);
      });
    });

    test('getContestantsBySeason should return empty array for non-existent season', () => {
      const nonExistentSeason = getContestantsBySeason(99);
      expect(nonExistentSeason).toHaveLength(0);
    });

    test('getAllContestantNames should return all names', () => {
      const names = getAllContestantNames();
      expect(names.length).toBe(contestants.length);
      expect(names).toContain('BeBe Zahara Benet');
      expect(names).toContain('Raja');
      expect(names).toContain('Tyra Sanchez');
    });

    test('getRandomContestant should return a valid contestant', () => {
      const randomContestant = getRandomContestant();
      expect(randomContestant).toBeDefined();
      expect(contestants).toContain(randomContestant);
    });
  });

  describe('Data Completeness', () => {
    test('should have contestants from multiple seasons', () => {
      const seasons = new Set(contestants.map(c => c.season));
      expect(seasons.size).toBeGreaterThan(1);
      expect(seasons.has(1)).toBe(true);
      expect(seasons.has(2)).toBe(true);
      expect(seasons.has(3)).toBe(true);
    });

    test('should have winners from each represented season', () => {
      const seasons = new Set(contestants.map(c => c.season));
      seasons.forEach(season => {
        const winner = contestants.find(c => c.season === season && c.finishingPosition === 1);
        expect(winner).toBeDefined();
      });
    });

    test('should not include All Stars or international seasons', () => {
      // This test ensures we only have main US seasons
      // All Stars seasons would typically be identified by different season numbering
      // or specific contestant data that indicates All Stars participation
      contestants.forEach(contestant => {
        // Main US seasons are numbered 1-17
        expect(contestant.season).toBeGreaterThanOrEqual(1);
        expect(contestant.season).toBeLessThanOrEqual(17);
        
        // Ensure no All Stars indicators in names or IDs
        expect(contestant.name.toLowerCase()).not.toContain('all stars');
        expect(contestant.id.toLowerCase()).not.toContain('allstars');
      });
    });
  });
});