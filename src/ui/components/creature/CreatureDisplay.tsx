import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Creature, EvolutionStage } from '../../../core/engine/types';
import { CreatureEngine } from '../../../core/engine/CreatureEngine';
import { EvolutionManager } from '../../../core/engine/EvolutionManager';
import { MedicineManager } from '../../../core/engine/MedicineManager';
import { spriteFor } from '../../../core/engine/species';
import { theme } from '../../theme';
import { AnimatedCreature, Reaction, idlePoseFor } from './AnimatedCreature';

interface CreatureDisplayProps {
  creature: Creature;
  reaction?: Reaction | null;
}

// The creature grows a little with each life stage
const STAGE_SCALE: Record<EvolutionStage, number> = {
  egg: 0.85,
  baby: 0.7,
  child: 0.8,
  teen: 0.9,
  adult: 1,
  elder: 1,
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
 * Tell the player when the creature's next medicine is due
 */
function medicineHint(creature: Creature): string | null {
  if (!MedicineManager.needsMedicine(creature)) {
    return null;
  }
  if (MedicineManager.isDoseDue(creature)) {
    return creature.isAsleep ? '💊 Medicine time! Wake them up gently' : '💊 Medicine time!';
  }
  const hours = MedicineManager.hoursUntilNextDose(creature);
  return `💊 Next medicine in ~${hours}h`;
}

/**
 * CreatureDisplay Component
 * Displays the creature with its current evolution stage, mood, and sleep state
 */
export const CreatureDisplay: React.FC<CreatureDisplayProps> = ({ creature, reaction }) => {
  const isDead = CreatureEngine.isDead(creature);
  const hint = isDead ? null : evolutionHint(creature);
  const medicine = isDead ? null : medicineHint(creature);
  const moodColor = theme.colors[creature.mood];
  const pose = idlePoseFor({
    isDead,
    isEgg: creature.evolutionStage === 'egg',
    isAsleep: creature.isAsleep,
    mood: creature.mood,
  });

  return (
    <View style={styles.container}>
      <View style={styles.spriteContainer}>
        <AnimatedCreature
          sprite={isDead ? '🪦' : spriteFor(creature.species, creature.evolutionStage)}
          spriteScale={isDead ? 1 : STAGE_SCALE[creature.evolutionStage]}
          pose={pose}
          dimmed={creature.isAsleep && !isDead}
          reaction={isDead ? null : reaction}
          ringColor={isDead ? theme.colors.border : moodColor}
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
      {medicine && <Text style={styles.medicine}>{medicine}</Text>}
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
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
  medicine: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.error,
  },
});

export default CreatureDisplay;
