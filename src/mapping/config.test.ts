/**
 * Tests for Methodology Configuration System
 */

import {
  MethodologyConfigBuilder,
  DecisionPointBuilder,
  DataSourceFactory,
  TransformRuleFactory,
  CommonConfigurations
} from './config';
import { DataSource, TransformRule, MethodologyDataConfig } from './types';

describe('MethodologyConfigBuilder', () => {
  let builder: MethodologyConfigBuilder;

  beforeEach(() => {
    builder = new MethodologyConfigBuilder('Test', '1.0');
  });

  describe('constructor', () => {
    it('should create a new builder with methodology and version', () => {
      expect(builder).toBeInstanceOf(MethodologyConfigBuilder);
    });
  });

  describe('addDecisionPoint', () => {
    it('should return a DecisionPointBuilder', () => {
      const dpBuilder = builder.addDecisionPoint('test_point');
      expect(dpBuilder).toBeInstanceOf(DecisionPointBuilder);
    });
  });

  describe('build', () => {
    it('should throw error when no decision points are configured', () => {
      expect(() => builder.build()).toThrow('At least one decision point mapping must be configured');
    });

    it('should return valid config when properly configured', () => {
      const dataSource = DataSourceFactory.manual('test-src', 'Test Source', 1);
      
      const config = builder
        .addDecisionPoint('test_point')
        .required()
        .withValidValues('VALUE1', 'VALUE2')
        .withSource(dataSource)
        .done()
        .build();

      expect(config.methodology).toBe('Test');
      expect(config.version).toBe('1.0');
      expect(config.decisionPointMappings).toHaveLength(1);
      expect(config.decisionPointMappings[0].decisionPoint).toBe('test_point');
    });

    it('should throw error for duplicate decision points', () => {
      const dataSource1 = DataSourceFactory.manual('test-src-1', 'Test Source 1', 1);
      const dataSource2 = DataSourceFactory.manual('test-src-2', 'Test Source 2', 2);

      expect(() => {
        builder
          .addDecisionPoint('duplicate')
          .withValidValues('VALUE1')
          .withSource(dataSource1)
          .done()
          .addDecisionPoint('duplicate')
          .withValidValues('VALUE2')
          .withSource(dataSource2)
          .done()
          .build();
      }).toThrow('Duplicate decision points found: duplicate');
    });
  });

  describe('validation', () => {
    it('should validate decision point has name', () => {
      const dataSource = DataSourceFactory.manual('test-src', 'Test Source', 1);
      
      expect(() => {
        builder.internal_addDecisionPointMapping({
          decisionPoint: '',
          required: true,
          dataSources: [dataSource],
          transformRules: [],
          validValues: ['VALUE1']
        });
        builder.build();
      }).toThrow('Decision point name is required');
    });

    it('should validate decision point has data sources or default value', () => {
      expect(() => {
        builder.internal_addDecisionPointMapping({
          decisionPoint: 'test',
          required: true,
          dataSources: [],
          transformRules: [],
          validValues: ['VALUE1']
        });
        builder.build();
      }).toThrow("Decision point 'test' must have at least one data source or a default value");
    });

    it('should allow decision point with no data sources if default value provided', () => {
      const config = builder
        .addDecisionPoint('test')
        .withValidValues('DEFAULT')
        .withDefault('DEFAULT')
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].defaultValue).toBe('DEFAULT');
    });

    it('should validate decision point has valid values', () => {
      const dataSource = DataSourceFactory.manual('test-src', 'Test Source', 1);
      
      expect(() => {
        builder.internal_addDecisionPointMapping({
          decisionPoint: 'test',
          required: true,
          dataSources: [dataSource],
          transformRules: [],
          validValues: []
        });
        builder.build();
      }).toThrow("Decision point 'test' must specify valid values");
    });

    it('should validate default value is in valid values', () => {
      const dataSource = DataSourceFactory.manual('test-src', 'Test Source', 1);
      
      expect(() => {
        builder.internal_addDecisionPointMapping({
          decisionPoint: 'test',
          required: true,
          dataSources: [dataSource],
          transformRules: [],
          validValues: ['VALUE1', 'VALUE2'],
          defaultValue: 'INVALID'
        });
        builder.build();
      }).toThrow("Default value 'INVALID' for decision point 'test' is not in valid values: VALUE1, VALUE2");
    });

    it('should validate data source priorities are unique', () => {
      const dataSource1 = DataSourceFactory.manual('test-src-1', 'Test Source 1', 1);
      const dataSource2 = DataSourceFactory.manual('test-src-2', 'Test Source 2', 1);
      
      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSources(dataSource1, dataSource2)
          .done()
          .build();
      }).toThrow("Duplicate priorities found in data sources for decision point 'test'");
    });
  });

  describe('data source validation', () => {
    it('should validate SQL source configuration', () => {
      const sqlSource: DataSource = {
        sourceId: 'sql-test',
        name: 'SQL Test',
        type: 'sql',
        description: 'Test SQL source',
        priority: 1,
        isActive: true,
        mimeTypes: ['application/json'],
        config: {} // Missing table or query
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(sqlSource)
          .done()
          .build();
      }).toThrow('SQL source must specify either table or query');
    });

    it('should validate API source configuration', () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test API source',
        priority: 1,
        isActive: true,
        mimeTypes: ['application/json'],
        config: {} // Missing endpoint
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(apiSource)
          .done()
          .build();
      }).toThrow('API source must specify endpoint');
    });

    it('should validate document source configuration', () => {
      const docSource: DataSource = {
        sourceId: 'doc-test',
        name: 'Doc Test',
        type: 'document',
        description: 'Test document source',
        priority: 1,
        isActive: true,
        mimeTypes: ['application/json'],
        config: {} // Missing collection
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(docSource)
          .done()
          .build();
      }).toThrow('Document source must specify collection');
    });

    it('should validate file source configuration', () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file source',
        priority: 1,
        isActive: true,
        mimeTypes: ['text/plain'],
        config: {} // Missing filePath
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(fileSource)
          .done()
          .build();
      }).toThrow('File source must specify filePath');
    });

    it('should validate data source has sourceId', () => {
      const invalidSource: DataSource = {
        sourceId: '',
        name: 'Test',
        type: 'manual',
        description: 'Test',
        priority: 1,
        isActive: true,
        mimeTypes: ['text/plain'],
        config: {}
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(invalidSource)
          .done()
          .build();
      }).toThrow('Data source must have a sourceId');
    });

    it('should validate data source has name', () => {
      const invalidSource: DataSource = {
        sourceId: 'test',
        name: '',
        type: 'manual',
        description: 'Test',
        priority: 1,
        isActive: true,
        mimeTypes: ['text/plain'],
        config: {}
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(invalidSource)
          .done()
          .build();
      }).toThrow('Data source must have a name');
    });

    it('should validate data source priority is positive', () => {
      const invalidSource: DataSource = {
        sourceId: 'test',
        name: 'Test',
        type: 'manual',
        description: 'Test',
        priority: 0,
        isActive: true,
        mimeTypes: ['text/plain'],
        config: {}
      };

      expect(() => {
        builder
          .addDecisionPoint('test')
          .withValidValues('VALUE1')
          .withSource(invalidSource)
          .done()
          .build();
      }).toThrow('Data source priority must be greater than 0');
    });

    it('should allow manual sources without additional config', () => {
      const manualSource = DataSourceFactory.manual('manual-test', 'Manual Test', 1);
      
      const config = builder
        .addDecisionPoint('test')
        .withValidValues('VALUE1')
        .withSource(manualSource)
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].dataSources[0].type).toBe('manual');
    });
  });
});

describe('DecisionPointBuilder', () => {
  let builder: MethodologyConfigBuilder;
  let dpBuilder: DecisionPointBuilder;

  beforeEach(() => {
    builder = new MethodologyConfigBuilder('Test', '1.0');
    dpBuilder = builder.addDecisionPoint('test_point');
  });

  describe('fluent interface', () => {
    it('should support method chaining', () => {
      const result = dpBuilder
        .required(false)
        .withValidValues('VALUE1', 'VALUE2')
        .withDefault('VALUE1')
        .done();
      
      expect(result).toBe(builder);
    });

    it('should set required flag', () => {
      const config = dpBuilder
        .required(false)
        .withValidValues('VALUE1')
        .withDefault('VALUE1')
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].required).toBe(false);
    });

    it('should default required to true', () => {
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withDefault('VALUE1')
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].required).toBe(true);
    });
  });

  describe('data source management', () => {
    it('should add single data source', () => {
      const dataSource = DataSourceFactory.manual('test', 'Test', 1);
      
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withSource(dataSource)
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].dataSources).toHaveLength(1);
      expect(config.decisionPointMappings[0].dataSources[0].sourceId).toBe('test');
    });

    it('should add multiple data sources with withSources', () => {
      const source1 = DataSourceFactory.manual('test1', 'Test 1', 1);
      const source2 = DataSourceFactory.manual('test2', 'Test 2', 2);
      
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withSources(source1, source2)
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].dataSources).toHaveLength(2);
    });

    it('should sort data sources by priority', () => {
      const source1 = DataSourceFactory.manual('test1', 'Test 1', 3);
      const source2 = DataSourceFactory.manual('test2', 'Test 2', 1);
      const source3 = DataSourceFactory.manual('test3', 'Test 3', 2);
      
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withSources(source1, source2, source3)
        .done()
        .build();
      
      const sources = config.decisionPointMappings[0].dataSources;
      expect(sources[0].priority).toBe(1);
      expect(sources[1].priority).toBe(2);
      expect(sources[2].priority).toBe(3);
    });
  });

  describe('transform rules', () => {
    it('should add single transform rule', () => {
      const rule = TransformRuleFactory.stringMatch('input', 'output');
      
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withDefault('VALUE1')
        .withTransform(rule)
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].transformRules).toHaveLength(1);
    });

    it('should add multiple transform rules', () => {
      const rule1 = TransformRuleFactory.stringMatch('input1', 'output1');
      const rule2 = TransformRuleFactory.stringMatch('input2', 'output2');
      
      const config = dpBuilder
        .withValidValues('VALUE1')
        .withDefault('VALUE1')
        .withTransforms(rule1, rule2)
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].transformRules).toHaveLength(2);
    });
  });

  describe('default values', () => {
    it('should set default value', () => {
      const config = dpBuilder
        .withValidValues('VALUE1', 'VALUE2')
        .withDefault('VALUE2')
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].defaultValue).toBe('VALUE2');
    });
  });

  describe('valid values', () => {
    it('should set valid values', () => {
      const config = dpBuilder
        .withValidValues('VALUE1', 'VALUE2', 'VALUE3')
        .withDefault('VALUE1')
        .done()
        .build();
      
      expect(config.decisionPointMappings[0].validValues).toEqual(['VALUE1', 'VALUE2', 'VALUE3']);
    });
  });
});

describe('DataSourceFactory', () => {
  describe('sql', () => {
    it('should create SQL data source with table config', () => {
      const source = DataSourceFactory.sql(
        'sql-test',
        'SQL Test',
        1,
        { table: 'vulnerabilities', column: 'exploitation' }
      );

      expect(source.type).toBe('sql');
      expect(source.sourceId).toBe('sql-test');
      expect(source.config.table).toBe('vulnerabilities');
      expect(source.config.column).toBe('exploitation');
    });

    it('should create SQL data source with query config', () => {
      const source = DataSourceFactory.sql(
        'sql-test',
        'SQL Test',
        1,
        { query: 'SELECT exploitation FROM vulnerabilities WHERE id = ?' }
      );

      expect(source.config.query).toBe('SELECT exploitation FROM vulnerabilities WHERE id = ?');
    });

    it('should use default values', () => {
      const source = DataSourceFactory.sql('test', 'Test', 1, { table: 'test' });
      
      expect(source.description).toBe('SQL data source');
      expect(source.mimeTypes).toEqual(['application/json']);
      expect(source.isActive).toBe(true);
    });
  });

  describe('api', () => {
    it('should create API data source', () => {
      const source = DataSourceFactory.api(
        'api-test',
        'API Test',
        1,
        { endpoint: 'https://api.example.com/data' }
      );

      expect(source.type).toBe('api');
      expect(source.config.endpoint).toBe('https://api.example.com/data');
      expect(source.config.method).toBe('GET');
      expect(source.connectionString).toBe('https://api.example.com/data');
    });

    it('should allow custom method and headers', () => {
      const source = DataSourceFactory.api(
        'api-test',
        'API Test',
        1,
        {
          endpoint: 'https://api.example.com/data',
          method: 'POST',
          headers: { 'Authorization': 'Bearer token' }
        }
      );

      expect(source.config.method).toBe('POST');
      expect(source.config.headers).toEqual({ 'Authorization': 'Bearer token' });
    });
  });

  describe('document', () => {
    it('should create document data source', () => {
      const source = DataSourceFactory.document(
        'doc-test',
        'Document Test',
        1,
        { collection: 'vulnerabilities', jsonPath: '$.exploitation' }
      );

      expect(source.type).toBe('document');
      expect(source.config.collection).toBe('vulnerabilities');
      expect(source.config.jsonPath).toBe('$.exploitation');
    });
  });

  describe('file', () => {
    it('should create file data source', () => {
      const source = DataSourceFactory.file(
        'file-test',
        'File Test',
        1,
        { filePath: '/path/to/file.json', mimeType: 'application/json' }
      );

      expect(source.type).toBe('file');
      expect(source.config.filePath).toBe('/path/to/file.json');
      expect(source.mimeTypes).toEqual(['application/json']);
    });

    it('should use custom mimeTypes array', () => {
      const source = DataSourceFactory.file(
        'file-test',
        'File Test',
        1,
        { filePath: '/path/to/file.txt' },
        'File Test',
        ['text/plain', 'text/csv']
      );

      expect(source.mimeTypes).toEqual(['text/plain', 'text/csv']);
    });

    it('should default to text/plain when no mimeType specified', () => {
      const source = DataSourceFactory.file(
        'file-test',
        'File Test',
        1,
        { filePath: '/path/to/file.txt' }
      );

      expect(source.mimeTypes).toEqual(['text/plain']);
    });
  });

  describe('manual', () => {
    it('should create manual data source', () => {
      const source = DataSourceFactory.manual('manual-test', 'Manual Test', 1);

      expect(source.type).toBe('manual');
      expect(source.sourceId).toBe('manual-test');
      expect(source.config).toEqual({});
      expect(source.mimeTypes).toEqual(['text/plain']);
    });

    it('should allow custom description and mimeTypes', () => {
      const source = DataSourceFactory.manual(
        'manual-test',
        'Manual Test',
        1,
        'Custom manual source',
        ['application/json']
      );

      expect(source.description).toBe('Custom manual source');
      expect(source.mimeTypes).toEqual(['application/json']);
    });
  });
});

describe('TransformRuleFactory', () => {
  describe('stringMatch', () => {
    it('should create string match rule', () => {
      const rule = TransformRuleFactory.stringMatch('input', 'output');

      expect(rule.sourceValue).toBe('input');
      expect(rule.targetValue).toBe('output');
      expect(rule.applicableToMappings).toEqual([]);
      expect(rule.applicableToSources).toEqual([]);
    });

    it('should accept applicability arrays', () => {
      const rule = TransformRuleFactory.stringMatch(
        'input',
        'output',
        ['mapping1'],
        ['source1']
      );

      expect(rule.applicableToMappings).toEqual(['mapping1']);
      expect(rule.applicableToSources).toEqual(['source1']);
    });
  });

  describe('regexMatch', () => {
    it('should create regex match rule', () => {
      const pattern = /^test$/i;
      const rule = TransformRuleFactory.regexMatch(pattern, 'output');

      expect(rule.sourceValue).toBe(pattern);
      expect(rule.targetValue).toBe('output');
    });
  });

  describe('caseInsensitiveMatch', () => {
    it('should create case insensitive match rule', () => {
      const rule = TransformRuleFactory.caseInsensitiveMatch('Test', 'output');

      expect(rule.sourceValue).toBeInstanceOf(RegExp);
      expect((rule.sourceValue as RegExp).test('test')).toBe(true);
      expect((rule.sourceValue as RegExp).test('TEST')).toBe(true);
      expect((rule.sourceValue as RegExp).test('Test')).toBe(true);
      expect(rule.targetValue).toBe('output');
    });
  });

  describe('booleanToYesNo', () => {
    it('should create boolean transform rules', () => {
      const rules = TransformRuleFactory.booleanToYesNo();

      expect(rules).toHaveLength(2);
      
      // Test true values
      const trueRule = rules[0];
      expect(trueRule.targetValue).toBe('YES');
      expect((trueRule.sourceValue as RegExp).test('true')).toBe(true);
      expect((trueRule.sourceValue as RegExp).test('1')).toBe(true);
      expect((trueRule.sourceValue as RegExp).test('yes')).toBe(true);
      expect((trueRule.sourceValue as RegExp).test('Y')).toBe(true);

      // Test false values
      const falseRule = rules[1];
      expect(falseRule.targetValue).toBe('NO');
      expect((falseRule.sourceValue as RegExp).test('false')).toBe(true);
      expect((falseRule.sourceValue as RegExp).test('0')).toBe(true);
      expect((falseRule.sourceValue as RegExp).test('no')).toBe(true);
      expect((falseRule.sourceValue as RegExp).test('N')).toBe(true);
    });

    it('should accept applicability arrays', () => {
      const rules = TransformRuleFactory.booleanToYesNo(['mapping1'], ['source1']);

      expect(rules[0].applicableToMappings).toEqual(['mapping1']);
      expect(rules[0].applicableToSources).toEqual(['source1']);
      expect(rules[1].applicableToMappings).toEqual(['mapping1']);
      expect(rules[1].applicableToSources).toEqual(['source1']);
    });
  });
});

describe('CommonConfigurations', () => {
  describe('cisaTemplate', () => {
    it('should create CISA template configuration', () => {
      const config = CommonConfigurations.cisaTemplate().build();

      expect(config.methodology).toBe('CISA');
      expect(config.version).toBe('1.0');
      expect(config.decisionPointMappings).toHaveLength(4);

      const exploitationMapping = config.decisionPointMappings.find(
        m => m.decisionPoint === 'exploitation'
      );
      expect(exploitationMapping).toBeDefined();
      expect(exploitationMapping?.validValues).toEqual(['NONE', 'POC', 'ACTIVE']);
      expect(exploitationMapping?.defaultValue).toBe('NONE');
      expect(exploitationMapping?.required).toBe(true);

      const automatableMapping = config.decisionPointMappings.find(
        m => m.decisionPoint === 'automatable'
      );
      expect(automatableMapping).toBeDefined();
      expect(automatableMapping?.validValues).toEqual(['YES', 'NO']);
      expect(automatableMapping?.defaultValue).toBe('NO');

      const technicalImpactMapping = config.decisionPointMappings.find(
        m => m.decisionPoint === 'technical_impact'
      );
      expect(technicalImpactMapping).toBeDefined();
      expect(technicalImpactMapping?.validValues).toEqual(['PARTIAL', 'TOTAL']);
      expect(technicalImpactMapping?.defaultValue).toBe('PARTIAL');

      const missionWellbeingMapping = config.decisionPointMappings.find(
        m => m.decisionPoint === 'mission_wellbeing'
      );
      expect(missionWellbeingMapping).toBeDefined();
      expect(missionWellbeingMapping?.validValues).toEqual(['LOW', 'MEDIUM', 'HIGH']);
      expect(missionWellbeingMapping?.defaultValue).toBe('LOW');
    });

    it('should allow extending CISA template', () => {
      const customConfig = CommonConfigurations.cisaTemplate()
        .addDecisionPoint('custom_point')
        .withValidValues('CUSTOM1', 'CUSTOM2')
        .withDefault('CUSTOM1')
        .done()
        .build();

      expect(customConfig.decisionPointMappings).toHaveLength(5);
      
      const customMapping = customConfig.decisionPointMappings.find(
        m => m.decisionPoint === 'custom_point'
      );
      expect(customMapping).toBeDefined();
      expect(customMapping?.validValues).toEqual(['CUSTOM1', 'CUSTOM2']);
    });
  });
});