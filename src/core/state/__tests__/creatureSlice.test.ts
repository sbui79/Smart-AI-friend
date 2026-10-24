import { useCreatureStore } from '../store';
import { CreatureEngine } from '../../engine/CreatureEngine';
import { Database } from '../../../services/storage/Database';
import { act } from '@testing-library/react-native';

describe('creatureSlice', () => {
  beforeEach(async () => {
    // Pin the clock to midday so the creature is awake
    jest.useFakeTimers({ now: new Date('2026-05-28T12:00:00'), advanceTimers: true });
    await Database.init(':memory:');
    // Reset store
    useCreatureStore.setState({
      creature: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(async () => {
    await Database.close();
    jest.useRealTimers();
  });

  describe('createCreature', () => {
    it('should create a new creature', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      const state = useCreatureStore.getState();
      expect(state.creature).toBeDefined();
      expect(state.creature?.name).toBe('TestPet');
      expect(state.isLoading).toBe(false);
    });

    it('should save creature to database', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      const creature = useCreatureStore.getState().creature;
      expect(creature).toBeDefined();

      // Verify saved to DB by loading in new session
      const { CreatureRepository } = require('../../../services/storage/CreatureRepository');
      const loaded = await CreatureRepository.findById(creature!.id);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('TestPet');
    });
  });

  describe('loadCreature', () => {
    it('should load creature from database', async () => {
      // Create and save creature
      const creature = CreatureEngine.createCreature('TestPet');
      const { CreatureRepository } = require('../../../services/storage/CreatureRepository');
      await CreatureRepository.save(creature);

      // Load into store
      await act(async () => {
        await useCreatureStore.getState().loadCreature(creature.id);
      });

      const state = useCreatureStore.getState();
      expect(state.creature).toBeDefined();
      expect(state.creature?.id).toBe(creature.id);
    });

    it('should set error if creature not found', async () => {
      await act(async () => {
        await useCreatureStore.getState().loadCreature('non-existent');
      });

      const state = useCreatureStore.getState();
      expect(state.creature).toBeNull();
      expect(state.error).toBeTruthy();
    });
  });

  describe('updateCreature', () => {
    it('should update creature and save to database', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      const creature = useCreatureStore.getState().creature!;
      const updated = CreatureEngine.updateStats(creature, {
        'physical.hunger': 50,
      });

      await act(async () => {
        await useCreatureStore.getState().updateCreature(updated);
      });

      const state = useCreatureStore.getState();
      expect(state.creature?.physical.hunger).toBe(50);

      // Verify persisted
      const { CreatureRepository } = require('../../../services/storage/CreatureRepository');
      const loaded = await CreatureRepository.findById(creature.id);
      expect(loaded?.physical.hunger).toBe(50);
    });
  });

  describe('performAction', () => {
    it('should execute action and update creature', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      // Lower hunger first so we can test feeding
      const creature = useCreatureStore.getState().creature!;
      const loweredHunger = CreatureEngine.updateStats(creature, {
        'physical.hunger': 50,
      });

      await act(async () => {
        await useCreatureStore.getState().updateCreature(loweredHunger);
      });

      const initialHunger = useCreatureStore.getState().creature!.physical.hunger;

      await act(async () => {
        await useCreatureStore.getState().performAction('feed');
      });

      const finalHunger = useCreatureStore.getState().creature!.physical.hunger;
      expect(finalHunger).toBeGreaterThan(initialHunger);
    });

    it('should apply elapsed decay before the action', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      // Two waking hours pass without the app ticking
      jest.setSystemTime(new Date('2026-05-28T14:00:00'));

      await act(async () => {
        await useCreatureStore.getState().performAction('pet');
      });

      // Hunger decays 15/hr and petting doesn't feed
      expect(useCreatureStore.getState().creature!.physical.hunger).toBeCloseTo(70);
    });

    it('should only allow petting while asleep', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      jest.setSystemTime(new Date('2026-05-28T23:00:00'));

      await act(async () => {
        await useCreatureStore.getState().performAction('play');
      });

      const state = useCreatureStore.getState();
      expect(state.creature!.isAsleep).toBe(true);
      expect(state.creature!.careHistory).toHaveLength(0);
    });
  });

  describe('tick', () => {
    it('should decay stats and persist them', async () => {
      await act(async () => {
        await useCreatureStore.getState().createCreature('TestPet');
      });

      jest.setSystemTime(new Date('2026-05-28T13:00:00'));

      await act(async () => {
        await useCreatureStore.getState().tick();
      });

      const creature = useCreatureStore.getState().creature!;
      expect(creature.physical.hunger).toBeCloseTo(85);

      const { CreatureRepository } = require('../../../services/storage/CreatureRepository');
      const loaded = await CreatureRepository.findById(creature.id);
      expect(loaded?.physical.hunger).toBeCloseTo(85);
    });
  });
});
