import {
  Module,
  ModuleDefinition,
  ModuleConfig,
  PaymentTier,
  AgeGroup,
} from '../types';
import { Creature } from '../../engine/types';

describe('Module Types', () => {
  describe('Module', () => {
    it('should create a valid module', () => {
      const module: Module = {
        id: 'test-module',
        version: '1.0.0',
        requiredTier: 'free',
        requiredAgeGroup: ['5-10', '10-15'],
        parentalControl: true,
        requires: [],
        enhances: ['other-module'],
        onLoad: () => {},
        onUnload: () => {},
      };

      expect(module.id).toBe('test-module');
      expect(module.version).toBe('1.0.0');
      expect(module.requiredTier).toBe('free');
      expect(module.requiredAgeGroup).toContain('5-10');
    });

    it('should support onCreatureAction hook', () => {
      const mockCreature: Creature = {
        id: 'test-creature',
        name: 'Test',
        species: 'default',
        generation: 1,
        parentIds: [undefined, undefined],
        evolutionStage: 'baby',
        age: 0,
        stageStartDate: new Date(),
        physical: { hunger: 100, energy: 100, health: 100, cleanliness: 100 },
        mental: { happiness: 100, intelligence: 50, creativity: 50, discipline: 5 },
        social: { affection: 50, trust: 50, playfulness: 50 },
        personality: { traits: [], preferences: {}, memory: [] },
        isAsleep: false,
        mood: 'happy',
        specialStates: [],
        careQuality: 100,
        careHistory: [],
        lastInteractionDate: new Date(),
      };

      let actionCalled = false;
      const module: Module = {
        id: 'test-module',
        version: '1.0.0',
        requiredTier: 'free',
        requiredAgeGroup: ['5-10'],
        parentalControl: false,
        requires: [],
        enhances: [],
        onLoad: () => {},
        onUnload: () => {},
        onCreatureAction: (actionType, creature) => {
          actionCalled = true;
          expect(actionType).toBe('feed');
          expect(creature.id).toBe('test-creature');
        },
      };

      module.onCreatureAction?.('feed', mockCreature);
      expect(actionCalled).toBe(true);
    });
  });

  describe('PaymentTier', () => {
    it('should validate payment tiers', () => {
      const tiers: PaymentTier[] = ['free', 'full', 'premium'];
      tiers.forEach(tier => {
        expect(['free', 'full', 'premium']).toContain(tier);
      });
    });
  });

  describe('AgeGroup', () => {
    it('should validate age groups', () => {
      const groups: AgeGroup[] = ['5-10', '10-15', '15+'];
      groups.forEach(group => {
        expect(['5-10', '10-15', '15+']).toContain(group);
      });
    });
  });

  describe('ModuleDefinition', () => {
    it('should create a valid module definition', () => {
      const definition: ModuleDefinition = {
        id: 'advanced-module',
        version: '2.0.0',
        requiredTier: 'premium',
        requiredAgeGroup: ['15+'],
        parentalControl: true,
        requires: ['base-module'],
        enhances: [],
        onLoad: () => {},
        onUnload: () => {},
        actions: {
          customAction: () => 'executed',
        },
        services: [],
      };

      expect(definition.id).toBe('advanced-module');
      expect(definition.requiredTier).toBe('premium');
      expect(definition.actions?.customAction()).toBe('executed');
    });
  });

  describe('ModuleConfig', () => {
    it('should create a valid module config', () => {
      const config: ModuleConfig = {
        ageGroup: '10-15',
        tier: 'full',
        parentalOverrides: {
          'module-1': true,
          'module-2': false,
        },
      };

      expect(config.ageGroup).toBe('10-15');
      expect(config.tier).toBe('full');
      expect(config.parentalOverrides['module-1']).toBe(true);
      expect(config.parentalOverrides['module-2']).toBe(false);
    });
  });
});
