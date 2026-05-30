import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Creature } from '../../../core/engine/types';
import { theme } from '../../theme';

interface CreatureDisplayProps {
  creature: Creature;
}

/**
 * CreatureDisplay Component
 * Displays the creature with its current evolution stage
 * Shows stage name as text (placeholder until real sprites are available)
 */
export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creature }) => {
  return (
    <View style={styles.container}>
      <View style={styles.spriteContainer}>
        <Text style={styles.stageName}>[{creature.evolutionStage.toUpperCase()}]</Text>
      </View>
      <Text style={styles.creatureName}>{creature.name}</Text>
      <Text style={styles.stageLabel}>Evolution Stage: {creature.evolutionStage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  spriteContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  stageName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  creatureName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stageLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default CreatureDisplay;
