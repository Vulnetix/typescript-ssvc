#!/usr/bin/env ts-node
/**
 * SSVC Plugin Generator for TypeScript
 * 
 * Generates TypeScript plugin modules from YAML decision tree definitions.
 * Also generates markdown documentation with mermaid diagrams.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface EnumDefinition {
  [enumName: string]: string[];
}

interface DecisionNode {
  type?: string;
  children?: { [key: string]: DecisionNode | string };
}

interface VectorMetadata {
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

interface PluginConfig {
  name: string;
  description: string;
  version: string;
  url?: string;
  enums: EnumDefinition;
  priorityMap: { [action: string]: string };
  decisionTree: DecisionNode;
  defaultAction?: string;
  vectorMetadata?: VectorMetadata;
}

class SSVCPluginGenerator {
  private yamlDir: string;
  private outputDir: string;
  private docsDir: string;

  constructor(yamlDir: string, outputDir: string, docsDir: string) {
    this.yamlDir = yamlDir;
    this.outputDir = outputDir;
    this.docsDir = docsDir;
  }

  generateAll(): void {
    const yamlFiles = fs.readdirSync(this.yamlDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.join(this.yamlDir, file));

    for (const yamlFile of yamlFiles) {
      console.log(`Processing ${path.basename(yamlFile)}...`);
      this.generatePlugin(yamlFile);
    }
  }

  generatePlugin(yamlFile: string): void {
    const yamlContent = fs.readFileSync(yamlFile, 'utf8');
    const config = yaml.parse(yamlContent) as PluginConfig;
    
    const pluginName = path.basename(yamlFile, path.extname(yamlFile));
    
    // Generate TypeScript plugin
    const tsCode = this.generateTypeScriptPlugin(config, pluginName);
    const tsFile = path.join(this.outputDir, `${pluginName}-generated.ts`);
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    fs.writeFileSync(tsFile, tsCode);
    
    // Generate markdown documentation
    const markdownCode = this.generateMarkdownDocs(config, pluginName);
    const docsFile = path.join(this.docsDir, `${pluginName}.md`);
    
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }
    
    fs.writeFileSync(docsFile, markdownCode);
    
    console.log(`Generated ${tsFile} and ${docsFile}`);
  }

  private generateTypeScriptPlugin(config: PluginConfig, pluginName: string): string {
    const enumsCode = this.generateEnums(config.enums);
    const priorityMapCode = this.generatePriorityMap(config.priorityMap, config.enums);
    const outcomeClassCode = this.generateOutcomeClass(pluginName);
    const decisionClassCode = this.generateDecisionClass(config, pluginName);

    return `/**
 * ${config.name} Plugin
 * 
 * ${config.description}
 * Generated from YAML configuration.
 */

${enumsCode}

${priorityMapCode}

${outcomeClassCode}

${decisionClassCode}
`;
  }

  private generateEnums(enums: EnumDefinition): string {
    const enumClasses: string[] = [];

    for (const [enumName, values] of Object.entries(enums)) {
      const enumValues: string[] = [];
      
      for (const value of values) {
        const enumValue = typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value;
        const stringValue = typeof value === 'boolean' ? (value ? 'yes' : 'no') : value.toLowerCase();
        enumValues.push(`  ${enumValue} = "${stringValue}"`);
      }
      
      const enumClass = `export enum ${enumName} {\n${enumValues.join(',\n')}\n}`;
      enumClasses.push(enumClass);
    }

    return enumClasses.join('\n\n');
  }

  private generatePriorityMap(priorityMap: { [action: string]: string }, enums: EnumDefinition): string {
    // Generate action and priority enums dynamically from priorityMap
    const actions = Object.keys(priorityMap);
    const priorities = [...new Set(Object.values(priorityMap))];

    // Generate ActionType enum
    const actionEnumValues = actions.map(action => `  ${action} = '${action}'`).join(',\n');
    const actionEnum = `export enum ActionType {\n${actionEnumValues}\n}`;

    // Generate PriorityLevel enum
    const priorityEnumValues = priorities.map(priority => `  ${priority.toUpperCase()} = '${priority}'`).join(',\n');
    const priorityEnum = `export enum PriorityLevel {\n${priorityEnumValues}\n}`;

    // Generate priority mappings
    const mappings: string[] = [];
    for (const [action, priority] of Object.entries(priorityMap)) {
      mappings.push(`  [ActionType.${action}]: PriorityLevel.${priority.toUpperCase()}`);
    }

    const priorityMapCode = `export const priorityMap = {\n${mappings.join(',\n')}\n};`;

    return `${actionEnum}\n\n${priorityEnum}\n\n${priorityMapCode}`;
  }

  private generateOutcomeClass(pluginName: string): string {
    const className = `Outcome${this.toPascalCase(pluginName)}`;
    
    return `export class ${className} {
  priority: string;
  action: string;

  constructor(action: any) {
    this.priority = (priorityMap as any)[action];
    this.action = action;
  }
}`;
  }

  private generateDecisionClass(config: PluginConfig, pluginName: string): string {
    const className = `Decision${this.toPascalCase(pluginName)}`;
    const outcomeClass = `Outcome${this.toPascalCase(pluginName)}`;

    // Get decision point enums (exclude ActionType and Priority)
    const decisionEnums: string[] = [];
    for (const enumName of Object.keys(config.enums)) {
      if (!enumName.includes('ActionType') && !enumName.includes('Priority')) {
        decisionEnums.push(enumName);
      }
    }

    // Generate constructor parameters interface
    const interfaceName = `${className}Options`;
    const interfaceProps: string[] = [];
    const typeConversions: string[] = [];
    const attributes: string[] = [];
    const validations: string[] = [];

    for (const enumName of decisionEnums) {
      const paramName = this.enumToParamName(enumName);
      interfaceProps.push(`  ${paramName}?: ${enumName} | string;`);
      
      typeConversions.push(`    if (typeof options.${paramName} === 'string') {`);
      typeConversions.push(`      this.${paramName} = Object.values(${enumName}).find(v => v === options.${paramName}) as ${enumName} || undefined;`);
      typeConversions.push(`    } else {`);
      typeConversions.push(`      this.${paramName} = options.${paramName};`);
      typeConversions.push(`    }`);
      
      attributes.push(`  ${paramName}?: ${enumName};`);
      validations.push(`this.${paramName} !== undefined`);
    }

    // Generate decision tree traversal
    const treeMethod = this.generateDecisionTreeMethod(config.decisionTree, config.defaultAction || 'TRACK');

    return `interface ${interfaceName} {
${interfaceProps.join('\n')}
}

export class ${className} {
${attributes.join('\n')}
  outcome?: ${outcomeClass};

  constructor(options: ${interfaceName} = {}) {
${typeConversions.join('\n')}
    
    // Always try to evaluate if we have the minimum required parameters
    if (${validations.join(' && ')}) {
      this.outcome = this.evaluate();
    }
  }

  evaluate(): ${outcomeClass} {
    const action = this.traverseTree();
    this.outcome = new ${outcomeClass}(action);
    return this.outcome;
  }

${this.generateVectorMethods(config, className)}

${treeMethod}
}`;
  }

  private generateVectorMethods(config: PluginConfig, className: string): string {
    if (!config.vectorMetadata) {
      return '';
    }

    const vectorMeta = config.vectorMetadata;

    // Generate toVector method
    const toVectorParams: string[] = [];
    for (const [paramName, mapping] of Object.entries(vectorMeta.parameterMappings)) {
      const actualParamName = this.enumToParamName(mapping.enumType);
      const valueMappings = mapping.valueMappings || {};
      const hasValueMappings = Object.keys(valueMappings).length > 0;

      if (hasValueMappings) {
        toVectorParams.push(`    const ${paramName}Vector = ${JSON.stringify(valueMappings)}[this.${actualParamName}?.toString?.()?.toUpperCase?.() ?? ''] || this.${actualParamName} || '';`);
      } else {
        toVectorParams.push(`    const ${paramName}Vector = this.${actualParamName} || '';`);
      }
    }

    const vectorSegments = Object.entries(vectorMeta.parameterMappings)
      .map(([paramName, mapping]) => `${mapping.abbrev}:\${${paramName}Vector}`)
      .join('/');

    const fromVectorValidations: string[] = [];
    const fromVectorParams: string[] = [];

    for (const [paramName, mapping] of Object.entries(vectorMeta.parameterMappings)) {
      const actualParamName = this.enumToParamName(mapping.enumType);
      const reverseValueMappings = mapping.valueMappings ? Object.fromEntries(
        Object.entries(mapping.valueMappings).map(([k, v]) => [v, k])
      ) : {};

      fromVectorValidations.push(`    const ${paramName}Match = params.get('${mapping.abbrev}');`);

      if (Object.keys(reverseValueMappings).length > 0) {
        fromVectorParams.push(`      ${actualParamName}: ${JSON.stringify(reverseValueMappings)}[${paramName}Match || ''] || ${paramName}Match,`);
      } else {
        fromVectorParams.push(`      ${actualParamName}: ${paramName}Match,`);
      }
    }

    return `  toVector(): string {
    if (!this.outcome) {
      this.evaluate();
    }

${toVectorParams.join('\n')}
    const timestamp = new Date().toISOString();
    return \`${vectorMeta.prefix}${vectorMeta.version}/${vectorSegments}/\${timestamp}/\`;
  }

  static fromVector(vectorString: string): ${className} {
    const regex = /^${vectorMeta.prefix}${vectorMeta.version}\\/(.+)\\/([0-9T:\\-\\.Z]+)\\/?$/;
    const match = vectorString.match(regex);

    if (!match) {
      throw new Error(\`Invalid vector string format for ${config.name}: \${vectorString}\`);
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

${fromVectorValidations.join('\n')}

    return new ${className}({
${fromVectorParams.join('\n')}
    });
  }`;
  }

  private generateDecisionTreeMethod(tree: DecisionNode, defaultAction: string): string {
    const generateTraversalCode = (node: DecisionNode | string, depth: number = 2): string => {
      const indent = '  '.repeat(depth);
      
      if (typeof node === 'string') {
        // Leaf node - return action
        return `${indent}return ActionType.${node};`;
      }
      
      if (!node.type || !node.children) {
        return `${indent}return ActionType.${defaultAction};`;
      }
      
      const paramName = this.enumToParamName(node.type);
      const codeLines: string[] = [];
      
      const children = Object.entries(node.children);
      for (let i = 0; i < children.length; i++) {
        const [value, childNode] = children[i];
        const condition = i === 0 ? 'if' : 'else if';
        
        // Handle enum values correctly
        const enumValue = typeof value === 'boolean' ? (value ? 'YES' : 'NO') : value;
        codeLines.push(`${indent}${condition} (this.${paramName} === ${node.type}.${enumValue}) {`);
        
        if (typeof childNode === 'string') {
          // Direct action
          codeLines.push(`${indent}  return ActionType.${childNode};`);
        } else {
          // Recursive traversal
          const childCode = generateTraversalCode(childNode, depth + 1);
          codeLines.push(childCode);
        }
        
        codeLines.push(`${indent}}`);
      }
      
      return codeLines.join('\n');
    };

    const traversalCode = generateTraversalCode(tree);

    return `  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
${traversalCode}
    
    // Default action for unmapped paths
    return ActionType.${defaultAction};
  }`;
  }

  private generateMarkdownDocs(config: PluginConfig, pluginName: string): string {
    const mermaidDiagram = this.generateMermaidDiagram(config.decisionTree, pluginName);
    
    return `# ${config.name}

${config.description}

**Version:** ${config.version}
${config.url ? `**URL:** ${config.url}` : ''}

## Decision Tree

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

## Enums

${Object.entries(config.enums).map(([enumName, values]) => 
  `### ${enumName}\n- ${values.join('\n- ')}`
).join('\n\n')}

## Priority Mapping

${Object.entries(config.priorityMap).map(([action, priority]) => 
  `- **${action}** → ${priority}`
).join('\n')}

## Usage

\`\`\`typescript
import { Decision${this.toPascalCase(pluginName)} } from './plugins/${pluginName}';

const decision = new Decision${this.toPascalCase(pluginName)}({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
\`\`\`

${this.generateVectorDocumentation(config, pluginName)}
`;
  }

  private generateVectorDocumentation(config: PluginConfig, pluginName: string): string {
    if (!config.vectorMetadata) {
      return '';
    }

    const vectorMeta = config.vectorMetadata;
    const className = `Decision${this.toPascalCase(pluginName)}`;

    // Generate parameter abbreviations table
    const paramTable = Object.entries(vectorMeta.parameterMappings)
      .map(([paramName, mapping]) => {
        const valueMappings = mapping.valueMappings;
        if (valueMappings && Object.keys(valueMappings).length > 0) {
          const valueExamples = Object.entries(valueMappings)
            .map(([key, value]) => `${key}→${value}`)
            .join(', ');
          return `| ${paramName} | ${mapping.abbrev} | ${valueExamples} |`;
        }
        return `| ${paramName} | ${mapping.abbrev} | Direct mapping |`;
      })
      .join('\n');

    // Generate example vector strings
    const firstParams = Object.keys(vectorMeta.parameterMappings);
    const exampleParams: string[] = [];
    const vectorSegments: string[] = [];

    for (const [paramName, mapping] of Object.entries(vectorMeta.parameterMappings)) {
      const firstEnumValue = Object.keys(mapping.valueMappings || {})[0];
      if (firstEnumValue) {
        exampleParams.push(`  ${paramName}: "${firstEnumValue}"`);
        vectorSegments.push(`${mapping.abbrev}:${mapping.valueMappings![firstEnumValue]}`);
      } else {
        exampleParams.push(`  ${paramName}: "example"`);
        vectorSegments.push(`${mapping.abbrev}:example`);
      }
    }

    const exampleVectorString = `${vectorMeta.prefix}${vectorMeta.version}/${vectorSegments.join('/')}/2024-07-23T20:34:21.000Z/`;

    return `## Vector String Support

This methodology supports SSVC vector strings for compact representation and interchange.

### Parameter Abbreviations

| Parameter | Abbreviation | Value Mappings |
|-----------|--------------|----------------|
${paramTable}

### Vector String Format

\`\`\`
${vectorMeta.prefix}${vectorMeta.version}/[parameters]/[timestamp]/
\`\`\`

### Example Usage

\`\`\`typescript
// Generate vector string from decision
const decision = new ${className}({
${exampleParams.join(',\n')}
});

const vectorString = decision.toVector();
console.log(vectorString);
// Output: ${exampleVectorString}

// Parse vector string to create decision
const parsedDecision = ${className}.fromVector("${exampleVectorString}");
const outcome = parsedDecision.evaluate();
\`\`\``;
  }

  private generateMermaidDiagram(tree: DecisionNode, pluginName: string): string {
    let nodeId = 0;
    const nodes: string[] = [];
    const edges: string[] = [];

    const processNode = (node: DecisionNode | string, parentId?: number, edgeLabel?: string): number => {
      const currentId = nodeId++;
      
      if (typeof node === 'string') {
        // Leaf node
        nodes.push(`  ${currentId}[${node}]`);
        nodes.push(`  ${currentId} --> ${currentId}_end((End))`);
        
        if (parentId !== undefined && edgeLabel) {
          edges.push(`  ${parentId} -->|${edgeLabel}| ${currentId}`);
        }
        
        return currentId;
      }
      
      if (!node.type || !node.children) {
        return currentId;
      }
      
      // Decision node
      nodes.push(`  ${currentId}{${node.type}}`);
      
      if (parentId !== undefined && edgeLabel) {
        edges.push(`  ${parentId} -->|${edgeLabel}| ${currentId}`);
      }
      
      // Process children
      for (const [value, childNode] of Object.entries(node.children)) {
        processNode(childNode, currentId, value);
      }
      
      return currentId;
    };

    processNode(tree);

    return `flowchart TD\n${nodes.join('\n')}\n${edges.join('\n')}`;
  }

  private enumToParamName(enumName: string): string {
    // Remove common suffixes and convert to camelCase
    let paramName = enumName.replace(/Status$/, '').replace(/Level$/, '').replace(/_/g, '');
    
    // Convert PascalCase to camelCase
    return paramName.charAt(0).toLowerCase() + paramName.slice(1);
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
  }

  private getExportList(config: PluginConfig, pluginName: string): string {
    const exports: string[] = [];
    
    // Add all enums
    exports.push(...Object.keys(config.enums));
    
    // Add priority map with alias to avoid conflicts
    exports.push(`priorityMap as ${pluginName}PriorityMap`);
    
    // Add outcome and decision classes
    exports.push(`Outcome${this.toPascalCase(pluginName)}`);
    exports.push(`Decision${this.toPascalCase(pluginName)}`);
    
    return exports.join(', ');
  }
}

// Main execution
if (require.main === module) {
  const yamlDir = path.join(__dirname, '..', 'methodologies');
  const outputDir = path.join(__dirname, '..', 'src', 'plugins');
  const docsDir = path.join(__dirname, '..', 'docs');

  const generator = new SSVCPluginGenerator(yamlDir, outputDir, docsDir);
  generator.generateAll();
}