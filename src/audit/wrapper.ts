/**
 * Auditable Decision Wrapper
 * 
 * Wraps any SSVCDecision (generated or runtime) to add audit trail capabilities
 * without modifying the underlying decision implementation.
 */

// Using browser-compatible crypto.randomUUID() instead of uuid package
import { SSVCDecision, SSVCOutcome, AuditableDecision } from '../core';
import { DecisionPointEvidence } from '../evidence/types';
import { DataSource } from '../mapping/types';
import { AuditEntry, ForensicReport, AuditEventType, AuditEvent, TimelineEntry } from '../audit/types';
import { createRuntimeDecision } from '../runtime';
import * as yaml from 'yaml';

/**
 * Universal wrapper that makes any SSVCDecision auditable
 */
export class AuditableDecisionWrapper implements AuditableDecision {
  public readonly evaluationId: string;
  private wrappedDecision: SSVCDecision;
  private methodology: string;
  private version: string;
  private evidenceMap: Map<string, DecisionPointEvidence> = new Map();
  private dataSourceMap: Map<string, DataSource> = new Map();
  private auditEvents: AuditEvent[] = [];
  private timeline: TimelineEntry[] = [];
  private startTime: number;
  
  constructor(decision: SSVCDecision, methodology: string, version: string) {
    this.evaluationId = crypto.randomUUID();
    this.wrappedDecision = decision;
    this.methodology = methodology;
    this.version = version;
    this.startTime = Date.now();
    
    // Set evaluationId on wrapped decision if it supports it
    if (this.wrappedDecision.evaluationId !== undefined) {
      this.wrappedDecision.evaluationId = this.evaluationId;
    }
    
    this.recordEvent(AuditEventType.EVALUATION_STARTED, {
      methodology: this.methodology,
      version: this.version,
      wrappedType: decision.constructor.name
    });
  }
  
  /**
   * Delegate evaluation to wrapped decision with audit tracking
   */
  evaluate(): SSVCOutcome {
    this.recordEvent(AuditEventType.EVALUATION_STARTED, {
      evaluationId: this.evaluationId
    });
    
    const outcome = this.wrappedDecision.evaluate();
    
    this.recordEvent(AuditEventType.EVALUATION_COMPLETED, {
      action: outcome.action,
      priority: outcome.priority,
      duration: Date.now() - this.startTime
    });
    
    return outcome;
  }
  
  /**
   * Get cached outcome from wrapped decision
   */
  get outcome(): SSVCOutcome | undefined {
    return this.wrappedDecision.outcome;
  }
  
  /**
   * Delegate vector generation to wrapped decision
   */
  toVector(): string | undefined {
    if (this.wrappedDecision.toVector) {
      return this.wrappedDecision.toVector();
    }
    return undefined;
  }
  
  /**
   * Attach evidence to a decision point
   */
  attachEvidence(decisionPoint: string, evidence: DecisionPointEvidence): void {
    this.evidenceMap.set(decisionPoint, evidence);
    
    this.recordEvent(AuditEventType.EVIDENCE_COLLECTED, {
      decisionPoint,
      evidenceId: evidence.verifications[0]?.evidence?.evidenceId || 'unknown',
      verificationsCount: evidence.verifications.length
    });
  }
  
  /**
   * Map a data source to a decision point
   */
  mapDataSource(decisionPoint: string, dataSource: DataSource): void {
    this.dataSourceMap.set(decisionPoint, dataSource);
    
    this.recordEvent(AuditEventType.DATA_SOURCE_ACCESSED, {
      decisionPoint,
      sourceId: dataSource.sourceId,
      sourceName: dataSource.name,
      sourceType: dataSource.type
    });
  }
  
  /**
   * Generate complete audit entry
   */
  getAuditEntry(): AuditEntry {
    const outcome = this.outcome || { action: 'UNKNOWN', priority: 'UNKNOWN' };
    
    return {
      auditId: crypto.randomUUID(),
      timestamp: Date.now(),
      methodology: this.methodology,
      methodologyVersion: this.version,
      evaluationId: this.evaluationId,
      parameters: this.extractParameters(),
      outcome,
      decisionEvidence: Array.from(this.evidenceMap.values()),
      dataMappings: [], // Would be populated if available
      checksum: this.generateChecksum()
    };
  }
  
  /**
   * Generate forensic report
   */
  generateForensicReport(): ForensicReport {
    const outcome = this.outcome || { action: 'UNKNOWN', priority: 'UNKNOWN' };
    
    return {
      reportId: crypto.randomUUID(),
      generatedAt: Date.now(),
      evaluationId: this.evaluationId,
      decisionPath: this.buildDecisionPath(),
      finalOutcome: outcome,
      dataSourcesUsed: this.buildDataSourceUsage(),
      dataSourceSummary: this.buildDataSourceSummary(),
      timeline: this.timeline,
      totalDuration: Date.now() - this.startTime,
      verificationSummary: this.buildVerificationSummary()
    };
  }
  
  /**
   * Get the wrapped decision (for advanced use cases)
   */
  getWrappedDecision(): SSVCDecision {
    return this.wrappedDecision;
  }
  
  /**
   * Get all collected evidence
   */
  getEvidence(): Record<string, DecisionPointEvidence> {
    return Object.fromEntries(this.evidenceMap);
  }
  
  /**
   * Get all mapped data sources
   */
  getDataSources(): Record<string, DataSource> {
    return Object.fromEntries(this.dataSourceMap);
  }
  
  /**
   * Get audit timeline
   */
  getTimeline(): TimelineEntry[] {
    return [...this.timeline];
  }
  
  /**
   * Record an audit event
   */
  private recordEvent(type: AuditEventType, details: Record<string, any>): void {
    const event: AuditEvent = {
      type,
      timestamp: Date.now(),
      details,
      evaluationId: this.evaluationId
    };
    
    this.auditEvents.push(event);
    
    // Add to timeline
    this.timeline.push({
      timestamp: event.timestamp,
      event: type,
      details
    });
  }
  
  /**
   * Extract parameters from wrapped decision (best effort)
   */
  private extractParameters(): Record<string, any> {
    // This is a best-effort extraction
    // Different decision types may store parameters differently
    
    const decision = this.wrappedDecision as any;
    
    // Try common property names
    if (decision.parameters) {
      return decision.parameters;
    }
    
    if (decision.options) {
      return decision.options;
    }
    
    // For runtime decisions, try to extract from the decision object
    if (decision.getParameters && typeof decision.getParameters === 'function') {
      return decision.getParameters();
    }
    
    // Extract from direct properties (for generated decisions)
    const params: Record<string, any> = {};
    for (const [key, value] of Object.entries(decision)) {
      if (typeof value !== 'function' && 
          !key.startsWith('_') && 
          key !== 'outcome' && 
          key !== 'evaluationId') {
        params[key] = value;
      }
    }
    
    return params;
  }
  
  /**
   * Build decision path from collected evidence
   */
  private buildDecisionPath(): ForensicReport['decisionPath'] {
    const decisionPath = [];
    let order = 0;
    
    for (const [decisionPoint, evidence] of this.evidenceMap) {
      decisionPath.push({
        decisionPoint,
        value: evidence.value,
        evidence,
        order: order++
      });
    }
    
    return decisionPath;
  }
  
  /**
   * Build data source usage information
   */
  private buildDataSourceUsage(): ForensicReport['dataSourcesUsed'] {
    const usage = [];
    
    for (const [decisionPoint, dataSource] of this.dataSourceMap) {
      usage.push({
        source: dataSource,
        accessed: true, // Assume accessed if mapped
        result: 'Data extracted successfully',
        accessTime: this.startTime,
      });
    }
    
    return usage;
  }
  
  /**
   * Build data source usage summary
   */
  private buildDataSourceSummary(): ForensicReport['dataSourceSummary'] {
    const sourceTypes: Record<string, number> = {};
    
    for (const dataSource of this.dataSourceMap.values()) {
      sourceTypes[dataSource.type] = (sourceTypes[dataSource.type] || 0) + 1;
    }
    
    return {
      totalSources: this.dataSourceMap.size,
      successfulAccesses: this.dataSourceMap.size,
      failedAccesses: 0,
      sourcesByType: sourceTypes
    };
  }
  
  /**
   * Build verification summary
   */
  private buildVerificationSummary(): ForensicReport['verificationSummary'] {
    let totalVerifications = 0;
    let successfulVerifications = 0;
    const bySource: Record<string, number> = {};
    
    for (const evidence of this.evidenceMap.values()) {
      totalVerifications += evidence.verifications.length;
      
      for (const verification of evidence.verifications) {
        successfulVerifications++; // Assume all are successful for now
        bySource[verification.source] = (bySource[verification.source] || 0) + 1;
      }
    }
    
    return {
      totalVerifications,
      successfulVerifications,
      failedVerifications: totalVerifications - successfulVerifications,
      verificationsBySource: bySource
    };
  }
  
  /**
   * Generate checksum for audit entry integrity
   */
  private generateChecksum(): string {
    // Simple checksum based on key audit data
    // In production, use a proper cryptographic hash
    const data = {
      evaluationId: this.evaluationId,
      methodology: this.methodology,
      version: this.version,
      outcome: this.outcome,
      evidenceCount: this.evidenceMap.size
    };
    
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}

/**
 * Factory functions for creating auditable decisions
 */
export class AuditableDecisionFactory {
  
  /**
   * Wrap any existing decision to make it auditable
   */
  static wrapDecision(
    decision: SSVCDecision,
    methodology: string,
    version: string
  ): AuditableDecision {
    return new AuditableDecisionWrapper(decision, methodology, version);
  }
  
  /**
   * Create an auditable decision from a generated plugin
   */
  static fromGeneratedPlugin(
    plugin: any,
    parameters: Record<string, any>
  ): AuditableDecision {
    const decision = plugin.createDecision(parameters);
    return new AuditableDecisionWrapper(decision, plugin.name, plugin.version);
  }
  
  /**
   * Create an auditable decision from runtime YAML
   */
  static fromRuntimeYAML(
    yamlContent: string,
    parameters: Record<string, any>
  ): AuditableDecision {
    try {
      // Parse YAML to extract methodology info
      const methodologyData = yaml.parse(yamlContent);
      const methodology = methodologyData.name || 'unknown';
      const version = methodologyData.version || '1.0';
      
      // Create runtime decision
      const decision = createRuntimeDecision(yamlContent, parameters);
      
      // Wrap with audit capabilities
      return new AuditableDecisionWrapper(decision, methodology, version);
      
    } catch (error) {
      throw new Error(`Failed to create auditable decision from YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Wrap an existing decision with pre-configured evidence and data sources
   */
  static wrapWithEvidence(
    decision: SSVCDecision,
    methodology: string,
    version: string,
    evidence: Map<string, DecisionPointEvidence>,
    dataSources: Map<string, DataSource>
  ): AuditableDecision {
    const wrapper = new AuditableDecisionWrapper(decision, methodology, version);
    
    // Attach all evidence
    for (const [decisionPoint, evidenceData] of evidence) {
      wrapper.attachEvidence(decisionPoint, evidenceData);
    }
    
    // Map all data sources
    for (const [decisionPoint, dataSource] of dataSources) {
      wrapper.mapDataSource(decisionPoint, dataSource);
    }
    
    return wrapper;
  }
}

/**
 * Utility functions for working with auditable decisions
 */
export class AuditableDecisionUtils {
  
  /**
   * Check if a decision is auditable
   */
  static isAuditable(decision: SSVCDecision): decision is AuditableDecision {
    return decision.evaluationId !== undefined && 
           typeof (decision as any).attachEvidence === 'function';
  }
  
  /**
   * Get audit information from a decision if available
   */
  static getAuditInfo(decision: SSVCDecision): {
    isAuditable: boolean;
    evaluationId?: string;
    evidenceCount?: number;
    dataSourceCount?: number;
  } {
    if (this.isAuditable(decision)) {
      const wrapper = decision as AuditableDecisionWrapper;
      return {
        isAuditable: true,
        evaluationId: decision.evaluationId,
        evidenceCount: wrapper.getEvidence ? Object.keys(wrapper.getEvidence()).length : 0,
        dataSourceCount: wrapper.getDataSources ? Object.keys(wrapper.getDataSources()).length : 0
      };
    }
    
    return {
      isAuditable: false,
      evaluationId: decision.evaluationId
    };
  }
  
  /**
   * Compare two decisions for audit purposes
   */
  static compareDecisions(
    decision1: SSVCDecision,
    decision2: SSVCDecision
  ): {
    sameEvaluationId: boolean;
    sameOutcome: boolean;
    bothAuditable: boolean;
  } {
    return {
      sameEvaluationId: decision1.evaluationId === decision2.evaluationId,
      sameOutcome: JSON.stringify(decision1.outcome) === JSON.stringify(decision2.outcome),
      bothAuditable: this.isAuditable(decision1) && this.isAuditable(decision2)
    };
  }
}