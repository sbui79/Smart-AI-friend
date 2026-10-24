import { create } from 'zustand';
import { Creature } from '../engine/types';
import { CreatureEngine } from '../engine/CreatureEngine';
import { CreatureRepository } from '../../services/storage/CreatureRepository';
import { TimeManager } from '../engine/TimeManager';
import { BasicCareModule } from '../modules/BasicCareModule';
import { EvolutionModule } from '../modules/EvolutionModule';
import { LocalAIModule, AIResponse } from '../modules/LocalAIModule';
import { useModuleStore } from './moduleSlice';

// Actions still allowed while the creature is asleep
const SLEEP_SAFE_ACTIONS = ['pet'];

/**
 * Catch the creature up on elapsed time and check whether it has evolved
 */
function advanceTime(creature: Creature): Creature {
  const updated = TimeManager.updateAfterTimeElapsed(creature, '15+');
  return EvolutionModule.onCreatureAction?.('tick', updated) || updated;
}

/**
 * Generate what the creature says, if the AI module is enabled
 */
function respond(creature: Creature, context: string): AIResponse | null {
  const aiEnabled = useModuleStore
    .getState()
    .loadedModules.some(module => module.id === LocalAIModule.id);
  if (!aiEnabled) {
    return null;
  }
  return LocalAIModule.actions!.generateResponse(creature, context);
}

/**
 * Creature store state
 */
interface CreatureState {
  creature: Creature | null;
  isLoading: boolean;
  error: string | null;
  lastResponse: AIResponse | null;

  // Actions
  createCreature: (name: string, species?: string) => Promise<void>;
  loadCreature: (id: string) => Promise<void>;
  updateCreature: (creature: Creature) => Promise<void>;
  performAction: (action: string) => Promise<void>;
  tick: () => Promise<void>;
  greet: () => void;
  deleteCreature: () => Promise<void>;
}

/**
 * Creature store - manages creature state with persistence
 */
export const useCreatureStore = create<CreatureState>((set, get) => ({
  creature: null,
  isLoading: false,
  error: null,
  lastResponse: null,

  /**
   * Create a new creature
   */
  createCreature: async (name: string, species: string = 'default') => {
    set({ isLoading: true, error: null });

    try {
      const creature = CreatureEngine.createCreature(name, species);
      await CreatureRepository.save(creature);

      set({ creature, isLoading: false, lastResponse: null });
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

      // Apply whatever happened while the app was closed
      const caughtUp = advanceTime(creature);
      await CreatureRepository.save(caughtUp);

      set({ creature: caughtUp, isLoading: false, lastResponse: null });
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
    set({ error: null });

    try {
      await CreatureRepository.save(creature);
      set({ creature });
    } catch (error) {
      set({ error: `Failed to update creature: ${error}` });
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

    set({ error: null });

    try {
      // Apply decay up to now first so it isn't lost when the action resets the clock
      let updated = advanceTime(creature);

      if (CreatureEngine.isDead(updated)) {
        await CreatureRepository.save(updated);
        set({ creature: updated });
        return;
      }

      if (updated.isAsleep && !SLEEP_SAFE_ACTIONS.includes(action)) {
        set({
          creature: updated,
          lastResponse: { text: 'Zzz... *snore*', quickReplies: [] },
        });
        return;
      }

      // Execute action from BasicCareModule
      if (BasicCareModule.actions && BasicCareModule.actions[action]) {
        updated = BasicCareModule.actions[action](updated);
      }

      // Check for evolution
      const stageBefore = updated.evolutionStage;
      updated = EvolutionModule.onCreatureAction?.(action, updated) || updated;

      // Save and update state
      await CreatureRepository.save(updated);

      const response = respond(updated, 'afterAction');
      set({
        creature: updated,
        lastResponse:
          response && updated.evolutionStage !== stageBefore
            ? { ...response, text: `Whoa... I evolved into a ${updated.evolutionStage}!` }
            : response,
      });
    } catch (error) {
      set({ error: `Failed to perform action: ${error}` });
    }
  },

  /**
   * Advance the simulation to the current time (called periodically and on app resume)
   */
  tick: async () => {
    const { creature } = get();
    if (!creature) {
      return;
    }

    try {
      const updated = advanceTime(creature);
      await CreatureRepository.save(updated);
      set({ creature: updated });
    } catch (error) {
      set({ error: `Failed to update creature: ${error}` });
    }
  },

  /**
   * Have the creature greet the player
   */
  greet: () => {
    const { creature } = get();
    if (!creature || CreatureEngine.isDead(creature)) {
      return;
    }
    set({ lastResponse: respond(creature, creature.isAsleep ? 'asleep' : 'greeting') });
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
      set({ creature: null, isLoading: false, lastResponse: null });
    } catch (error) {
      set({
        error: `Failed to delete creature: ${error}`,
        isLoading: false,
      });
    }
  },
}));
