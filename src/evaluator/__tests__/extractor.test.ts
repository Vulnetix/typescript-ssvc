/**
 * Tests for DataExtractor
 */

import { DataExtractor, JSONPathExtractor } from '../extractor';
import { DataSource } from '../../mapping/types';
import { RawDataInput } from '../../evidence/types';

describe('DataExtractor', () => {
  let extractor: DataExtractor;

  beforeEach(() => {
    extractor = new DataExtractor();
  });

  describe('YAML parsing', () => {
    it('should parse valid YAML content', async () => {
      const yamlSource: DataSource = {
        sourceId: 'yaml-test',
        name: 'YAML Test',
        type: 'file',
        description: 'Test YAML parsing',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/yaml'],
        config: {
          filePath: 'test.yaml',
          mimeType: 'application/yaml'
        }
      };

      const yamlInput: RawDataInput = {
        sourceId: 'yaml-test',
        data: `
name: "Test"
version: "1.0"
items:
  - value1
  - value2
`,
        timestamp: Date.now()
      };

      const result = await extractor.extract(yamlInput, yamlSource);
      
      expect(result.success).toBe(true);
      expect(result.value.name).toBe('Test');
      expect(result.value.version).toBe('1.0');
      expect(result.value.items).toEqual(['value1', 'value2']);
    });

    it('should handle invalid YAML', async () => {
      const yamlSource: DataSource = {
        sourceId: 'yaml-test',
        name: 'YAML Test',
        type: 'file',
        description: 'Test YAML parsing',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/yaml'],
        config: {
          filePath: 'test.yaml',
          mimeType: 'application/yaml'
        }
      };

      const yamlInput: RawDataInput = {
        sourceId: 'yaml-test',
        data: `
invalid: yaml: content [
`,
        timestamp: Date.now()
      };

      const result = await extractor.extract(yamlInput, yamlSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse YAML');
    });
  });

  describe('JSONPath extraction', () => {
    it('should extract values using JSONPath', async () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test JSONPath extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          endpoint: 'https://api.example.com',
          method: 'GET',
          jsonPath: '$.data.items[0].value'
        }
      };

      const apiInput: RawDataInput = {
        sourceId: 'api-test',
        data: {
          data: {
            items: [
              { value: 'test-value-1' },
              { value: 'test-value-2' }
            ]
          }
        },
        timestamp: Date.now()
      };

      const result = await extractor.extract(apiInput, apiSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('test-value-1');
    });

    it('should handle invalid JSONPath', async () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test JSONPath extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          endpoint: 'https://api.example.com',
          method: 'GET',
          jsonPath: '$.nonexistent.path'
        }
      };

      const apiInput: RawDataInput = {
        sourceId: 'api-test',
        data: { data: { items: [] } },
        timestamp: Date.now()
      };

      const result = await extractor.extract(apiInput, apiSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSONPath');
    });
  });

  describe('Manual data source', () => {
    it('should handle manual input directly', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/plain'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: 'manual-value',
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('manual-value');
    });
  });

  describe('CSV parsing', () => {
    it('should parse CSV data correctly', async () => {
      const csvSource: DataSource = {
        sourceId: 'csv-test',
        name: 'CSV Test',
        type: 'file',
        description: 'Test CSV parsing',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/csv'],
        config: {
          filePath: 'test.csv',
          mimeType: 'text/csv'
        }
      };

      const csvInput: RawDataInput = {
        sourceId: 'csv-test',
        data: `name,value,priority
item1,active,high
item2,inactive,low`,
        timestamp: Date.now()
      };

      const result = await extractor.extract(csvInput, csvSource);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.value)).toBe(true);
      expect(result.value[0]).toEqual({
        name: 'item1',
        value: 'active',
        priority: 'high'
      });
      expect(result.value[1]).toEqual({
        name: 'item2',
        value: 'inactive',
        priority: 'low'
      });
    });
  });

  describe('SQL extraction', () => {
    it('should extract from SQL array data with column', async () => {
      const sqlSource: DataSource = {
        sourceId: 'sql-test',
        name: 'SQL Test',
        type: 'sql',
        description: 'Test SQL extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          table: 'vulnerabilities',
          column: 'exploitation'
        }
      };

      const sqlInput: RawDataInput = {
        sourceId: 'sql-test',
        data: [
          { id: 1, exploitation: 'ACTIVE', technical_impact: 'TOTAL' },
          { id: 2, exploitation: 'POC', technical_impact: 'PARTIAL' }
        ],
        timestamp: Date.now()
      };

      const result = await extractor.extract(sqlInput, sqlSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
    });

    it('should extract from SQL object data with column', async () => {
      const sqlSource: DataSource = {
        sourceId: 'sql-test',
        name: 'SQL Test',
        type: 'sql',
        description: 'Test SQL extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          table: 'vulnerabilities',
          column: 'exploitation'
        }
      };

      const sqlInput: RawDataInput = {
        sourceId: 'sql-test',
        data: { id: 1, exploitation: 'POC', technical_impact: 'PARTIAL' },
        timestamp: Date.now()
      };

      const result = await extractor.extract(sqlInput, sqlSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('POC');
    });

    it('should throw error for invalid SQL data format', async () => {
      const sqlSource: DataSource = {
        sourceId: 'sql-test',
        name: 'SQL Test',
        type: 'sql',
        description: 'Test SQL extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          table: 'vulnerabilities',
          column: 'exploitation'
        }
      };

      const sqlInput: RawDataInput = {
        sourceId: 'sql-test',
        data: 'invalid-sql-data',
        timestamp: Date.now()
      };

      const result = await extractor.extract(sqlInput, sqlSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('SQL data format not supported');
    });

    it('should return full data when no column specified', async () => {
      const sqlSource: DataSource = {
        sourceId: 'sql-test',
        name: 'SQL Test',
        type: 'sql',
        description: 'Test SQL extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          table: 'vulnerabilities'
        }
      };

      const sqlInput: RawDataInput = {
        sourceId: 'sql-test',
        data: { id: 1, exploitation: 'ACTIVE' },
        timestamp: Date.now()
      };

      const result = await extractor.extract(sqlInput, sqlSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toEqual({ id: 1, exploitation: 'ACTIVE' });
    });
  });

  describe('API extraction', () => {
    it('should parse JSON string data from API', async () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test API extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          endpoint: 'https://api.example.com'
        }
      };

      const apiInput: RawDataInput = {
        sourceId: 'api-test',
        data: '{"exploitation": "ACTIVE", "score": 8.5}',
        timestamp: Date.now()
      };

      const result = await extractor.extract(apiInput, apiSource);
      
      expect(result.success).toBe(true);
      expect(result.value.exploitation).toBe('ACTIVE');
      expect(result.value.score).toBe(8.5);
    });

    it('should handle non-JSON string data from API', async () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test API extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/plain'],
        config: {
          endpoint: 'https://api.example.com'
        }
      };

      const apiInput: RawDataInput = {
        sourceId: 'api-test',
        data: 'plain-text-response',
        timestamp: Date.now()
      };

      const result = await extractor.extract(apiInput, apiSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('plain-text-response');
    });

    it('should apply JSONPath to API data', async () => {
      const apiSource: DataSource = {
        sourceId: 'api-test',
        name: 'API Test',
        type: 'api',
        description: 'Test API extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          endpoint: 'https://api.example.com',
          jsonPath: '$.vulnerability.exploitation'
        }
      };

      const apiInput: RawDataInput = {
        sourceId: 'api-test',
        data: {
          vulnerability: {
            exploitation: 'ACTIVE',
            impact: 'HIGH'
          }
        },
        timestamp: Date.now()
      };

      const result = await extractor.extract(apiInput, apiSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
    });
  });

  describe('Document extraction', () => {
    it('should parse JSON string data from document source', async () => {
      const docSource: DataSource = {
        sourceId: 'doc-test',
        name: 'Document Test',
        type: 'document',
        description: 'Test document extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          collection: 'vulnerabilities'
        }
      };

      const docInput: RawDataInput = {
        sourceId: 'doc-test',
        data: '{"exploitation": "POC", "automatable": true}',
        timestamp: Date.now()
      };

      const result = await extractor.extract(docInput, docSource);
      
      expect(result.success).toBe(true);
      expect(result.value.exploitation).toBe('POC');
      expect(result.value.automatable).toBe(true);
    });

    it('should throw error for invalid JSON in document data', async () => {
      const docSource: DataSource = {
        sourceId: 'doc-test',
        name: 'Document Test',
        type: 'document',
        description: 'Test document extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          collection: 'vulnerabilities'
        }
      };

      const docInput: RawDataInput = {
        sourceId: 'doc-test',
        data: '{"invalid": json}',
        timestamp: Date.now()
      };

      const result = await extractor.extract(docInput, docSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse document data as JSON');
    });

    it('should apply JSONPath to document data', async () => {
      const docSource: DataSource = {
        sourceId: 'doc-test',
        name: 'Document Test',
        type: 'document',
        description: 'Test document extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          collection: 'vulnerabilities',
          jsonPath: '$.data.exploitation'
        }
      };

      const docInput: RawDataInput = {
        sourceId: 'doc-test',
        data: {
          data: {
            exploitation: 'NONE',
            technical_impact: 'PARTIAL'
          }
        },
        timestamp: Date.now()
      };

      const result = await extractor.extract(docInput, docSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('NONE');
    });
  });

  describe('File extraction', () => {
    it('should parse JSON file content', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          filePath: '/path/to/file.json',
          mimeType: 'application/json'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: '{"exploitation": "ACTIVE", "score": 9.0}',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(true);
      expect(result.value.exploitation).toBe('ACTIVE');
      expect(result.value.score).toBe(9.0);
    });

    it('should handle JSON parsing errors in files', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          filePath: '/path/to/file.json',
          mimeType: 'application/json'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: '{invalid json content}',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse JSON');
    });

    it('should handle unsupported XML MIME type', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/xml'],
        config: {
          filePath: '/path/to/file.xml',
          mimeType: 'application/xml'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: '<vulnerability><exploitation>ACTIVE</exploitation></vulnerability>',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported MIME type');
    });

    it('should handle unsupported text/xml MIME type', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/xml'],
        config: {
          filePath: '/path/to/file.xml',
          mimeType: 'text/xml'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: '<test>data</test>',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported MIME type');
    });

    it('should handle text/plain files', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/plain'],
        config: {
          filePath: '/path/to/file.txt',
          mimeType: 'text/plain'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: 'ACTIVE',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('ACTIVE');
    });

    it('should handle text/yaml files', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/yaml'],
        config: {
          filePath: '/path/to/file.yaml',
          mimeType: 'text/yaml'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: 'exploitation: ACTIVE\ntechnical_impact: TOTAL',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(true);
      expect(result.value.exploitation).toBe('ACTIVE');
      expect(result.value.technical_impact).toBe('TOTAL');
    });

    it('should handle unknown MIME types', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/unknown'],
        config: {
          filePath: '/path/to/file.unk',
          mimeType: 'application/unknown'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: 'unknown-data-format',
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(true);
      expect(result.value).toBe('unknown-data-format');
    });

    it('should return object data as-is when already parsed JSON', async () => {
      const fileSource: DataSource = {
        sourceId: 'file-test',
        name: 'File Test',
        type: 'file',
        description: 'Test file extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          filePath: '/path/to/file.json',
          mimeType: 'application/json'
        }
      };

      const fileInput: RawDataInput = {
        sourceId: 'file-test',
        data: { exploitation: 'POC', already: 'parsed' },
        timestamp: Date.now()
      };

      const result = await extractor.extract(fileInput, fileSource);
      
      expect(result.success).toBe(true);
      expect(result.value.exploitation).toBe('POC');
      expect(result.value.already).toBe('parsed');
    });
  });

  describe('Error handling', () => {
    it('should handle unsupported data source types', async () => {
      const invalidSource: DataSource = {
        sourceId: 'invalid-test',
        name: 'Invalid Test',
        type: 'unsupported' as any,
        description: 'Test unsupported type',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {}
      };

      const input: RawDataInput = {
        sourceId: 'invalid-test',
        data: 'test',
        timestamp: Date.now()
      };

      const result = await extractor.extract(input, invalidSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported data source type');
    });

    it('should handle extraction errors gracefully', async () => {
      const docSource: DataSource = {
        sourceId: 'doc-test',
        name: 'Document Test',
        type: 'document',
        description: 'Test document extraction',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {
          collection: 'vulnerabilities',
          jsonPath: '$.nonexistent.path'
        }
      };

      const docInput: RawDataInput = {
        sourceId: 'doc-test',
        data: { data: { exploitation: 'ACTIVE' } },
        timestamp: Date.now()
      };

      const result = await extractor.extract(docInput, docSource);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSONPath');
    });
  });

  describe('Data size calculation', () => {
    it('should calculate data size for strings', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['text/plain'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: 'test-string',
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.size).toBe(11); // 'test-string'.length
    });

    it('should calculate data size for arrays', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: ['item1', 'item2', 'item3'],
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.size).toBe(3); // array.length
    });

    it('should calculate data size for objects', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: { key1: 'value1', key2: 'value2' },
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.size).toBe(2); // Object.keys().length
    });

    it('should handle null/undefined data size', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: null,
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.size).toBe(0);
    });

    it('should estimate size for numbers and booleans', async () => {
      const manualSource: DataSource = {
        sourceId: 'manual-test',
        name: 'Manual Test',
        type: 'manual',
        description: 'Test manual input',
        isActive: true,
        priority: 1,
        mimeTypes: ['application/json'],
        config: {}
      };

      const manualInput: RawDataInput = {
        sourceId: 'manual-test',
        data: 42,
        timestamp: Date.now()
      };

      const result = await extractor.extract(manualInput, manualSource);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.size).toBe(8); // estimated size for numbers
    });
  });
});

describe('JSONPathExtractor', () => {
  describe('static extract method', () => {
    it('should extract using static method', () => {
      const data = { test: { value: 'result' } };
      const result = JSONPathExtractor.extract(data, '$.test.value');
      expect(result).toBe('result');
    });

    it('should handle root path', () => {
      const data = { test: 'value' };
      const result = JSONPathExtractor.extract(data, '$');
      expect(result).toEqual({ test: 'value' });
    });

    it('should handle simple property access', () => {
      const data = { test: { nested: { value: 'deep-result' } } };
      const result = JSONPathExtractor.extract(data, '$.test.nested.value');
      expect(result).toBe('deep-result');
    });

    it('should handle wildcards for arrays', () => {
      const data = { items: [1, 2, 3] };
      const result = JSONPathExtractor.extract(data, '$.items.*');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle wildcards for objects', () => {
      const data = { 
        items: { 
          a: 'value1', 
          b: 'value2', 
          c: 'value3' 
        } 
      };
      const result = JSONPathExtractor.extract(data, '$.items.*');
      expect(result).toEqual(['value1', 'value2', 'value3']);
    });

    it('should handle array access with indices', () => {
      const data = { 
        items: [
          { name: 'item1' },
          { name: 'item2' },
          { name: 'item3' }
        ]
      };
      const result = JSONPathExtractor.extract(data, '$.items[1].name');
      expect(result).toBe('item2');
    });

    it('should handle array access without key', () => {
      const data = ['item1', 'item2', 'item3'];
      const result = JSONPathExtractor.extract(data, '$[2]');
      expect(result).toBe('item3');
    });

    it('should return undefined for non-existent paths', () => {
      const data = { test: 'value' };
      const result = JSONPathExtractor.extract(data, '$.nonexistent.path');
      expect(result).toBeUndefined();
    });

    it('should handle null/undefined data gracefully', () => {
      const result = JSONPathExtractor.extract(null, '$.test');
      expect(result).toBeUndefined();
    });

    it('should handle invalid array indices', () => {
      const data = { items: ['a', 'b', 'c'] };
      const result = JSONPathExtractor.extract(data, '$.items[invalid]');
      expect(result).toEqual(['a', 'b', 'c']); // Falls back to array access
    });
  });
});