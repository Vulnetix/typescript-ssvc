/**
 * Data Validation System for SSVC Evidence Mapping
 * 
 * Comprehensive validation for data completeness, methodology configurations,
 * and evaluation inputs with informative error reporting
 */

import { 
  ValidationError, 
  ValidationResult, 
  RawDataInput, 
  EvaluationDataPackage 
} from '../evidence/types';
import { 
  MethodologyDataConfig, 
  DecisionPointMapping, 
  DataSource, 
  TransformRule 
} from '../mapping/types';

/**
 * Detailed validation issue
 */
export interface ValidationIssue {
  /** Severity of the issue */
  severity: 'error' | 'warning' | 'info';
  /** Category of the issue */
  category: 'data' | 'config' | 'mapping' | 'transform';
  /** Specific issue code for programmatic handling */
  code: string;
  /** Human-readable message */
  message: string;
  /** Location/context of the issue */
  context?: string;
  /** Suggested resolution */
  suggestion?: string;
}

/**
 * Comprehensive validation result
 */
export interface DetailedValidationResult {
  /** Overall validation success */
  valid: boolean;
  /** List of all issues found */
  issues: ValidationIssue[];
  /** Summary of validation results */
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    totalIssues: number;
  };
  /** Data completeness analysis */
  dataCompleteness?: {
    requiredDecisionPoints: number;
    availableDecisionPoints: number;
    missingDecisionPoints: string[];
    availabilityPercentage: number;
  };
}

/**
 * Comprehensive data validator
 */
export class DataValidator {
  
  /**
   * Validate complete evaluation data package
   */
  validate(
    dataPackage: EvaluationDataPackage,
    config: MethodologyDataConfig
  ): DetailedValidationResult {
    const issues: ValidationIssue[] = [];
    
    // Validate methodology configuration
    issues.push(...this.validateMethodologyConfig(config));
    
    // Validate data package structure
    issues.push(...this.validateDataPackage(dataPackage));
    
    // Validate data completeness
    issues.push(...this.validateDataCompleteness(dataPackage, config));
    
    // Validate data quality
    issues.push(...this.validateDataQuality(dataPackage.rawInputs));
    
    // Validate data source availability
    issues.push(...this.validateDataSourceAvailability(dataPackage, config));
    
    // Calculate summary
    const summary = this.calculateSummary(issues);
    
    // Calculate data completeness
    const dataCompleteness = this.calculateDataCompleteness(dataPackage, config);
    
    return {
      valid: summary.errors === 0,
      issues,
      summary,
      dataCompleteness
    };
  }
  
  /**
   * Validate methodology configuration
   */
  validateMethodologyConfig(config: MethodologyDataConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Basic structure validation
    if (!config.methodology || config.methodology.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'METHODOLOGY_NAME_MISSING',
        message: 'Methodology name is required',
        suggestion: 'Provide a non-empty methodology name'
      });
    }
    
    if (!config.version || config.version.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'VERSION_MISSING',
        message: 'Methodology version is required',
        suggestion: 'Provide a version number (e.g., "1.0")'
      });
    }
    
    if (!config.decisionPointMappings || config.decisionPointMappings.length === 0) {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'NO_DECISION_POINTS',
        message: 'At least one decision point mapping is required',
        suggestion: 'Add decision point mappings for your methodology'
      });
      return issues; // Can't proceed without decision points
    }
    
    // Validate each decision point mapping
    for (const mapping of config.decisionPointMappings) {
      issues.push(...this.validateDecisionPointMapping(mapping, config.methodology));
    }
    
    // Check for duplicate decision points
    const decisionPointNames = config.decisionPointMappings.map(m => m.decisionPoint);
    const duplicates = decisionPointNames.filter((name, index) => 
      decisionPointNames.indexOf(name) !== index
    );
    
    if (duplicates.length > 0) {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'DUPLICATE_DECISION_POINTS',
        message: `Duplicate decision points found: ${[...new Set(duplicates)].join(', ')}`,
        suggestion: 'Ensure each decision point is configured only once'
      });
    }
    
    return issues;
  }
  
  /**
   * Validate individual decision point mapping
   */
  private validateDecisionPointMapping(
    mapping: DecisionPointMapping, 
    methodology: string
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const context = `Decision point '${mapping.decisionPoint}'`;
    
    // Basic validation
    if (!mapping.decisionPoint || mapping.decisionPoint.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'mapping',
        code: 'DECISION_POINT_NAME_MISSING',
        message: 'Decision point name is required',
        context,
        suggestion: 'Provide a descriptive name for the decision point'
      });
      return issues; // Can't proceed without name
    }
    
    // Validate data sources
    if (mapping.dataSources.length === 0 && !mapping.defaultValue) {
      issues.push({
        severity: 'error',
        category: 'mapping',
        code: 'NO_DATA_SOURCES_OR_DEFAULT',
        message: 'Decision point must have at least one data source or a default value',
        context,
        suggestion: 'Add data sources or specify a default value'
      });
    }
    
    // Validate valid values
    if (!mapping.validValues || mapping.validValues.length === 0) {
      issues.push({
        severity: 'error',
        category: 'mapping',
        code: 'NO_VALID_VALUES',
        message: 'Decision point must specify valid enum values',
        context,
        suggestion: 'Define the valid values for this decision point'
      });
    }
    
    // Validate default value is in valid values
    if (mapping.defaultValue && mapping.validValues) {
      if (!mapping.validValues.includes(mapping.defaultValue)) {
        issues.push({
          severity: 'error',
          category: 'mapping',
          code: 'INVALID_DEFAULT_VALUE',
          message: `Default value '${mapping.defaultValue}' is not in valid values: ${mapping.validValues.join(', ')}`,
          context,
          suggestion: 'Choose a default value from the valid values list'
        });
      }
    }
    
    // Validate data sources
    for (let i = 0; i < mapping.dataSources.length; i++) {
      const source = mapping.dataSources[i];
      issues.push(...this.validateDataSource(source, `${context}, source ${i + 1}`));
    }
    
    // Check for duplicate priorities
    if (mapping.dataSources.length > 1) {
      const priorities = mapping.dataSources.map(s => s.priority);
      const uniquePriorities = new Set(priorities);
      if (priorities.length !== uniquePriorities.size) {
        issues.push({
          severity: 'warning',
          category: 'mapping',
          code: 'DUPLICATE_PRIORITIES',
          message: 'Duplicate priorities found in data sources',
          context,
          suggestion: 'Assign unique priorities to ensure deterministic source ordering'
        });
      }
    }
    
    // Validate transform rules
    for (const rule of mapping.transformRules) {
      issues.push(...this.validateTransformRule(rule, context));
    }
    
    return issues;
  }
  
  /**
   * Validate data source configuration
   */
  private validateDataSource(source: DataSource, context: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Basic validation
    if (!source.sourceId || source.sourceId.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'SOURCE_ID_MISSING',
        message: 'Data source must have a sourceId',
        context,
        suggestion: 'Provide a unique identifier for the data source'
      });
    }
    
    if (!source.name || source.name.trim() === '') {
      issues.push({
        severity: 'warning',
        category: 'config',
        code: 'SOURCE_NAME_MISSING',
        message: 'Data source should have a descriptive name',
        context,
        suggestion: 'Provide a human-readable name for the data source'
      });
    }
    
    if (source.priority <= 0) {
      issues.push({
        severity: 'error',
        category: 'config',
        code: 'INVALID_PRIORITY',
        message: 'Data source priority must be greater than 0',
        context,
        suggestion: 'Set priority to a positive integer (1 = highest priority)'
      });
    }
    
    // Type-specific validation
    issues.push(...this.validateSourceTypeConfig(source, context));
    
    return issues;
  }
  
  /**
   * Validate source type-specific configuration
   */
  private validateSourceTypeConfig(source: DataSource, context: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    switch (source.type) {
      case 'sql':
        if (!source.config.table && !source.config.query) {
          issues.push({
            severity: 'error',
            category: 'config',
            code: 'SQL_CONFIG_INCOMPLETE',
            message: 'SQL source must specify either table or query',
            context,
            suggestion: 'Provide either a table name or a custom SQL query'
          });
        }
        break;
        
      case 'api':
        if (!source.config.endpoint) {
          issues.push({
            severity: 'error',
            category: 'config',
            code: 'API_ENDPOINT_MISSING',
            message: 'API source must specify endpoint',
            context,
            suggestion: 'Provide the API endpoint URL'
          });
        } else {
          // Validate URL format
          try {
            new URL(source.config.endpoint);
          } catch (error) {
            issues.push({
              severity: 'error',
              category: 'config',
              code: 'INVALID_ENDPOINT_URL',
              message: `Invalid endpoint URL: ${source.config.endpoint}`,
              context,
              suggestion: 'Provide a valid HTTP/HTTPS URL'
            });
          }
        }
        break;
        
      case 'document':
        if (!source.config.collection) {
          issues.push({
            severity: 'error',
            category: 'config',
            code: 'DOCUMENT_COLLECTION_MISSING',
            message: 'Document source must specify collection',
            context,
            suggestion: 'Provide the collection or container name'
          });
        }
        break;
        
      case 'file':
        if (!source.config.filePath) {
          issues.push({
            severity: 'error',
            category: 'config',
            code: 'FILE_PATH_MISSING',
            message: 'File source must specify filePath',
            context,
            suggestion: 'Provide the path to the data file'
          });
        }
        break;
        
      case 'manual':
        // Manual sources don't require additional config
        break;
        
      default:
        issues.push({
          severity: 'error',
          category: 'config',
          code: 'UNKNOWN_SOURCE_TYPE',
          message: `Unknown source type: ${source.type}`,
          context,
          suggestion: 'Use one of: sql, api, document, file, manual'
        });
    }
    
    return issues;
  }
  
  /**
   * Validate transform rule
   */
  private validateTransformRule(rule: TransformRule, context: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!rule.sourceValue) {
      issues.push({
        severity: 'error',
        category: 'transform',
        code: 'TRANSFORM_SOURCE_MISSING',
        message: 'Transform rule must have a source value',
        context,
        suggestion: 'Specify the source value pattern to match'
      });
    }
    
    if (!rule.targetValue || rule.targetValue.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'transform',
        code: 'TRANSFORM_TARGET_MISSING',
        message: 'Transform rule must have a target value',
        context,
        suggestion: 'Specify the target enum value'
      });
    }
    
    // Validate regex if present
    if (rule.sourceValue instanceof RegExp) {
      try {
        rule.sourceValue.test('test');
      } catch (error) {
        issues.push({
          severity: 'error',
          category: 'transform',
          code: 'INVALID_REGEX',
          message: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`,
          context,
          suggestion: 'Fix the regular expression syntax'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Validate data package structure
   */
  validateDataPackage(dataPackage: EvaluationDataPackage): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!dataPackage.methodology || dataPackage.methodology.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'data',
        code: 'METHODOLOGY_NOT_SPECIFIED',
        message: 'Data package must specify methodology',
        suggestion: 'Provide the methodology name to evaluate against'
      });
    }
    
    if (!dataPackage.rawInputs || dataPackage.rawInputs.length === 0) {
      issues.push({
        severity: 'error',
        category: 'data',
        code: 'NO_RAW_INPUTS',
        message: 'Data package must contain at least one raw input',
        suggestion: 'Provide raw data inputs from your data sources'
      });
      return issues; // Can't proceed without inputs
    }
    
    // Validate each raw input
    for (let i = 0; i < dataPackage.rawInputs.length; i++) {
      const input = dataPackage.rawInputs[i];
      issues.push(...this.validateRawInput(input, `Raw input ${i + 1}`));
    }
    
    return issues;
  }
  
  /**
   * Validate individual raw input
   */
  private validateRawInput(input: RawDataInput, context: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (!input.sourceId || input.sourceId.trim() === '') {
      issues.push({
        severity: 'error',
        category: 'data',
        code: 'SOURCE_ID_MISSING',
        message: 'Raw input must specify sourceId',
        context,
        suggestion: 'Provide the ID of the data source this input came from'
      });
    }
    
    if (!input.timestamp || input.timestamp <= 0) {
      issues.push({
        severity: 'warning',
        category: 'data',
        code: 'INVALID_TIMESTAMP',
        message: 'Raw input should have a valid timestamp',
        context,
        suggestion: 'Provide the timestamp when this data was collected'
      });
    }
    
    if (input.data === undefined || input.data === null) {
      issues.push({
        severity: 'warning',
        category: 'data',
        code: 'EMPTY_DATA',
        message: 'Raw input contains no data',
        context,
        suggestion: 'Ensure data was properly extracted from the source'
      });
    }
    
    return issues;
  }
  
  /**
   * Validate data completeness against methodology requirements
   */
  validateDataCompleteness(
    dataPackage: EvaluationDataPackage, 
    config: MethodologyDataConfig
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const inputSourceIds = new Set(dataPackage.rawInputs.map(input => input.sourceId));
    
    for (const mapping of config.decisionPointMappings) {
      if (!mapping.required) continue;
      
      const hasData = mapping.dataSources.some(source => 
        source.isActive && inputSourceIds.has(source.sourceId)
      );
      
      if (!hasData && !mapping.defaultValue) {
        issues.push({
          severity: 'error',
          category: 'data',
          code: 'REQUIRED_DATA_MISSING',
          message: `Missing required data for decision point '${mapping.decisionPoint}'`,
          context: `Expected sources: ${mapping.dataSources.map(s => s.name).join(', ')}`,
          suggestion: 'Provide data from one of the configured sources or set a default value'
        });
      } else if (!hasData && mapping.defaultValue) {
        issues.push({
          severity: 'info',
          category: 'data',
          code: 'USING_DEFAULT_VALUE',
          message: `Using default value '${mapping.defaultValue}' for decision point '${mapping.decisionPoint}'`,
          context: 'No data available from configured sources'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Validate data quality
   */
  validateDataQuality(rawInputs: RawDataInput[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for duplicate source IDs
    const sourceIds = rawInputs.map(input => input.sourceId);
    const duplicateIds = sourceIds.filter((id, index) => sourceIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'data',
        code: 'DUPLICATE_SOURCE_DATA',
        message: `Multiple inputs from same sources: ${[...new Set(duplicateIds)].join(', ')}`,
        suggestion: 'Consider consolidating or prioritizing duplicate source data'
      });
    }
    
    // Check for very old data
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oldDataThreshold = now - (7 * oneDay); // 7 days old
    
    for (const input of rawInputs) {
      if (input.timestamp < oldDataThreshold) {
        const age = Math.floor((now - input.timestamp) / oneDay);
        issues.push({
          severity: 'warning',
          category: 'data',
          code: 'OLD_DATA',
          message: `Data from source '${input.sourceId}' is ${age} days old`,
          suggestion: 'Consider refreshing data from this source'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Validate data source availability
   */
  validateDataSourceAvailability(
    dataPackage: EvaluationDataPackage, 
    config: MethodologyDataConfig
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const inputSourceIds = new Set(dataPackage.rawInputs.map(input => input.sourceId));
    
    // Collect all configured sources
    const allSources = new Map<string, DataSource>();
    for (const mapping of config.decisionPointMappings) {
      for (const source of mapping.dataSources) {
        allSources.set(source.sourceId, source);
      }
    }
    
    // Check for inactive sources
    for (const [sourceId, source] of allSources) {
      if (!source.isActive) {
        issues.push({
          severity: 'warning',
          category: 'config',
          code: 'INACTIVE_SOURCE',
          message: `Data source '${source.name}' is marked as inactive`,
          context: `Source ID: ${sourceId}`,
          suggestion: 'Activate the source or remove it from mappings'
        });
      } else if (!inputSourceIds.has(sourceId)) {
        issues.push({
          severity: 'info',
          category: 'data',
          code: 'UNUSED_SOURCE',
          message: `No data provided for configured source '${source.name}'`,
          context: `Source ID: ${sourceId}`,
          suggestion: 'Provide data from this source or mark it as inactive'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Calculate validation summary
   */
  private calculateSummary(issues: ValidationIssue[]): DetailedValidationResult['summary'] {
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    
    return {
      errors,
      warnings,
      infos,
      totalIssues: issues.length
    };
  }
  
  /**
   * Calculate data completeness statistics
   */
  private calculateDataCompleteness(
    dataPackage: EvaluationDataPackage, 
    config: MethodologyDataConfig
  ): DetailedValidationResult['dataCompleteness'] {
    const requiredDecisionPoints = config.decisionPointMappings.filter(m => m.required);
    const inputSourceIds = new Set(dataPackage.rawInputs.map(input => input.sourceId));
    
    let availableCount = 0;
    const missingDecisionPoints: string[] = [];
    
    for (const mapping of requiredDecisionPoints) {
      const hasData = mapping.dataSources.some(source => 
        source.isActive && inputSourceIds.has(source.sourceId)
      ) || Boolean(mapping.defaultValue);
      
      if (hasData) {
        availableCount++;
      } else {
        missingDecisionPoints.push(mapping.decisionPoint);
      }
    }
    
    return {
      requiredDecisionPoints: requiredDecisionPoints.length,
      availableDecisionPoints: availableCount,
      missingDecisionPoints,
      availabilityPercentage: requiredDecisionPoints.length > 0 
        ? (availableCount / requiredDecisionPoints.length) * 100 
        : 100
    };
  }
  
  /**
   * Quick validation for simple use cases
   */
  quickValidate(
    rawInputs: RawDataInput[], 
    config: MethodologyDataConfig
  ): ValidationResult {
    const dataPackage: EvaluationDataPackage = {
      methodology: config.methodology,
      rawInputs
    };
    
    const result = this.validate(dataPackage, config);
    
    return {
      valid: result.valid,
      errors: result.issues
        .filter(i => i.severity === 'error')
        .map(i => i.message)
    };
  }
}