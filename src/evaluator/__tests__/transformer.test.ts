/**
 * Tests for Transform Engine
 */

import { TransformEngine, CommonTransforms, RuleValidator } from '../transformer';
import { TransformRule } from '../../mapping/types';

describe('TransformEngine', () => {
  let engine: TransformEngine;

  beforeEach(() => {
    engine = new TransformEngine();
  });

  describe('transform', () => {
    test('should apply exact string match rule', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'active',
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const result = engine.transform('active', rules, 'test-source', 'test-mapping');

      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
      expect(result.appliedRule).toBe(rules[0]);
      expect(result.originalValue).toBe('active');
    });

    test('should apply regex rule', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: /^(active|exploitation|exploited)$/i,
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const testValues = ['active', 'ACTIVE', 'exploitation', 'exploited'];

      for (const testValue of testValues) {
        const result = engine.transform(testValue, rules, 'test-source', 'test-mapping');
        expect(result.success).toBe(true);
        expect(result.value).toBe('ACTIVE');
        expect(result.appliedRule).toBe(rules[0]);
      }
    });

    test('should handle case insensitive matching', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'Active',
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const testValues = ['active', 'ACTIVE', 'Active', 'aCtiVe'];

      for (const testValue of testValues) {
        const result = engine.transform(testValue, rules, 'test-source', 'test-mapping');
        expect(result.success).toBe(true);
        expect(result.value).toBe('ACTIVE');
      }
    });

    test('should handle trimmed matching', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'active',
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const result = engine.transform('  active  ', rules, 'test-source', 'test-mapping');

      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
    });

    test('should handle word boundary matching', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'exploit',
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const result = engine.transform('active exploitation detected', rules, 'test-source', 'test-mapping');

      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
    });

    test('should return normalized original value when no rule matches', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'other',
          targetValue: 'OTHER',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const result = engine.transform('no match', rules, 'test-source', 'test-mapping');

      expect(result.success).toBe(true);
      expect(result.value).toBe('NO MATCH');
      expect(result.appliedRule).toBeUndefined();
    });

    test('should respect source restrictions', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'MATCHED',
          applicableToSources: ['allowed-source'],
          applicableToMappings: []
        }
      ];

      // Should match when source is allowed
      const result1 = engine.transform('test', rules, 'allowed-source', 'test-mapping');
      expect(result1.value).toBe('MATCHED');

      // Should not match when source is not allowed
      const result2 = engine.transform('test', rules, 'other-source', 'test-mapping');
      expect(result2.value).toBe('TEST');
      expect(result2.appliedRule).toBeUndefined();
    });

    test('should respect mapping restrictions', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'MATCHED',
          applicableToSources: [],
          applicableToMappings: ['allowed-mapping']
        }
      ];

      // Should match when mapping is allowed
      const result1 = engine.transform('test', rules, 'test-source', 'allowed-mapping');
      expect(result1.value).toBe('MATCHED');

      // Should not match when mapping is not allowed
      const result2 = engine.transform('test', rules, 'test-source', 'other-mapping');
      expect(result2.value).toBe('TEST');
      expect(result2.appliedRule).toBeUndefined();
    });

    test('should apply first matching rule in order', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'FIRST',
          applicableToSources: [],
          applicableToMappings: []
        },
        {
          sourceValue: 'test',
          targetValue: 'SECOND',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const result = engine.transform('test', rules, 'test-source', 'test-mapping');

      expect(result.value).toBe('FIRST');
      expect(result.appliedRule).toBe(rules[0]);
    });
  });

  describe('normalizeValue', () => {
    test('should handle different data types', () => {
      const testCases = [
        { input: null, expected: '' },
        { input: undefined, expected: '' },
        { input: true, expected: 'true' },
        { input: false, expected: 'false' },
        { input: 42, expected: '42' },
        { input: 3.14, expected: '3.14' },
        { input: 'string', expected: 'string' },
        { input: '  spaced  ', expected: 'spaced' },
        { input: { key: 'value' }, expected: '{"key":"value"}' },
        { input: [1, 2, 3], expected: '[1,2,3]' }
      ];

      for (const testCase of testCases) {
        const rules: TransformRule[] = [];
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected.toUpperCase());
      }
    });
  });

  describe('getApplicableRules', () => {
    test('should return all rules when no restrictions', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test1',
          targetValue: 'TEST1',
          applicableToSources: [],
          applicableToMappings: []
        },
        {
          sourceValue: 'test2',
          targetValue: 'TEST2',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const applicable = engine.getApplicableRules(rules, 'any-source', 'any-mapping');
      expect(applicable).toHaveLength(2);
    });

    test('should filter by source restrictions', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test1',
          targetValue: 'TEST1',
          applicableToSources: ['source1'],
          applicableToMappings: []
        },
        {
          sourceValue: 'test2',
          targetValue: 'TEST2',
          applicableToSources: ['source2'],
          applicableToMappings: []
        },
        {
          sourceValue: 'test3',
          targetValue: 'TEST3',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const applicable = engine.getApplicableRules(rules, 'source1', 'any-mapping');
      expect(applicable).toHaveLength(2); // rule1 (matches source1) + rule3 (no restriction)
    });

    test('should filter by mapping restrictions', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test1',
          targetValue: 'TEST1',
          applicableToSources: [],
          applicableToMappings: ['mapping1']
        },
        {
          sourceValue: 'test2',
          targetValue: 'TEST2',
          applicableToSources: [],
          applicableToMappings: ['mapping2']
        }
      ];

      const applicable = engine.getApplicableRules(rules, 'any-source', 'mapping1');
      expect(applicable).toHaveLength(1);
      expect(applicable[0].targetValue).toBe('TEST1');
    });
  });

  describe('validate', () => {
    test('should return true for valid values', () => {
      const validValues = ['LOW', 'MEDIUM', 'HIGH'];
      expect(engine.validate('MEDIUM', validValues)).toBe(true);
    });

    test('should return false for invalid values', () => {
      const validValues = ['LOW', 'MEDIUM', 'HIGH'];
      expect(engine.validate('INVALID', validValues)).toBe(false);
    });
  });

  describe('batchTransform', () => {
    test('should transform multiple values', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: /^(low|minimal)$/i,
          targetValue: 'LOW',
          applicableToSources: [],
          applicableToMappings: []
        },
        {
          sourceValue: /^(high|severe)$/i,
          targetValue: 'HIGH',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const values = ['low', 'high', 'unknown'];
      const results = engine.batchTransform(values, rules, 'test-source', 'test-mapping');

      expect(results).toHaveLength(3);
      expect(results[0].value).toBe('LOW');
      expect(results[1].value).toBe('HIGH');
      expect(results[2].value).toBe('UNKNOWN'); // No rule matched
    });
  });

  describe('testRules', () => {
    test('should test rules against sample data', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: /^(active|exploited)$/i,
          targetValue: 'ACTIVE',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const sampleData = [
        { value: 'active', expectedResult: 'ACTIVE' },
        { value: 'exploited', expectedResult: 'ACTIVE' },
        { value: 'none', expectedResult: 'NONE' } // No rule matches, returns uppercase
      ];

      const results = engine.testRules(sampleData, rules, 'test-source', 'test-mapping');

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true); // 'none' returns as-is
    });
  });
});

describe('CommonTransforms', () => {
  describe('booleanToYesNo', () => {
    test('should create boolean transformation rules', () => {
      const rules = CommonTransforms.booleanToYesNo();
      expect(rules).toHaveLength(2);

      const engine = new TransformEngine();

      const testCases = [
        { input: 'true', expected: 'YES' },
        { input: '1', expected: 'YES' },
        { input: 'yes', expected: 'YES' },
        { input: 'enabled', expected: 'YES' },
        { input: 'false', expected: 'NO' },
        { input: '0', expected: 'NO' },
        { input: 'no', expected: 'NO' },
        { input: 'disabled', expected: 'NO' }
      ];

      for (const testCase of testCases) {
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected);
      }
    });
  });

  describe('severityLevels', () => {
    test('should create severity transformation rules', () => {
      const rules = CommonTransforms.severityLevels();
      expect(rules).toHaveLength(3);

      const engine = new TransformEngine();

      const testCases = [
        { input: 'low', expected: 'LOW' },
        { input: 'minimal', expected: 'LOW' },
        { input: '1', expected: 'LOW' },
        { input: 'medium', expected: 'MEDIUM' },
        { input: 'moderate', expected: 'MEDIUM' },
        { input: '2', expected: 'MEDIUM' },
        { input: 'high', expected: 'HIGH' },
        { input: 'severe', expected: 'HIGH' },
        { input: 'critical', expected: 'HIGH' },
        { input: '3', expected: 'HIGH' }
      ];

      for (const testCase of testCases) {
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected);
      }
    });
  });

  describe('exploitStatus', () => {
    test('should create exploit status transformation rules', () => {
      const rules = CommonTransforms.exploitStatus();
      expect(rules).toHaveLength(3);

      const engine = new TransformEngine();

      const testCases = [
        { input: 'none', expected: 'NONE' },
        { input: 'no exploit', expected: 'NONE' },
        { input: 'poc', expected: 'POC' },
        { input: 'proof of concept', expected: 'POC' },
        { input: 'active', expected: 'ACTIVE' },
        { input: 'exploitation', expected: 'ACTIVE' },
        { input: 'in the wild', expected: 'ACTIVE' }
      ];

      for (const testCase of testCases) {
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected);
      }
    });
  });

  describe('cvssToImpact', () => {
    test('should create CVSS score transformation rules', () => {
      const rules = CommonTransforms.cvssToImpact();
      expect(rules).toHaveLength(4);

      const engine = new TransformEngine();

      const testCases = [
        { input: '2.5', expected: 'LOW' },
        { input: '5.0', expected: 'MEDIUM' },
        { input: '7.5', expected: 'HIGH' },
        { input: '9.5', expected: 'CRITICAL' },
        { input: '10.0', expected: 'CRITICAL' },
        { input: 'low', expected: 'LOW' },
        { input: 'medium', expected: 'MEDIUM' },
        { input: 'high', expected: 'HIGH' },
        { input: 'critical', expected: 'CRITICAL' }
      ];

      for (const testCase of testCases) {
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected);
      }
    });
  });

  describe('sentiment', () => {
    test('should create sentiment transformation rules', () => {
      const rules = CommonTransforms.sentiment();
      expect(rules).toHaveLength(2);

      const engine = new TransformEngine();

      const testCases = [
        { input: 'positive', expected: 'YES' },
        { input: 'good', expected: 'YES' },
        { input: 'available', expected: 'YES' },
        { input: 'confirmed', expected: 'YES' },
        { input: 'negative', expected: 'NO' },
        { input: 'bad', expected: 'NO' },
        { input: 'unavailable', expected: 'NO' },
        { input: 'denied', expected: 'NO' }
      ];

      for (const testCase of testCases) {
        const result = engine.transform(testCase.input, rules, 'test-source', 'test-mapping');
        expect(result.value).toBe(testCase.expected);
      }
    });
  });
});

describe('RuleValidator', () => {
  describe('validateRules', () => {
    test('should validate well-formed rules', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'TEST',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const results = RuleValidator.validateRules(rules);
      expect(results).toHaveLength(1);
      expect(results[0].issues).toHaveLength(0);
    });

    test('should detect missing source value', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: '',
          targetValue: 'TEST',
          applicableToSources: [],
          applicableToMappings: []
        } as TransformRule
      ];

      const results = RuleValidator.validateRules(rules);
      expect(results[0].issues).toContain('Source value is required');
    });

    test('should detect missing target value', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: '',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const results = RuleValidator.validateRules(rules);
      expect(results[0].issues).toContain('Target value is required and cannot be empty');
    });

    test('should detect invalid regex patterns', () => {
      // Create a real regex but spy on its test method to throw
      const realRegex = /test/;
      const spyTest = jest.spyOn(realRegex, 'test').mockImplementation(() => {
        throw new Error('Invalid regex pattern test');
      });
      
      const rules: TransformRule[] = [
        {
          sourceValue: realRegex,
          targetValue: 'TEST',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const results = RuleValidator.validateRules(rules);
      expect(results[0].issues.length).toBeGreaterThan(0);
      expect(results[0].issues[0]).toContain('Invalid regex pattern');
      
      spyTest.mockRestore();
    });
  });

  describe('findConflicts', () => {
    test('should detect conflicting rules', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'TEST1',
          applicableToSources: [],
          applicableToMappings: []
        },
        {
          sourceValue: 'test',
          targetValue: 'TEST2',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const conflicts = RuleValidator.findConflicts(rules);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflict).toContain('overlapping scope');
    });

    test('should not detect conflicts for same target values', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test1',
          targetValue: 'TEST',
          applicableToSources: [],
          applicableToMappings: []
        },
        {
          sourceValue: 'test2',
          targetValue: 'TEST',
          applicableToSources: [],
          applicableToMappings: []
        }
      ];

      const conflicts = RuleValidator.findConflicts(rules);
      expect(conflicts).toHaveLength(0);
    });

    test('should not detect conflicts for non-overlapping scopes', () => {
      const rules: TransformRule[] = [
        {
          sourceValue: 'test',
          targetValue: 'TEST1',
          applicableToSources: ['source1'],
          applicableToMappings: []
        },
        {
          sourceValue: 'test',
          targetValue: 'TEST2',
          applicableToSources: ['source2'],
          applicableToMappings: []
        }
      ];

      const conflicts = RuleValidator.findConflicts(rules);
      expect(conflicts).toHaveLength(0);
    });
  });
});