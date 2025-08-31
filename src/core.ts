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
  abstract fromVector?(vectorString: string): SSVCDecision;
}

export interface SSVCDecision {
  evaluate(): SSVCOutcome;
  outcome?: SSVCOutcome;
  toVector?(): string | undefined;
  evaluationId?: string; // UUID for audit trail tracking
}

export interface AuditableDecision extends SSVCDecision {
  evaluationId: string; // Required for auditable decisions
  attachEvidence(decisionPoint: string, evidence: any): void;
  mapDataSource(decisionPoint: string, dataSource: any): void;
  getAuditEntry(): any;
  generateForensicReport(): any;
  getEvidence(): Record<string, any>;
  getDataSources(): Record<string, any>;
  getTimeline(): any[];
  getWrappedDecision(): SSVCDecision;
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
  public evaluationId?: string;
  
  constructor(methodology: string, options: Record<string, any> = {}) {
    this.methodology = methodology;
    this.options = options;
    // Note: We don't generate evaluationId here to maintain backward compatibility
    // It can be set by audit systems when needed
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
  
  static fromVector(vectorString: string): Decision {
    const registry = PluginRegistry.getInstance();
    
    // Parse the methodology name from vector string
    const match = vectorString.match(/^([A-Z_]+)v?\d*/);
    if (!match) {
      throw new Error(`Invalid vector string format: ${vectorString}`);
    }
    
    const methodologyPrefix = match[1];
    
    // Find plugin by matching vector prefix
    for (const plugin of registry.list()) {
      if (plugin.fromVector) {
        try {
          const parsedDecision = plugin.fromVector(vectorString);
          // Create a Decision that wraps the parsed decision
          const decision = new Decision(plugin.name.toLowerCase(), {});
          decision.outcome = parsedDecision.evaluate();
          // Override the evaluate method to return the parsed decision's outcome
          decision.evaluate = () => parsedDecision.evaluate();
          return decision;
        } catch (error) {
          // Try next plugin
          continue;
        }
      }
    }
    
    throw new Error(`No plugin found that can parse vector string: ${vectorString}`);
  }
  
  toVector(): string {
    const registry = PluginRegistry.getInstance();
    const plugin = registry.get(this.methodology);
    
    if (!plugin) {
      throw new Error(`Unknown methodology: ${this.methodology}`);
    }
    
    const decision = plugin.createDecision(this.options);
    if (decision.toVector) {
      const vector = decision.toVector();
      if (vector !== undefined) {
        return vector;
      }
    }
    
    throw new Error(`Vector string generation not supported for methodology: ${this.methodology}`);
  }
}