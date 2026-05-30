import { create } from 'zustand';
import { Module, ModuleConfig } from '../modules/types';
import { ModuleLoader } from '../modules/ModuleLoader';

/**
 * Module store state
 */
interface ModuleState {
  config: ModuleConfig;
  loadedModules: Module[];

  // Actions
  setConfig: (config: ModuleConfig) => void;
  reloadModules: () => void;
}

/**
 * Module store - manages module configuration and loading
 */
export const useModuleStore = create<ModuleState>((set, get) => ({
  config: {
    tier: 'free',
    ageGroup: '15+',
    parentalOverrides: {},
  },
  loadedModules: [],

  /**
   * Set module configuration
   */
  setConfig: (config: ModuleConfig) => {
    set({ config });
    // Reload modules with new config
    get().reloadModules();
  },

  /**
   * Reload modules based on current config
   */
  reloadModules: () => {
    const { config } = get();
    ModuleLoader.loadModules(config);
    const loadedModules = ModuleLoader.getLoadedModules();
    set({ loadedModules });
  },
}));
