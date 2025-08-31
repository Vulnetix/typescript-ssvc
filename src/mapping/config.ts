/**
 * Methodology Configuration System
 * 
 * Comprehensive configuration for mapping data sources to SSVC methodologies
 */

import { 
  DataSource, 
  TransformRule, 
  DecisionPointMapping, 
  MethodologyDataConfig 
} from './types';

/**
 * Configuration builder for creating methodology data configs
 */
export class MethodologyConfigBuilder {
  private config: MethodologyDataConfig;
  
  constructor(methodology: string, version: string) {
    this.config = {
      methodology,
      version,
      decisionPointMappings: []
    };
  }
  
  /**
   * Add a decision point configuration
   */
  addDecisionPoint(name: string): DecisionPointBuilder {
    return new DecisionPointBuilder(this, name);
  }
  
  /**
   * Build the final configuration
   */
  build(): MethodologyDataConfig {
    this.validate();
    return this.config;
  }
  
  /**
   * Internal method to add a decision point mapping
   */
  internal_addDecisionPointMapping(mapping: DecisionPointMapping): void {
    this.config.decisionPointMappings.push(mapping);
  }
  
  private validate(): void {
    if (this.config.decisionPointMappings.length === 0) {
      throw new Error('At least one decision point mapping must be configured');
    }
    
    // Validate each decision point
    for (const mapping of this.config.decisionPointMappings) {
      this.validateDecisionPointMapping(mapping);
    }
    
    // Check for duplicate decision points
    const decisionPointNames = this.config.decisionPointMappings.map(m => m.decisionPoint);
    const duplicates = decisionPointNames.filter((name, index) => 
      decisionPointNames.indexOf(name) !== index
    );
    
    if (duplicates.length > 0) {
      throw new Error(`Duplicate decision points found: ${duplicates.join(', ')}`);
    }
  }
  
  private validateDecisionPointMapping(mapping: DecisionPointMapping): void {
    if (!mapping.decisionPoint) {
      throw new Error('Decision point name is required');
    }
    
    if (mapping.dataSources.length === 0 && !mapping.defaultValue) {
      throw new Error(`Decision point '${mapping.decisionPoint}' must have at least one data source or a default value`);
    }
    
    if (mapping.validValues.length === 0) {
      throw new Error(`Decision point '${mapping.decisionPoint}' must specify valid values`);
    }
    
    if (mapping.defaultValue && !mapping.validValues.includes(mapping.defaultValue)) {
      throw new Error(`Default value '${mapping.defaultValue}' for decision point '${mapping.decisionPoint}' is not in valid values: ${mapping.validValues.join(', ')}`);
    }
    
    // Validate data sources
    for (const source of mapping.dataSources) {
      this.validateDataSource(source);
    }
    
    // Validate priorities are unique
    const priorities = mapping.dataSources.map(s => s.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      throw new Error(`Duplicate priorities found in data sources for decision point '${mapping.decisionPoint}'`);
    }
  }
  
  private validateDataSource(source: DataSource): void {
    if (!source.sourceId) {
      throw new Error('Data source must have a sourceId');
    }
    
    if (!source.name) {
      throw new Error('Data source must have a name');
    }
    
    if (source.priority <= 0) {
      throw new Error('Data source priority must be greater than 0');
    }
    
    // Validate source-specific configuration
    switch (source.type) {
      case 'sql':
        if (!source.config.table && !source.config.query) {
          throw new Error('SQL source must specify either table or query');
        }
        break;
      case 'api':
        if (!source.config.endpoint) {
          throw new Error('API source must specify endpoint');
        }
        break;
      case 'document':
        if (!source.config.collection) {
          throw new Error('Document source must specify collection');
        }
        break;
      case 'file':
        if (!source.config.filePath) {
          throw new Error('File source must specify filePath');
        }
        break;
      case 'manual':
        // Manual sources don't require additional config
        break;
    }
  }
}

/**
 * Builder for individual decision point configurations
 */
export class DecisionPointBuilder {
  private mapping: DecisionPointMapping;
  private parent: MethodologyConfigBuilder;
  
  constructor(parent: MethodologyConfigBuilder, name: string) {
    this.parent = parent;
    this.mapping = {
      decisionPoint: name,
      required: true,
      dataSources: [],
      transformRules: [],
      validValues: []
    };
  }
  
  /**
   * Set whether this decision point is required
   */
  required(isRequired: boolean = true): this {
    this.mapping.required = isRequired;
    return this;
  }
  
  /**
   * Add a data source for this decision point
   */
  withSource(source: DataSource): this {
    this.mapping.dataSources.push(source);
    // Sort by priority
    this.mapping.dataSources.sort((a, b) => a.priority - b.priority);
    return this;
  }
  
  /**
   * Add multiple data sources
   */
  withSources(...sources: DataSource[]): this {
    for (const source of sources) {
      this.withSource(source);
    }
    return this;
  }
  
  /**
   * Add a transform rule for this decision point
   */
  withTransform(rule: TransformRule): this {
    this.mapping.transformRules.push(rule);
    return this;
  }
  
  /**
   * Add multiple transform rules
   */
  withTransforms(...rules: TransformRule[]): this {
    this.mapping.transformRules.push(...rules);
    return this;
  }
  
  /**
   * Set the default value if no data is available
   */
  withDefault(value: string): this {
    this.mapping.defaultValue = value;
    return this;
  }
  
  /**
   * Set the valid values for this decision point
   */
  withValidValues(...values: string[]): this {
    this.mapping.validValues = values;
    return this;
  }
  
  /**
   * Finish configuring this decision point and return to parent
   */
  done(): MethodologyConfigBuilder {
    this.parent.internal_addDecisionPointMapping(this.mapping);
    return this.parent;
  }
}

/**
 * Helper functions for creating common data sources
 */
export class DataSourceFactory {
  /**
   * Create an SQL data source
   */
  static sql(
    sourceId: string,
    name: string,
    priority: number,
    config: {
      table?: string;
      primaryKey?: string;
      column?: string;
      query?: string;
    },
    description: string = 'SQL data source',
    mimeTypes: string[] = ['application/json']
  ): DataSource {
    return {
      sourceId,
      name,
      type: 'sql',
      description,
      priority,
      isActive: true,
      mimeTypes,
      config
    };
  }
  
  /**
   * Create an API data source
   */
  static api(
    sourceId: string,
    name: string,
    priority: number,
    config: {
      endpoint: string;
      method?: string;
      headers?: Record<string, string>;
    },
    description: string = 'API data source',
    mimeTypes: string[] = ['application/json']
  ): DataSource {
    return {
      sourceId,
      name,
      type: 'api',
      description,
      priority,
      isActive: true,
      connectionString: config.endpoint,
      mimeTypes,
      config: {
        method: 'GET',
        ...config
      }
    };
  }
  
  /**
   * Create a document data source
   */
  static document(
    sourceId: string,
    name: string,
    priority: number,
    config: {
      collection: string;
      documentKey?: string;
      jsonPath?: string;
    },
    description: string = 'Document data source',
    mimeTypes: string[] = ['application/json']
  ): DataSource {
    return {
      sourceId,
      name,
      type: 'document',
      description,
      priority,
      isActive: true,
      mimeTypes,
      config
    };
  }
  
  /**
   * Create a file data source
   */
  static file(
    sourceId: string,
    name: string,
    priority: number,
    config: {
      filePath: string;
      mimeType?: string;
    },
    description: string = 'File data source',
    mimeTypes?: string[]
  ): DataSource {
    return {
      sourceId,
      name,
      type: 'file',
      description,
      priority,
      isActive: true,
      mimeTypes: mimeTypes || [config.mimeType || 'text/plain'],
      config
    };
  }
  
  /**
   * Create a manual data source
   */
  static manual(
    sourceId: string,
    name: string,
    priority: number,
    description: string = 'Manual data source',
    mimeTypes: string[] = ['text/plain']
  ): DataSource {
    return {
      sourceId,
      name,
      type: 'manual',
      description,
      priority,
      isActive: true,
      mimeTypes,
      config: {}
    };
  }
}

/**
 * Helper functions for creating transform rules
 */
export class TransformRuleFactory {
  /**
   * Create a simple string match transform rule
   */
  static stringMatch(
    sourceValue: string,
    targetValue: string,
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule {
    return {
      sourceValue,
      targetValue,
      applicableToMappings,
      applicableToSources
    };
  }
  
  /**
   * Create a regex match transform rule
   */
  static regexMatch(
    pattern: RegExp,
    targetValue: string,
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule {
    return {
      sourceValue: pattern,
      targetValue,
      applicableToMappings,
      applicableToSources
    };
  }
  
  /**
   * Create a case-insensitive match transform rule
   */
  static caseInsensitiveMatch(
    sourceValue: string,
    targetValue: string,
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule {
    return {
      sourceValue: new RegExp(`^${sourceValue}$`, 'i'),
      targetValue,
      applicableToMappings,
      applicableToSources
    };
  }
  
  /**
   * Create multiple boolean transform rules (true/false -> YES/NO)
   */
  static booleanToYesNo(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^(true|1|yes|y)$/i,
        targetValue: 'YES',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(false|0|no|n)$/i,
        targetValue: 'NO',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
}

/**
 * Pre-built configurations for common methodologies
 */
export class CommonConfigurations {
  /**
   * Create a basic CISA configuration template
   */
  static cisaTemplate(): MethodologyConfigBuilder {
    return new MethodologyConfigBuilder('CISA', '1.0')
      .addDecisionPoint('exploitation')
        .required()
        .withValidValues('NONE', 'POC', 'ACTIVE')
        .withDefault('NONE')
        .done()
      .addDecisionPoint('automatable')
        .required()
        .withValidValues('YES', 'NO')
        .withDefault('NO')
        .done()
      .addDecisionPoint('technical_impact')
        .required()
        .withValidValues('PARTIAL', 'TOTAL')
        .withDefault('PARTIAL')
        .done()
      .addDecisionPoint('mission_wellbeing')
        .required()
        .withValidValues('LOW', 'MEDIUM', 'HIGH')
        .withDefault('LOW')
        .done();
  }
}