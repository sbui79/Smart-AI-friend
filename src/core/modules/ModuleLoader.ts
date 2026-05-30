import { Module, ModuleConfig, PaymentTier, AgeGroup } from './types';

export class ModuleLoader {
  private static registry: Module[] = [];
  private static loadedModules: Module[] = [];

  /**
   * Tier hierarchy for comparison
   */
  private static readonly TIER_HIERARCHY: Record<PaymentTier, number> = {
    free: 0,
    full: 1,
    premium: 2,
  };

  /**
   * Register a module in the registry
   */
  static registerModule(module: Module): void {
    // Check if module already registered
    const exists = this.registry.find(m => m.id === module.id);
    if (exists) {
      return; // Skip duplicate registration
    }

    this.registry.push(module);
  }

  /**
   * Get all registered modules
   */
  static getRegisteredModules(): Module[] {
    return [...this.registry];
  }

  /**
   * Clear the module registry (for testing)
   */
  static clearRegistry(): void {
    this.registry = [];
    this.loadedModules = [];
  }

  /**
   * Calculate which modules should be enabled based on config
   */
  static calculateEnabledModules(config: ModuleConfig): Module[] {
    return this.registry.filter(module => {
      // Check tier requirement
      const userTierLevel = this.TIER_HIERARCHY[config.tier];
      const requiredTierLevel = this.TIER_HIERARCHY[module.requiredTier];

      if (userTierLevel < requiredTierLevel) {
        return false; // User tier too low
      }

      // Check age group requirement
      if (!module.requiredAgeGroup.includes(config.ageGroup)) {
        return false; // Module not available for this age group
      }

      // Check parental overrides (can only disable, not enable)
      if (module.parentalControl && config.parentalOverrides[module.id] === false) {
        return false; // Disabled by parental control
      }

      return true;
    });
  }

  /**
   * Load modules based on config
   */
  static loadModules(config: ModuleConfig): void {
    // Calculate enabled modules
    const enabledModules = this.calculateEnabledModules(config);

    // Unload any currently loaded modules
    this.unloadModules();

    // Load enabled modules
    this.loadedModules = enabledModules;

    // Call onLoad for each module
    enabledModules.forEach(module => {
      try {
        module.onLoad();
      } catch (error) {
        console.error(`Failed to load module ${module.id}:`, error);
      }
    });
  }

  /**
   * Unload all currently loaded modules
   */
  static unloadModules(): void {
    // Call onUnload for each loaded module
    this.loadedModules.forEach(module => {
      try {
        module.onUnload();
      } catch (error) {
        console.error(`Failed to unload module ${module.id}:`, error);
      }
    });

    this.loadedModules = [];
  }

  /**
   * Get currently loaded modules
   */
  static getLoadedModules(): Module[] {
    return [...this.loadedModules];
  }
}
