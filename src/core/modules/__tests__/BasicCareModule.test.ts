import { BasicCareModule } from '../BasicCareModule';
import { CreatureEngine } from '../../engine/CreatureEngine';
import { Creature } from '../../engine/types';

describe('BasicCareModule', () => {
  let creature: Creature;

  beforeEach(() => {
    creature = CreatureEngine.createCreature('TestPet');
  });

  describe('module registration', () => {
    it('should have correct module metadata', () => {
      expect(BasicCareModule.id).toBe('basic-care');
      expect(BasicCareModule.requiredTier).toBe('free');
      expect(BasicCareModule.parentalControl).toBe(false);
    });
  });

  describe('feed action', () => {
    it('should increase hunger and decrease other stats', () => {
      const lowHungerCreature = CreatureEngine.updateStats(creature, {
        'physical.hunger': 50,
      });

      const fed = BasicCareModule.actions.feed(lowHungerCreature);

      expect(fed.physical.hunger).toBeGreaterThan(lowHungerCreature.physical.hunger);
      expect(fed.mental.happiness).toBeLessThan(lowHungerCreature.mental.happiness);
      expect(fed.physical.cleanliness).toBeLessThan(lowHungerCreature.physical.cleanliness);
    });

    it('should record care event', () => {
      const fed = BasicCareModule.actions.feed(creature);
      const lastEvent = fed.careHistory[fed.careHistory.length - 1];

      expect(lastEvent.type).toBe('feed');
      expect(lastEvent.statChanges).toBeDefined();
    });
  });

  describe('play action', () => {
    it('should increase happiness and decrease energy/hunger/cleanliness', () => {
      const lowHappinessCreature = CreatureEngine.updateStats(creature, {
        'mental.happiness': 50,
      });

      const played = BasicCareModule.actions.play(lowHappinessCreature);

      expect(played.mental.happiness).toBeGreaterThan(lowHappinessCreature.mental.happiness);
      expect(played.physical.hunger).toBeLessThan(lowHappinessCreature.physical.hunger);
      expect(played.physical.energy).toBeLessThan(lowHappinessCreature.physical.energy);
      expect(played.physical.cleanliness).toBeLessThan(lowHappinessCreature.physical.cleanliness);
    });
  });

  describe('clean action', () => {
    it('should increase cleanliness and health', () => {
      const dirtyCreature = CreatureEngine.updateStats(creature, {
        'physical.cleanliness': 40,
        'physical.health': 80,
      });

      const cleaned = BasicCareModule.actions.clean(dirtyCreature);

      expect(cleaned.physical.cleanliness).toBeGreaterThan(dirtyCreature.physical.cleanliness);
      expect(cleaned.physical.health).toBeGreaterThan(dirtyCreature.physical.health);
    });
  });

  describe('pet action', () => {
    it('should increase happiness and affection', () => {
      const lowStatsCreature = CreatureEngine.updateStats(creature, {
        'mental.happiness': 70,
        'social.affection': 40,
      });

      const petted = BasicCareModule.actions.pet(lowStatsCreature);

      expect(petted.mental.happiness).toBeGreaterThan(lowStatsCreature.mental.happiness);
      expect(petted.social.affection).toBeGreaterThan(lowStatsCreature.social.affection);
    });
  });

  describe('train action', () => {
    it('should increase discipline and decrease energy', () => {
      const trained = BasicCareModule.actions.train(creature);

      expect(trained.mental.discipline).toBeGreaterThan(creature.mental.discipline);
      expect(trained.physical.energy).toBeLessThan(creature.physical.energy);
    });
  });

  describe('gift action', () => {
    it('should increase happiness and care quality', () => {
      const lowHappinessCreature = CreatureEngine.updateStats(creature, {
        'mental.happiness': 60,
      });
      const initialCareQuality = lowHappinessCreature.careQuality;
      const gifted = BasicCareModule.actions.gift(lowHappinessCreature);

      expect(gifted.mental.happiness).toBeGreaterThan(lowHappinessCreature.mental.happiness);
      expect(gifted.careQuality).toBeGreaterThanOrEqual(initialCareQuality);
    });
  });

  describe('lifecycle hooks', () => {
    it('should have onLoad and onUnload hooks', () => {
      expect(typeof BasicCareModule.onLoad).toBe('function');
      expect(typeof BasicCareModule.onUnload).toBe('function');
    });

    it('should not throw when calling lifecycle hooks', () => {
      expect(() => BasicCareModule.onLoad()).not.toThrow();
      expect(() => BasicCareModule.onUnload()).not.toThrow();
    });
  });
});
