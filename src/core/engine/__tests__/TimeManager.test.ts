import { TimeManager } from '../TimeManager';
import { CreatureEngine } from '../CreatureEngine';
import { Creature } from '../types';

describe('TimeManager', () => {
  describe('applyStatDecay', () => {
    it('should decay stats based on hours elapsed (Ages 15+)', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const hoursElapsed = 2;

      const updated = TimeManager.applyStatDecay(creature, hoursElapsed, '15+');

      // Ages 15+ decay rates: hunger -15/hr, happiness -12/hr, energy -10/hr, cleanliness -8/hr
      expect(updated.physical.hunger).toBe(100 - (15 * 2)); // 70
      expect(updated.mental.happiness).toBe(100 - (12 * 2)); // 76
      expect(updated.physical.energy).toBe(100 - (10 * 2)); // 80
      expect(updated.physical.cleanliness).toBe(100 - (8 * 2)); // 84
    });

    it('should not decay stats below 0', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const lowHungerCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 10,
      });

      const updated = TimeManager.applyStatDecay(lowHungerCreature, 5, '15+');

      expect(updated.physical.hunger).toBe(0);
      expect(updated.physical.hunger).not.toBeLessThan(0);
    });

    it('should update creature age', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const hoursElapsed = 3;

      const updated = TimeManager.applyStatDecay(creature, hoursElapsed, '15+');

      expect(updated.age).toBe(hoursElapsed * 3600); // 3 hours in seconds
    });
  });

  describe('isDayTime', () => {
    it('should return true during day hours (6am-10pm)', () => {
      const morning = new Date('2026-05-28T08:00:00');
      const afternoon = new Date('2026-05-28T15:00:00');
      const evening = new Date('2026-05-28T21:00:00');

      expect(TimeManager.isDayTime(morning)).toBe(true);
      expect(TimeManager.isDayTime(afternoon)).toBe(true);
      expect(TimeManager.isDayTime(evening)).toBe(true);
    });

    it('should return false during night hours', () => {
      const lateNight = new Date('2026-05-28T02:00:00');
      const earlyMorning = new Date('2026-05-28T05:00:00');
      const afterBedtime = new Date('2026-05-28T23:00:00');

      expect(TimeManager.isDayTime(lateNight)).toBe(false);
      expect(TimeManager.isDayTime(earlyMorning)).toBe(false);
      expect(TimeManager.isDayTime(afterBedtime)).toBe(false);
    });
  });

  describe('updateAfterTimeElapsed', () => {
    it('should calculate hours elapsed and apply decay', () => {
      const creature = CreatureEngine.createCreature('TestPet');

      // Set last interaction to 2pm (12 noon)
      const twoHoursAgo = new Date('2026-05-28T12:00:00');
      const updatedCreature = CreatureEngine.updateStats(creature, {});
      updatedCreature.lastInteractionDate = twoHoursAgo;

      // Mock current time to be during the day (2pm)
      const dayTime = new Date('2026-05-28T14:00:00');

      const updated = TimeManager.updateAfterTimeElapsed(updatedCreature, '15+', dayTime);

      // Stats should have decayed (2 hours elapsed)
      expect(updated.physical.hunger).toBeLessThan(100);
      expect(updated.age).toBeGreaterThan(0);
    });

    it('should set creature to asleep during night time', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const updatedCreature = CreatureEngine.updateStats(creature, {});
      updatedCreature.lastInteractionDate = oneHourAgo;

      // Mock current time to be night (2am)
      const nightTime = new Date('2026-05-28T02:00:00');

      const updated = TimeManager.updateAfterTimeElapsed(updatedCreature, '15+', nightTime);

      expect(updated.isAsleep).toBe(true);
      expect(updated.physical.energy).toBe(100); // Energy restored during sleep
    });
  });

  describe('checkForDeath', () => {
    it('should mark creature as dead if critical for 96+ hours (Ages 15+)', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const criticalCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 15,
        'physical.energy': 10,
        'physical.health': 5,
      });

      const criticalHours = 100;

      const result = TimeManager.checkForDeath(criticalCreature, criticalHours, '15+');

      expect(result.isDead).toBe(true);
    });

    it('should not kill creature if critical hours below threshold', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const criticalCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 15,
      });

      const criticalHours = 50; // Below 96 hour threshold

      const result = TimeManager.checkForDeath(criticalCreature, criticalHours, '15+');

      expect(result.isDead).toBe(false);
    });
  });
});
