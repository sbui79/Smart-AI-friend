import { Creature } from './types';
import { CreatureEngine } from './CreatureEngine';

const HOUR_MS = 1000 * 60 * 60;

export class MedicineManager {
  // A creature below this health needs medicine
  static readonly NEEDS_MEDICINE_BELOW = 50;

  // Doses must be spaced out, like a real prescription
  static readonly DOSE_INTERVAL_HOURS = 4;

  // Each dose gives a small boost right away, then keeps healing for a few hours
  static readonly IMMEDIATE_HEALTH = 5;
  static readonly EFFECT_HOURS = 4;
  static readonly HEALTH_PER_HOUR = 10;

  /**
   * Whether the creature is unwell enough to need medicine
   */
  static needsMedicine(creature: Creature): boolean {
    return !CreatureEngine.isDead(creature) && creature.physical.health < this.NEEDS_MEDICINE_BELOW;
  }

  /**
   * When the next dose may be given (null if no dose has been given yet)
   */
  static nextDoseAt(creature: Creature): Date | null {
    if (!creature.lastMedicineAt) {
      return null;
    }
    return new Date(creature.lastMedicineAt.getTime() + this.DOSE_INTERVAL_HOURS * HOUR_MS);
  }

  /**
   * Whether it is time for a dose right now
   */
  static isDoseDue(creature: Creature, now: Date = new Date()): boolean {
    const nextDose = this.nextDoseAt(creature);
    return this.needsMedicine(creature) && (!nextDose || now >= nextDose);
  }

  /**
   * Whole hours until the next dose, rounded up (0 when due)
   */
  static hoursUntilNextDose(creature: Creature, now: Date = new Date()): number {
    const nextDose = this.nextDoseAt(creature);
    if (!nextDose) {
      return 0;
    }
    return Math.max(0, Math.ceil((nextDose.getTime() - now.getTime()) / HOUR_MS));
  }

  /**
   * Health restored by the last dose between two moments, awake or asleep
   */
  static healingBetween(creature: Creature, start: Date, end: Date): number {
    if (!creature.lastMedicineAt) {
      return 0;
    }

    const effectStart = creature.lastMedicineAt.getTime();
    const effectEnd = effectStart + this.EFFECT_HOURS * HOUR_MS;
    const overlapMs =
      Math.min(end.getTime(), effectEnd) - Math.max(start.getTime(), effectStart);

    return overlapMs > 0 ? (overlapMs / HOUR_MS) * this.HEALTH_PER_HOUR : 0;
  }
}
