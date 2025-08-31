# Runtime YAML Evaluation

The SSVC TypeScript library includes a powerful runtime YAML evaluation system that allows you to evaluate SSVC decisions using YAML methodology configurations loaded at runtime, bypassing the code generation process entirely.

## Overview

The runtime evaluation system provides a completely isolated alternative to the generated plugin approach:

- **No Code Generation Required**: Load and evaluate YAML methodologies directly at runtime
- **Dynamic Flexibility**: Switch between different methodologies without rebuilding
- **Schema Validation**: Uses the same validation rules as the generator
- **Full Compatibility**: Implements the same `SSVCOutcome` and plugin interfaces
- **Isolated Implementation**: Does not modify any existing generated plugin code

## Key Features

### 1. **Runtime YAML Loading**
Load methodology configurations from files, APIs, or strings at runtime.

### 2. **Dynamic Decision Tree Evaluation** 
Traverse decision trees dynamically without pre-generated TypeScript code.

### 3. **Flexible Parameter Mapping**
Supports multiple parameter naming conventions (camelCase, snake_case).

### 4. **Vector String Support**
Generate and parse vector strings if methodology includes vector metadata.

### 5. **Comprehensive Validation**
Validates YAML against the schema with detailed error reporting.

## Basic Usage

### Simple Decision Evaluation

```typescript
import { createRuntimeDecision, customFromYAML } from 'ssvc';
import * as fs from 'fs';

// Load YAML from file
const yamlContent = fs.readFileSync('custom-methodology.yaml', 'utf8');

// Method 1: Direct evaluation
const outcome = customFromYAML(yamlContent, {
  exploitation: 'active',
  automatable: 'yes',
  technical_impact: 'total',
  mission_wellbeing: 'high'
});

console.log(outcome); // { action: 'ACT', priority: 'IMMEDIATE' }

// Method 2: Create decision instance
const decision = createRuntimeDecision(yamlContent, {
  exploitation: 'active',
  automatable: 'yes',
  technical_impact: 'total', 
  mission_wellbeing: 'high'
});

const result = decision.evaluate();
console.log(result.action);   // 'ACT'
console.log(result.priority); // 'IMMEDIATE'
```

### Using Built-in Methodologies

```typescript
import { customFromYAML } from 'ssvc';
import * as fs from 'fs';

// Load the CISA methodology
const cisaYaml = fs.readFileSync('./methodologies/cisa.yaml', 'utf8');

const outcome = customFromYAML(cisaYaml, {
  exploitation: 'poc',
  automatable: 'no', 
  technical_impact: 'partial',
  mission_wellbeing: 'medium'
});

console.log(`Action: ${outcome.action}, Priority: ${outcome.priority}`);
// Action: TRACK_STAR, Priority: MEDIUM
```

## Advanced Usage

### YAML Validation

```typescript
import { validateYAML } from 'ssvc';

const validation = validateYAML(yamlContent);

if (validation.valid) {
  console.log('YAML is valid');
  console.log(`Methodology: ${validation.methodology?.name}`);
} else {
  console.error('Validation errors:');
  validation.errors.forEach(error => console.error(`- ${error}`));
}
```

### Runtime Plugin Creation

```typescript
import { createRuntimePlugin } from 'ssvc';

// Create a runtime plugin
const plugin = createRuntimePlugin(yamlContent);

console.log(`Plugin: ${plugin.name} v${plugin.version}`);
console.log(`Description: ${plugin.description}`);

// Create decisions from the plugin
const decision = plugin.createDecision({
  exploitation: 'active',
  automatable: 'yes'
  // ... other parameters
});

const outcome = decision.evaluate();
```

### Parameter Updates

```typescript
import { createRuntimeDecision } from 'ssvc';

const decision = createRuntimeDecision(yamlContent, {
  exploitation: 'none',
  automatable: 'no',
  technical_impact: 'partial',
  mission_wellbeing: 'low'
});

let outcome = decision.evaluate();
console.log(`Initial: ${outcome.action}`); // TRACK

// Update parameters
decision.updateParameters({
  exploitation: 'active',
  mission_wellbeing: 'high'
});

outcome = decision.evaluate();
console.log(`Updated: ${outcome.action}`); // ACT
```

### Batch Evaluation

```typescript
import { batchEvaluate } from 'ssvc';

const parameterSets = [
  { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
  { exploitation: 'poc', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'medium' },
  { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'low' }
];

const outcomes = batchEvaluate(yamlContent, parameterSets);

outcomes.forEach((outcome, index) => {
  console.log(`Scenario ${index + 1}: ${outcome.action} (${outcome.priority})`);
});
```

### Vector String Operations

```typescript
import { supportsVectorStrings, generateVectorString, parseVectorString } from 'ssvc';

// Check if methodology supports vector strings
if (supportsVectorStrings(yamlContent)) {
  // Generate vector string
  const vectorString = generateVectorString(yamlContent, {
    exploitation: 'active',
    automatable: 'yes',
    technical_impact: 'total',
    mission_wellbeing: 'high'
  });
  
  console.log(`Vector: ${vectorString}`);
  // CISA1.0/E:A/AU:Y/T:T/MW:H/2023-10-15T12:30:00.000Z/

  // Parse vector string back to parameters
  const parsedParams = parseVectorString(yamlContent, vectorString);
  console.log(parsedParams);
  // { exploitation: 'active', automatable: 'yes', ... }
}
```

### Methodology Introspection

```typescript
import { 
  getMethodologyMetadata,
  getMethodologyEnums,
  getMethodologyPriorityMap,
  RuntimeEvaluationStats 
} from 'ssvc';

// Get methodology metadata
const metadata = getMethodologyMetadata(yamlContent);
console.log(`${metadata.name} v${metadata.version}`);
console.log(metadata.description);

// Get available enums and values
const enums = getMethodologyEnums(yamlContent);
console.log('Available values:');
Object.entries(enums).forEach(([enumName, values]) => {
  console.log(`${enumName}: ${values.join(', ')}`);
});

// Get priority mappings
const priorityMap = getMethodologyPriorityMap(yamlContent);
console.log('Action priorities:', priorityMap);

// Generate statistics
const stats = new RuntimeEvaluationStats(yamlContent);
console.log(`Actions: ${stats.getAllActions().join(', ')}`);
console.log(`Priorities: ${stats.getAllPriorities().join(', ')}`);
console.log(`Decision tree depth: ${stats.getDecisionTreeDepth()}`);
console.log(`Total decision paths: ${stats.getTotalDecisionPaths()}`);
```

## Parameter Naming Flexibility

The runtime system supports multiple parameter naming conventions:

```typescript
// All of these work for the same enum (TechnicalImpactLevel):
const decision1 = createRuntimeDecision(yamlContent, {
  technical_impact: 'total'           // snake_case (preferred)
});

const decision2 = createRuntimeDecision(yamlContent, {
  technicalImpact: 'total'            // camelCase
});

const decision3 = createRuntimeDecision(yamlContent, {
  technicalImpactLevel: 'total'       // full enum name
});

// Case-insensitive enum values
const decision4 = createRuntimeDecision(yamlContent, {
  technical_impact: 'TOTAL'           // uppercase
});

const decision5 = createRuntimeDecision(yamlContent, {
  technical_impact: 'Total'           // mixed case
});
```

## Custom YAML Methodologies

You can create your own YAML methodology files following the schema:

```yaml
name: "Custom Methodology"
description: "My custom vulnerability assessment methodology"
version: "1.0"

enums:
  Severity:
    - LOW
    - MEDIUM  
    - HIGH
  Impact:
    - MINOR
    - MAJOR
    - CRITICAL

priorityMap:
  IGNORE: LOW
  MONITOR: MEDIUM
  REMEDIATE: HIGH

decisionTree:
  type: Severity
  children:
    LOW:
      type: Impact
      children:
        MINOR: IGNORE
        MAJOR: MONITOR
        CRITICAL: MONITOR
    MEDIUM:
      type: Impact
      children:
        MINOR: MONITOR
        MAJOR: REMEDIATE
        CRITICAL: REMEDIATE
    HIGH: REMEDIATE

defaultAction: IGNORE
```

```typescript
// Use your custom methodology
const customYaml = fs.readFileSync('custom-methodology.yaml', 'utf8');

const outcome = customFromYAML(customYaml, {
  severity: 'high',
  impact: 'critical'  
});

console.log(outcome); // { action: 'REMEDIATE', priority: 'HIGH' }
```

## Error Handling

```typescript
import { validateYAML, createRuntimeDecision } from 'ssvc';

try {
  // Validate YAML first
  const validation = validateYAML(yamlContent);
  if (!validation.valid) {
    console.error('YAML validation failed:');
    validation.errors.forEach(err => console.error(`- ${err}`));
    return;
  }

  // Create and evaluate decision
  const decision = createRuntimeDecision(yamlContent, parameters);
  const outcome = decision.evaluate();
  
  console.log(outcome);
  
} catch (error) {
  if (error.message.includes('Invalid YAML methodology')) {
    console.error('YAML parsing failed:', error.message);
  } else if (error.message.includes('Vector string generation not supported')) {
    console.error('This methodology does not support vector strings');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Performance Considerations

- **First-time Overhead**: YAML parsing and validation occur on first use
- **Caching**: Consider caching parsed methodologies for repeated use
- **Memory**: Runtime evaluation uses more memory than generated plugins
- **Speed**: Generated plugins are faster for high-frequency evaluation

```typescript
// For high-performance scenarios, cache the plugin
const pluginCache = new Map();

function getCachedPlugin(yamlContent: string) {
  const hash = require('crypto').createHash('sha1').update(yamlContent).digest('hex');
  
  if (!pluginCache.has(hash)) {
    pluginCache.set(hash, createRuntimePlugin(yamlContent));
  }
  
  return pluginCache.get(hash);
}

// Use cached plugin for better performance
const plugin = getCachedPlugin(yamlContent);
const outcome = plugin.createDecision(parameters).evaluate();
```

## Comparison: Runtime vs Generated

| Feature | Runtime Evaluation | Generated Plugins |
|---------|-------------------|-------------------|
| **Setup** | Load YAML at runtime | Run generator script |
| **Flexibility** | Dynamic methodology switching | Requires regeneration |
| **Performance** | Slower (parsing overhead) | Faster (compiled code) |
| **Memory** | Higher memory usage | Lower memory usage |
| **Development** | No build step required | Build step required |
| **Type Safety** | Runtime validation | Compile-time types |
| **Use Case** | Dynamic/configurable systems | High-performance applications |

## Integration Examples

### Web Service

```typescript
import express from 'express';
import { customFromYAML, validateYAML } from 'ssvc';

const app = express();
app.use(express.json());

app.post('/evaluate', (req, res) => {
  const { yamlContent, parameters } = req.body;
  
  // Validate YAML
  const validation = validateYAML(yamlContent);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  try {
    const outcome = customFromYAML(yamlContent, parameters);
    res.json({ success: true, outcome });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000);
```

### Configuration-Driven Assessment

```typescript
import { createRuntimeDecision } from 'ssvc';
import * as fs from 'fs';

class VulnerabilityAssessment {
  private methodologyCache = new Map<string, string>();
  
  async loadMethodology(name: string): Promise<string> {
    if (!this.methodologyCache.has(name)) {
      const yamlContent = fs.readFileSync(`methodologies/${name}.yaml`, 'utf8');
      this.methodologyCache.set(name, yamlContent);
    }
    return this.methodologyCache.get(name)!;
  }
  
  async assess(methodologyName: string, vulnerability: any) {
    const yamlContent = await this.loadMethodology(methodologyName);
    
    const decision = createRuntimeDecision(yamlContent, {
      exploitation: vulnerability.exploitationStatus,
      automatable: vulnerability.isAutomatable ? 'yes' : 'no',
      technical_impact: vulnerability.technicalImpact,
      mission_wellbeing: vulnerability.missionImpact
    });
    
    return decision.evaluate();
  }
}

// Usage
const assessor = new VulnerabilityAssessment();
const outcome = await assessor.assess('cisa', vulnerabilityData);
console.log(`Recommended action: ${outcome.action}`);
```

This runtime evaluation system provides complete flexibility for dynamic SSVC methodology evaluation while maintaining full compatibility with the existing plugin system.