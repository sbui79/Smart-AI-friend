import { Creature, StatDecayRates, AgeMode } from './types';
import { CreatureEngine } from './CreatureEngine';

export class TimeManager {
  // Day/night cycle hours
  private static readonly DAY_START_HOUR = 6;  // 6am
  private static readonly DAY_END_HOUR = 22;   // 10pm

  // Stat decay rates per hour for Ages 15+ (Classic/Challenge mode)
  private static readonly DECAY_RATES_15_PLUS: StatDecayRates = {
    hunger: 15,
    energy: 10,
    happiness: 12,
    cleanliness: 8,
  };

  // Death threshold for Ages 15+ (96 hours in critical state)
  private static readonly DEATH_THRESHOLD_HOURS = 96;

  /**
   * Check if the given time is during day hours (6am-10pm)
   */
  static isDayTime(date: Date): boolean {
    const hour = date.getHours();
    return hour >= this.DAY_START_HOUR && hour < this.DAY_END_HOUR;
  }

  /**
   * Apply stat decay based on hours elapsed
   * @param creature The creature to update
   * @param hoursElapsed Number of hours that have passed
   * @param ageMode Age mode for decay rate calculation
   */
  static applyStatDecay(
    creature: Creature,
    hoursElapsed: number,
    ageMode: AgeMode = '15+'
  ): Creature {
    // Phase 1 only implements Ages 15+ mode
    const decayRates = this.DECAY_RATES_15_PLUS;

    const hungerDecay = Math.floor(decayRates.hunger * hoursElapsed);
    const energyDecay = Math.floor(decayRates.energy * hoursElapsed);
    const happinessDecay = Math.floor(decayRates.happiness * hoursElapsed);
    const cleanlinessDecay = Math.floor(decayRates.cleanliness * hoursElapsed);

    // Update stats using CreatureEngine
    let updated = CreatureEngine.updateStats(creature, {
      'physical.hunger': creature.physical.hunger - hungerDecay,
      'physical.energy': creature.physical.energy - energyDecay,
      'mental.happiness': creature.mental.happiness - happinessDecay,
      'physical.cleanliness': creature.physical.cleanliness - cleanlinessDecay,
    });

    // Update age (in seconds)
    updated = {
      ...updated,
      age: creature.age + (hoursElapsed * 3600),
    };

    return updated;
  }

  /**
   * Update creature after time has elapsed since last interaction
   * @param creature The creature to update
   * @param ageMode Age mode for decay calculations
   * @param currentDate Current date/time (defaults to now, injectable for testing)
   */
  static updateAfterTimeElapsed(
    creature: Creature,
    ageMode: AgeMode = '15+',
    currentDate: Date = new Date()
  ): Creature {
    const elapsedMs = currentDate.getTime() - creature.lastInteractionDate.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    let updated = creature;

    // Apply stat decay if it's daytime
    if (this.isDayTime(currentDate)) {
      updated = {
        ...updated,
        isAsleep: false,
      };
      updated = this.applyStatDecay(updated, elapsedHours, ageMode);
      updated = CreatureEngine.updateCareQuality(updated);
    } else {
      // Night time: creature sleeps and energy is restored
      updated = {
        ...updated,
        isAsleep: true,
        physical: {
          ...updated.physical,
          energy: 100,
        },
      };
    }

    updated = {
      ...updated,
      lastInteractionDate: currentDate,
    };

    return updated;
  }

  /**
   * Check if creature should die based on critical hours (Ages 15+ only)
   * @param creature The creature to check
   * @param criticalHours How many hours the creature has been in critical state
   * @param ageMode Age mode (death only possible in 15+ mode)
   */
  static checkForDeath(
    creature: Creature,
    criticalHours: number,
    ageMode: AgeMode = '15+'
  ): { isDead: boolean; creature: Creature } {
    // Phase 1: Only Ages 15+ can die
    if (ageMode !== '15+') {
      return { isDead: false, creature };
    }

    // Death occurs after 96+ hours in critical state
    const isDead = criticalHours >= this.DEATH_THRESHOLD_HOURS;

    if (isDead) {
      const updated = {
        ...creature,
        specialStates: [...creature.specialStates, 'dead' as any],
      };
      return { isDead: true, creature: updated };
    }

    return { isDead: false, creature };
  }

  /**
   * Calculate total critical hours from care history
   * (For future implementation - tracks how long creature has been in critical state)
   */
  static calculateCriticalHours(creature: Creature): number {
    // Simplified for Phase 1: assume if currently critical, count from last interaction
    if (CreatureEngine.isCritical(creature)) {
      const elapsedMs = Date.now() - creature.lastInteractionDate.getTime();
      return elapsedMs / (1000 * 60 * 60);
    }
    return 0;
  }
}
