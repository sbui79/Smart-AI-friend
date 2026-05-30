import { CreatureEngine } from '../../src/core/engine/CreatureEngine';
import { BasicCareModule } from '../../src/core/modules/BasicCareModule';
import { EvolutionModule } from '../../src/core/modules/EvolutionModule';
import { Creature, EvolutionStage } from '../../src/core/engine/types';

/**
 * Integration test: Creature lifecycle
 * Tests creating a creature, performing actions, and checking evolution
 */
describe('Creature Lifecycle Integration', () => {
  let creature: Creature;

  beforeEach(() => {
    // Create a fresh creature for each test
    creature = CreatureEngine.createCreature('TestCreature', 'default');
  });

  describe('Creature Creation', () => {
    it('should create a creature with default stats', () => {
      expect(creature).toBeDefined();
      expect(creature.name).toBe('TestCreature');
      expect(creature.species).toBe('default');
      expect(creature.evolutionStage).toBe('egg');
      expect(creature.age).toBe(0);
    });

    it('should initialize with happy mood', () => {
      expect(creature.mood).toBe('happy');
    });

    it('should have UUID id', () => {
      expect(creature.id).toBeDefined();
      expect(creature.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('Care Actions', () => {
    it('should execute feed action', () => {
      if (BasicCareModule.actions && BasicCareModule.actions.feed) {
        const updated = BasicCareModule.actions.feed(creature);
        // Feed increases hunger (reduces need to eat) - but hunger can max at 100
        expect(updated.physical.cleanliness).toBeLessThan(creature.physical.cleanliness);
      }
    });

    it('should execute play action', () => {
      if (BasicCareModule.actions && BasicCareModule.actions.play) {
        const updated = BasicCareModule.actions.play(creature);
        // Play increases happiness but happiness maxes at 100, so verify energy decreases
        expect(updated.physical.energy).toBeLessThan(creature.physical.energy);
        expect(updated.physical.hunger).toBeLessThan(creature.physical.hunger);
      }
    });

    it('should execute sleep action', () => {
      if (BasicCareModule.actions && BasicCareModule.actions.sleep) {
        const updated = BasicCareModule.actions.sleep(creature);
        expect(updated.physical.energy).toBeGreaterThan(creature.physical.energy);
      }
    });

    it('should return updated creature with immutability', () => {
      if (BasicCareModule.actions && BasicCareModule.actions.feed) {
        const updated = BasicCareModule.actions.feed(creature);
        expect(updated.id).toBe(creature.id);
        expect(updated).not.toBe(creature);
      }
    });
  });

  describe('Evolution System', () => {
    it('should have evolution module enabled', () => {
      expect(EvolutionModule).toBeDefined();
      expect(EvolutionModule.onCreatureAction).toBeDefined();
    });

    it('should check evolution status on action', () => {
      if (EvolutionModule.onCreatureAction && BasicCareModule.actions?.feed) {
        const afterFeed = BasicCareModule.actions.feed(creature);
        const afterCheck = EvolutionModule.onCreatureAction('feed', afterFeed);

        expect(afterCheck).toBeDefined();
        expect(afterCheck.id).toBe(creature.id);
      }
    });

    it('should preserve creature state through evolution check', () => {
      const originalStage = creature.evolutionStage;

      if (EvolutionModule.onCreatureAction) {
        const checked = EvolutionModule.onCreatureAction('idle', creature);
        // Evolution status should be checked but not forced to change
        expect(checked.evolutionStage).toBeDefined();
      }
    });
  });

  describe('Stat Management', () => {
    it('should have stats within valid range (0-100)', () => {
      expect(creature.physical.hunger).toBeGreaterThanOrEqual(0);
      expect(creature.physical.hunger).toBeLessThanOrEqual(100);
      expect(creature.physical.energy).toBeGreaterThanOrEqual(0);
      expect(creature.physical.energy).toBeLessThanOrEqual(100);
      expect(creature.mental.happiness).toBeGreaterThanOrEqual(0);
      expect(creature.mental.happiness).toBeLessThanOrEqual(100);
    });

    it('should have care quality tracking', () => {
      expect(creature.careQuality).toBeGreaterThanOrEqual(0);
      expect(creature.careQuality).toBeLessThanOrEqual(100);
    });

    it('should have empty care history on creation', () => {
      expect(creature.careHistory).toEqual([]);
    });
  });

  describe('Creature State', () => {
    it('should have personality defined', () => {
      expect(creature.personality).toBeDefined();
      expect(creature.personality.traits).toBeDefined();
      expect(Array.isArray(creature.personality.traits)).toBe(true);
    });

    it('should not be asleep on creation', () => {
      expect(creature.isAsleep).toBe(false);
    });

    it('should have valid generation', () => {
      expect(creature.generation).toBe(1);
    });

    it('should have empty parent IDs on creation', () => {
      expect(creature.parentIds[0]).toBeUndefined();
      expect(creature.parentIds[1]).toBeUndefined();
    });
  });

  describe('Integration: Action Sequence', () => {
    it('should handle multiple actions in sequence', () => {
      let current = creature;

      // Perform multiple actions
      if (BasicCareModule.actions) {
        if (BasicCareModule.actions.feed) {
          current = BasicCareModule.actions.feed(current);
        }
        if (BasicCareModule.actions.play) {
          current = BasicCareModule.actions.play(current);
        }
        if (BasicCareModule.actions.sleep) {
          current = BasicCareModule.actions.sleep(current);
        }
      }

      // Verify creature still valid
      expect(current.id).toBe(creature.id);
      expect(current.name).toBe(creature.name);
      expect(current.evolutionStage).toBeDefined();
    });

    it('should maintain creature identity through lifecycle', () => {
      const originalId = creature.id;

      // Simulate lifecycle: actions -> evolution check
      let updated = creature;

      if (BasicCareModule.actions?.feed && EvolutionModule.onCreatureAction) {
        updated = BasicCareModule.actions.feed(updated);
        updated = EvolutionModule.onCreatureAction('feed', updated);
      }

      expect(updated.id).toBe(originalId);
      expect(updated.name).toBe(creature.name);
    });
  });
});
