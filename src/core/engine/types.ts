// Evolution stages
export type EvolutionStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder';

// Moods
export type Mood = 'happy' | 'sad' | 'excited' | 'tired' | 'sick' | 'neutral';

// Special states
export type SpecialState = 'hibernating' | 'evolving' | 'sick';

// Age modes (for future phases)
export type AgeMode = '5-10' | '10-15' | '15+';

// Stats interfaces
export interface PhysicalStats {
  hunger: number;        // 0-100
  energy: number;        // 0-100
  health: number;        // 0-100
  cleanliness: number;   // 0-100
}

export interface MentalStats {
  happiness: number;     // 0-100
  intelligence: number;  // 0-100
  creativity: number;    // 0-100
  discipline: number;    // 0-10
}

export interface SocialStats {
  affection: number;     // 0-100
  trust: number;         // 0-100
  playfulness: number;   // 0-100
}

// Care tracking
export interface CareEvent {
  type: 'feed' | 'play' | 'clean' | 'pet' | 'train' | 'gift';
  timestamp: Date;
  statChanges: Record<string, number>;
}

// Conversation memory (for AI module)
export interface MoodEntry {
  mood: Mood;
  timestamp: Date;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  progress: number; // 0-100
}

export interface ConversationMemory {
  recentTopics: string[];
  userPreferences: {
    favoriteColor?: string;
    interests: string[];
    learningStyle: 'visual' | 'verbal' | 'kinetic';
  };
  emotionalState: {
    lastMood: Mood;
    moodHistory: MoodEntry[];
  };
  achievements: string[];
  ongoingStories: Story[];
}

// Personality
export interface Personality {
  traits: string[];  // 'curious', 'shy', 'energetic', etc.
  preferences: Record<string, any>;
  memory: ConversationMemory[];
}

// Main Creature interface
export interface Creature {
  // Identity
  id: string;  // UUID
  name: string;
  species: string;
  generation: number;
  parentIds: [string | undefined, string | undefined];

  // Life stage
  evolutionStage: EvolutionStage;
  age: number;  // in seconds
  stageStartDate: Date;

  // Stats
  physical: PhysicalStats;
  mental: MentalStats;
  social: SocialStats;

  // Personality (drives AI conversations)
  personality: Personality;

  // State
  isAsleep: boolean;
  mood: Mood;
  specialStates: SpecialState[];

  // Care tracking
  careQuality: number;  // 0-100
  careHistory: CareEvent[];
  lastInteractionDate: Date;
}

// Evolution configuration
export interface EvolutionStageConfig {
  stage: EvolutionStage;
  durationHours: number;  // How long to stay in this stage
  minCareQuality: number;  // Minimum care quality to evolve (0-100)
  nextStage?: EvolutionStage;
}

// Stat decay rates (per hour) for Ages 15+
export interface StatDecayRates {
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
}
