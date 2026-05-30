import * as Notifications from 'expo-notifications';
import { Creature } from '../../core/engine/types';

/**
 * Notification Service - Handles push notifications for creature care alerts
 * Manages low stat alerts and evolution readiness notifications
 */
export class NotificationService {
  private static isInitialized = false;

  /**
   * Initialize notification permissions and handlers
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure notification handler for when notification is received
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Schedule low stat alerts when stats fall below threshold (30%)
   * Called when creature stats are updated
   */
  static async scheduleStatAlert(creature: Creature): Promise<void> {
    try {
      // Check if any critical stat is below 30%
      const criticalStats = this.getCriticalStats(creature);

      if (criticalStats.length === 0) {
        return; // No critical stats, no alert needed
      }

      // Cancel any existing low stat notifications for this creature
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const existingLowStatNotifs = existingNotifications.filter(
        (n) => n.trigger && typeof n.trigger === 'object' && 'type' in n.trigger &&
                (n.trigger as any).identifier?.includes(`lowstat_${creature.id}`)
      );

      for (const notif of existingLowStatNotifs) {
        if (notif.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      // Schedule new notification
      const statLabel = criticalStats.join(', ');
      await Notifications.scheduleNotificationAsync({
        identifier: `lowstat_${creature.id}_${Date.now()}`,
        content: {
          title: `${creature.name} needs attention!`,
          body: `${statLabel} is getting low. Time to care for your friend!`,
          data: {
            creatureId: creature.id,
            type: 'low_stat_alert',
          },
        },
        trigger: {
          type: 'time',
          seconds: 600, // Alert every 10 minutes if stats remain critical
        },
      });
    } catch (error) {
      console.error('Failed to schedule stat alert:', error);
    }
  }

  /**
   * Schedule evolution ready notification when creature is ready to evolve
   */
  static async scheduleEvolutionReadyNotification(creature: Creature): Promise<void> {
    try {
      // Cancel any existing evolution notifications for this creature
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const existingEvolveNotifs = existingNotifications.filter(
        (n) => n.trigger && typeof n.trigger === 'object' && 'type' in n.trigger &&
                (n.trigger as any).identifier?.includes(`evolve_${creature.id}`)
      );

      for (const notif of existingEvolveNotifs) {
        if (notif.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      // Schedule evolution ready notification
      await Notifications.scheduleNotificationAsync({
        identifier: `evolve_${creature.id}`,
        content: {
          title: `${creature.name} is ready to evolve!`,
          body: `Your friend has grown and is ready for the next stage. Visit them now!`,
          data: {
            creatureId: creature.id,
            type: 'evolution_ready',
            currentStage: creature.evolutionStage,
          },
        },
        trigger: {
          type: 'time',
          seconds: 1, // Immediate notification
        },
      });
    } catch (error) {
      console.error('Failed to schedule evolution notification:', error);
    }
  }

  /**
   * Cancel all notifications for a specific creature
   */
  static async cancelCreatureNotifications(creatureId: string): Promise<void> {
    try {
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const creatureNotifications = allNotifications.filter(
        (n) => n.trigger && typeof n.trigger === 'object' && 'type' in n.trigger &&
               (n.trigger as any).identifier?.includes(creatureId)
      );

      for (const notif of creatureNotifications) {
        if (notif.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
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

  /**
   * Get list of critical stats (below 30% threshold)
   */
  private static getCriticalStats(creature: Creature): string[] {
    const critical: string[] = [];
    const threshold = 30;

    if (creature.physical.hunger < threshold) {
      critical.push('Hunger');
    }
    if (creature.physical.energy < threshold) {
      critical.push('Energy');
    }
    if (creature.mental.happiness < threshold) {
      critical.push('Happiness');
    }
    if (creature.physical.health < threshold) {
      critical.push('Health');
    }

    return critical;
  }
}

export default NotificationService;
