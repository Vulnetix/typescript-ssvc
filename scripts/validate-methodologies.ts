#!/usr/bin/env npx ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

interface DecisionNode {
  type: string;
  children: Record<string, DecisionNode | string>;
}

interface Methodology {
  name: string;
  description: string;
  version: string;
  url?: string;
  enums: Record<string, string[]>;
  priorityMap: Record<string, string>;
  decisionTree: DecisionNode;
  defaultAction: string;
}

class MethodologyValidator {
  private ajv: Ajv;
  private schema: any;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    // Load the schema
    const schemaPath = path.join(__dirname, '../methodologies/schema.json');
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  }

  validateFile(filePath: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // Load and parse YAML
      const content = fs.readFileSync(filePath, 'utf8');
      const methodology: Methodology = yaml.parse(content);
      
      // Validate against JSON schema
      const valid = this.ajv.validate(this.schema, methodology);
      
      if (!valid && this.ajv.errors) {
        errors.push(...this.ajv.errors.map(err => 
          `${err.instancePath || 'root'}: ${err.message}`
        ));
      }
      
      if (valid) {
        // Additional validation checks
        this.validateTreeDepthConsistency(methodology, errors);
        this.validateEnumUsage(methodology, errors);
        this.validatePriorityMapping(methodology, errors);
        this.validateActionCoverage(methodology, errors);
      }
      
      return { valid: errors.length === 0, errors };
      
    } catch (error) {
      errors.push(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  private validateTreeDepthConsistency(methodology: Methodology, errors: string[]): void {
    const depths = this.getTreeDepths(methodology.decisionTree);
    const uniqueDepths = [...new Set(depths)];
    
    if (uniqueDepths.length > 1) {
      errors.push(`Inconsistent tree depth: found depths ${uniqueDepths.join(', ')}. All paths should have the same depth.`);
    }
  }

  private getTreeDepths(node: DecisionNode, currentDepth: number = 0): number[] {
    const depths: number[] = [];
    
    for (const [key, child] of Object.entries(node.children)) {
      if (typeof child === 'string') {
        // This is a leaf action
        depths.push(currentDepth + 1);
      } else {
        // This is another node, recurse
        depths.push(...this.getTreeDepths(child, currentDepth + 1));
      }
    }
    
    return depths;
  }

  private validateEnumUsage(methodology: Methodology, errors: string[]): void {
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

  private getUsedEnumTypes(node: DecisionNode): Set<string> {
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

  private validatePriorityMapping(methodology: Methodology, errors: string[]): void {
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

  private getLeafActions(node: DecisionNode): Set<string> {
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

  private validateActionCoverage(methodology: Methodology, errors: string[]): void {
    // This is a more complex validation that ensures all enum combinations
    // are either explicitly covered or will use the default action
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

  private getDecisionPath(node: DecisionNode): string[] {
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

  private getCoveredPaths(node: DecisionNode, currentPath: string[] = []): string[][] {
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

async function main() {
  const validator = new MethodologyValidator();
  const methodologiesDir = path.join(__dirname, '../methodologies');
  
  // Get all YAML files
  const yamlFiles = fs.readdirSync(methodologiesDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => path.join(methodologiesDir, file));
  
  let hasErrors = false;
  
  console.log('🔍 Validating SSVC Methodology Files...\n');
  
  for (const filePath of yamlFiles) {
    const fileName = path.basename(filePath);
    console.log(`Validating ${fileName}...`);
    
    const result = validator.validateFile(filePath);
    
    if (result.valid) {
      console.log(`✅ ${fileName} is valid\n`);
    } else {
      console.log(`❌ ${fileName} has errors:`);
      for (const error of result.errors) {
        console.log(`   • ${error}`);
      }
      console.log('');
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.log('❌ Validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All methodology files are valid!');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MethodologyValidator };