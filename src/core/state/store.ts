import { create } from 'zustand';
import { Creature } from '../engine/types';
import { CreatureEngine } from '../engine/CreatureEngine';
import { CreatureRepository } from '../../services/storage/CreatureRepository';
import { BasicCareModule } from '../modules/BasicCareModule';
import { EvolutionModule } from '../modules/EvolutionModule';

/**
 * Creature store state
 */
interface CreatureState {
  creature: Creature | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createCreature: (name: string, species?: string) => Promise<void>;
  loadCreature: (id: string) => Promise<void>;
  updateCreature: (creature: Creature) => Promise<void>;
  performAction: (action: string) => Promise<void>;
  deleteCreature: () => Promise<void>;
}

/**
 * Creature store - manages creature state with persistence
 */
export const useCreatureStore = create<CreatureState>((set, get) => ({
  creature: null,
  isLoading: false,
  error: null,

  /**
   * Create a new creature
   */
  createCreature: async (name: string, species: string = 'default') => {
    set({ isLoading: true, error: null });

    try {
      const creature = CreatureEngine.createCreature(name, species);
      await CreatureRepository.save(creature);

      set({ creature, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to create creature: ${error}`,
        isLoading: false,
      });
    }
  },

  /**
   * Load creature from database
   */
  loadCreature: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const creature = await CreatureRepository.findById(id);

      if (!creature) {
        set({
          creature: null,
          error: 'Creature not found',
          isLoading: false,
        });
        return;
      }

      set({ creature, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to load creature: ${error}`,
        isLoading: false,
      });
    }
  },

  /**
   * Update creature and save to database
   */
  updateCreature: async (creature: Creature) => {
    set({ isLoading: true, error: null });

    try {
      await CreatureRepository.save(creature);
      set({ creature, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to update creature: ${error}`,
        isLoading: false,
      });
    }
  },

  /**
   * Perform a care action on the creature
   */
  performAction: async (action: string) => {
    const { creature } = get();
    if (!creature) {
      set({ error: 'No creature to perform action on' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      let updated = creature;

      // Execute action from BasicCareModule
      if (BasicCareModule.actions && BasicCareModule.actions[action]) {
        updated = BasicCareModule.actions[action](updated);
      }

      // Check for evolution
      if (EvolutionModule.onCreatureAction) {
        updated = EvolutionModule.onCreatureAction(action, updated);
      }

      // Save and update state
      await CreatureRepository.save(updated);
      set({ creature: updated, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to perform action: ${error}`,
        isLoading: false,
      });
    }
  },

  /**
   * Delete the current creature
   */
  deleteCreature: async () => {
    const { creature } = get();
    if (!creature) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await CreatureRepository.delete(creature.id);
      set({ creature: null, isLoading: false });
    } catch (error) {
      set({
        error: `Failed to delete creature: ${error}`,
        isLoading: false,
      });
    }
  },
}));
