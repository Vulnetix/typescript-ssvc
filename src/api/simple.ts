/**
 * Simple User-Facing API for Data-Driven SSVC Evaluation
 * 
 * Provides a clean, simple interface that abstracts all the underlying complexity
 * of evidence mapping, data validation, and audit trail generation.
 */

import { SSVCOutcome } from '../core';
import { MethodologyDataConfig } from '../mapping/types';
import { ForensicReport, AuditEntry, ExportableReport } from '../audit/types';
import { ValidationResult, RawDataInput, EvaluationDataPackage } from '../evidence/types';
import { DataDrivenEvaluator } from '../evaluator/data-driven';
import { DataValidator, DetailedValidationResult } from '../evaluator/validator';

/**
 * Simple evaluation result that hides complexity from users
 */
export interface SimpleEvaluationResult {
  /** The SSVC decision outcome */
  decision: SSVCOutcome;
  /** Unique evaluation identifier for tracking */
  evaluationId: string;
  /** Complete forensic evidence report */
  evidence: ForensicReport;
  /** Function to export the report in various formats */
  export: () => ExportableReportImpl;
}

/**
 * Validation result for user data
 */
export interface SimpleValidationResult {
  /** Whether the data is valid for evaluation */
  valid: boolean;
  /** List of error messages (if any) */
  errors: string[];
  /** Data completeness information */
  completeness: {
    /** Percentage of required data available */
    percentage: number;
    /** List of missing required decision points */
    missing: string[];
  };
}

/**
 * Simple SSVC Evaluator - the main user-facing class
 */
export class SSVCEvaluator {
  private configs: Map<string, MethodologyDataConfig> = new Map();
  private evaluators: Map<string, DataDrivenEvaluator> = new Map();
  private validator = new DataValidator();
  
  /**
   * Configure a methodology with its data mappings
   * @param config Complete methodology configuration
   */
  configure(config: MethodologyDataConfig): void {
    // Validate configuration first
    const configIssues = this.validator.validateMethodologyConfig(config);
    const errors = configIssues.filter(issue => issue.severity === 'error');
    
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.map(e => e.message).join(', ')}`);
    }
    
    this.configs.set(config.methodology.toLowerCase(), config);
    this.evaluators.set(config.methodology.toLowerCase(), new DataDrivenEvaluator(config));
  }
  
  /**
   * Get list of configured methodologies
   */
  getConfiguredMethodologies(): string[] {
    return Array.from(this.configs.keys());
  }
  
  /**
   * Check if a methodology is configured
   */
  isConfigured(methodology: string): boolean {
    return this.configs.has(methodology.toLowerCase());
  }
  
  /**
   * Main evaluation function - simple interface that takes raw data and returns decision + evidence
   * @param methodology The methodology to use (must be configured)
   * @param data Raw data from various sources
   * @param context Optional context information
   * @returns Complete evaluation result with decision and forensics
   */
  async evaluate(
    methodology: string,
    data: any[],
    context?: {
      evaluatedBy?: string;
      evaluatedFor?: string;
      environment?: string;
    }
  ): Promise<SimpleEvaluationResult> {
    const methodologyKey = methodology.toLowerCase();
    const evaluator = this.evaluators.get(methodologyKey);
    const config = this.configs.get(methodologyKey);
    
    if (!evaluator || !config) {
      throw new Error(
        `Methodology '${methodology}' not configured. ` +
        `Available methodologies: ${this.getConfiguredMethodologies().join(', ')}`
      );
    }
    
    // Prepare raw inputs from user data
    const rawInputs = this.prepareRawInputs(data, config);
    
    // Create evaluation package
    const dataPackage: EvaluationDataPackage = {
      methodology,
      rawInputs,
      context
    };
    
    // Evaluate with full audit trail
    const result = await evaluator.evaluate(dataPackage);
    
    // Return simplified result
    return {
      decision: result.outcome,
      evaluationId: result.evaluationId,
      evidence: result.forensicReport,
      export: () => new ExportableReportImpl(result.forensicReport, result.auditEntry)
    };
  }
  
  /**
   * Validate data completeness and quality before evaluation
   * @param methodology The methodology to validate against
   * @param data Raw data to validate
   * @returns Validation result with detailed feedback
   */
  validateData(methodology: string, data: any[]): SimpleValidationResult {
    const methodologyKey = methodology.toLowerCase();
    const config = this.configs.get(methodologyKey);
    
    if (!config) {
      return {
        valid: false,
        errors: [`Unknown methodology: ${methodology}`],
        completeness: { percentage: 0, missing: [] }
      };
    }
    
    // Prepare raw inputs from user data
    const rawInputs = this.prepareRawInputs(data, config);
    
    // Create data package for validation
    const dataPackage: EvaluationDataPackage = {
      methodology,
      rawInputs
    };
    
    // Perform detailed validation
    const validation = this.validator.validate(dataPackage, config);
    
    return {
      valid: validation.valid,
      errors: validation.issues
        .filter(issue => issue.severity === 'error')
        .map(issue => issue.message),
      completeness: {
        percentage: validation.dataCompleteness?.availabilityPercentage || 0,
        missing: validation.dataCompleteness?.missingDecisionPoints || []
      }
    };
  }
  
  /**
   * Get detailed validation information for debugging
   * @param methodology The methodology to validate against
   * @param data Raw data to validate
   * @returns Detailed validation result with warnings and info
   */
  validateDataDetailed(methodology: string, data: any[]): DetailedValidationResult {
    const methodologyKey = methodology.toLowerCase();
    const config = this.configs.get(methodologyKey);
    
    if (!config) {
      throw new Error(`Unknown methodology: ${methodology}`);
    }
    
    // Prepare raw inputs from user data
    const rawInputs = this.prepareRawInputs(data, config);
    
    // Create data package for validation
    const dataPackage: EvaluationDataPackage = {
      methodology,
      rawInputs
    };
    
    return this.validator.validate(dataPackage, config);
  }
  
  /**
   * Get information about a configured methodology
   */
  getMethodologyInfo(methodology: string): {
    name: string;
    version: string;
    decisionPoints: Array<{
      name: string;
      required: boolean;
      validValues: string[];
      defaultValue?: string;
      sourcesCount: number;
    }>;
  } {
    const config = this.configs.get(methodology.toLowerCase());
    if (!config) {
      throw new Error(`Unknown methodology: ${methodology}`);
    }
    
    return {
      name: config.methodology,
      version: config.version,
      decisionPoints: config.decisionPointMappings.map(mapping => ({
        name: mapping.decisionPoint,
        required: mapping.required,
        validValues: mapping.validValues,
        defaultValue: mapping.defaultValue,
        sourcesCount: mapping.dataSources.length
      }))
    };
  }
  
  /**
   * Convert user-provided data array to structured raw inputs
   */
  private prepareRawInputs(data: any[], config: MethodologyDataConfig): RawDataInput[] {
    const rawInputs: RawDataInput[] = [];
    const timestamp = Date.now();
    
    // Collect all source IDs from the configuration
    const allSourceIds = new Set<string>();
    for (const mapping of config.decisionPointMappings) {
      for (const source of mapping.dataSources) {
        allSourceIds.add(source.sourceId);
      }
    }
    
    // Process each data item
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (this.isRawDataInput(item)) {
        // Item is already a RawDataInput
        rawInputs.push(item);
      } else if (typeof item === 'object' && item !== null) {
        // Try to infer source ID from object properties
        let sourceId: string;
        
        if ('sourceId' in item && typeof item.sourceId === 'string') {
          sourceId = item.sourceId;
        } else if ('source' in item && typeof item.source === 'string') {
          sourceId = item.source;
        } else {
          // Generate a default source ID
          sourceId = `manual-${i}`;
        }
        
        rawInputs.push({
          sourceId,
          timestamp: item.timestamp || timestamp,
          data: item.data || item,
          metadata: item.metadata
        });
      } else {
        // Primitive value - treat as manual input
        rawInputs.push({
          sourceId: `manual-${i}`,
          timestamp,
          data: item
        });
      }
    }
    
    return rawInputs;
  }
  
  /**
   * Type guard to check if an object is a RawDataInput
   */
  private isRawDataInput(obj: any): obj is RawDataInput {
    return obj && 
           typeof obj === 'object' && 
           'sourceId' in obj && 
           'timestamp' in obj && 
           'data' in obj;
  }
}

/**
 * Implementation of exportable report
 */
class ExportableReportImpl implements ExportableReport {
  constructor(
    private forensicReport: ForensicReport,
    private auditEntry: AuditEntry
  ) {}
  
  toJSON(): string {
    return JSON.stringify({
      forensicReport: this.forensicReport,
      auditEntry: this.auditEntry
    }, null, 2);
  }
  
  
  async toPDF(): Promise<Buffer> {
    // PDF generation would require a library like puppeteer or pdfkit
    throw new Error('PDF export not implemented. Requires PDF library integration.');
  }
  
  getMetadata() {
    return {
      reportId: this.forensicReport.reportId,
      evaluationId: this.forensicReport.evaluationId,
      generatedAt: this.forensicReport.generatedAt,
      methodology: this.auditEntry.methodology,
      outcome: this.auditEntry.outcome
    };
  }
}

/**
 * Convenience function for one-off evaluations without managing an evaluator instance
 * @param config Methodology configuration
 * @param data Raw data to evaluate
 * @returns Evaluation result
 */
export async function quickEvaluate(
  config: MethodologyDataConfig,
  data: any[]
): Promise<SimpleEvaluationResult> {
  const evaluator = new SSVCEvaluator();
  evaluator.configure(config);
  return evaluator.evaluate(config.methodology, data);
}

/**
 * Convenience function for validating data without evaluation
 * @param config Methodology configuration  
 * @param data Raw data to validate
 * @returns Validation result
 */
export function quickValidate(
  config: MethodologyDataConfig,
  data: any[]
): SimpleValidationResult {
  const evaluator = new SSVCEvaluator();
  evaluator.configure(config);
  return evaluator.validateData(config.methodology, data);
}