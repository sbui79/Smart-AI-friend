import { ModuleDefinition } from './types';
import { Creature, CareEvent } from '../engine/types';
import { CreatureEngine } from '../engine/CreatureEngine';

/**
 * Basic Care Module - Provides core care actions for creatures
 * Available in all tiers (free, full, premium)
 */
export const BasicCareModule: ModuleDefinition = {
  id: 'basic-care',
  version: '1.0.0',
  requiredTier: 'free',
  requiredAgeGroup: ['5-10', '10-15', '15+'],
  parentalControl: false, // Core gameplay, can't be disabled
  requires: [],
  enhances: [],

  onLoad: () => {
    // Module loaded
  },

  onUnload: () => {
    // Module unloaded
  },

  actions: {
    /**
     * Feed the creature - increases hunger, decreases happiness and cleanliness slightly
     */
    feed: (creature: Creature): Creature => {
      const changes = {
        'physical.hunger': creature.physical.hunger + 30,
        'mental.happiness': creature.mental.happiness - 5,
        'physical.cleanliness': creature.physical.cleanliness - 10,
      };

      let updated = CreatureEngine.updateStats(creature, changes);

      // Record care event
      updated = recordCareEvent(updated, 'feed', changes);

      return updated;
    },

    /**
     * Play with creature - increases happiness, decreases hunger, energy, cleanliness
     */
    play: (creature: Creature): Creature => {
      const changes = {
        'mental.happiness': creature.mental.happiness + 25,
        'physical.hunger': creature.physical.hunger - 20,
        'physical.energy': creature.physical.energy - 15,
        'physical.cleanliness': creature.physical.cleanliness - 10,
      };

      let updated = CreatureEngine.updateStats(creature, changes);
      updated = recordCareEvent(updated, 'play', changes);

      return updated;
    },

    /**
     * Clean the creature - increases cleanliness and health
     */
    clean: (creature: Creature): Creature => {
      const changes = {
        'physical.cleanliness': creature.physical.cleanliness + 40,
        'physical.health': creature.physical.health + 10,
        'mental.happiness': creature.mental.happiness - 5,
      };

      let updated = CreatureEngine.updateStats(creature, changes);
      updated = recordCareEvent(updated, 'clean', changes);

      return updated;
    },

    /**
     * Pet the creature - increases happiness and affection
     */
    pet: (creature: Creature): Creature => {
      const changes = {
        'mental.happiness': creature.mental.happiness + 15,
        'social.affection': creature.social.affection + 10,
        'physical.cleanliness': creature.physical.cleanliness - 5,
      };

      let updated = CreatureEngine.updateStats(creature, changes);
      updated = recordCareEvent(updated, 'pet', changes);

      return updated;
    },

    /**
     * Train the creature - increases discipline, decreases energy and hunger
     */
    train: (creature: Creature): Creature => {
      const changes = {
        'mental.discipline': creature.mental.discipline + 1, // Discipline is 0-10 scale
        'physical.hunger': creature.physical.hunger - 15,
        'physical.energy': creature.physical.energy - 20,
        'mental.happiness': creature.mental.happiness + 5,
      };

      let updated = CreatureEngine.updateStats(creature, changes);
      updated = recordCareEvent(updated, 'train', changes);

      return updated;
    },

    /**
     * Give gift to creature - increases happiness and care quality
     */
    gift: (creature: Creature): Creature => {
      const changes = {
        'mental.happiness': creature.mental.happiness + 35,
      };

      let updated = CreatureEngine.updateStats(creature, changes);

      // Increase care quality directly (not via changes since it's not a stat path)
      updated = {
        ...updated,
        careQuality: Math.min(100, updated.careQuality + 5),
      };

      updated = recordCareEvent(updated, 'gift', changes);

      return updated;
    },
  },
};

/**
 * Helper function to record a care event in creature history
 */
function recordCareEvent(
  creature: Creature,
  type: CareEvent['type'],
  statChanges: Record<string, number>
): Creature {
  const event: CareEvent = {
    type,
    timestamp: new Date(),
    statChanges,
  };

  return {
    ...creature,
    careHistory: [...creature.careHistory, event],
  };
}
