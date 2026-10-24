import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Creature, EvolutionStage } from '../../../core/engine/types';
import { CreatureEngine } from '../../../core/engine/CreatureEngine';
import { EvolutionManager } from '../../../core/engine/EvolutionManager';
import { theme } from '../../theme';
import { AnimatedCreature, Reaction, idlePoseFor } from './AnimatedCreature';

interface CreatureDisplayProps {
  creature: Creature;
  reaction?: Reaction | null;
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
export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creature, reaction }) => {
  const isDead = CreatureEngine.isDead(creature);
  const hint = isDead ? null : evolutionHint(creature);
  const moodColor = theme.colors[creature.mood];
  const pose = idlePoseFor({
    isDead,
    isEgg: creature.evolutionStage === 'egg',
    isAsleep: creature.isAsleep,
    mood: creature.mood,
  });

  return (
    <View style={styles.container}>
      <View style={[styles.spriteContainer, { borderColor: isDead ? theme.colors.border : moodColor }]}>
        <AnimatedCreature
          sprite={isDead ? '🪦' : STAGE_SPRITES[creature.evolutionStage]}
          pose={pose}
          dimmed={creature.isAsleep && !isDead}
          reaction={isDead ? null : reaction}
        />
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
