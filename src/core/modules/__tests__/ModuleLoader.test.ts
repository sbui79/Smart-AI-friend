import { ModuleLoader } from '../ModuleLoader';
import { Module, ModuleConfig } from '../types';

describe('ModuleLoader', () => {
  // Mock module for testing
  const mockModule: Module = {
    id: 'test-module',
    version: '1.0.0',
    requiredTier: 'full',
    requiredAgeGroup: ['15+'],
    parentalControl: true,
    requires: [],
    enhances: [],
    onLoad: jest.fn(),
    onUnload: jest.fn(),
  };

  const mockFreeModule: Module = {
    id: 'free-module',
    version: '1.0.0',
    requiredTier: 'free',
    requiredAgeGroup: ['5-10', '10-15', '15+'],
    parentalControl: false,
    requires: [],
    enhances: [],
    onLoad: jest.fn(),
    onUnload: jest.fn(),
  };

  beforeEach(() => {
    ModuleLoader.clearRegistry();
    jest.clearAllMocks();
  });

  describe('registerModule', () => {
    it('should register a module', () => {
      ModuleLoader.registerModule(mockModule);
      const modules = ModuleLoader.getRegisteredModules();
      expect(modules).toHaveLength(1);
      expect(modules[0].id).toBe('test-module');
    });

    it('should not register duplicate modules', () => {
      ModuleLoader.registerModule(mockModule);
      ModuleLoader.registerModule(mockModule);
      const modules = ModuleLoader.getRegisteredModules();
      expect(modules).toHaveLength(1);
    });
  });

  describe('calculateEnabledModules', () => {
    beforeEach(() => {
      ModuleLoader.registerModule(mockModule);
      ModuleLoader.registerModule(mockFreeModule);
    });

    it('should enable modules matching tier and age group', () => {
      const config: ModuleConfig = {
        tier: 'full',
        ageGroup: '15+',
        parentalOverrides: {},
      };

      const enabled = ModuleLoader.calculateEnabledModules(config);
      expect(enabled.map(m => m.id)).toContain('test-module');
      expect(enabled.map(m => m.id)).toContain('free-module');
    });

    it('should not enable modules above current tier', () => {
      const config: ModuleConfig = {
        tier: 'free',
        ageGroup: '15+',
        parentalOverrides: {},
      };

      const enabled = ModuleLoader.calculateEnabledModules(config);
      expect(enabled.map(m => m.id)).not.toContain('test-module');
      expect(enabled.map(m => m.id)).toContain('free-module');
    });

    it('should not enable modules for wrong age group', () => {
      const config: ModuleConfig = {
        tier: 'full',
        ageGroup: '5-10',
        parentalOverrides: {},
      };

      const enabled = ModuleLoader.calculateEnabledModules(config);
      expect(enabled.map(m => m.id)).not.toContain('test-module');
      expect(enabled.map(m => m.id)).toContain('free-module');
    });

    it('should respect parental overrides to disable modules', () => {
      const config: ModuleConfig = {
        tier: 'full',
        ageGroup: '15+',
        parentalOverrides: {
          'test-module': false,
        },
      };

      const enabled = ModuleLoader.calculateEnabledModules(config);
      expect(enabled.map(m => m.id)).not.toContain('test-module');
    });

    it('should not allow enabling modules disabled by parental control', () => {
      const config: ModuleConfig = {
        tier: 'free',
        ageGroup: '15+',
        parentalOverrides: {
          'test-module': true, // Try to force enable
        },
      };

      const enabled = ModuleLoader.calculateEnabledModules(config);
      expect(enabled.map(m => m.id)).not.toContain('test-module'); // Still blocked by tier
    });
  });

  describe('loadModules', () => {
    it('should call onLoad for all enabled modules', () => {
      ModuleLoader.registerModule(mockModule);
      ModuleLoader.registerModule(mockFreeModule);

      const config: ModuleConfig = {
        tier: 'full',
        ageGroup: '15+',
        parentalOverrides: {},
      };

      ModuleLoader.loadModules(config);

      expect(mockModule.onLoad).toHaveBeenCalled();
      expect(mockFreeModule.onLoad).toHaveBeenCalled();
    });

    it('should not call onLoad for disabled modules', () => {
      ModuleLoader.registerModule(mockModule);

      const config: ModuleConfig = {
        tier: 'free',
        ageGroup: '15+',
        parentalOverrides: {},
      };

      ModuleLoader.loadModules(config);

      expect(mockModule.onLoad).not.toHaveBeenCalled();
    });
  });

  describe('unloadModules', () => {
    it('should call onUnload for all loaded modules', () => {
      ModuleLoader.registerModule(mockModule);

      const config: ModuleConfig = {
        tier: 'full',
        ageGroup: '15+',
        parentalOverrides: {},
      };

      ModuleLoader.loadModules(config);
      ModuleLoader.unloadModules();

      expect(mockModule.onUnload).toHaveBeenCalled();
    });
  });
});
