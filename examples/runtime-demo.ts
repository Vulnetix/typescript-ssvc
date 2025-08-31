#!/usr/bin/env ts-node
/**
 * Runtime YAML Evaluation Demo
 * 
 * This script demonstrates the new runtime YAML evaluation capabilities
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    batchEvaluate,
    createRuntimePlugin,
    customFromYAML,
    generateVectorString,
    parseVectorString,
    RuntimeEvaluationStats,
    supportsVectorStrings,
    validateYAML
} from '../src/runtime';

console.log('🚀 SSVC Runtime YAML Evaluation Demo\n');

async function runDemo() {
  // Load CISA methodology YAML
  const cisaYamlPath = path.join(__dirname, '../methodologies/cisa.yaml');
  const cisaYaml = fs.readFileSync(cisaYamlPath, 'utf8');

  console.log('📋 1. YAML Validation');
  console.log('─'.repeat(50));
  const validation = validateYAML(cisaYaml);
  console.log(`✅ YAML is ${validation.valid ? 'valid' : 'invalid'}`);
  
  if (validation.methodology) {
    console.log(`   Name: ${validation.methodology.name}`);
    console.log(`   Version: ${validation.methodology.version}`);
    console.log(`   Description: ${validation.methodology.description}`);
  }
  console.log();

  console.log('🎯 2. Direct Decision Evaluation');
  console.log('─'.repeat(50));
  const highSeverityParams = {
    exploitation: 'active',
    automatable: 'yes',
    technical_impact: 'total',
    mission_wellbeing: 'high'
  };

  const outcome1 = customFromYAML(cisaYaml, highSeverityParams);
  console.log(`Parameters: ${JSON.stringify(highSeverityParams)}`);
  console.log(`➡️  Action: ${outcome1.action}, Priority: ${outcome1.priority}`);
  console.log();

  console.log('🔧 3. Runtime Plugin Creation');
  console.log('─'.repeat(50));
  const plugin = createRuntimePlugin(cisaYaml);
  console.log(`Plugin Name: ${plugin.name}`);
  console.log(`Plugin Version: ${plugin.version}`);

  const decision = plugin.createDecision({
    exploitation: 'poc',
    automatable: 'no',
    technical_impact: 'partial',
    mission_wellbeing: 'medium'
  });

  const outcome2 = decision.evaluate();
  console.log(`Decision Outcome: ${outcome2.action} (${outcome2.priority})`);
  console.log();

  console.log('🔀 4. Parameter Flexibility');
  console.log('─'.repeat(50));
  
  // Same parameters, different naming conventions
  const snakeCase = customFromYAML(cisaYaml, {
    exploitation: 'active',
    technical_impact: 'total',
    mission_wellbeing: 'high',
    automatable: 'yes'
  });

  const camelCase = customFromYAML(cisaYaml, {
    exploitation: 'active',
    technicalImpact: 'total',
    missionWellbeing: 'high',
    automatable: 'yes'
  });

  console.log(`Snake case result: ${snakeCase.action}`);
  console.log(`Camel case result: ${camelCase.action}`);
  console.log(`✅ Results match: ${snakeCase.action === camelCase.action}`);
  console.log();

  console.log('📊 5. Batch Evaluation');
  console.log('─'.repeat(50));
  const scenarios = [
    { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
    { exploitation: 'poc', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'medium' },
    { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'low' },
  ];

  const batchResults = batchEvaluate(cisaYaml, scenarios);
  batchResults.forEach((result, index) => {
    console.log(`Scenario ${index + 1}: ${result.action} (${result.priority})`);
  });
  console.log();

  console.log('🔗 6. Vector String Support');
  console.log('─'.repeat(50));
  if (supportsVectorStrings(cisaYaml)) {
    const vectorString = generateVectorString(cisaYaml, highSeverityParams);
    console.log(`Generated vector: ${vectorString}`);
    
    const parsedParams = parseVectorString(cisaYaml, vectorString);
    console.log(`Parsed parameters: ${JSON.stringify(parsedParams)}`);
  } else {
    console.log('❌ Vector strings not supported by this methodology');
  }
  console.log();

  console.log('📈 7. Methodology Statistics');
  console.log('─'.repeat(50));
  const stats = new RuntimeEvaluationStats(cisaYaml);
  console.log(`Available actions: ${stats.getAllActions().join(', ')}`);
  console.log(`Available priorities: ${stats.getAllPriorities().join(', ')}`);
  console.log(`Decision tree depth: ${stats.getDecisionTreeDepth()}`);
  console.log(`Total decision paths: ${stats.getTotalDecisionPaths()}`);
  console.log();

  console.log('🏗️  8. Custom Methodology');
  console.log('─'.repeat(50));
  
  const customYaml = `
name: "Demo Methodology"
description: "A simple demo methodology for testing"
version: "1.0"

enums:
  Severity:
    - LOW
    - MEDIUM
    - HIGH
  Impact:
    - MINOR
    - MAJOR

priorityMap:
  IGNORE: LOW
  MONITOR: MEDIUM
  URGENT: HIGH

decisionTree:
  type: Severity
  children:
    LOW:
      type: Impact
      children:
        MINOR: IGNORE
        MAJOR: MONITOR
    MEDIUM: MONITOR
    HIGH: URGENT

defaultAction: IGNORE
`;

  console.log('Custom YAML methodology:');
  const customValidation = validateYAML(customYaml);
  console.log(`✅ Valid: ${customValidation.valid}`);
  
  if (customValidation.valid) {
    const customOutcome = customFromYAML(customYaml, {
      severity: 'high',
      impact: 'major'
    });
    console.log(`Custom evaluation: ${customOutcome.action} (${customOutcome.priority})`);
  }
  console.log();

  console.log('⚡ 9. Performance Test');
  console.log('─'.repeat(50));
  const iterations = 1000;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    customFromYAML(cisaYaml, {
      exploitation: i % 2 === 0 ? 'active' : 'none',
      automatable: i % 2 === 0 ? 'yes' : 'no',
      technical_impact: i % 2 === 0 ? 'total' : 'partial',
      mission_wellbeing: ['low', 'medium', 'high'][i % 3]
    });
  }
  
  const duration = Date.now() - startTime;
  console.log(`${iterations} evaluations in ${duration}ms`);
  console.log(`Average: ${(duration / iterations).toFixed(2)}ms per evaluation`);
  console.log();

  console.log('🎉 Demo completed successfully!');
  console.log('\nThe runtime YAML evaluation system provides:');
  console.log('• ✅ Complete isolation from generated plugins');
  console.log('• ✅ Dynamic YAML loading and validation');
  console.log('• ✅ Flexible parameter naming conventions');
  console.log('• ✅ Vector string support where available');
  console.log('• ✅ High performance for real-time evaluation');
  console.log('• ✅ Full compatibility with existing SSVC interfaces');
}

// Run the demo
runDemo().catch(console.error);