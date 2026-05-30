import { Creature } from '../engine/types';

// Payment tiers
export type PaymentTier = 'free' | 'full' | 'premium';

// Age groups
export type AgeGroup = '5-10' | '10-15' | '15+';

// Module interface
export interface Module {
  id: string;
  version: string;

  // Feature gating
  requiredTier: PaymentTier;
  requiredAgeGroup: AgeGroup[];
  parentalControl: boolean;  // Can parents disable this?

  // Dependencies
  requires: string[];  // Other module IDs this depends on
  enhances: string[];  // Optional modules that improve this

  // Lifecycle hooks
  onLoad: () => void;
  onUnload: () => void;
  onCreatureAction?: (actionType: string, creature: Creature) => void;
}

// Module registry entry
export interface ModuleDefinition extends Module {
  // Implementation references (actual implementations will vary by module)
  actions?: Record<string, Function>;
  services?: any[];
}

// Module loader config
export interface ModuleConfig {
  ageGroup: AgeGroup;
  tier: PaymentTier;
  parentalOverrides: Record<string, boolean>;  // moduleId -> enabled/disabled
}
