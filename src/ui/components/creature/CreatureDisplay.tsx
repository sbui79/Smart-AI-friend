import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Creature, EvolutionStage } from '../../../core/engine/types';
import { CreatureEngine } from '../../../core/engine/CreatureEngine';
import { EvolutionManager } from '../../../core/engine/EvolutionManager';
import { theme } from '../../theme';

interface CreatureDisplayProps {
  creature: Creature;
}

// Placeholder sprites until real artwork is available
const STAGE_SPRITES: Record<EvolutionStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐦',
  elder: '🦉',
};

/**
 * Describe how long until the creature can evolve
 */
function evolutionHint(creature: Creature): string | null {
  const config = EvolutionManager.getStageConfig(creature.evolutionStage);
  if (!config.nextStage) {
    return null;
  }

  const hoursInStage = (Date.now() - creature.stageStartDate.getTime()) / (1000 * 60 * 60);
  const hoursLeft = Math.ceil(config.durationHours - hoursInStage);

  if (hoursLeft > 0) {
    return `Evolves in ~${hoursLeft}h`;
  }
  return creature.careQuality < config.minCareQuality
    ? 'Needs better care to evolve'
    : 'Ready to evolve — interact with them!';
}

/**
 * CreatureDisplay Component
 * Displays the creature with its current evolution stage, mood, and sleep state
 */
export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creature }) => {
  const isDead = CreatureEngine.isDead(creature);
  const hint = isDead ? null : evolutionHint(creature);
  const moodColor = theme.colors[creature.mood];

  return (
    <View style={styles.container}>
      <View style={[styles.spriteContainer, { borderColor: isDead ? theme.colors.border : moodColor }]}>
        <Text style={[styles.sprite, creature.isAsleep && styles.asleep]}>
          {isDead ? '🪦' : STAGE_SPRITES[creature.evolutionStage]}
        </Text>
        {creature.isAsleep && !isDead && <Text style={styles.zzz}>💤</Text>}
      </View>
      <Text style={styles.creatureName}>{creature.name}</Text>
      <Text style={styles.stageLabel}>
        {creature.evolutionStage}
        {!isDead && (
          <>
            {' · '}
            <Text style={{ color: moodColor }}>{creature.isAsleep ? 'sleeping' : creature.mood}</Text>
          </>
        )}
      </Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  spriteContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
    borderWidth: 3,
  },
  sprite: {
    fontSize: 72,
  },
  asleep: {
    opacity: 0.6,
  },
  zzz: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: theme.typography.fontSize['2xl'],
  },
  creatureName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stageLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  hint: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },
});

export default CreatureDisplay;
