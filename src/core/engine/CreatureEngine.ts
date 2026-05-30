import { v4 as uuidv4 } from 'uuid';
import { Creature, PhysicalStats, MentalStats, SocialStats, Mood } from './types';

export class CreatureEngine {
  /**
   * Create a new creature with default stats
   */
  static createCreature(name: string, species: string = 'default'): Creature {
    const now = new Date();

    return {
      id: uuidv4(),
      name,
      species,
      generation: 1,
      parentIds: [undefined, undefined],

      evolutionStage: 'egg',
      age: 0,
      stageStartDate: now,

      physical: {
        hunger: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      },
      mental: {
        happiness: 100,
        intelligence: 50,
        creativity: 50,
        discipline: 5,
      },
      social: {
        affection: 50,
        trust: 50,
        playfulness: 50,
      },

      personality: {
        traits: this.generateRandomTraits(),
        preferences: {},
        memory: [],
      },

      isAsleep: false,
      mood: 'happy',
      specialStates: [],

      careQuality: 100,
      careHistory: [],
      lastInteractionDate: now,
    };
  }

  /**
   * Update creature stats with clamping to valid ranges
   * @param creature The creature to update
   * @param changes Object with stat paths and values (e.g., {'physical.hunger': 50})
   */
  static updateStats(
    creature: Creature,
    changes: Record<string, number>
  ): Creature {
    const updated = {
      ...creature,
      physical: { ...creature.physical },
      mental: { ...creature.mental },
      social: { ...creature.social },
    };

    // Apply changes
    for (const [path, value] of Object.entries(changes)) {
      const parts = path.split('.');
      if (parts.length === 2) {
        const [category, stat] = parts;
        if (category === 'physical' || category === 'mental' || category === 'social') {
          const statGroup = updated[category] as any;
          const clampedValue = this.clampStat(stat, value);
          statGroup[stat] = clampedValue;
        }
      }
    }

    // Update mood based on new stats
    updated.mood = this.calculateMood(updated);

    // Update last interaction date
    updated.lastInteractionDate = new Date();

    return updated;
  }

  /**
   * Clamp stat value to valid range
   */
  private static clampStat(statName: string, value: number): number {
    // Discipline is 0-10, others are 0-100
    const max = statName === 'discipline' ? 10 : 100;
    return Math.max(0, Math.min(max, value));
  }

  /**
   * Calculate mood based on creature's stats
   */
  private static calculateMood(creature: Creature): Mood {
    const { physical, mental } = creature;

    // Check for sickness (low health)
    if (physical.health <= 30) {
      return 'sick';
    }

    // Check for tiredness (low energy)
    if (physical.energy < 20) {
      return 'tired';
    }

    // Check for sadness (low happiness or hunger)
    if (mental.happiness < 30 || physical.hunger < 20) {
      return 'sad';
    }

    // Check for excitement (high happiness and energy)
    if (mental.happiness > 80 && physical.energy > 70) {
      return 'excited';
    }

    // Default to happy if all stats are decent
    if (this.isHealthy(creature)) {
      return 'happy';
    }

    return 'neutral';
  }

  /**
   * Check if creature stats are in critical state (below 20)
   */
  static isCritical(creature: Creature): boolean {
    const { physical, mental } = creature;

    return (
      physical.hunger < 20 ||
      physical.energy < 20 ||
      physical.health < 20 ||
      physical.cleanliness < 20 ||
      mental.happiness < 20
    );
  }

  /**
   * Check if creature stats are healthy (above 50)
   */
  static isHealthy(creature: Creature): boolean {
    const { physical, mental } = creature;

    return (
      physical.hunger > 50 &&
      physical.energy > 50 &&
      physical.health > 50 &&
      physical.cleanliness > 50 &&
      mental.happiness > 50
    );
  }

  /**
   * Generate random personality traits for a new creature
   */
  private static generateRandomTraits(): string[] {
    const allTraits = [
      'curious', 'shy', 'energetic', 'calm', 'playful',
      'serious', 'adventurous', 'cautious', 'friendly', 'independent'
    ];

    // Pick 2-3 random traits
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const shuffled = [...allTraits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Update care quality score based on current stats
   */
  static updateCareQuality(creature: Creature): Creature {
    return {
      ...creature,
      careQuality: this.isHealthy(creature)
        ? Math.min(100, creature.careQuality + 1)
        : this.isCritical(creature)
        ? Math.max(0, creature.careQuality - 5)
        : creature.careQuality,
    };
  }
}
