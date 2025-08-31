#!/usr/bin/env npx ts-node

/**
 * Transform Rules Example
 * 
 * Demonstrates the transform rules engine for mapping raw data
 * to SSVC methodology values with source and mapping restrictions.
 */

import {
  CommonTransforms,
  TransformEngine
} from '../src/index';

function demonstrateTransformRules() {
  console.log('🔄 Transform Rules Engine Demo\n');

  const engine = new TransformEngine();

  // ===== 1. Basic Transform Rules =====
  console.log('1. ✅ Basic transform rules...');
  
  const exploitationRules = [
    {
      sourceValue: /^(active|exploitation|exploited|confirmed)$/i,
      targetValue: 'ACTIVE',
      applicableToSources: ['nvd-api', 'mitre-database'],
      applicableToMappings: ['exploitation']
    },
    {
      sourceValue: /^(poc|proof.of.concept|demo|sample)$/i,
      targetValue: 'POC',
      applicableToSources: ['security-research', 'analyst-input'],
      applicableToMappings: ['exploitation']
    },
    {
      sourceValue: /^(none|not.found|safe|clean)$/i,
      targetValue: 'NONE',
      applicableToSources: ['nvd-api', 'analyst-input', 'automated-scan'],
      applicableToMappings: ['exploitation']
    }
  ];

  // Test various transformations
  const testCases = [
    { value: 'exploited', source: 'nvd-api', mapping: 'exploitation' },
    { value: 'proof-of-concept', source: 'security-research', mapping: 'exploitation' },
    { value: 'none', source: 'automated-scan', mapping: 'exploitation' },
    { value: 'confirmed', source: 'mitre-database', mapping: 'exploitation' }
  ];

  testCases.forEach(testCase => {
    const result = engine.transform(
      testCase.value, 
      exploitationRules, 
      testCase.source, 
      testCase.mapping
    );
    console.log(`   → '${testCase.value}' (${testCase.source}) → ${result.value}`);
  });

  // ===== 2. Source Restrictions =====
  console.log('\n2. ✅ Source restrictions...');
  
  // Try to apply POC rule with wrong source
  const invalidSourceResult = engine.transform(
    'poc', 
    exploitationRules, 
    'nvd-api', // POC rule not applicable to nvd-api
    'exploitation'
  );
  console.log(`   → 'poc' with invalid source (nvd-api) → ${invalidSourceResult.value || 'NO MATCH'}`);

  // Valid source for POC rule
  const validSourceResult = engine.transform(
    'poc',
    exploitationRules,
    'security-research', // POC rule applicable to security-research
    'exploitation'
  );
  console.log(`   → 'poc' with valid source (security-research) → ${validSourceResult.value}`);

  // ===== 3. Mapping Restrictions =====
  console.log('\n3. ✅ Mapping restrictions...');
  
  const multiMappingRules = [
    {
      sourceValue: 'high',
      targetValue: 'TOTAL',
      applicableToSources: ['cvss-calculator'],
      applicableToMappings: ['technical_impact'] // Only for technical impact
    },
    {
      sourceValue: 'high',
      targetValue: 'HIGH',
      applicableToSources: ['analyst-assessment'],
      applicableToMappings: ['mission_wellbeing'] // Only for mission wellbeing
    }
  ];

  const techImpactResult = engine.transform(
    'high',
    multiMappingRules,
    'cvss-calculator',
    'technical_impact'
  );
  console.log(`   → 'high' for technical_impact → ${techImpactResult.value}`);

  const missionResult = engine.transform(
    'high',
    multiMappingRules,
    'analyst-assessment', 
    'mission_wellbeing'
  );
  console.log(`   → 'high' for mission_wellbeing → ${missionResult.value}`);

  // ===== 4. Common Transform Patterns =====
  console.log('\n4. ✅ Common transform patterns...');
  
  // Boolean to Yes/No
  const booleanRules = CommonTransforms.booleanToYesNo();
  const boolTests = ['true', 'false', '1', '0', 'yes', 'no'];
  
  console.log('   Boolean transformations:');
  boolTests.forEach(value => {
    const result = engine.transform(value, booleanRules, 'manual', 'automatable');
    console.log(`     → '${value}' → ${result.value}`);
  });

  // Severity levels
  const severityRules = CommonTransforms.severityLevels();
  const severityTests = ['low', 'medium', 'high', 'critical', 'info'];
  
  console.log('   Severity transformations:');
  severityTests.forEach(value => {
    const result = engine.transform(value, severityRules, 'scanner', 'severity');
    console.log(`     → '${value}' → ${result.value || 'NO MATCH'}`);
  });

  // ===== 5. Complex Regex Patterns =====
  console.log('\n5. ✅ Complex regex patterns...');
  
  const cvssRules = [
    {
      sourceValue: /^([0-2]\.\d|[0-2])$/,  // 0.0 - 2.9
      targetValue: 'NONE',
      applicableToSources: ['cvss-v3'],
      applicableToMappings: ['technical_impact']
    },
    {
      sourceValue: /^([3-6]\.\d|[3-6])$/,  // 3.0 - 6.9
      targetValue: 'PARTIAL',
      applicableToSources: ['cvss-v3'],
      applicableToMappings: ['technical_impact']
    },
    {
      sourceValue: /^([7-9]\.\d|[7-9]|10\.0)$/,  // 7.0 - 10.0
      targetValue: 'TOTAL',
      applicableToSources: ['cvss-v3'],
      applicableToMappings: ['technical_impact']
    }
  ];

  const cvssTests = ['2.1', '4.5', '7.8', '9.2', '10.0', '0.5'];
  console.log('   CVSS score to impact transformations:');
  cvssTests.forEach(score => {
    const result = engine.transform(score, cvssRules, 'cvss-v3', 'technical_impact');
    console.log(`     → CVSS ${score} → ${result.value || 'NO MATCH'}`);
  });

  // ===== 6. Case Sensitivity =====
  console.log('\n6. ✅ Case sensitivity handling...');
  
  const caseRules = [
    {
      sourceValue: /^active$/i, // Case insensitive
      targetValue: 'ACTIVE',
      applicableToSources: ['any-source'],
      applicableToMappings: ['exploitation']
    }
  ];

  const caseTests = ['ACTIVE', 'Active', 'active', 'AcTiVe'];
  console.log('   Case insensitive matching:');
  caseTests.forEach(value => {
    const result = engine.transform(value, caseRules, 'any-source', 'exploitation');
    console.log(`     → '${value}' → ${result.value}`);
  });

  // ===== 7. Rule Priority and Ordering =====
  console.log('\n7. ✅ Rule priority and ordering...');
  
  const priorityRules = [
    // More specific rule comes first
    {
      sourceValue: /^exploitation.detected.confirmed$/i,
      targetValue: 'ACTIVE',
      applicableToSources: ['threat-intel'],
      applicableToMappings: ['exploitation']
    },
    // More general rule comes second
    {
      sourceValue: /^exploitation/i,
      targetValue: 'POC',
      applicableToSources: ['threat-intel'],
      applicableToMappings: ['exploitation']
    }
  ];

  const priorityTests = [
    'exploitation detected confirmed',
    'exploitation possible',
    'exploitation detected'
  ];

  console.log('   Rule priority (first match wins):');
  priorityTests.forEach(value => {
    const result = engine.transform(value, priorityRules, 'threat-intel', 'exploitation');
    console.log(`     → '${value}' → ${result.value || 'NO MATCH'}`);
  });

  // ===== 8. Validation =====
  console.log('\n8. ✅ Value validation...');
  
  const validValues = ['NONE', 'POC', 'ACTIVE'];
  const validationTests = ['ACTIVE', 'POC', 'INVALID', 'none'];
  
  console.log('   Valid value checking:');
  validationTests.forEach(value => {
    const isValid = engine.validate(value, validValues);
    console.log(`     → '${value}' is ${isValid ? 'VALID' : 'INVALID'}`);
  });

  // ===== SUMMARY =====
  console.log('\n🎉 TRANSFORM RULES ENGINE DEMO COMPLETE!\n');
  
  console.log('✅ Features Demonstrated:');
  console.log('  • Basic string and regex pattern matching');
  console.log('  • Source-specific rule restrictions');
  console.log('  • Mapping-specific rule restrictions');
  console.log('  • Common transform patterns (boolean, severity, CVSS)');
  console.log('  • Case-insensitive pattern matching');
  console.log('  • Rule priority and ordering');
  console.log('  • Value validation against allowed enums');
  console.log('  • Complex regex patterns for numeric ranges');
  console.log('  • Flexible source and mapping combinations');

  return {
    success: true,
    rulesApplied: exploitationRules.length + multiMappingRules.length + cvssRules.length,
    testCases: testCases.length
  };
}

// Run if executed directly
if (process.argv[1].endsWith('transform-rules-example.ts')) {
  const result = demonstrateTransformRules();
  if (result.success) {
    console.log(`\n📊 Demo Statistics:`);
    console.log(`   → Rules defined: ${result.rulesApplied}`);
    console.log(`   → Test cases: ${result.testCases}`);
    console.log(`   → Status: SUCCESS`);
    process.exit(0);
  } else {
    console.log('\n❌ Demo failed');
    process.exit(1);
  }
}

export { demonstrateTransformRules };
