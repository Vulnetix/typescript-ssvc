/**
 * SSVC Core Library with Plugin Support
 * 
 * This module provides the core functionality for SSVC with a plugin-based architecture.
 */

export interface SSVCOutcome {
  action: string;
  priority: string;
}

export abstract class SSVCPlugin {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly version: string;
  
  abstract createDecision(options: Record<string, any>): SSVCDecision;
}

export interface SSVCDecision {
  evaluate(): SSVCOutcome;
  outcome?: SSVCOutcome;
}

export class PluginRegistry {
  private plugins: Map<string, SSVCPlugin> = new Map();
  private static instance: PluginRegistry;
  
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }
  
  register(plugin: SSVCPlugin): void {
    this.plugins.set(plugin.name.toLowerCase(), plugin);
  }
  
  get(name: string): SSVCPlugin | undefined {
    return this.plugins.get(name.toLowerCase());
  }
  
  list(): SSVCPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  has(name: string): boolean {
    return this.plugins.has(name.toLowerCase());
  }
}

export class Decision {
  private methodology: string;
  private options: Record<string, any>;
  public outcome?: SSVCOutcome;
  
  constructor(methodology: string, options: Record<string, any> = {}) {
    this.methodology = methodology;
    this.options = options;
  }
  
  evaluate(): SSVCOutcome {
    const registry = PluginRegistry.getInstance();
    const plugin = registry.get(this.methodology);
    
    if (!plugin) {
      throw new Error(`Unknown methodology: ${this.methodology}. Available methodologies: ${registry.list().map(p => p.name).join(', ')}`);
    }
    
    const decision = plugin.createDecision(this.options);
    this.outcome = decision.evaluate();
    return this.outcome;
  }
  
  static createDecision(methodology: string, options: Record<string, any> = {}): Decision {
    return new Decision(methodology, options);
  }
}