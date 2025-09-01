/**
 * Tests for DataValidator
 */

import { DataValidator } from '../validator';
import { MethodologyDataConfig } from '../../mapping/types';
import { EvaluationDataPackage } from '../../evidence/types';

describe('DataValidator', () => {
  let validator: DataValidator;

  beforeEach(() => {
    validator = new DataValidator();
  });

  describe('validateMethodologyConfig', () => {
    it('should validate complete valid configuration', () => {
      const config: MethodologyDataConfig = {
        methodology: 'TestMethodology',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [
              {
                sourceId: 'source1',
                name: 'Source 1',
                type: 'manual',
                description: 'Manual source',
                priority: 1,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: ['VALUE1', 'VALUE2']
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should error when methodology name is missing', () => {
      const config: MethodologyDataConfig = {
        methodology: '',
        version: '1.0',
        decisionPointMappings: []
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'METHODOLOGY_NAME_MISSING');
      expect(error).toBeDefined();
      expect(error?.severity).toBe('error');
      expect(error?.category).toBe('config');
    });

    it('should error when version is missing', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '',
        decisionPointMappings: []
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'VERSION_MISSING');
      expect(error).toBeDefined();
      expect(error?.severity).toBe('error');
    });

    it('should error when no decision points are provided', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: []
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'NO_DECISION_POINTS');
      expect(error).toBeDefined();
      expect(error?.severity).toBe('error');
    });

    it('should error on duplicate decision points', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'duplicate',
            required: true,
            dataSources: [
              {
                sourceId: 'source1',
                name: 'Source 1',
                type: 'manual',
                description: 'Manual source',
                priority: 1,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: ['VALUE1']
          },
          {
            decisionPoint: 'duplicate',
            required: true,
            dataSources: [
              {
                sourceId: 'source2',
                name: 'Source 2',
                type: 'manual',
                description: 'Manual source 2',
                priority: 2,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: ['VALUE2']
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'DUPLICATE_DECISION_POINTS');
      expect(error).toBeDefined();
      expect(error?.message).toContain('duplicate');
    });

    it('should handle empty decision point name', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: '',
            required: true,
            dataSources: [],
            transformRules: [],
            validValues: []
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'DECISION_POINT_NAME_MISSING');
      expect(error).toBeDefined();
    });

    it('should handle decision point with no data sources and no default', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [],
            transformRules: [],
            validValues: ['VALUE1']
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'NO_DATA_SOURCES_OR_DEFAULT');
      expect(error).toBeDefined();
    });

    it('should handle decision point with no valid values', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [
              {
                sourceId: 'source1',
                name: 'Source 1',
                type: 'manual',
                description: 'Manual source',
                priority: 1,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: []
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'NO_VALID_VALUES');
      expect(error).toBeDefined();
    });

    it('should handle invalid default value', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [],
            transformRules: [],
            validValues: ['VALUE1', 'VALUE2'],
            defaultValue: 'INVALID'
          }
        ]
      };

      const issues = validator.validateMethodologyConfig(config);
      const error = issues.find(i => i.code === 'INVALID_DEFAULT_VALUE');
      expect(error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate complete data package', () => {
      const config: MethodologyDataConfig = {
        methodology: 'TestMethodology',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [
              {
                sourceId: 'source1',
                name: 'Source 1',
                type: 'manual',
                description: 'Manual source',
                priority: 1,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: ['VALUE1', 'VALUE2']
          }
        ]
      };

      const dataPackage: EvaluationDataPackage = {
        methodology: 'TestMethodology',
        rawInputs: [
          {
            sourceId: 'source1',
            timestamp: Date.now(),
            data: { test_point: 'VALUE1' }
          }
        ]
      };

      const result = validator.validate(dataPackage, config);
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.issues).toBeInstanceOf(Array);
    });

    it('should return invalid result when there are errors', () => {
      const config: MethodologyDataConfig = {
        methodology: '',
        version: '1.0',
        decisionPointMappings: []
      };

      const dataPackage: EvaluationDataPackage = {
        methodology: 'TestMethodology',
        rawInputs: []
      };

      const result = validator.validate(dataPackage, config);
      expect(result.valid).toBe(false);
      expect(result.summary.errors).toBeGreaterThan(0);
    });

    it('should calculate summary correctly', () => {
      const config: MethodologyDataConfig = {
        methodology: '',
        version: '1.0',
        decisionPointMappings: []
      };

      const dataPackage: EvaluationDataPackage = {
        methodology: 'TestMethodology',
        rawInputs: []
      };

      const result = validator.validate(dataPackage, config);
      expect(result.summary.totalIssues).toBe(
        result.summary.errors + result.summary.warnings + result.summary.infos
      );
    });

    it('should handle empty raw inputs', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: [
          {
            decisionPoint: 'test_point',
            required: true,
            dataSources: [
              {
                sourceId: 'source1',
                name: 'Source 1',
                type: 'manual',
                description: 'Manual source',
                priority: 1,
                isActive: true,
                mimeTypes: ['text/plain'],
                config: {}
              }
            ],
            transformRules: [],
            validValues: ['VALUE1']
          }
        ]
      };

      const dataPackage: EvaluationDataPackage = {
        methodology: 'Test',
        rawInputs: []
      };

      const result = validator.validate(dataPackage, config);
      const error = result.issues.find(i => i.code === 'NO_RAW_INPUTS');
      expect(error).toBeDefined();
    });

    it('should handle missing methodology in data package', () => {
      const config: MethodologyDataConfig = {
        methodology: 'Test',
        version: '1.0',
        decisionPointMappings: []
      };

      const dataPackage: EvaluationDataPackage = {
        methodology: '',
        rawInputs: [
          {
            sourceId: 'source1',
            timestamp: Date.now(),
            data: {}
          }
        ]
      };

      const result = validator.validate(dataPackage, config);
      const error = result.issues.find(i => i.code === 'METHODOLOGY_NOT_SPECIFIED');
      expect(error).toBeDefined();
    });
  });
});