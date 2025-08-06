import { 
  PluginRegistry, 
  SSVCPlugin, 
  Decision, 
  SSVCDecision, 
  SSVCOutcome 
} from './core';

// Mock plugin for testing
class MockPlugin extends SSVCPlugin {
  readonly name = 'MockPlugin';
  readonly description = 'Mock plugin for testing';
  readonly version = '1.0.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new MockDecision(options);
  }
}

class MockDecision implements SSVCDecision {
  private options: Record<string, any>;
  public outcome?: SSVCOutcome;
  
  constructor(options: Record<string, any>) {
    this.options = options;
  }
  
  evaluate(): SSVCOutcome {
    const mockOutcome = {
      action: this.options.severity === 'high' ? 'immediate' : 'track',
      priority: this.options.severity === 'high' ? 'high' : 'low'
    };
    this.outcome = mockOutcome;
    return mockOutcome;
  }
}

// Another mock plugin to test multiple plugins
class AnotherMockPlugin extends SSVCPlugin {
  readonly name = 'AnotherMock';
  readonly description = 'Another mock plugin';
  readonly version = '2.0.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new MockDecision(options);
  }
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry;
  
  beforeEach(() => {
    // Create a fresh registry for each test
    registry = new (PluginRegistry as any)();
    (PluginRegistry as any).instance = registry;
  });
  
  afterEach(() => {
    // Clean up singleton
    (PluginRegistry as any).instance = undefined;
  });
  
  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const registry1 = PluginRegistry.getInstance();
      const registry2 = PluginRegistry.getInstance();
      expect(registry1).toBe(registry2);
    });
  });
  
  describe('plugin registration', () => {
    it('should register a plugin', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      expect(registry.has('mockplugin')).toBe(true);
      expect(registry.get('mockplugin')).toBe(mockPlugin);
    });
    
    it('should handle case-insensitive plugin names', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      expect(registry.has('MOCKPLUGIN')).toBe(true);
      expect(registry.has('mockplugin')).toBe(true);
      expect(registry.get('MOCKPLUGIN')).toBe(mockPlugin);
    });
    
    it('should list all registered plugins', () => {
      const mockPlugin1 = new MockPlugin();
      const mockPlugin2 = new AnotherMockPlugin();
      
      registry.register(mockPlugin1);
      registry.register(mockPlugin2);
      
      const plugins = registry.list();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(mockPlugin1);
      expect(plugins).toContain(mockPlugin2);
    });
    
    it('should return undefined for non-existent plugins', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
      expect(registry.has('nonexistent')).toBe(false);
    });
    
    it('should overwrite existing plugin with same name', () => {
      const mockPlugin1 = new MockPlugin();
      const mockPlugin2 = new AnotherMockPlugin();
      
      // Override the name to test overwriting
      (mockPlugin2 as any).name = 'MockPlugin';
      
      registry.register(mockPlugin1);
      registry.register(mockPlugin2);
      
      expect(registry.get('mockplugin')).toBe(mockPlugin2);
      expect(registry.list()).toHaveLength(1);
    });
  });
});

describe('Decision', () => {
  let registry: PluginRegistry;
  
  beforeEach(() => {
    registry = new (PluginRegistry as any)();
    (PluginRegistry as any).instance = registry;
  });
  
  afterEach(() => {
    (PluginRegistry as any).instance = undefined;
  });
  
  describe('plugin-based decisions', () => {
    it('should create and evaluate decisions using registered plugins', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      const decision = new Decision('MockPlugin', { severity: 'high' });
      const outcome = decision.evaluate();
      
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('high');
      expect(decision.outcome).toBe(outcome);
    });
    
    it('should handle different plugin options', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      const decision = new Decision('MockPlugin', { severity: 'low' });
      const outcome = decision.evaluate();
      
      expect(outcome.action).toBe('track');
      expect(outcome.priority).toBe('low');
    });
    
    it('should throw error for unknown methodology', () => {
      expect(() => {
        const decision = new Decision('UnknownMethodology', {});
        decision.evaluate();
      }).toThrow('Unknown methodology: UnknownMethodology. Available methodologies: ');
    });
    
    it('should include available methodologies in error message', () => {
      const mockPlugin1 = new MockPlugin();
      const mockPlugin2 = new AnotherMockPlugin();
      registry.register(mockPlugin1);
      registry.register(mockPlugin2);
      
      expect(() => {
        const decision = new Decision('UnknownMethodology', {});
        decision.evaluate();
      }).toThrow('Unknown methodology: UnknownMethodology. Available methodologies: MockPlugin, AnotherMock');
    });
    
    it('should handle empty options', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      const decision = new Decision('MockPlugin');
      const outcome = decision.evaluate();
      
      expect(outcome.action).toBe('track'); // default behavior
      expect(outcome.priority).toBe('low');
    });
  });
  
  describe('static factory method', () => {
    it('should create decision using static method', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      const decision = Decision.createDecision('MockPlugin', { severity: 'high' });
      expect(decision).toBeInstanceOf(Decision);
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
    });
    
    it('should create decision with empty options using static method', () => {
      const mockPlugin = new MockPlugin();
      registry.register(mockPlugin);
      
      const decision = Decision.createDecision('MockPlugin');
      expect(decision).toBeInstanceOf(Decision);
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('track');
    });
  });
});

describe('SSVCPlugin abstract class', () => {
  it('should require implementation of abstract properties and methods', () => {
    class TestPlugin extends SSVCPlugin {
      readonly name = 'TestPlugin';
      readonly description = 'Test plugin';
      readonly version = '1.0.0';
      
      createDecision(options: Record<string, any>): SSVCDecision {
        return new MockDecision(options);
      }
    }
    
    const plugin = new TestPlugin();
    expect(plugin.name).toBe('TestPlugin');
    expect(plugin.description).toBe('Test plugin');
    expect(plugin.version).toBe('1.0.0');
    expect(typeof plugin.createDecision).toBe('function');
  });
});

describe('Integration tests', () => {
  let registry: PluginRegistry;
  
  beforeEach(() => {
    registry = new (PluginRegistry as any)();
    (PluginRegistry as any).instance = registry;
  });
  
  afterEach(() => {
    (PluginRegistry as any).instance = undefined;
  });
  
  it('should support multiple plugins with different outcomes', () => {
    const plugin1 = new MockPlugin();
    const plugin2 = new AnotherMockPlugin();
    
    registry.register(plugin1);
    registry.register(plugin2);
    
    const decision1 = new Decision('MockPlugin', { severity: 'high' });
    const outcome1 = decision1.evaluate();
    
    const decision2 = new Decision('AnotherMock', { severity: 'low' });
    const outcome2 = decision2.evaluate();
    
    expect(outcome1.action).toBe('immediate');
    expect(outcome2.action).toBe('track');
  });
  
  it('should maintain state between plugin calls', () => {
    const mockPlugin = new MockPlugin();
    registry.register(mockPlugin);
    
    const decision1 = new Decision('MockPlugin', { severity: 'high' });
    const decision2 = new Decision('MockPlugin', { severity: 'low' });
    
    const outcome1 = decision1.evaluate();
    const outcome2 = decision2.evaluate();
    
    // Each decision should maintain its own outcome
    expect(decision1.outcome?.action).toBe('immediate');
    expect(decision2.outcome?.action).toBe('track');
    expect(outcome1.action).toBe('immediate');
    expect(outcome2.action).toBe('track');
  });
});