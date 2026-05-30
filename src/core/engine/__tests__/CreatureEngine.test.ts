import { CreatureEngine } from '../CreatureEngine';
import { Creature, EvolutionStage } from '../types';

describe('CreatureEngine', () => {
  describe('createCreature', () => {
    it('should create a new creature with default stats', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      expect(creature.name).toBe('TestPet');
      expect(creature.species).toBe('default');
      expect(creature.evolutionStage).toBe('egg');
      expect(creature.generation).toBe(1);
      expect(creature.physical.hunger).toBe(100);
      expect(creature.physical.energy).toBe(100);
      expect(creature.physical.health).toBe(100);
      expect(creature.physical.cleanliness).toBe(100);
      expect(creature.careQuality).toBe(100);
      expect(creature.mood).toBe('happy');
      expect(creature.isAsleep).toBe(false);
    });

    it('should generate a unique ID for each creature', () => {
      const creature1 = CreatureEngine.createCreature('Pet1');
      const creature2 = CreatureEngine.createCreature('Pet2');

      expect(creature1.id).not.toBe(creature2.id);
    });
  });

  describe('updateStats', () => {
    it('should update creature stats and clamp to valid range', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      const updated = CreatureEngine.updateStats(creature, {
        'physical.hunger': 150,  // Should clamp to 100
        'physical.energy': -10,  // Should clamp to 0
        'mental.happiness': 75,
      });

      expect(updated.physical.hunger).toBe(100);
      expect(updated.physical.energy).toBe(0);
      expect(updated.mental.happiness).toBe(75);
    });

    it('should update mood based on stats', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      // Low stats should make creature sad/tired
      const updated = CreatureEngine.updateStats(creature, {
        'physical.hunger': 0,
        'physical.energy': 10,
        'mental.happiness': 20,
      });

      expect(['sad', 'tired', 'sick']).toContain(updated.mood);
    });
  });

  describe('isCritical', () => {
    it('should return true when any stat is below 20', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      creature.physical.hunger = 15;

      expect(CreatureEngine.isCritical(creature)).toBe(true);
    });

    it('should return false when all stats are above 20', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      expect(CreatureEngine.isCritical(creature)).toBe(false);
    });
  });

  describe('isHealthy', () => {
    it('should return true when all stats are above 50', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      expect(CreatureEngine.isHealthy(creature)).toBe(true);
    });

    it('should return false when any stat is at or below 50', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const updated = CreatureEngine.updateStats(creature, {
        'physical.hunger': 50,
      });
      expect(CreatureEngine.isHealthy(updated)).toBe(false);
    });
  });

  describe('updateCareQuality', () => {
    it('should increase care quality when creature is healthy', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Set care quality to less than 100 so we can test the increase
      const creatureWithLowerCare = { ...creature, careQuality: 90 };
      const updated = CreatureEngine.updateCareQuality(creatureWithLowerCare);
      expect(updated.careQuality).toBe(91);  // Was 90, now 91
    });

    it('should decrease care quality when creature is critical', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const criticalCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 10,
      });
      const updated = CreatureEngine.updateCareQuality(criticalCreature);
      expect(updated.careQuality).toBe(95);  // Was 100, now 95
    });

    it('should not change care quality if neither healthy nor critical', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const midCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 40,
      });
      const updated = CreatureEngine.updateCareQuality(midCreature);
      expect(updated.careQuality).toBe(midCreature.careQuality);
    });
  });

  describe('calculateMood', () => {
    it('should prioritize sick mood when health is low', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const updated = CreatureEngine.updateStats(creature, {
        'physical.health': 25,
        'physical.energy': 10,
        'mental.happiness': 10,
      });
      expect(updated.mood).toBe('sick');
    });

    it('should show tired mood when energy is low but health is ok', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const updated = CreatureEngine.updateStats(creature, {
        'physical.energy': 15,
        'physical.health': 80,
      });
      expect(updated.mood).toBe('tired');
    });

    it('should show excited mood when happiness and energy are high', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const updated = CreatureEngine.updateStats(creature, {
        'mental.happiness': 85,
        'physical.energy': 75,
      });
      expect(updated.mood).toBe('excited');
    });
  });
});
