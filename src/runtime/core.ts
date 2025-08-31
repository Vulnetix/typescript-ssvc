/**
 * SSVC Runtime Evaluation Core
 * 
 * This module provides runtime YAML evaluation capabilities that bypass the code generation
 * entirely. It validates YAML against the schema and evaluates decision trees dynamically.
 */

import * as yaml from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import { SSVCOutcome } from '../core';

export interface RuntimeDecisionNode {
  type: string;
  children: Record<string, RuntimeDecisionNode | string>;
}

export interface RuntimeVectorMetadata {
  prefix: string;
  version: string;
  parameterMappings: {
    [paramName: string]: {
      abbrev: string;
      enumType: string;
      valueMappings?: { [enumValue: string]: string };
    };
  };
}

export interface RuntimeMethodology {
  name: string;
  description: string;
  version: string;
  url?: string;
  enums: Record<string, string[]>;
  priorityMap: Record<string, string>;
  decisionTree: RuntimeDecisionNode;
  defaultAction: string;
  vectorMetadata?: RuntimeVectorMetadata;
}

export class RuntimeMethodologyValidator {
  private ajv: Ajv;
  private schema: any;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    // Load the schema from the project
    const schemaPath = path.join(__dirname, '../../methodologies/schema.json');
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }

  validate(yamlContent: string): { valid: boolean; methodology?: RuntimeMethodology; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Parse YAML
      const methodology: RuntimeMethodology = yaml.parse(yamlContent);
      
      // Validate against JSON schema
      const valid = this.ajv.validate(this.schema, methodology);
      
      if (!valid && this.ajv.errors) {
        errors.push(...this.ajv.errors.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        ));
      }
      
      if (valid) {
        // Additional validation checks (reusing existing validation logic)
        this.validateTreeDepthConsistency(methodology, errors);
        this.validateEnumUsage(methodology, errors);
        this.validatePriorityMapping(methodology, errors);
        this.validateActionCoverage(methodology, errors);
      }
      
      return { 
        valid: errors.length === 0, 
        methodology: errors.length === 0 ? methodology : undefined,
        errors 
      };
      
    } catch (error) {
      errors.push(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  private validateTreeDepthConsistency(methodology: RuntimeMethodology, errors: string[]): void {
    const depths = this.getTreeDepths(methodology.decisionTree);
    const uniqueDepths = [...new Set(depths)];
    
    if (uniqueDepths.length > 1) {
      errors.push(`Inconsistent tree depth: found depths ${uniqueDepths.join(', ')}. All paths should have the same depth.`);
    }
  }

  private getTreeDepths(node: RuntimeDecisionNode, currentDepth: number = 0): number[] {
    const depths: number[] = [];
    
    for (const [key, child] of Object.entries(node.children)) {
      if (typeof child === 'string') {
        depths.push(currentDepth + 1);
      } else {
        depths.push(...this.getTreeDepths(child, currentDepth + 1));
      }
    }
    
    return depths;
  }

  private validateEnumUsage(methodology: RuntimeMethodology, errors: string[]): void {
    const declaredEnums = new Set(Object.keys(methodology.enums));
    const usedEnums = this.getUsedEnumTypes(methodology.decisionTree);
    
    // Check that all used enums are declared
    for (const used of usedEnums) {
      if (!declaredEnums.has(used)) {
        errors.push(`Decision tree uses undeclared enum type: ${used}`);
      }
    }
    
    // Check that all declared enums are used
    for (const declared of declaredEnums) {
      if (!usedEnums.has(declared)) {
        errors.push(`Declared enum type is never used: ${declared}`);
      }
    }
  }

  private getUsedEnumTypes(node: RuntimeDecisionNode): Set<string> {
    const types = new Set<string>();
    types.add(node.type);
    
    for (const child of Object.values(node.children)) {
      if (typeof child !== 'string') {
        for (const childType of this.getUsedEnumTypes(child)) {
          types.add(childType);
        }
      }
    }
    
    return types;
  }

  private validatePriorityMapping(methodology: RuntimeMethodology, errors: string[]): void {
    const actions = this.getLeafActions(methodology.decisionTree);
    actions.add(methodology.defaultAction);
    
    // Check that all actions have priority mappings
    for (const action of actions) {
      if (!methodology.priorityMap[action]) {
        errors.push(`Action '${action}' has no priority mapping`);
      }
    }
    
    // Check that all priority mappings have corresponding actions
    for (const action of Object.keys(methodology.priorityMap)) {
      if (!actions.has(action)) {
        errors.push(`Priority mapping exists for unused action: ${action}`);
      }
    }
  }

  private getLeafActions(node: RuntimeDecisionNode): Set<string> {
    const actions = new Set<string>();
    
    for (const child of Object.values(node.children)) {
      if (typeof child === 'string') {
        actions.add(child);
      } else {
        for (const action of this.getLeafActions(child)) {
          actions.add(action);
        }
      }
    }
    
    return actions;
  }

  private validateActionCoverage(methodology: RuntimeMethodology, errors: string[]): void {
    // This validation ensures enum combinations are covered or will use default action
    const enumTypes = this.getDecisionPath(methodology.decisionTree);
    const totalCombinations = enumTypes.reduce((total, enumType) => {
      const enumValues = methodology.enums[enumType];
      return total * (enumValues ? enumValues.length : 1);
    }, 1);
    
    const coveredPaths = this.getCoveredPaths(methodology.decisionTree);
    const coveragePercentage = (coveredPaths.length / totalCombinations) * 100;
    
    // Only warn if coverage is extremely low (< 25%) - sparse trees with defaults are valid
    if (coveragePercentage < 25) {
      console.warn(`⚠️  Warning: Very low decision coverage (${coveragePercentage.toFixed(1)}%) in ${methodology.name}. Ensure default action handles unmapped cases appropriately.`);
    }
  }

  private getDecisionPath(node: RuntimeDecisionNode): string[] {
    const path = [node.type];
    
    // Find the first non-leaf child to continue the path
    for (const child of Object.values(node.children)) {
      if (typeof child !== 'string') {
        path.push(...this.getDecisionPath(child));
        break; // We only need one path to determine the structure
      }
    }
    
    return path;
  }

  private getCoveredPaths(node: RuntimeDecisionNode, currentPath: string[] = []): string[][] {
    const paths: string[][] = [];
    
    for (const [value, child] of Object.entries(node.children)) {
      const newPath = [...currentPath, `${node.type}:${value}`];
      
      if (typeof child === 'string') {
        paths.push([...newPath, `ACTION:${child}`]);
      } else {
        paths.push(...this.getCoveredPaths(child, newPath));
      }
    }
    
    return paths;
  }
}

export class RuntimeDecisionTreeEvaluator {
  private methodology: RuntimeMethodology;
  
  constructor(methodology: RuntimeMethodology) {
    this.methodology = methodology;
  }

  evaluate(parameters: Record<string, any>): RuntimeOutcome {
    // Convert parameters to proper enum values
    const mappedParameters = this.mapParametersToEnums(parameters);
    
    // Traverse the decision tree
    const action = this.traverseTree(this.methodology.decisionTree, mappedParameters);
    
    return new RuntimeOutcome(action, this.methodology.priorityMap[action], this.methodology);
  }

  private mapParametersToEnums(parameters: Record<string, any>): Record<string, string> {
    const mapped: Record<string, string> = {};
    
    for (const [enumName, enumValues] of Object.entries(this.methodology.enums)) {
      // Try multiple parameter name variations
      const paramName = this.enumToParamName(enumName);
      const snakeCaseParam = this.camelToSnakeCase(paramName);
      
      let paramValue = parameters[paramName] || 
                      parameters[snakeCaseParam] || 
                      parameters[paramName + '_status'] ||
                      parameters[paramName + '_level'] ||
                      parameters[paramName + '_impact'];
      
      // For specific enum types, try additional variations
      if (!paramValue) {
        if (enumName === 'ExploitationStatus') {
          paramValue = parameters['exploitation'] || parameters['exploit'] || parameters['exploitationStatus'];
        } else if (enumName === 'AutomatableStatus') {
          paramValue = parameters['automatable'] || parameters['automatableStatus'];
        } else if (enumName === 'TechnicalImpactLevel') {
          paramValue = parameters['technical_impact'] || parameters['technicalImpact'] || parameters['technicalImpactLevel'];
        } else if (enumName === 'MissionWellbeingImpactLevel') {
          paramValue = parameters['mission_wellbeing'] || parameters['missionWellbeing'] || parameters['missionWellbeingImpact'] || parameters['missionWellbeingImpactLevel'];
        }
      }
      
      if (paramValue) {
        // Find matching enum value
        const enumValue = this.findMatchingEnumValue(paramValue, enumValues);
        if (enumValue) {
          mapped[enumName] = enumValue;
        }
      }
    }
    
    return mapped;
  }

  private enumToParamName(enumName: string): string {
    // Convert PascalCase enum name to camelCase parameter name
    // E.g., ExploitationStatus -> exploitation, TechnicalImpactLevel -> technicalImpact
    let paramName = enumName.charAt(0).toLowerCase() + enumName.slice(1);
    
    // Remove suffixes and convert to camelCase
    paramName = paramName.replace(/Status$/, '');
    paramName = paramName.replace(/Level$/, '');
    paramName = paramName.replace(/Impact$/, '');
    
    // Handle specific cases
    if (paramName === 'missionWellbeingImpact') {
      return 'mission_wellbeing';
    }
    if (paramName === 'technicalImpact') {
      return 'technical_impact';
    }
    
    return paramName;
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private findMatchingEnumValue(paramValue: any, enumValues: string[]): string | undefined {
    if (typeof paramValue !== 'string') {
      paramValue = String(paramValue);
    }
    
    // Direct match
    const directMatch = enumValues.find(v => v.toLowerCase() === paramValue.toLowerCase());
    if (directMatch) return directMatch;
    
    // Try uppercase
    const upperMatch = enumValues.find(v => v === paramValue.toUpperCase());
    if (upperMatch) return upperMatch;
    
    return undefined;
  }

  private traverseTree(node: RuntimeDecisionNode, parameters: Record<string, string>): string {
    const enumValue = parameters[node.type];
    
    if (!enumValue) {
      // No value provided for this decision point, use default action
      return this.methodology.defaultAction;
    }
    
    const child = node.children[enumValue];
    
    if (typeof child === 'string') {
      // This is a leaf node with an action
      return child;
    } else if (child) {
      // This is another decision node, recurse
      return this.traverseTree(child, parameters);
    } else {
      // No matching child, use default action
      return this.methodology.defaultAction;
    }
  }

  generateVectorString(parameters: Record<string, any>, outcome: RuntimeOutcome): string | undefined {
    if (!this.methodology.vectorMetadata) {
      return undefined;
    }
    
    const vectorMeta = this.methodology.vectorMetadata;
    const vectorSegments: string[] = [];
    
    for (const [paramName, mapping] of Object.entries(vectorMeta.parameterMappings)) {
      const actualParamName = this.enumToParamName(mapping.enumType);
      let paramValue = parameters[actualParamName] || parameters[this.camelToSnakeCase(actualParamName)];
      
      if (paramValue && mapping.valueMappings) {
        // Use value mapping if available
        const mappedValue = mapping.valueMappings[paramValue.toString().toUpperCase()];
        paramValue = mappedValue || paramValue;
      }
      
      vectorSegments.push(`${mapping.abbrev}:${paramValue || ''}`);
    }
    
    const timestamp = new Date().toISOString();
    return `${vectorMeta.prefix}${vectorMeta.version}/${vectorSegments.join('/')}/${timestamp}/`;
  }

  parseVectorString(vectorString: string): Record<string, any> | undefined {
    if (!this.methodology.vectorMetadata) {
      return undefined;
    }
    
    const vectorMeta = this.methodology.vectorMetadata;
    const regex = new RegExp(`^${vectorMeta.prefix}${vectorMeta.version}\\/(.+)\\/([0-9T:\\-\\.Z]+)\\/?$`);
    const match = vectorString.match(regex);
    
    if (!match) {
      throw new Error(`Invalid vector string format for ${this.methodology.name}: ${vectorString}`);
    }
    
    const paramsString = match[1];
    const params = new Map<string, string>();
    
    const paramPairs = paramsString.split('/');
    for (const pair of paramPairs) {
      const [key, value] = pair.split(':');
      if (key && value !== undefined) {
        params.set(key, value);
      }
    }
    
    const result: Record<string, any> = {};
    
    for (const [paramName, mapping] of Object.entries(vectorMeta.parameterMappings)) {
      const vectorValue = params.get(mapping.abbrev);
      if (vectorValue) {
        const actualParamName = this.enumToParamName(mapping.enumType);
        
        if (mapping.valueMappings) {
          // Use reverse mapping
          const reverseMapping = Object.fromEntries(
            Object.entries(mapping.valueMappings).map(([k, v]) => [v, k])
          );
          result[actualParamName] = reverseMapping[vectorValue] || vectorValue;
        } else {
          result[actualParamName] = vectorValue;
        }
      }
    }
    
    return result;
  }
}

export class RuntimeOutcome implements SSVCOutcome {
  public readonly action: string;
  public readonly priority: string;
  private methodology: RuntimeMethodology;
  
  constructor(action: string, priority: string, methodology: RuntimeMethodology) {
    this.action = action;
    this.priority = priority;
    this.methodology = methodology;
  }

  toString(): string {
    return `Action: ${this.action}, Priority: ${this.priority}`;
  }

  toJSON(): { action: string; priority: string } {
    return { action: this.action, priority: this.priority };
  }
}