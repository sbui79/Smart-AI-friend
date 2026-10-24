import * as Notifications from 'expo-notifications';
import { NotificationService } from '../NotificationService';
import { CreatureEngine } from '../../../core/engine/CreatureEngine';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const schedule = Notifications.scheduleNotificationAsync as jest.Mock;

describe('NotificationService', () => {
  const now = new Date('2026-05-28T12:00:00');

  beforeAll(async () => {
    await NotificationService.initialize();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule a care reminder for when the first stat goes critical', async () => {
    const creature = CreatureEngine.createCreature('TestPet');

    await NotificationService.scheduleCareReminders(creature, now);

    const care = schedule.mock.calls.find(([req]) => req.identifier === `care_${creature.id}`);
    // Hunger hits 20 after 80 / 15 hours
    expect(care![0].trigger.date.getTime()).toBeCloseTo(
      now.getTime() + (80 / 15) * 60 * 60 * 1000,
      -3
    );
  });

  it('should schedule an evolution reminder at the end of the current stage', async () => {
    const creature = { ...CreatureEngine.createCreature('TestPet'), stageStartDate: now };

    await NotificationService.scheduleCareReminders(creature, now);

    const evolve = schedule.mock.calls.find(([req]) => req.identifier === `evolve_${creature.id}`);
    // Eggs hatch after 4 hours
    expect(evolve![0].trigger.date).toEqual(new Date('2026-05-28T16:00:00'));
  });

  it('should replace earlier reminders', async () => {
    const creature = CreatureEngine.createCreature('TestPet');

    await NotificationService.scheduleCareReminders(creature, now);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      `care_${creature.id}`
    );
  });

  it('should not schedule anything for a dead creature', async () => {
    const creature = CreatureEngine.createCreature('TestPet');
    creature.specialStates = ['dead'];

    await NotificationService.scheduleCareReminders(creature, now);

    expect(schedule).not.toHaveBeenCalled();
  });
});
