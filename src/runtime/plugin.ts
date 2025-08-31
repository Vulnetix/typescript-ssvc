/**
 * SSVC Runtime Plugin Wrapper
 * 
 * This module provides plugin wrappers that integrate runtime YAML evaluation
 * with the existing SSVC plugin architecture.
 */

import { SSVCDecision, SSVCOutcome, SSVCPlugin } from '../core';
import {
    RuntimeDecisionTreeEvaluator,
    RuntimeMethodology,
    RuntimeMethodologyValidator
} from './core';

export class RuntimeSSVCPlugin extends SSVCPlugin {
  private methodology: RuntimeMethodology;
  private evaluator: RuntimeDecisionTreeEvaluator;

  constructor(methodology: RuntimeMethodology) {
    super();
    this.methodology = methodology;
    this.evaluator = new RuntimeDecisionTreeEvaluator(methodology);
  }

  get name(): string {
    return this.methodology.name;
  }

  get description(): string {
    return this.methodology.description;
  }

  get version(): string {
    return this.methodology.version;
  }

  createDecision(options: Record<string, any>): SSVCDecision {
    return new RuntimeDecision(this.methodology, this.evaluator, options);
  }

  fromVector(vectorString: string): SSVCDecision {
    const parameters = this.evaluator.parseVectorString(vectorString);
    if (!parameters) {
      throw new Error(`Vector string parsing not supported for methodology: ${this.methodology.name}`);
    }
    return new RuntimeDecision(this.methodology, this.evaluator, parameters);
  }

  static fromYAML(yamlContent: string): RuntimeSSVCPlugin {
    const validator = new RuntimeMethodologyValidator();
    const result = validator.validate(yamlContent);
    
    if (!result.valid || !result.methodology) {
      throw new Error(`Invalid YAML methodology: ${result.errors.join(', ')}`);
    }
    
    return new RuntimeSSVCPlugin(result.methodology);
  }
}

export class RuntimeDecision implements SSVCDecision {
  private methodology: RuntimeMethodology;
  private evaluator: RuntimeDecisionTreeEvaluator;
  private parameters: Record<string, any>;
  public outcome?: SSVCOutcome;

  constructor(
    methodology: RuntimeMethodology, 
    evaluator: RuntimeDecisionTreeEvaluator, 
    parameters: Record<string, any>
  ) {
    this.methodology = methodology;
    this.evaluator = evaluator;
    this.parameters = parameters;
  }

  evaluate(): SSVCOutcome {
    const runtimeOutcome = this.evaluator.evaluate(this.parameters);
    this.outcome = {
      action: runtimeOutcome.action,
      priority: runtimeOutcome.priority
    };
    return this.outcome;
  }

  toVector(): string {
    if (!this.outcome) {
      this.evaluate();
    }
    
    const runtimeOutcome = this.evaluator.evaluate(this.parameters);
    const vectorString = this.evaluator.generateVectorString(this.parameters, runtimeOutcome);
    
    if (!vectorString) {
      throw new Error(`Vector string generation not supported for methodology: ${this.methodology.name}`);
    }
    
    return vectorString;
  }

  // Additional runtime-specific methods
  getMethodology(): RuntimeMethodology {
    return this.methodology;
  }

  getParameters(): Record<string, any> {
    return { ...this.parameters };
  }

  updateParameters(newParameters: Record<string, any>): void {
    this.parameters = { ...this.parameters, ...newParameters };
    this.outcome = undefined; // Clear cached outcome
  }

  getAvailableEnums(): Record<string, string[]> {
    return this.methodology.enums;
  }

  getPriorityMap(): Record<string, string> {
    return this.methodology.priorityMap;
  }
}

// Factory function for creating runtime decisions from YAML
export function createRuntimeDecisionFromYAML(
  yamlContent: string, 
  parameters: Record<string, any> = {}
): RuntimeDecision {
  const plugin = RuntimeSSVCPlugin.fromYAML(yamlContent);
  return plugin.createDecision(parameters) as RuntimeDecision;
}

// Utility function for validating YAML without creating a decision
export function validateYAMLMethodology(yamlContent: string): { 
  valid: boolean; 
  methodology?: RuntimeMethodology; 
  errors: string[] 
} {
  const validator = new RuntimeMethodologyValidator();
  return validator.validate(yamlContent);
}

// Utility function for evaluating YAML directly
export function customFromYAMLMethodology(
  yamlContent: string, 
  parameters: Record<string, any>
): SSVCOutcome {
  const decision = createRuntimeDecisionFromYAML(yamlContent, parameters);
  return decision.evaluate();
}