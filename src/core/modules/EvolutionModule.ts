import { ModuleDefinition } from './types';
import { Creature } from '../engine/types';
import { EvolutionManager } from '../engine/EvolutionManager';

/**
 * Evolution Module - Handles creature evolution
 * Automatically checks for evolution after creature actions
 */
export const EvolutionModule: ModuleDefinition = {
  id: 'evolution',
  version: '1.0.0',
  requiredTier: 'free',
  requiredAgeGroup: ['5-10', '10-15', '15+'],
  parentalControl: false, // Core gameplay mechanic
  requires: [],
  enhances: [],

  onLoad: () => {
    // Module loaded
  },

  onUnload: () => {
    // Module unloaded
  },

  /**
   * Check for evolution after any creature action
   */
  onCreatureAction: (actionType: string, creature: Creature): Creature => {
    // Check if creature should evolve
    if (EvolutionManager.shouldEvolve(creature, '15+')) {
      // Add "evolving" state temporarily
      let evolving = {
        ...creature,
        specialStates: [...creature.specialStates, 'evolving' as const],
      };

      // Evolve the creature
      let evolved = EvolutionManager.evolve(evolving, '15+');

      // Remove "evolving" state after evolution
      evolved = {
        ...evolved,
        specialStates: evolved.specialStates.filter(s => s !== 'evolving'),
      };

      return evolved;
    }

    return creature;
  },
};
