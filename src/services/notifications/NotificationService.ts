import * as Notifications from 'expo-notifications';
import { Creature } from '../../core/engine/types';
import { CreatureEngine } from '../../core/engine/CreatureEngine';
import { TimeManager } from '../../core/engine/TimeManager';
import { EvolutionManager } from '../../core/engine/EvolutionManager';

const HOUR_MS = 1000 * 60 * 60;

// If the creature is already critical, nudge again after this long
const CRITICAL_REMINDER_DELAY_HOURS = 0.25;

/**
 * Notification Service - Handles local notifications for creature care
 * Schedules reminders for when the creature will need care and when it is ready to evolve
 */
export class NotificationService {
  private static isInitialized = false;
  private static hasPermission = false;

  /**
   * Initialize notification permissions and handlers
   */
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.hasPermission;
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const { status } = await Notifications.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      if (!this.hasPermission) {
        console.warn('Notification permissions not granted');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }

    return this.hasPermission;
  }

  private static careId(creatureId: string): string {
    return `care_${creatureId}`;
  }

  private static evolveId(creatureId: string): string {
    return `evolve_${creatureId}`;
  }

  /**
   * Schedule reminders based on the creature's current state.
   * Call when the app goes to the background; replaces any earlier reminders.
   */
  static async scheduleCareReminders(creature: Creature, now: Date = new Date()): Promise<void> {
    if (!this.hasPermission) {
      return;
    }

    try {
      await this.cancelCreatureNotifications(creature.id);

      if (CreatureEngine.isDead(creature)) {
        return;
      }

      // Remind just as the first stat drops into the critical range
      const hoursUntilCritical = TimeManager.hoursUntilCritical(creature);
      const careDate = TimeManager.addDaytimeHours(
        now,
        hoursUntilCritical > 0 ? hoursUntilCritical : CRITICAL_REMINDER_DELAY_HOURS
      );

      await Notifications.scheduleNotificationAsync({
        identifier: this.careId(creature.id),
        content: {
          title: `${creature.name} needs attention!`,
          body: 'Your friend is getting hungry, tired, or lonely. Time to check in!',
          data: { creatureId: creature.id, type: 'low_stat_alert' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: careDate },
      });

      // Let the player know when the creature can evolve
      const config = EvolutionManager.getStageConfig(creature.evolutionStage);
      if (config.nextStage && creature.careQuality >= config.minCareQuality) {
        const evolveDate = new Date(
          creature.stageStartDate.getTime() + config.durationHours * HOUR_MS
        );
        if (evolveDate > now) {
          await Notifications.scheduleNotificationAsync({
            identifier: this.evolveId(creature.id),
            content: {
              title: `${creature.name} is ready to evolve!`,
              body: 'Your friend has grown. Visit them to see what they become!',
              data: {
                creatureId: creature.id,
                type: 'evolution_ready',
                currentStage: creature.evolutionStage,
              },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: evolveDate },
          });
        }
      }
    } catch (error) {
      console.error('Failed to schedule care reminders:', error);
    }
  }

  /**
   * Cancel all notifications for a specific creature
   */
  static async cancelCreatureNotifications(creatureId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(this.careId(creatureId));
      await Notifications.cancelScheduledNotificationAsync(this.evolveId(creatureId));
    } catch (error) {
      console.error('Failed to cancel creature notifications:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }
}

export default NotificationService;
