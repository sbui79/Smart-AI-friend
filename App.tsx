import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/ui/navigation/AppNavigator';
import { Database } from './src/services/storage/Database';
import { CreatureRepository } from './src/services/storage/CreatureRepository';
import { NotificationService } from './src/services/notifications/NotificationService';
import { ModuleLoader } from './src/core/modules/ModuleLoader';
import { BasicCareModule } from './src/core/modules/BasicCareModule';
import { EvolutionModule } from './src/core/modules/EvolutionModule';
import { LocalAIModule } from './src/core/modules/LocalAIModule';
import { useModuleStore } from './src/core/state/moduleSlice';
import { useCreatureStore } from './src/core/state/store';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reloadModules } = useModuleStore();

  useEffect(() => {
    initialize();
  }, []);

  // Advance the simulation while the app is open, and set reminders while it's away
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      useCreatureStore.getState().tick();
    }, 60000); // Update every minute

    const subscription = AppState.addEventListener('change', state => {
      const { creature, tick } = useCreatureStore.getState();
      if (state === 'active') {
        tick();
        if (creature) {
          NotificationService.cancelCreatureNotifications(creature.id);
        }
      } else if (state === 'background' && creature) {
        NotificationService.scheduleCareReminders(creature);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isInitialized]);

  const initialize = async () => {
    try {
      // Initialize database
      await Database.init();

      // Register modules
      ModuleLoader.registerModule(BasicCareModule);
      ModuleLoader.registerModule(EvolutionModule);
      ModuleLoader.registerModule(LocalAIModule);

      // Load modules with default config
      reloadModules();

      // Ask for notification permission without blocking startup
      NotificationService.initialize();

      // Try to load existing creature (catches up on time spent away)
      const creatures = await CreatureRepository.getAll();
      if (creatures.length > 0) {
        await useCreatureStore.getState().loadCreature(creatures[0].id);
      }

      setIsInitialized(true);
    } catch (err) {
      setError(`Initialization failed: ${err}`);
      console.error('App initialization error:', err);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    padding: 24,
    textAlign: 'center',
  },
});
