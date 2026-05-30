import { Creature, EvolutionStage, EvolutionStageConfig, AgeMode } from './types';

export class EvolutionManager {
  // Evolution timing for Ages 15+ (slowest timing for challenge mode)
  private static readonly STAGE_CONFIGS_15_PLUS: Record<EvolutionStage, EvolutionStageConfig> = {
    egg: {
      stage: 'egg',
      durationHours: 4,
      minCareQuality: 70,
      nextStage: 'baby',
    },
    baby: {
      stage: 'baby',
      durationHours: 24,
      minCareQuality: 70,
      nextStage: 'child',
    },
    child: {
      stage: 'child',
      durationHours: 48,
      minCareQuality: 70,
      nextStage: 'teen',
    },
    teen: {
      stage: 'teen',
      durationHours: 72,
      minCareQuality: 70,
      nextStage: 'adult',
    },
    adult: {
      stage: 'adult',
      durationHours: Infinity, // No time limit
      minCareQuality: 0,
      nextStage: undefined,
    },
    elder: {
      stage: 'elder',
      durationHours: Infinity,
      minCareQuality: 0,
      nextStage: undefined,
    },
  };

  /**
   * Get evolution stage configuration for given stage and age mode
   */
  static getStageConfig(stage: EvolutionStage, ageMode: AgeMode = '15+'): EvolutionStageConfig {
    // Phase 1 only implements Ages 15+ mode
    return this.STAGE_CONFIGS_15_PLUS[stage];
  }

  /**
   * Check if creature should evolve based on time and care quality
   */
  static shouldEvolve(creature: Creature, ageMode: AgeMode = '15+'): boolean {
    const config = this.getStageConfig(creature.evolutionStage, ageMode);

    // Can't evolve if already at final stage
    if (!config.nextStage) {
      return false;
    }

    // Check if enough time has passed
    const now = new Date();
    const timeInStage = (now.getTime() - creature.stageStartDate.getTime()) / (1000 * 60 * 60); // hours
    const hasEnoughTime = timeInStage >= config.durationHours;

    // Check if care quality meets minimum requirement
    const hasGoodCare = creature.careQuality >= config.minCareQuality;

    return hasEnoughTime && hasGoodCare;
  }

  /**
   * Evolve creature to next stage
   */
  static evolve(creature: Creature, ageMode: AgeMode = '15+'): Creature {
    const config = this.getStageConfig(creature.evolutionStage, ageMode);

    // Can't evolve if already at final stage
    if (!config.nextStage) {
      return creature;
    }

    // Evolve to next stage
    return {
      ...creature,
      evolutionStage: config.nextStage,
      stageStartDate: new Date(),
    };
  }
}
