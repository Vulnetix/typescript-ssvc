/**
 * Runtime YAML Evaluation Tests
 * 
 * Comprehensive tests for the runtime YAML evaluation system
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    batchEvaluate,
    createRuntimeDecision,
    createRuntimePlugin,
    customFromYAML,
    generateVectorString,
    getMethodologyEnums,
    getMethodologyMetadata,
    getMethodologyPriorityMap,
    parseVectorString,
    RuntimeDecision,
    RuntimeEvaluationStats,
    RuntimeSSVCPlugin,
    supportsVectorStrings,
    validateYAML
} from './index';

describe('Runtime YAML Evaluation System', () => {
  let cisaYaml: string;
  let coordinatorTriageYaml: string;
  let invalidYaml: string;

  beforeAll(() => {
    // Load existing methodology YAML files for testing
    const methodologiesDir = path.join(__dirname, '../../methodologies');
    cisaYaml = fs.readFileSync(path.join(methodologiesDir, 'cisa.yaml'), 'utf8');
    coordinatorTriageYaml = fs.readFileSync(path.join(methodologiesDir, 'coordinator_triage.yaml'), 'utf8');
    
    // Create invalid YAML for error testing
    invalidYaml = `
name: "Invalid"
description: "Invalid methodology"
version: "1.0"
enums:
  MissingEnum:
    - VALUE1
priorityMap:
  ACTION1: HIGH
decisionTree:
  type: NonExistentEnum
  children:
    VALUE1: ACTION1
defaultAction: ACTION1
`;
  });

  describe('YAML Validation', () => {
    test('should validate correct CISA YAML', () => {
      const result = validateYAML(cisaYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.methodology).toBeDefined();
      expect(result.methodology?.name).toBe('CISA');
    });

    test('should validate correct Coordinator Triage YAML', () => {
      const result = validateYAML(coordinatorTriageYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.methodology).toBeDefined();
    });

    test('should reject invalid YAML', () => {
      const result = validateYAML(invalidYaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.methodology).toBeUndefined();
    });

    test('should handle malformed YAML', () => {
      const malformedYaml = 'invalid: yaml: content: [unclosed';
      const result = validateYAML(malformedYaml);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Failed to parse YAML');
    });
  });

  describe('Runtime Decision Creation and Evaluation', () => {
    test('should create and evaluate CISA decision', () => {
      const decision = createRuntimeDecision(cisaYaml, {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });

      expect(decision).toBeInstanceOf(RuntimeDecision);
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });

    test('should handle different parameter naming conventions', () => {
      const decision1 = createRuntimeDecision(cisaYaml, {
        exploitation: 'poc',
        automatable: 'no',
        technicalImpact: 'partial',
        missionWellbeingImpact: 'medium'
      });

      const decision2 = createRuntimeDecision(cisaYaml, {
        exploitation: 'poc',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'medium'
      });

      const outcome1 = decision1.evaluate();
      const outcome2 = decision2.evaluate();
      
      expect(outcome1.action).toBe(outcome2.action);
      expect(outcome1.priority).toBe(outcome2.priority);
    });

    test('should handle missing parameters with default action', () => {
      const decision = createRuntimeDecision(cisaYaml, {
        exploitation: 'none'
        // Missing other required parameters
      });

      const outcome = decision.evaluate();
      expect(outcome.action).toBe('TRACK'); // Default action for CISA
    });

    test('should handle case-insensitive enum values', () => {
      const decision = createRuntimeDecision(cisaYaml, {
        exploitation: 'ACTIVE',
        automatable: 'YES',
        technical_impact: 'TOTAL',
        mission_wellbeing: 'HIGH'
      });

      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
  });

  describe('Direct YAML Evaluation', () => {
    test('should evaluate YAML directly', () => {
      const outcome = customFromYAML(cisaYaml, {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });

      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });

    test('should handle coordinator triage methodology', () => {
      const outcome = customFromYAML(coordinatorTriageYaml, {
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple'
      });

      expect(outcome.action).toBeDefined();
      expect(outcome.priority).toBeDefined();
    });
  });

  describe('Runtime Plugin System', () => {
    test('should create runtime plugin from YAML', () => {
      const plugin = createRuntimePlugin(cisaYaml);
      
      expect(plugin).toBeInstanceOf(RuntimeSSVCPlugin);
      expect(plugin.name).toBe('CISA');
      expect(plugin.description).toContain('CISA');
      expect(plugin.version).toBe('1.0');
    });

    test('should create decisions from plugin', () => {
      const plugin = createRuntimePlugin(cisaYaml);
      const decision = plugin.createDecision({
        exploitation: 'poc',
        automatable: 'yes',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      });

      const outcome = decision.evaluate();
      expect(outcome.action).toBeDefined();
      expect(outcome.priority).toBeDefined();
    });
  });

  describe('Vector String Support', () => {
    test('should check vector string support', () => {
      const cisaSupportsVectors = supportsVectorStrings(cisaYaml);
      expect(typeof cisaSupportsVectors).toBe('boolean');
    });

    test('should generate and parse vector strings if supported', () => {
      if (supportsVectorStrings(cisaYaml)) {
        const vectorString = generateVectorString(cisaYaml, {
          exploitation: 'active',
          automatable: 'yes',
          technical_impact: 'total',
          mission_wellbeing: 'high'
        });

        expect(vectorString).toMatch(/^CISA/);
        expect(vectorString).toContain('/');

        const parsedParams = parseVectorString(cisaYaml, vectorString);
        expect(parsedParams).toBeDefined();
        expect(typeof parsedParams).toBe('object');
      }
    });
  });

  describe('Methodology Metadata', () => {
    test('should extract methodology metadata', () => {
      const metadata = getMethodologyMetadata(cisaYaml);
      
      expect(metadata.name).toBe('CISA');
      expect(metadata.description).toContain('CISA');
      expect(metadata.version).toBe('1.0');
      expect(metadata.url).toContain('cisa.gov');
    });

    test('should get methodology enums', () => {
      const enums = getMethodologyEnums(cisaYaml);
      
      expect(enums).toBeDefined();
      expect(enums.ExploitationStatus).toContain('ACTIVE');
      expect(enums.AutomatableStatus).toContain('YES');
      expect(enums.TechnicalImpactLevel).toContain('TOTAL');
    });

    test('should get priority map', () => {
      const priorityMap = getMethodologyPriorityMap(cisaYaml);
      
      expect(priorityMap).toBeDefined();
      expect(priorityMap.ACT).toBe('IMMEDIATE');
      expect(priorityMap.TRACK).toBe('LOW');
    });
  });

  describe('Batch Evaluation', () => {
    test('should batch evaluate multiple parameter sets', () => {
      const parameterSets = [
        {
          exploitation: 'active',
          automatable: 'yes',
          technical_impact: 'total',
          mission_wellbeing: 'high'
        },
        {
          exploitation: 'none',
          automatable: 'no',
          technical_impact: 'partial',
          mission_wellbeing: 'low'
        },
        {
          exploitation: 'poc',
          automatable: 'yes',
          technical_impact: 'total',
          mission_wellbeing: 'medium'
        }
      ];

      const outcomes = batchEvaluate(cisaYaml, parameterSets);
      
      expect(outcomes).toHaveLength(3);
      expect(outcomes[0].action).toBe('ACT');
      expect(outcomes[0].priority).toBe('IMMEDIATE');
      
      outcomes.forEach(outcome => {
        expect(outcome.action).toBeDefined();
        expect(outcome.priority).toBeDefined();
      });
    });
  });

  describe('Runtime Evaluation Statistics', () => {
    test('should create evaluation stats', () => {
      const stats = new RuntimeEvaluationStats(cisaYaml);
      
      expect(stats).toBeInstanceOf(RuntimeEvaluationStats);
    });

    test('should get all available actions', () => {
      const stats = new RuntimeEvaluationStats(cisaYaml);
      const actions = stats.getAllActions();
      
      expect(actions).toContain('ACT');
      expect(actions).toContain('ATTEND');
      expect(actions).toContain('TRACK');
      expect(actions).toContain('TRACK_STAR');
      expect(actions.length).toBeGreaterThan(0);
    });

    test('should get all available priorities', () => {
      const stats = new RuntimeEvaluationStats(cisaYaml);
      const priorities = stats.getAllPriorities();
      
      expect(priorities).toContain('IMMEDIATE');
      expect(priorities).toContain('MEDIUM');
      expect(priorities).toContain('LOW');
      expect(priorities.length).toBeGreaterThan(0);
    });

    test('should calculate decision tree depth', () => {
      const stats = new RuntimeEvaluationStats(cisaYaml);
      const depth = stats.getDecisionTreeDepth();
      
      expect(typeof depth).toBe('number');
      expect(depth).toBeGreaterThan(0);
    });

    test('should count total decision paths', () => {
      const stats = new RuntimeEvaluationStats(cisaYaml);
      const pathCount = stats.getTotalDecisionPaths();
      
      expect(typeof pathCount).toBe('number');
      expect(pathCount).toBeGreaterThan(0);
    });
  });

  describe('Runtime Decision Methods', () => {
    test('should provide additional runtime-specific methods', () => {
      const decision = createRuntimeDecision(cisaYaml, {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });

      const methodology = decision.getMethodology();
      expect(methodology.name).toBe('CISA');

      const parameters = decision.getParameters();
      expect(parameters.exploitation).toBe('active');

      const enums = decision.getAvailableEnums();
      expect(enums.ExploitationStatus).toContain('ACTIVE');

      const priorityMap = decision.getPriorityMap();
      expect(priorityMap.ACT).toBe('IMMEDIATE');
    });

    test('should support parameter updates', () => {
      const decision = createRuntimeDecision(cisaYaml, {
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      });

      const outcome1 = decision.evaluate();
      
      decision.updateParameters({
        exploitation: 'active',
        mission_wellbeing: 'high'
      });

      const outcome2 = decision.evaluate();
      
      expect(outcome2.action).not.toBe(outcome1.action);
      // The updated parameters should result in a different action (ATTEND is correct for these params)
      expect(['ACT', 'ATTEND']).toContain(outcome2.action);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid YAML gracefully', () => {
      expect(() => {
        createRuntimePlugin(invalidYaml);
      }).toThrow();
    });

    test('should handle missing methodology gracefully', () => {
      expect(() => {
        getMethodologyMetadata('invalid yaml content');
      }).toThrow();
    });

    test('should handle vector operations on non-vector methodologies', () => {
      const testYaml = cisaYaml.replace(/vectorMetadata:[\s\S]*?(?=\n[a-zA-Z]|$)/, '');
      
      if (!supportsVectorStrings(testYaml)) {
        expect(() => {
          generateVectorString(testYaml, {
            exploitation: 'active'
          });
        }).toThrow();
      }
    });
  });

  describe('Integration with Existing System', () => {
    test('should be compatible with SSVCOutcome interface', () => {
      const outcome = customFromYAML(cisaYaml, {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });

      // Should have SSVCOutcome properties
      expect(outcome).toHaveProperty('action');
      expect(outcome).toHaveProperty('priority');
      expect(typeof outcome.action).toBe('string');
      expect(typeof outcome.priority).toBe('string');
    });

    test('should work with different methodology files', () => {
      const methodologiesDir = path.join(__dirname, '../../methodologies');
      const yamlFiles = fs.readdirSync(methodologiesDir)
        .filter(file => file.endsWith('.yaml'))
        .slice(0, 3); // Test first 3 files

      for (const file of yamlFiles) {
        const yamlContent = fs.readFileSync(path.join(methodologiesDir, file), 'utf8');
        const validation = validateYAML(yamlContent);
        
        if (validation.valid) {
          const plugin = createRuntimePlugin(yamlContent);
          expect(plugin.name).toBeDefined();
          expect(plugin.description).toBeDefined();
          expect(plugin.version).toBeDefined();
        }
      }
    });
  });
});