import { EvolutionManager } from '../EvolutionManager';
import { CreatureEngine } from '../CreatureEngine';
import { Creature } from '../types';

describe('EvolutionManager', () => {
  describe('shouldEvolve', () => {
    it('should return false when not enough time has passed', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Just created, no time passed
      expect(EvolutionManager.shouldEvolve(creature, '15+')).toBe(false);
    });

    it('should return true when time threshold met and care quality sufficient', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      // Simulate 5 hours passed (egg stage requires 4 hours for Ages 15+)
      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000);
      creature.stageStartDate = pastDate;
      creature.careQuality = 75; // Above 70 threshold

      expect(EvolutionManager.shouldEvolve(creature, '15+')).toBe(true);
    });

    it('should return false when care quality too low', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const pastDate = new Date(Date.now() - 5 * 60 * 60 * 1000);
      creature.stageStartDate = pastDate;
      creature.careQuality = 50; // Below 70 threshold for 15+

      expect(EvolutionManager.shouldEvolve(creature, '15+')).toBe(false);
    });

    it('should return false when already at final stage', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      creature.evolutionStage = 'adult';
      const pastDate = new Date(Date.now() - 100 * 60 * 60 * 1000);
      creature.stageStartDate = pastDate;

      expect(EvolutionManager.shouldEvolve(creature, '15+')).toBe(false);
    });
  });

  describe('evolve', () => {
    it('should evolve creature to next stage', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      const evolved = EvolutionManager.evolve(creature);

      expect(evolved.evolutionStage).toBe('baby');
      expect(evolved.stageStartDate.getTime()).toBeGreaterThanOrEqual(creature.stageStartDate.getTime());
    });

    it('should not evolve if already at final stage', () => {
      const creature = CreatureEngine.createCreature('TestPet');
      creature.evolutionStage = 'adult';

      const evolved = EvolutionManager.evolve(creature);

      expect(evolved.evolutionStage).toBe('adult');
    });

    it('should follow evolution path: egg -> baby -> child -> teen -> adult', () => {
      let creature = CreatureEngine.createCreature('TestPet');

      expect(creature.evolutionStage).toBe('egg');

      creature = EvolutionManager.evolve(creature);
      expect(creature.evolutionStage).toBe('baby');

      creature = EvolutionManager.evolve(creature);
      expect(creature.evolutionStage).toBe('child');

      creature = EvolutionManager.evolve(creature);
      expect(creature.evolutionStage).toBe('teen');

      creature = EvolutionManager.evolve(creature);
      expect(creature.evolutionStage).toBe('adult');

      creature = EvolutionManager.evolve(creature);
      expect(creature.evolutionStage).toBe('adult'); // Stays at adult
    });
  });

  describe('getStageConfig', () => {
    it('should return correct duration for Ages 15+ egg stage', () => {
      const config = EvolutionManager.getStageConfig('egg', '15+');
      expect(config.durationHours).toBe(4);
      expect(config.minCareQuality).toBe(70);
      expect(config.nextStage).toBe('baby');
    });

    it('should return correct durations for all Ages 15+ stages', () => {
      expect(EvolutionManager.getStageConfig('egg', '15+').durationHours).toBe(4);
      expect(EvolutionManager.getStageConfig('baby', '15+').durationHours).toBe(24);
      expect(EvolutionManager.getStageConfig('child', '15+').durationHours).toBe(48);
      expect(EvolutionManager.getStageConfig('teen', '15+').durationHours).toBe(72);
    });

    it('should return no next stage for adult', () => {
      const config = EvolutionManager.getStageConfig('adult', '15+');
      expect(config.nextStage).toBeUndefined();
    });
  });
});
