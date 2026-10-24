import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { useCreatureStore } from '../../core/state/store';
import { CreatureEngine } from '../../core/engine/CreatureEngine';
import { CreatureDisplay } from '../components/creature/CreatureDisplay';
import { StatBar } from '../components/creature/StatBar';
import { ActionButtons } from '../components/creature/ActionButtons';
import { SpeechBubble } from '../components/ai/SpeechBubble';
import { Reaction } from '../components/creature/AnimatedCreature';

// Actions the creature responds to while asleep (matches the store's rules)
const SLEEP_SAFE_ACTIONS = ['pet'];

export const CreatureScreen = ({ navigation }: any) => {
  const { creature, isLoading, lastResponse, performAction, deleteCreature, greet } =
    useCreatureStore();
  const [reaction, setReaction] = useState<Reaction | null>(null);

  // Animate the creature's reaction, then apply the action
  const handleAction = (action: string) => {
    if (creature && (!creature.isAsleep || SLEEP_SAFE_ACTIONS.includes(action))) {
      setReaction({ action, id: Date.now() });
    }
    performAction(action);
  };

  // Say hello whenever the player opens this tab
  useFocusEffect(
    useCallback(() => {
      greet();
    }, [greet])
  );

  if (isLoading && !creature) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!creature) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No creature yet.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Hatch an egg</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleStartOver = async () => {
    await deleteCreature();
    navigation.navigate('Home');
  };

  if (CreatureEngine.isDead(creature)) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <CreatureDisplay creature={creature} />
          <Text style={styles.memorialText}>
            {creature.name} was neglected for too long and has passed away.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStartOver}>
            <Text style={styles.buttonText}>Start a new egg</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { physical, mental } = creature;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <CreatureDisplay creature={creature} reaction={reaction} />

        {lastResponse && <SpeechBubble response={lastResponse} onQuickReply={handleAction} />}

        <View style={styles.card}>
          <StatBar label="Hunger" value={physical.hunger} />
          <StatBar label="Happiness" value={mental.happiness} />
          <StatBar label="Energy" value={physical.energy} />
          <StatBar label="Cleanliness" value={physical.cleanliness} />
          <StatBar label="Health" value={physical.health} />
          <StatBar label="Care quality" value={creature.careQuality} />
        </View>

        <ActionButtons isAsleep={creature.isAsleep} onAction={handleAction} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing['2xl'],
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  memorialText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
