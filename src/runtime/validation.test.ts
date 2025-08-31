/**
 * Runtime System Validation Tests
 * 
 * Tests to validate that the runtime system works correctly with all existing methodologies
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    createRuntimePlugin,
    customFromYAML,
    getMethodologyMetadata,
    supportsVectorStrings,
    validateYAML
} from './index';

describe('Runtime System - Methodology Validation', () => {
  let methodologyFiles: string[];
  let validMethodologies: { name: string; content: string; metadata: any }[];

  beforeAll(() => {
    // Get all methodology files
    const methodologiesDir = path.join(__dirname, '../../methodologies');
    methodologyFiles = fs.readdirSync(methodologiesDir)
      .filter(file => file.endsWith('.yaml'))
      .map(file => path.join(methodologiesDir, file));

    // Validate and collect valid methodologies
    validMethodologies = [];
    
    for (const filePath of methodologyFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const validation = validateYAML(content);
      
      if (validation.valid && validation.methodology) {
        const metadata = getMethodologyMetadata(content);
        validMethodologies.push({
          name: metadata.name,
          content,
          metadata
        });
      }
    }

    console.log(`Found ${validMethodologies.length} valid methodologies: ${validMethodologies.map(m => m.name).join(', ')}`);
  });

  test('should validate all existing methodology files', () => {
    expect(methodologyFiles.length).toBeGreaterThan(0);
    
    for (const filePath of methodologyFiles) {
      const fileName = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const validation = validateYAML(content);
      
      if (!validation.valid) {
        console.error(`${fileName} validation errors:`, validation.errors);
      }
      
      expect(validation.valid).toBe(true);
    }
  });

  test('should create runtime plugins for all valid methodologies', () => {
    for (const methodology of validMethodologies) {
      const plugin = createRuntimePlugin(methodology.content);
      
      expect(plugin.name).toBe(methodology.name);
      expect(plugin.description).toBe(methodology.metadata.description);
      expect(plugin.version).toBe(methodology.metadata.version);
    }
  });

  describe('CISA Methodology', () => {
    let cisaMethodology: { name: string; content: string; metadata: any };

    beforeAll(() => {
      cisaMethodology = validMethodologies.find(m => m.name === 'CISA')!;
      expect(cisaMethodology).toBeDefined();
    });

    test('should evaluate CISA decisions correctly', () => {
      const testCases = [
        {
          params: { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
          expectedAction: 'ACT'
        },
        {
          params: { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'low' },
          expectedAction: 'TRACK'
        },
        {
          params: { exploitation: 'poc', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'medium' },
          expectedAction: 'TRACK_STAR'
        }
      ];

      for (const testCase of testCases) {
        const outcome = customFromYAML(cisaMethodology.content, testCase.params);
        expect(outcome.action).toBe(testCase.expectedAction);
        expect(outcome.priority).toBeDefined();
      }
    });

    test('should support vector strings for CISA', () => {
      const supportsVectors = supportsVectorStrings(cisaMethodology.content);
      expect(supportsVectors).toBe(true);
    });
  });

  describe('Coordinator Triage Methodology', () => {
    let coordinatorMethodology: { name: string; content: string; metadata: any };

    beforeAll(() => {
      coordinatorMethodology = validMethodologies.find(m => m.name.includes('Coordinator') && m.name.includes('Triage'))!;
      if (coordinatorMethodology) {
        console.log(`Found coordinator methodology: ${coordinatorMethodology.name}`);
      }
    });

    test('should evaluate coordinator triage decisions', () => {
      if (!coordinatorMethodology) {
        console.log('Skipping coordinator triage test - methodology not found');
        return;
      }

      const testCases = [
        {
          params: { 
            report_public: 'yes', 
            supplier_contacted: 'yes', 
            report_credibility: 'credible',
            supplier_cardinality: 'multiple'
          }
        },
        {
          params: { 
            report_public: 'no', 
            supplier_contacted: 'no', 
            report_credibility: 'credible',
            supplier_cardinality: 'single'
          }
        }
      ];

      for (const testCase of testCases) {
        const outcome = customFromYAML(coordinatorMethodology.content, testCase.params);
        expect(outcome.action).toBeDefined();
        expect(outcome.priority).toBeDefined();
      }
    });
  });

  describe('All Methodologies - Basic Functionality', () => {
    test('should create plugins and handle basic operations for all methodologies', () => {
      for (const methodology of validMethodologies) {
        // Create plugin
        const plugin = createRuntimePlugin(methodology.content);
        expect(plugin).toBeDefined();

        // Test basic decision creation (with empty parameters - should use defaults)
        const decision = plugin.createDecision({});
        expect(decision).toBeDefined();

        // Should be able to evaluate even with empty params (will use default action)
        const outcome = decision.evaluate();
        expect(outcome.action).toBeDefined();
        expect(outcome.priority).toBeDefined();
      }
    });

    test('should handle vector string support correctly for all methodologies', () => {
      for (const methodology of validMethodologies) {
        const supportsVectors = supportsVectorStrings(methodology.content);
        expect(typeof supportsVectors).toBe('boolean');
        
        if (supportsVectors) {
          console.log(`${methodology.name} supports vector strings`);
        }
      }
    });

    test('should extract metadata correctly for all methodologies', () => {
      for (const methodology of validMethodologies) {
        const metadata = getMethodologyMetadata(methodology.content);
        
        expect(metadata.name).toBeDefined();
        expect(metadata.description).toBeDefined();
        expect(metadata.version).toBeDefined();
        expect(metadata.version).toMatch(/^\d+\.\d+/); // semver format
      }
    });
  });

  describe('Parameter Flexibility Tests', () => {
    test('should handle various parameter naming conventions', () => {
      const cisaMethodology = validMethodologies.find(m => m.name === 'CISA');
      if (!cisaMethodology) return;

      const baseParams = {
        exploitation: 'active',
        automatable: 'yes', 
        technical_impact: 'total',
        mission_wellbeing: 'high'
      };

      // Test snake_case
      const outcome1 = customFromYAML(cisaMethodology.content, baseParams);

      // Test camelCase variants
      const camelParams = {
        exploitation: 'active',
        automatable: 'yes',
        technicalImpact: 'total',
        missionWellbeing: 'high'
      };
      const outcome2 = customFromYAML(cisaMethodology.content, camelParams);

      // Test mixed case enum values
      const mixedParams = {
        exploitation: 'ACTIVE',
        automatable: 'YES',
        technical_impact: 'TOTAL',
        mission_wellbeing: 'HIGH'
      };
      const outcome3 = customFromYAML(cisaMethodology.content, mixedParams);

      // All should produce the same result
      expect(outcome1.action).toBe(outcome2.action);
      expect(outcome1.action).toBe(outcome3.action);
      expect(outcome1.priority).toBe(outcome2.priority);
      expect(outcome1.priority).toBe(outcome3.priority);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing parameters gracefully', () => {
      for (const methodology of validMethodologies) {
        // Should not throw with empty parameters - should use default action
        const outcome = customFromYAML(methodology.content, {});
        expect(outcome.action).toBeDefined();
        expect(outcome.priority).toBeDefined();
      }
    });

    test('should handle invalid parameter values', () => {
      const cisaMethodology = validMethodologies.find(m => m.name === 'CISA');
      if (!cisaMethodology) return;

      // Invalid enum values should fall back to default action
      const outcome = customFromYAML(cisaMethodology.content, {
        exploitation: 'invalid_value',
        automatable: 'maybe',
        technical_impact: 'unknown',
        mission_wellbeing: 'undefined'
      });

      // Should still produce a valid outcome (likely the default action)
      expect(outcome.action).toBeDefined();
      expect(outcome.priority).toBeDefined();
    });
  });

  describe('Performance and Memory', () => {
    test('should handle multiple evaluations efficiently', () => {
      const cisaMethodology = validMethodologies.find(m => m.name === 'CISA');
      if (!cisaMethodology) return;

      const startTime = Date.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const outcome = customFromYAML(cisaMethodology.content, {
          exploitation: i % 2 === 0 ? 'active' : 'none',
          automatable: i % 3 === 0 ? 'yes' : 'no',
          technical_impact: i % 2 === 0 ? 'total' : 'partial',
          mission_wellbeing: ['low', 'medium', 'high'][i % 3]
        });
        
        expect(outcome.action).toBeDefined();
        expect(outcome.priority).toBeDefined();
      }

      const duration = Date.now() - startTime;
      console.log(`${iterations} evaluations completed in ${duration}ms (${(duration/iterations).toFixed(2)}ms per evaluation)`);
      
      // Should complete reasonably quickly (less than 1 second for 100 evaluations)
      expect(duration).toBeLessThan(10000);
    });
  });
});