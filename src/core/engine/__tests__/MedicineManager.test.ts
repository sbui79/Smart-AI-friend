import { MedicineManager } from '../MedicineManager';
import { CreatureEngine } from '../CreatureEngine';
import { Creature } from '../types';

const at = (time: string) => new Date(`2026-05-28T${time}`);

function sickCreature(overrides: Partial<Creature> = {}): Creature {
  const creature = CreatureEngine.createCreature('TestPet');
  return {
    ...creature,
    physical: { ...creature.physical, health: 20 },
    ...overrides,
  };
}

describe('MedicineManager', () => {
  describe('needsMedicine', () => {
    it('is true when health is low', () => {
      expect(MedicineManager.needsMedicine(sickCreature())).toBe(true);
    });

    it('is false for a healthy creature', () => {
      expect(MedicineManager.needsMedicine(CreatureEngine.createCreature('TestPet'))).toBe(false);
    });

    it('is false for a dead creature', () => {
      expect(MedicineManager.needsMedicine(sickCreature({ specialStates: ['dead'] }))).toBe(false);
    });
  });

  describe('isDoseDue', () => {
    it('is due right away for the first dose', () => {
      expect(MedicineManager.isDoseDue(sickCreature(), at('12:00:00'))).toBe(true);
    });

    it('waits the dose interval between doses', () => {
      const creature = sickCreature({ lastMedicineAt: at('12:00:00') });

      expect(MedicineManager.isDoseDue(creature, at('15:59:00'))).toBe(false);
      expect(MedicineManager.isDoseDue(creature, at('16:00:00'))).toBe(true);
    });

    it('is never due for a healthy creature', () => {
      expect(MedicineManager.isDoseDue(CreatureEngine.createCreature('TestPet'))).toBe(false);
    });
  });

  describe('hoursUntilNextDose', () => {
    it('rounds up to whole hours', () => {
      const creature = sickCreature({ lastMedicineAt: at('12:00:00') });
      expect(MedicineManager.hoursUntilNextDose(creature, at('13:30:00'))).toBe(3);
    });

    it('is 0 when no dose has been given', () => {
      expect(MedicineManager.hoursUntilNextDose(sickCreature(), at('12:00:00'))).toBe(0);
    });
  });

  describe('healingBetween', () => {
    const creature = sickCreature({ lastMedicineAt: at('12:00:00') });

    it('heals gradually over the effect window', () => {
      expect(MedicineManager.healingBetween(creature, at('12:00:00'), at('13:00:00'))).toBe(10);
      expect(MedicineManager.healingBetween(creature, at('12:00:00'), at('12:30:00'))).toBe(5);
    });

    it('stops once the dose wears off', () => {
      expect(MedicineManager.healingBetween(creature, at('12:00:00'), at('20:00:00'))).toBe(40);
      expect(MedicineManager.healingBetween(creature, at('17:00:00'), at('18:00:00'))).toBe(0);
    });

    it('does nothing without medicine', () => {
      expect(MedicineManager.healingBetween(sickCreature(), at('12:00:00'), at('13:00:00'))).toBe(0);
    });
  });
});
