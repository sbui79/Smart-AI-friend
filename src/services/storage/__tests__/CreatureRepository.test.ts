import { CreatureRepository } from '../CreatureRepository';
import { Database } from '../Database';
import { CreatureEngine } from '../../../core/engine/CreatureEngine';

describe('CreatureRepository', () => {
  beforeEach(async () => {
    await Database.init(':memory:');
  });

  afterEach(async () => {
    await Database.close();
  });

  describe('save', () => {
    it('should save a creature', async () => {
      const creature = CreatureEngine.createCreature('TestPet');

      await CreatureRepository.save(creature);

      const loaded = await CreatureRepository.findById(creature.id);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('TestPet');
    });

    it('should update existing creature', async () => {
      const creature = CreatureEngine.createCreature('TestPet');
      await CreatureRepository.save(creature);

      const updated = CreatureEngine.updateStats(creature, {
        'physical.hunger': 50,
      });
      await CreatureRepository.save(updated);

      const loaded = await CreatureRepository.findById(creature.id);
      expect(loaded?.physical.hunger).toBe(50);
    });
  });

  describe('findById', () => {
    it('should return null for non-existent creature', async () => {
      const result = await CreatureRepository.findById('non-existent');
      expect(result).toBeNull();
    });

    it('should deserialize dates correctly', async () => {
      const creature = CreatureEngine.createCreature('TestPet');
      await CreatureRepository.save(creature);

      const loaded = await CreatureRepository.findById(creature.id);
      expect(loaded?.lastInteractionDate).toBeInstanceOf(Date);
      expect(loaded?.stageStartDate).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    it('should delete a creature', async () => {
      const creature = CreatureEngine.createCreature('TestPet');
      await CreatureRepository.save(creature);

      await CreatureRepository.delete(creature.id);

      const result = await CreatureRepository.findById(creature.id);
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all creatures', async () => {
      const creature1 = CreatureEngine.createCreature('Pet1');
      const creature2 = CreatureEngine.createCreature('Pet2');

      await CreatureRepository.save(creature1);
      await CreatureRepository.save(creature2);

      const all = await CreatureRepository.getAll();
      expect(all).toHaveLength(2);
    });

    it('should return empty array when no creatures', async () => {
      const all = await CreatureRepository.getAll();
      expect(all).toHaveLength(0);
    });
  });
});
