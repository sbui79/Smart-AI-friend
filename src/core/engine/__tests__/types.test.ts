import {
  Creature,
  EvolutionStage,
  Mood,
  PhysicalStats,
  MentalStats,
  SocialStats,
  CareEvent,
  ConversationMemory,
  EvolutionStageConfig,
  StatDecayRates
} from '../types';

describe('Core Types', () => {
  describe('Creature', () => {
    it('should create a valid creature object', () => {
      const now = new Date();
      const creature: Creature = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'TestPet',
        species: 'default',
        generation: 1,
        parentIds: [undefined, undefined],
        evolutionStage: 'egg',
        age: 0,
        stageStartDate: now,
        physical: {
          hunger: 100,
          energy: 100,
          health: 100,
          cleanliness: 100,
        },
        mental: {
          happiness: 100,
          intelligence: 50,
          creativity: 50,
          discipline: 5,
        },
        social: {
          affection: 50,
          trust: 50,
          playfulness: 50,
        },
        personality: {
          traits: ['curious', 'energetic'],
          preferences: {},
          memory: [],
        },
        isAsleep: false,
        mood: 'happy',
        specialStates: [],
        careQuality: 100,
        careHistory: [],
        lastInteractionDate: now,
      };

      expect(creature.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(creature.evolutionStage).toBe('egg');
      expect(creature.physical.hunger).toBe(100);
    });

    it('should validate evolution stages', () => {
      const stages: EvolutionStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder'];
      stages.forEach(stage => {
        expect(['egg', 'baby', 'child', 'teen', 'adult', 'elder']).toContain(stage);
      });
    });

    it('should validate moods', () => {
      const moods: Mood[] = ['happy', 'sad', 'excited', 'tired', 'sick', 'neutral'];
      moods.forEach(mood => {
        expect(['happy', 'sad', 'excited', 'tired', 'sick', 'neutral']).toContain(mood);
      });
    });
  });

  describe('Stats Interfaces', () => {
    it('should create valid physical stats', () => {
      const stats: PhysicalStats = {
        hunger: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      };
      expect(stats.hunger).toBe(100);
      expect(stats.energy).toBe(100);
      expect(stats.health).toBe(100);
      expect(stats.cleanliness).toBe(100);
    });

    it('should create valid mental stats', () => {
      const stats: MentalStats = {
        happiness: 100,
        intelligence: 50,
        creativity: 50,
        discipline: 5,
      };
      expect(stats.happiness).toBe(100);
      expect(stats.intelligence).toBe(50);
      expect(stats.creativity).toBe(50);
      expect(stats.discipline).toBe(5);
    });

    it('should create valid social stats', () => {
      const stats: SocialStats = {
        affection: 50,
        trust: 50,
        playfulness: 50,
      };
      expect(stats.affection).toBe(50);
      expect(stats.trust).toBe(50);
      expect(stats.playfulness).toBe(50);
    });
  });

  describe('CareEvent', () => {
    it('should create a valid care event', () => {
      const event: CareEvent = {
        type: 'feed',
        timestamp: new Date(),
        statChanges: { hunger: 10, happiness: 5 },
      };
      expect(event.type).toBe('feed');
      expect(event.statChanges.hunger).toBe(10);
    });
  });

  describe('ConversationMemory', () => {
    it('should create valid conversation memory', () => {
      const memory: ConversationMemory = {
        recentTopics: ['school', 'friends'],
        userPreferences: {
          favoriteColor: 'blue',
          interests: ['science', 'art'],
          learningStyle: 'visual',
        },
        emotionalState: {
          lastMood: 'happy',
          moodHistory: [],
        },
        achievements: ['first_chat', 'learning_basics'],
        ongoingStories: [],
      };
      expect(memory.userPreferences.favoriteColor).toBe('blue');
      expect(memory.userPreferences.learningStyle).toBe('visual');
    });
  });

  describe('EvolutionStageConfig', () => {
    it('should create valid evolution stage config', () => {
      const config: EvolutionStageConfig = {
        stage: 'egg',
        durationHours: 24,
        minCareQuality: 50,
        nextStage: 'baby',
      };
      expect(config.stage).toBe('egg');
      expect(config.durationHours).toBe(24);
      expect(config.nextStage).toBe('baby');
    });
  });

  describe('StatDecayRates', () => {
    it('should create valid stat decay rates', () => {
      const rates: StatDecayRates = {
        hunger: 5,
        energy: 3,
        happiness: 2,
        cleanliness: 4,
      };
      expect(rates.hunger).toBe(5);
      expect(rates.energy).toBe(3);
    });
  });
});
