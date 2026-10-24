import { Creature, StatDecayRates, AgeMode } from './types';
import { CreatureEngine } from './CreatureEngine';

const HOUR_MS = 1000 * 60 * 60;

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

  // Health drains while neglected and slowly recovers while well cared for
  private static readonly HEALTH_LOSS_PER_HOUR_CRITICAL = 4;
  private static readonly HEALTH_GAIN_PER_HOUR_HEALTHY = 2;

  // A stat below this value counts as critical (matches CreatureEngine.isCritical)
  static readonly CRITICAL_THRESHOLD = 20;

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
   * Get the next moment the day/night state flips (6am or 10pm)
   */
  private static nextDayNightBoundary(date: Date): Date {
    const next = new Date(date);
    const hour = date.getHours();

    if (hour < this.DAY_START_HOUR) {
      next.setHours(this.DAY_START_HOUR, 0, 0, 0);
    } else if (hour < this.DAY_END_HOUR) {
      next.setHours(this.DAY_END_HOUR, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(this.DAY_START_HOUR, 0, 0, 0);
    }

    return next;
  }

  /**
   * Count only waking (daytime) hours between two dates.
   * Stats don't decay while the creature sleeps, so overnight absences are free.
   */
  static daytimeHoursBetween(start: Date, end: Date): number {
    let total = 0;
    let cursor = new Date(start);

    while (cursor < end) {
      const boundary = this.nextDayNightBoundary(cursor);
      const segmentEnd = boundary < end ? boundary : end;
      if (this.isDayTime(cursor)) {
        total += (segmentEnd.getTime() - cursor.getTime()) / HOUR_MS;
      }
      cursor = segmentEnd;
    }

    return total;
  }

  /**
   * Find the wall-clock time after a number of waking hours have passed
   */
  static addDaytimeHours(start: Date, hours: number): Date {
    let remainingMs = Math.max(0, hours) * HOUR_MS;
    let cursor = new Date(start);

    while (true) {
      const boundary = this.nextDayNightBoundary(cursor);
      if (this.isDayTime(cursor)) {
        const availableMs = boundary.getTime() - cursor.getTime();
        if (remainingMs <= availableMs) {
          return new Date(cursor.getTime() + remainingMs);
        }
        remainingMs -= availableMs;
      }
      cursor = boundary;
    }
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

    // Keep fractional decay so frequent small ticks still add up
    let updated = CreatureEngine.updateStats(creature, {
      'physical.hunger': creature.physical.hunger - decayRates.hunger * hoursElapsed,
      'physical.energy': creature.physical.energy - decayRates.energy * hoursElapsed,
      'mental.happiness': creature.mental.happiness - decayRates.happiness * hoursElapsed,
      'physical.cleanliness': creature.physical.cleanliness - decayRates.cleanliness * hoursElapsed,
    });

    // Update age (in seconds)
    updated = {
      ...updated,
      age: creature.age + (hoursElapsed * 3600),
    };

    return updated;
  }

  /**
   * Drain health while critical, recover it while healthy
   */
  private static applyHealthChange(creature: Creature, hoursElapsed: number): Creature {
    if (CreatureEngine.isCritical(creature)) {
      return CreatureEngine.updateStats(creature, {
        'physical.health':
          creature.physical.health - this.HEALTH_LOSS_PER_HOUR_CRITICAL * hoursElapsed,
      });
    }
    if (CreatureEngine.isHealthy(creature)) {
      return CreatureEngine.updateStats(creature, {
        'physical.health':
          creature.physical.health + this.HEALTH_GAIN_PER_HOUR_HEALTHY * hoursElapsed,
      });
    }
    return creature;
  }

  /**
   * Hours of waking time until the first decaying stat becomes critical (0 if already critical)
   */
  static hoursUntilCritical(creature: Creature, ageMode: AgeMode = '15+'): number {
    if (CreatureEngine.isCritical(creature)) {
      return 0;
    }

    const rates = this.DECAY_RATES_15_PLUS;
    const values: [number, number][] = [
      [creature.physical.hunger, rates.hunger],
      [creature.physical.energy, rates.energy],
      [creature.mental.happiness, rates.happiness],
      [creature.physical.cleanliness, rates.cleanliness],
    ];

    return Math.max(
      0,
      Math.min(...values.map(([value, rate]) => (value - this.CRITICAL_THRESHOLD) / rate))
    );
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
    if (CreatureEngine.isDead(creature)) {
      return creature;
    }

    const elapsedHours = this.daytimeHoursBetween(creature.lastInteractionDate, currentDate);

    let updated = creature;

    if (this.isDayTime(currentDate)) {
      updated = {
        ...updated,
        isAsleep: false,
      };
      updated = this.applyStatDecay(updated, elapsedHours, ageMode);
      updated = this.applyHealthChange(updated, elapsedHours);
      updated = CreatureEngine.updateCareQuality(updated, elapsedHours);
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

    // Track how long the creature has been neglected
    if (CreatureEngine.isCritical(updated)) {
      updated = { ...updated, criticalSince: updated.criticalSince ?? currentDate };
    } else {
      updated = { ...updated, criticalSince: undefined };
    }

    updated = {
      ...updated,
      lastInteractionDate: currentDate,
    };

    return this.checkForDeath(updated, this.calculateCriticalHours(updated, currentDate), ageMode)
      .creature;
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

    if (CreatureEngine.isDead(creature)) {
      return { isDead: true, creature };
    }

    // Death occurs after 96+ hours in critical state
    const isDead = criticalHours >= this.DEATH_THRESHOLD_HOURS;

    if (isDead) {
      const updated: Creature = {
        ...creature,
        specialStates: [...creature.specialStates, 'dead'],
      };
      return { isDead: true, creature: updated };
    }

    return { isDead: false, creature };
  }

  /**
   * Hours the creature has continuously been in a critical state
   */
  static calculateCriticalHours(creature: Creature, currentDate: Date = new Date()): number {
    if (!creature.criticalSince) {
      return 0;
    }
    return (currentDate.getTime() - creature.criticalSince.getTime()) / HOUR_MS;
  }
}
