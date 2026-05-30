import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AppNavigator } from './src/ui/navigation/AppNavigator';
import { Database } from './src/services/storage/Database';
import { ModuleLoader } from './src/core/modules/ModuleLoader';
import { BasicCareModule } from './src/core/modules/BasicCareModule';
import { EvolutionModule } from './src/core/modules/EvolutionModule';
import { LocalAIModule } from './src/core/modules/LocalAIModule';
import { useModuleStore } from './src/core/state/moduleSlice';
import { useCreatureStore } from './src/core/state/store';
import { TimeManager } from './src/core/engine/TimeManager';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { reloadModules } = useModuleStore();
  const { creature, updateCreature } = useCreatureStore();

  useEffect(() => {
    initialize();
  }, []);

  // Background timer for stat decay
  useEffect(() => {
    if (!creature) return;

    const interval = setInterval(() => {
      const updated = TimeManager.updateAfterTimeElapsed(creature, '15+');
      if (updated !== creature) {
        updateCreature(updated);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [creature]);

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

      // Try to load existing creature
      const { CreatureRepository } = require('./src/services/storage/CreatureRepository');
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

  return <AppNavigator />;
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
