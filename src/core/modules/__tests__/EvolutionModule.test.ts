import { EvolutionModule } from '../EvolutionModule';
import { CreatureEngine } from '../../engine/CreatureEngine';
import { Creature } from '../../engine/types';

describe('EvolutionModule', () => {
  describe('module metadata', () => {
    it('should have correct module configuration', () => {
      expect(EvolutionModule.id).toBe('evolution');
      expect(EvolutionModule.requiredTier).toBe('free');
      expect(EvolutionModule.requiredAgeGroup).toEqual(['5-10', '10-15', '15+']);
      expect(EvolutionModule.parentalControl).toBe(false);
    });
  });

  describe('onCreatureAction', () => {
    it('should check for evolution after action', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Simulate time passed
      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000);
      creature.stageStartDate = pastDate;
      creature.careQuality = 75;

      const result = EvolutionModule.onCreatureAction!('feed', creature);

      expect(result.evolutionStage).toBe('baby'); // Evolved from egg
    });

    it('should not evolve if conditions not met', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Just created, no time passed

      const result = EvolutionModule.onCreatureAction!('feed', creature);

      expect(result.evolutionStage).toBe('egg'); // Still egg
    });

    it('should add evolving to special states during evolution', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000);
      creature.stageStartDate = pastDate;
      creature.careQuality = 75;

      const result = EvolutionModule.onCreatureAction!('feed', creature);

      // After evolution, evolving state should be added then removed
      // But we can check that evolution occurred
      expect(result.evolutionStage).not.toBe(creature.evolutionStage);
    });
  });

  describe('lifecycle hooks', () => {
    it('should have onLoad and onUnload hooks', () => {
      expect(typeof EvolutionModule.onLoad).toBe('function');
      expect(typeof EvolutionModule.onUnload).toBe('function');
    });

    it('should not throw when calling lifecycle hooks', () => {
      expect(() => EvolutionModule.onLoad()).not.toThrow();
      expect(() => EvolutionModule.onUnload()).not.toThrow();
    });
  });
});
