import { act } from '@testing-library/react-native';
import { actionBlockedReason, useCreatureStore } from '../store';
import { CreatureEngine } from '../../engine/CreatureEngine';
import { Creature } from '../../engine/types';
import { Database } from '../../../services/storage/Database';
import { CreatureRepository } from '../../../services/storage/CreatureRepository';

/**
 * Put a sick creature in the store, last seen at the current (fake) time
 */
async function setSickCreature(): Promise<Creature> {
  const base = CreatureEngine.createCreature('TestPet');
  const creature: Creature = {
    ...base,
    physical: { ...base.physical, health: 20 },
    lastInteractionDate: new Date(),
  };
  await CreatureRepository.save(creature);
  useCreatureStore.setState({ creature });
  return creature;
}

const perform = (action: string) =>
  act(async () => {
    await useCreatureStore.getState().performAction(action);
  });

const current = () => useCreatureStore.getState().creature!;

describe('wake up, medicine and rock to sleep', () => {
  beforeEach(async () => {
    await Database.init(':memory:');
    useCreatureStore.setState({ creature: null, isLoading: false, error: null, lastResponse: null });
  });

  afterEach(async () => {
    await Database.close();
    jest.useRealTimers();
  });

  it('wakes a sick creature at night, gives medicine and rocks it back to sleep', async () => {
    jest.useFakeTimers({ now: new Date('2026-05-28T22:30:00'), advanceTimers: true });
    await setSickCreature();

    // Asleep at night: medicine has to wait until it is woken up
    await perform('medicine');
    expect(current().isAsleep).toBe(true);
    expect(current().lastMedicineAt).toBeUndefined();
    expect(useCreatureStore.getState().lastResponse?.text).toContain('Zzz');

    await perform('wake');
    expect(current().isAsleep).toBe(false);

    await perform('medicine');
    expect(current().lastMedicineAt).toBeDefined();
    expect(current().physical.health).toBe(25);

    await perform('rock');
    expect(current().isAsleep).toBe(true);

    // The medicine keeps working through the night
    jest.setSystemTime(new Date('2026-05-28T23:30:00'));
    await act(async () => {
      await useCreatureStore.getState().tick();
    });
    expect(current().isAsleep).toBe(true);
    expect(current().physical.health).toBeCloseTo(35, 0);
  });

  it('refuses a second dose too soon', async () => {
    jest.useFakeTimers({ now: new Date('2026-05-28T12:00:00'), advanceTimers: true });
    await setSickCreature();

    await perform('medicine');
    const firstDose = current().lastMedicineAt;

    await perform('medicine');
    expect(current().lastMedicineAt).toEqual(firstDose);
    expect(useCreatureStore.getState().lastResponse?.text).toMatch(/Not yet/);
  });

  it('rocks a creature into a daytime nap and wakes it up again', async () => {
    jest.useFakeTimers({ now: new Date('2026-05-28T12:00:00'), advanceTimers: true });
    await setSickCreature();

    await perform('rock');
    expect(current().isAsleep).toBe(true);

    await perform('feed');
    expect(useCreatureStore.getState().lastResponse?.text).toContain('Zzz');

    await perform('wake');
    expect(current().isAsleep).toBe(false);
  });

  describe('actionBlockedReason', () => {
    const awake = CreatureEngine.createCreature('TestPet');
    const asleep = { ...awake, isAsleep: true };

    it('only lets a sleeping creature be petted or woken', () => {
      expect(actionBlockedReason(asleep, 'pet')).toBeNull();
      expect(actionBlockedReason(asleep, 'wake')).toBeNull();
      expect(actionBlockedReason(asleep, 'feed')).not.toBeNull();
      expect(actionBlockedReason(asleep, 'rock')).not.toBeNull();
    });

    it("won't wake a creature that is already awake", () => {
      expect(actionBlockedReason(awake, 'wake')).not.toBeNull();
      expect(actionBlockedReason(awake, 'rock')).toBeNull();
    });

    it("won't give medicine to a healthy creature", () => {
      expect(actionBlockedReason(awake, 'medicine')).toMatch(/don't need medicine/);
    });
  });
});
