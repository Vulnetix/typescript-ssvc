/**
 * SSVC Runtime Evaluation API
 * 
 * This module provides the public API for runtime YAML methodology evaluation.
 * It allows users to evaluate SSVC decisions using YAML configurations loaded
 * at runtime without requiring code generation.
 */

import { SSVCOutcome } from '../core';
import {
    RuntimeMethodology
} from './core';
import {
    RuntimeDecision,
    RuntimeSSVCPlugin,
    createRuntimeDecisionFromYAML,
    customFromYAMLMethodology,
    validateYAMLMethodology
} from './plugin';

// Re-export core types for convenience
export {
    RuntimeDecisionNode, RuntimeMethodology, RuntimeOutcome, RuntimeVectorMetadata
} from './core';

export {
    RuntimeDecision, RuntimeSSVCPlugin, customFromYAMLMethodology, validateYAMLMethodology
} from './plugin';

/**
 * Create a runtime decision from YAML content and parameters
 * @param yamlContent The YAML methodology content
 * @param parameters The decision parameters
 * @returns A RuntimeDecision instance ready for evaluation
 */
export function createRuntimeDecision(
  yamlContent: string, 
  parameters: Record<string, any> = {}
): RuntimeDecision {
  return createRuntimeDecisionFromYAML(yamlContent, parameters);
}

/**
 * Evaluate a YAML methodology directly and return the outcome
 * @param yamlContent The YAML methodology content
 * @param parameters The decision parameters
 * @returns The SSVC outcome (action and priority)
 */
export function customFromYAML(
  yamlContent: string, 
  parameters: Record<string, any>
): SSVCOutcome {
  return customFromYAMLMethodology(yamlContent, parameters);
}

/**
 * Validate YAML methodology content against the schema
 * @param yamlContent The YAML content to validate
 * @returns Validation result with errors if any
 */
export function validateYAML(yamlContent: string): { 
  valid: boolean; 
  methodology?: RuntimeMethodology; 
  errors: string[] 
} {
  return validateYAMLMethodology(yamlContent);
}

/**
 * Create a runtime SSVC plugin from YAML content
 * @param yamlContent The YAML methodology content
 * @returns A RuntimeSSVCPlugin instance
 */
export function createRuntimePlugin(yamlContent: string): RuntimeSSVCPlugin {
  return RuntimeSSVCPlugin.fromYAML(yamlContent);
}

/**
 * Parse a vector string using a runtime methodology
 * @param yamlContent The YAML methodology content
 * @param vectorString The vector string to parse
 * @returns The parsed parameters
 */
export function parseVectorString(
  yamlContent: string, 
  vectorString: string
): Record<string, any> {
  const plugin = RuntimeSSVCPlugin.fromYAML(yamlContent);
  const decision = plugin.fromVector(vectorString);
  return (decision as RuntimeDecision).getParameters();
}

/**
 * Generate a vector string from parameters using a runtime methodology
 * @param yamlContent The YAML methodology content
 * @param parameters The decision parameters
 * @returns The generated vector string
 */
export function generateVectorString(
  yamlContent: string, 
  parameters: Record<string, any>
): string {
  const decision = createRuntimeDecisionFromYAML(yamlContent, parameters);
  return decision.toVector();
}

/**
 * Get available enums and their values from a YAML methodology
 * @param yamlContent The YAML methodology content
 * @returns The enum definitions
 */
export function getMethodologyEnums(yamlContent: string): Record<string, string[]> {
  const validation = validateYAMLMethodology(yamlContent);
  if (!validation.valid || !validation.methodology) {
    throw new Error(`Invalid YAML methodology: ${validation.errors.join(', ')}`);
  }
  return validation.methodology.enums;
}

/**
 * Get the priority map from a YAML methodology
 * @param yamlContent The YAML methodology content
 * @returns The action to priority mapping
 */
export function getMethodologyPriorityMap(yamlContent: string): Record<string, string> {
  const validation = validateYAMLMethodology(yamlContent);
  if (!validation.valid || !validation.methodology) {
    throw new Error(`Invalid YAML methodology: ${validation.errors.join(', ')}`);
  }
  return validation.methodology.priorityMap;
}

/**
 * Get methodology metadata (name, description, version, etc.)
 * @param yamlContent The YAML methodology content
 * @returns The methodology metadata
 */
export function getMethodologyMetadata(yamlContent: string): {
  name: string;
  description: string;
  version: string;
  url?: string;
} {
  const validation = validateYAMLMethodology(yamlContent);
  if (!validation.valid || !validation.methodology) {
    throw new Error(`Invalid YAML methodology: ${validation.errors.join(', ')}`);
  }
  
  const { name, description, version, url } = validation.methodology;
  return { name, description, version, url };
}

/**
 * Check if a methodology supports vector string generation
 * @param yamlContent The YAML methodology content
 * @returns True if vector string generation is supported
 */
export function supportsVectorStrings(yamlContent: string): boolean {
  const validation = validateYAMLMethodology(yamlContent);
  if (!validation.valid || !validation.methodology) {
    return false;
  }
  return !!validation.methodology.vectorMetadata;
}

/**
 * Batch evaluate multiple parameter sets against the same methodology
 * @param yamlContent The YAML methodology content
 * @param parameterSets Array of parameter objects
 * @returns Array of outcomes
 */
export function batchEvaluate(
  yamlContent: string, 
  parameterSets: Record<string, any>[]
): SSVCOutcome[] {
  const plugin = RuntimeSSVCPlugin.fromYAML(yamlContent);
  return parameterSets.map(parameters => {
    const decision = plugin.createDecision(parameters);
    return decision.evaluate();
  });
}

/**
 * Runtime evaluation statistics and utilities
 */
export class RuntimeEvaluationStats {
  private methodology: RuntimeMethodology;
  
  constructor(yamlContent: string) {
    const validation = validateYAMLMethodology(yamlContent);
    if (!validation.valid || !validation.methodology) {
      throw new Error(`Invalid YAML methodology: ${validation.errors.join(', ')}`);
    }
    this.methodology = validation.methodology;
  }

  /**
   * Get all possible actions from the methodology
   */
  getAllActions(): string[] {
    const actions = new Set<string>();
    this.collectActions(this.methodology.decisionTree, actions);
    actions.add(this.methodology.defaultAction);
    return Array.from(actions);
  }

  private collectActions(node: any, actions: Set<string>): void {
    for (const child of Object.values(node.children)) {
      if (typeof child === 'string') {
        actions.add(child);
      } else {
        this.collectActions(child, actions);
      }
    }
  }

  /**
   * Get all possible priorities from the methodology
   */
  getAllPriorities(): string[] {
    return Array.from(new Set(Object.values(this.methodology.priorityMap)));
  }

  /**
   * Get the decision tree depth
   */
  getDecisionTreeDepth(): number {
    return this.getMaxDepth(this.methodology.decisionTree);
  }

  private getMaxDepth(node: any, currentDepth: number = 0): number {
    let maxDepth = currentDepth;
    for (const child of Object.values(node.children)) {
      if (typeof child !== 'string') {
        maxDepth = Math.max(maxDepth, this.getMaxDepth(child, currentDepth + 1));
      } else {
        maxDepth = Math.max(maxDepth, currentDepth + 1);
      }
    }
    return maxDepth;
  }

  /**
   * Count total number of decision paths
   */
  getTotalDecisionPaths(): number {
    return this.countPaths(this.methodology.decisionTree);
  }

  private countPaths(node: any): number {
    let pathCount = 0;
    for (const child of Object.values(node.children)) {
      if (typeof child === 'string') {
        pathCount += 1;
      } else {
        pathCount += this.countPaths(child);
      }
    }
    return pathCount;
  }
}