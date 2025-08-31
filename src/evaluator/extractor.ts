/**
 * Data Source Value Extractor
 * 
 * Extracts values from various data source types with proper error handling
 */

import { JSONPath } from 'jsonpath-plus';
import * as yaml from 'yaml';
import { RawDataInput } from '../evidence/types';
import { DataSource, DataSourceConfig, ExtractionResult } from '../mapping/types';

/**
 * Data extractor for different source types
 */
export class DataExtractor {
  
  /**
   * Extract value from any data source type
   */
  async extract(input: RawDataInput, source: DataSource): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      let value: any;
      
      switch (source.type) {
        case 'manual':
          value = await this.extractFromManual(input, source.config);
          break;
        case 'sql':
          value = await this.extractFromSQL(input, source.config);
          break;
        case 'api':
          value = await this.extractFromAPI(input, source.config);
          break;
        case 'document':
          value = await this.extractFromDocument(input, source.config);
          break;
        case 'file':
          value = await this.extractFromFile(input, source.config);
          break;
        default:
          throw new Error(`Unsupported data source type: ${source.type}`);
      }
      
      return {
        value,
        success: true,
        metadata: {
          timestamp: Date.now(),
          query: this.buildQueryDescription(source),
          size: this.calculateDataSize(value)
        }
      };
      
    } catch (error) {
      return {
        value: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          timestamp: Date.now(),
          query: this.buildQueryDescription(source)
        }
      };
    }
  }
  
  /**
   * Extract from manual input (direct data)
   */
  private async extractFromManual(
    input: RawDataInput, 
    config: DataSourceConfig
  ): Promise<any> {
    // Manual input is the data as-is
    return input.data;
  }
  
  /**
   * Extract from SQL data
   */
  private async extractFromSQL(
    input: RawDataInput,
    config: DataSourceConfig
  ): Promise<any> {
    // For SQL sources, we expect the input data to be the query result
    // In a real implementation, this would execute the SQL query
    
    if (config.column) {
      // Extract specific column
      if (Array.isArray(input.data)) {
        // Multiple rows - extract column from first row
        return input.data[0]?.[config.column];
      } else if (typeof input.data === 'object' && input.data !== null) {
        // Single row
        return input.data[config.column];
      } else {
        throw new Error(`SQL data format not supported for column extraction: ${typeof input.data}`);
      }
    } else {
      // Return the full data
      return input.data;
    }
  }
  
  /**
   * Extract from API data
   */
  private async extractFromAPI(
    input: RawDataInput,
    config: DataSourceConfig
  ): Promise<any> {
    // For API sources, we expect the input data to be the API response
    // In a real implementation, this would make the HTTP request
    
    let data = input.data;
    
    // If data is a string, try to parse as JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        // Not JSON, use as-is
      }
    }
    
    // Apply JSON path extraction if specified
    if (config.jsonPath) {
      return this.extractFromJSONPath(data, config.jsonPath);
    }
    
    return data;
  }
  
  /**
   * Extract from document data (NoSQL, MongoDB, etc.)
   */
  private async extractFromDocument(
    input: RawDataInput,
    config: DataSourceConfig
  ): Promise<any> {
    let data = input.data;
    
    // If data is a string, try to parse as JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        throw new Error(`Failed to parse document data as JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Apply JSON path extraction if specified
    if (config.jsonPath) {
      return this.extractFromJSONPath(data, config.jsonPath);
    }
    
    return data;
  }
  
  /**
   * Extract from file data
   */
  private async extractFromFile(
    input: RawDataInput,
    config: DataSourceConfig
  ): Promise<any> {
    let data = input.data;
    
    // Parse based on MIME type
    if (config.mimeType) {
      data = await this.parseFileContent(data, config.mimeType);
    }
    
    return data;
  }
  
  /**
   * Parse file content based on MIME type
   */
  private async parseFileContent(data: any, mimeType: string): Promise<any> {
    switch (mimeType.toLowerCase()) {
      case 'application/json':
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (error) {
            throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        return data;
        
      case 'text/csv':
        return this.parseCSV(data.toString());
        
        
      case 'text/plain':
        return data.toString();
        
      case 'application/yaml':
      case 'text/yaml':
        return this.parseYAML(data.toString());
        
      case 'application/xml':
      case 'text/xml':
        throw new Error(`Unsupported MIME type: ${mimeType}. XML parsing is not supported.`);
      default:
        // Unknown MIME type, return as-is
        return data;
    }
  }
  
  /**
   * Simple CSV parser
   */
  private parseCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return data;
  }
  
  
  /**
   * YAML parser using yaml package
   */
  private parseYAML(yamlContent: string): any {
    try {
      return yaml.parse(yamlContent);
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract value using JSONPath with jsonpath-plus library
   */
  private extractFromJSONPath(data: any, jsonPath: string): any {
    try {
      if (jsonPath === '$' || jsonPath === '') {
        return data;
      }

      const result = JSONPath({ path: jsonPath, json: data });

      if (result.length === 0) {
        throw new Error(`JSONPath '${jsonPath}' returned no results`);
      }

      // Return single value if only one result, otherwise return array
      return result.length === 1 ? result[0] : result;
    } catch (error) {
      throw new Error(`JSONPath '${jsonPath}' failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Build query description for audit trail
   */
  private buildQueryDescription(source: DataSource): string {
    switch (source.type) {
      case 'sql':
        if (source.config.query) {
          return source.config.query;
        } else if (source.config.table && source.config.column) {
          return `SELECT ${source.config.column} FROM ${source.config.table}`;
        } else {
          return `SQL query on ${source.config.table || 'unknown table'}`;
        }
        
      case 'api':
        return `${source.config.method || 'GET'} ${source.config.endpoint}`;
        
      case 'document':
        return `Collection: ${source.config.collection}, JSONPath: ${source.config.jsonPath || '$'}`;
        
      case 'file':
        return `File: ${source.config.filePath} (${source.config.mimeType || 'unknown type'})`;
        
      case 'manual':
        return 'Manual input';
        
default:
        return `Unknown source type: ${source.type}`;
    }
  }
  
  /**
   * Calculate rough data size for metadata
   */
  private calculateDataSize(data: any): number {
    if (data === null || data === undefined) {
      return 0;
    }
    
    if (typeof data === 'string') {
      return data.length;
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
      return 8; // Rough estimate
    }
    
    if (Array.isArray(data)) {
      return data.length;
    }
    
    if (typeof data === 'object') {
      return Object.keys(data).length;
    }
    
    return 0;
  }
}

/**
 * Enhanced JSON Path extractor with more features
 */
export class JSONPathExtractor {
  
  /**
   * Extract using JSONPath with wildcards and filters
   */
  static extract(data: any, jsonPath: string): any {
    const extractor = new JSONPathExtractor();
    return extractor.extract(data, jsonPath);
  }
  
  private extract(data: any, path: string): any {
    if (path === '$') {
      return data;
    }

    // Handle array access at the root
    const rootArrayMatch = path.match(/^\$\[(\d+)\]$/);
    if (rootArrayMatch && Array.isArray(data)) {
      const index = parseInt(rootArrayMatch[1], 10);
      return data[index];
    }

    // Handle simple paths for now
    // In production, implement full JSONPath specification
    return this.extractSimplePath(data, path.replace(/^\$\./, ''));
  }
  
  private extractSimplePath(data: any, path: string): any {
    const segments = path.split('.');
    let current = data;
    
    for (const segment of segments) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Handle wildcards (*)
      if (segment === '*') {
        if (Array.isArray(current)) {
          // Return all array elements
          return current;
        } else if (typeof current === 'object') {
          // Return all object values
          return Object.values(current);
        }
        return undefined;
      }
      
      // Handle array access
      if (segment.includes('[') && segment.includes(']')) {
        const [key, indexStr] = segment.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        
        if (key) {
          current = current[key];
        }
        
        if (Array.isArray(current) && !isNaN(index)) {
          current = current[index];
        }
      } else {
        // Simple property access
        current = current[segment];
      }
    }
    
    return current;
  }
}
