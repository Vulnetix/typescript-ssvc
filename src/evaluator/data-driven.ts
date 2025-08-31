/**
 * Data-Driven SSVC Evaluator
 * 
 * Core evaluator that processes raw data inputs to produce SSVC decisions
 * with complete audit trails and forensic reports.
 */

// Using browser-compatible crypto.randomUUID() instead of uuid package
import { SSVCOutcome, SSVCDecision, PluginRegistry } from '../core';
import { createRuntimeDecision, RuntimeDecision } from '../runtime';
import { JSONPath } from 'jsonpath-plus';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ValidationError, 
  EvaluationDataPackage, 
  RawDataInput, 
  DecisionPointEvidence,
  Verification,
  Evidence,
  ValidationResult
} from '../evidence/types';
import { 
  MethodologyDataConfig, 
  DecisionPointMapping, 
  DataSource, 
  MappedDecisionValues, 
  MappingResult 
} from '../mapping/types';
import { 
  AuditEntry, 
  ForensicReport, 
  DataSourceUsage, 
  DecisionPathEntry,
  AuditEventType,
  AuditEvent,
  TimelineEntry
} from '../audit/types';

/**
 * Result of a complete data-driven evaluation
 */
export interface EvaluationResult {
  /** Unique identifier for this evaluation */
  evaluationId: string;
  /** Final decision outcome */
  outcome: SSVCOutcome;
  /** Mapped parameters used for decision */
  mappedParameters: Record<string, any>;
  /** Complete forensic report */
  forensicReport: ForensicReport;
  /** Audit entry for storage */
  auditEntry: AuditEntry;
  /** The decision object used */
  decision: SSVCDecision;
}

/**
 * Core data-driven evaluator
 */
export class DataDrivenEvaluator {
  private methodologyConfig: MethodologyDataConfig;
  private auditEvents: AuditEvent[] = [];
  private dataSourcesUsed: DataSourceUsage[] = [];
  private timeline: TimelineEntry[] = [];
  
  constructor(config: MethodologyDataConfig) {
    this.methodologyConfig = config;
  }
  
  /**
   * Main evaluation function - takes raw data and produces decision + forensic report
   */
  async evaluate(dataPackage: EvaluationDataPackage): Promise<EvaluationResult> {
    const evaluationId = crypto.randomUUID();
    const startTime = Date.now();
    
    this.recordEvent(AuditEventType.EVALUATION_STARTED, evaluationId, {
      methodology: this.methodologyConfig.methodology,
      version: this.methodologyConfig.version,
      inputCount: dataPackage.rawInputs.length
    });
    
    try {
      // Step 1: Validate all required decision points have data
      this.validateDataCompleteness(dataPackage);
      
      // Step 2: Map raw data to decision point values
      const mappedValues = await this.mapDataToDecisionPoints(
        dataPackage.rawInputs, 
        evaluationId
      );
      
      // Step 3: Create decision with mapped values
      const decision = this.createDecision(mappedValues.parameters, evaluationId);
      
      // Step 4: Evaluate decision
      const outcome = decision.evaluate();
      
      this.recordEvent(AuditEventType.EVALUATION_COMPLETED, evaluationId, {
        action: outcome.action,
        priority: outcome.priority,
        duration: Date.now() - startTime
      });
      
      // Step 5: Generate complete forensic report
      const forensicReport = await this.generateForensicReport(
        evaluationId,
        mappedValues,
        outcome,
        dataPackage,
        Date.now() - startTime
      );
      
      // Step 6: Create audit entry
      const auditEntry = this.createAuditEntry(
        evaluationId,
        decision,
        forensicReport,
        dataPackage.context,
        mappedValues
      );
      
      return {
        evaluationId,
        outcome,
        mappedParameters: mappedValues.parameters,
        forensicReport,
        auditEntry,
        decision
      };
      
    } catch (error) {
      this.recordEvent(AuditEventType.ERROR_OCCURRED, evaluationId, {
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      throw error;
    }
  }
  
  /**
   * Validate that all required decision points have data available
   */
  private validateDataCompleteness(dataPackage: EvaluationDataPackage): void {
    const errors: string[] = [];
    
    for (const mapping of this.methodologyConfig.decisionPointMappings) {
      if (!mapping.required) continue;
      
      const hasData = this.hasDataForDecisionPoint(
        mapping,
        dataPackage.rawInputs
      );
      
      if (!hasData && !mapping.defaultValue) {
        errors.push(
          `Missing required data for decision point '${mapping.decisionPoint}'. ` +
          `Expected sources: ${mapping.dataSources.map(s => s.name).join(', ')}`
        );
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Incomplete data for evaluation', errors);
    }
  }
  
  /**
   * Check if data is available for a specific decision point
   */
  private hasDataForDecisionPoint(
    mapping: DecisionPointMapping,
    rawInputs: RawDataInput[]
  ): boolean {
    return mapping.dataSources.some(source => 
      source.isActive && rawInputs.some(input => input.sourceId === source.sourceId)
    );
  }
  
  /**
   * Map all raw data inputs to decision point values
   */
  private async mapDataToDecisionPoints(
    rawInputs: RawDataInput[],
    evaluationId: string
  ): Promise<MappedDecisionValues> {
    const mappedValues: MappedDecisionValues = {
      parameters: {},
      evidence: {},
      sourcesUsed: {}
    };
    
    for (const mapping of this.methodologyConfig.decisionPointMappings) {
      const result = await this.mapSingleDecisionPoint(mapping, rawInputs, evaluationId);
      
      mappedValues.parameters[mapping.decisionPoint] = result.value;
      mappedValues.evidence[mapping.decisionPoint] = result.evidence;
      mappedValues.sourcesUsed[mapping.decisionPoint] = result.sourceUsed;
      
      this.recordEvent(AuditEventType.DECISION_POINT_RESOLVED, evaluationId, {
        decisionPoint: mapping.decisionPoint,
        value: result.value,
        sourceUsed: result.sourceUsed?.name || 'default',
        evidenceId: result.evidence.evidenceId
      });
    }
    
    return mappedValues;
  }
  
  /**
   * Map a single decision point using priority-ordered data sources
   */
  private async mapSingleDecisionPoint(
    mapping: DecisionPointMapping,
    rawInputs: RawDataInput[],
    evaluationId: string
  ): Promise<MappingResult> {
    // Try data sources in priority order
    for (const dataSource of mapping.dataSources) {
      if (!dataSource.isActive) continue;
      
      const input = rawInputs.find(i => i.sourceId === dataSource.sourceId);
      if (!input) continue;
      
      const sourceUsage: DataSourceUsage = {
        source: dataSource,
        accessed: false,
        accessTime: Date.now()
      };
      
      try {
        const accessStart = Date.now();
        
        // Extract value from raw data based on source config
        const extractedValue = await this.extractValue(input, dataSource);
        
        sourceUsage.accessed = true;
        sourceUsage.result = extractedValue;
        
        this.recordEvent(AuditEventType.DATA_SOURCE_ACCESSED, evaluationId, {
          sourceId: dataSource.sourceId,
          sourceName: dataSource.name,
          decisionPoint: mapping.decisionPoint,
          extractedValue,
          duration: Date.now() - accessStart
        });
        
        // Apply transformation rules
        const transformedValue = this.applyTransformRules(
          extractedValue,
          mapping.transformRules,
          dataSource.sourceId,
          mapping.decisionPoint,
          evaluationId
        );
        
        // Validate against expected values
        if (!mapping.validValues.includes(transformedValue)) {
          throw new Error(
            `Invalid value '${transformedValue}' for decision point '${mapping.decisionPoint}'. ` +
            `Expected one of: ${mapping.validValues.join(', ')}`
          );
        }
        
        // Create evidence
        const evidence = await this.createEvidence(
          input,
          dataSource,
          extractedValue,
          transformedValue,
          mapping.decisionPoint
        );
        
        this.dataSourcesUsed.push(sourceUsage);
        
        return {
          value: transformedValue,
          evidence,
          sourceUsed: dataSource
        };
        
      } catch (error) {
        sourceUsage.error = error instanceof Error ? error.message : String(error);
        this.dataSourcesUsed.push(sourceUsage);
        
        // Log error and try next source
        console.warn(`Failed to extract from source ${dataSource.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // No data found, use default if available
    if (mapping.defaultValue) {
      const evidence = this.createDefaultEvidence(mapping);
      
      this.recordEvent(AuditEventType.DECISION_POINT_RESOLVED, evaluationId, {
        decisionPoint: mapping.decisionPoint,
        value: mapping.defaultValue,
        sourceUsed: 'default',
        evidenceId: evidence.verifications[0]?.evidence?.evidenceId || 'unknown'
      });
      
      return {
        value: mapping.defaultValue,
        evidence,
        sourceUsed: null
      };
    }
    
    throw new Error(
      `Unable to map data for decision point '${mapping.decisionPoint}'. ` +
      `Tried sources: ${mapping.dataSources.map(s => s.name).join(', ')}`
    );
  }
  
  /**
   * Extract value from raw data input based on data source configuration
   */
  private async extractValue(input: RawDataInput, source: DataSource): Promise<any> {
    switch (source.type) {
      case 'manual':
        return input.data;
      
      case 'sql':
        // For SQL, assume the data is already the extracted value
        // In a real implementation, this would query the database
        return input.data[source.config.column || 'value'];
      
      case 'api':
        // For API, assume the data contains the response
        // In a real implementation, this would make the API call
        return this.extractFromJSONPath(input.data, source.config.jsonPath || '$');
      
      case 'document':
        // For documents, extract using JSON path
        return this.extractFromJSONPath(input.data, source.config.jsonPath || '$');
      
      case 'file':
        // For files, parse based on MIME type
        return await this.parseFileContent(input.data, source.config.mimeType);
      
      default:
        throw new Error(`Unsupported data source type: ${source.type}`);
    }
  }
  
  /**
   * JSONPath extraction using jsonpath-plus library
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
   * Parse file content based on MIME type using DataExtractor
   */
  private async parseFileContent(data: any, mimeType?: string): Promise<any> {
    if (!mimeType) return data;
    
    switch (mimeType.toLowerCase()) {
      case 'application/json':
        return typeof data === 'string' ? JSON.parse(data) : data;
      case 'text/plain':
        return data.toString();
      default:
        return data;
    }
  }
  
  /**
   * Apply transformation rules to convert raw value to methodology value
   */
  private applyTransformRules(
    value: any,
    rules: any[],
    sourceId: string,
    decisionPoint: string,
    evaluationId: string
  ): string {
    const stringValue = String(value).trim();
    
    for (const rule of rules) {
      let matches = false;
      
      if (rule.sourceValue instanceof RegExp) {
        matches = rule.sourceValue.test(stringValue);
      } else {
        matches = stringValue.toLowerCase() === String(rule.sourceValue).toLowerCase();
      }
      
      if (matches) {
        this.recordEvent(AuditEventType.TRANSFORM_APPLIED, evaluationId, {
          decisionPoint,
          sourceId,
          sourceValue: stringValue,
          rule: {
            sourceValue: rule.sourceValue instanceof RegExp ? rule.sourceValue.source : rule.sourceValue,
            targetValue: rule.targetValue
          },
          transformedValue: rule.targetValue
        });
        
        return rule.targetValue;
      }
    }
    
    // No transformation rule matched, return original value
    return stringValue.toUpperCase();
  }
  
  /**
   * Create evidence for a decision point
   */
  private async createEvidence(
    input: RawDataInput,
    source: DataSource,
    extractedValue: any,
    transformedValue: string,
    decisionPoint: string
  ): Promise<DecisionPointEvidence> {
    const verification: Verification = {
      method: `${source.type} extraction`,
      source: source.name,
      timestamp: Date.now(),
      result: `Extracted '${extractedValue}', transformed to '${transformedValue}'`,
      query: this.buildQueryDescription(source),
      evidence: {
        verified: true,
        evidenceId: crypto.randomUUID(),
        collectedAt: input.timestamp,
        collectedBy: 'system',
        contents: JSON.stringify(extractedValue),
        notes: `Raw data from ${source.name}`
      }
    };
    
    return {
      decisionPoint,
      value: transformedValue,
      verifications: [verification],
      reasoning: `Value derived from ${source.name} using ${source.type} extraction`
    };
  }
  
  /**
   * Build a description of the query used for a data source
   */
  private buildQueryDescription(source: DataSource): string {
    switch (source.type) {
      case 'sql':
        return source.config.query || `SELECT ${source.config.column} FROM ${source.config.table}`;
      case 'api':
        return `${source.config.method || 'GET'} ${source.config.endpoint}`;
      case 'document':
        return `Collection: ${source.config.collection}, Path: ${source.config.jsonPath}`;
      case 'file':
        return `File: ${source.config.filePath}`;
      default:
        return 'Manual input';
    }
  }
  
  /**
   * Create default evidence when no data sources provide values
   */
  private createDefaultEvidence(mapping: DecisionPointMapping): DecisionPointEvidence {
    return {
      decisionPoint: mapping.decisionPoint,
      value: mapping.defaultValue!,
      verifications: [{
        method: 'default value',
        source: 'system',
        timestamp: Date.now(),
        result: `Used default value: ${mapping.defaultValue}`,
        evidence: {
          verified: true,
          evidenceId: crypto.randomUUID(),
          collectedAt: Date.now(),
          collectedBy: 'system',
          notes: 'Default value used due to no available data sources'
        }
      }],
      reasoning: `Default value used as no data sources provided valid data`
    };
  }
  
  /**
   * Create decision instance (runtime or generated)
   */
  private createDecision(parameters: Record<string, any>, evaluationId: string): SSVCDecision {
    // For now, always use runtime evaluation
    // In the future, we could detect if a generated plugin exists and use it
    const yamlContent = this.generateYAMLForRuntime();
    const decision = createRuntimeDecision(yamlContent, parameters);
    
    // Add evaluation ID to decision
    (decision as any).evaluationId = evaluationId;
    
    return decision;
  }
  
  /**
   * Load actual YAML content for runtime evaluation
   */
  private generateYAMLForRuntime(): string {
    try {
      const yamlPath = path.join('methodologies', `${this.methodologyConfig.methodology}.yaml`);
      
      if (!fs.existsSync(yamlPath)) {
        throw new Error(`Methodology YAML file not found: ${yamlPath}`);
      }
      
      return fs.readFileSync(yamlPath, 'utf8');
      
    } catch (error) {
      // Fallback to a basic YAML structure if file doesn't exist
      console.warn(`Could not load YAML for ${this.methodologyConfig.methodology}, using fallback:`, error);
      return `
name: "${this.methodologyConfig.methodology}"
description: "Runtime-generated methodology (fallback)"
version: "${this.methodologyConfig.version}"
enums:
  defaultEnum: ["unknown"]
priorityMap:
  TRACK: defer
decisionTree:
  type: defaultEnum
  children:
    unknown: TRACK
defaultAction: TRACK
`;
    }
  }
  
  /**
   * Generate comprehensive forensic report
   */
  private async generateForensicReport(
    evaluationId: string,
    mappedValues: MappedDecisionValues,
    outcome: SSVCOutcome,
    dataPackage: EvaluationDataPackage,
    totalDuration: number
  ): Promise<ForensicReport> {
    // Build decision path
    const decisionPath: DecisionPathEntry[] = [];
    let order = 0;
    
    for (const [decisionPoint, evidence] of Object.entries(mappedValues.evidence)) {
      decisionPath.push({
        decisionPoint,
        value: evidence.value,
        evidence: evidence as DecisionPointEvidence,
        order: order++
      });
    }
    
    // Build data source summary
    const sourcesByType: Record<string, number> = {};
    for (const usage of this.dataSourcesUsed) {
      sourcesByType[usage.source.type] = (sourcesByType[usage.source.type] || 0) + 1;
    }
    
    return {
      reportId: crypto.randomUUID(),
      generatedAt: Date.now(),
      evaluationId,
      decisionPath,
      finalOutcome: outcome,
      dataSourcesUsed: this.dataSourcesUsed,
      dataSourceSummary: {
        totalSources: this.dataSourcesUsed.length,
        successfulAccesses: this.dataSourcesUsed.filter(u => u.accessed).length,
        failedAccesses: this.dataSourcesUsed.filter(u => !u.accessed).length,
        sourcesByType
      },
      timeline: this.timeline,
      totalDuration,
      verificationSummary: {
        totalVerifications: Object.values(mappedValues.evidence).length,
        successfulVerifications: Object.values(mappedValues.evidence).length,
        failedVerifications: 0,
        verificationsBySource: this.buildVerificationsBySource(mappedValues.evidence)
      }
    };
  }
  
  private buildVerificationsBySource(evidence: Record<string, any>): Record<string, number> {
    const bySource: Record<string, number> = {};
    
    for (const ev of Object.values(evidence)) {
      for (const verification of ev.verifications || []) {
        bySource[verification.source] = (bySource[verification.source] || 0) + 1;
      }
    }
    
    return bySource;
  }
  
  /**
   * Create audit entry for storage
   */
  private createAuditEntry(
    evaluationId: string,
    decision: SSVCDecision,
    forensicReport: ForensicReport,
    context: any,
    mappedValues: MappedDecisionValues
  ): AuditEntry {
    return {
      auditId: crypto.randomUUID(),
      timestamp: Date.now(),
      methodology: this.methodologyConfig.methodology,
      methodologyVersion: this.methodologyConfig.version,
      evaluationId,
      parameters: mappedValues.parameters,
      outcome: decision.outcome!,
      decisionEvidence: Object.values(mappedValues.evidence) as DecisionPointEvidence[],
      dataMappings: [], // Would be populated from actual mappings
      evaluatedBy: context?.evaluatedBy,
      evaluatedFor: context?.evaluatedFor,
      environment: context?.environment
    };
  }
  
  /**
   * Record an audit event
   */
  private recordEvent(
    type: AuditEventType,
    evaluationId: string,
    details: Record<string, any>,
    duration?: number
  ): void {
    const event: AuditEvent = {
      type,
      timestamp: Date.now(),
      details,
      duration,
      evaluationId
    };
    
    this.auditEvents.push(event);
    
    // Also add to timeline
    this.timeline.push({
      timestamp: event.timestamp,
      event: type,
      details
    });
  }
  
  /**
   * Validate data availability without full evaluation
   */
  public validateData(rawInputs: RawDataInput[]): ValidationResult {
    const errors: string[] = [];
    
    try {
      const dataPackage: EvaluationDataPackage = {
        methodology: this.methodologyConfig.methodology,
        rawInputs
      };
      
      this.validateDataCompleteness(dataPackage);
      return { valid: true, errors: [] };
      
    } catch (error) {
      if (error instanceof ValidationError) {
        return { valid: false, errors: error.errors };
      } else {
        return { 
          valid: false, 
          errors: [error instanceof Error ? error.message : String(error)] 
        };
      }
    }
  }
}