/**
 * Audit Trail and Forensic Report Types for SSVC
 * 
 * Comprehensive audit trail structures for forensic investigation
 */

import { SSVCOutcome } from '../core';
import { DecisionPointEvidence, VerificationSummary, TimelineEntry } from '../evidence/types';

// Re-export TimelineEntry for convenience
export { TimelineEntry };
import { DataMapping, DataSource } from '../mapping/types';

/**
 * Complete audit entry for a single SSVC evaluation
 */
export interface AuditEntry {
  /** Unique identifier for this audit entry */
  auditId: string; // UUID
  /** When this audit entry was created */
  timestamp: number;
  /** Methodology used for evaluation */
  methodology: string;
  /** Version of the methodology */
  methodologyVersion: string;
  /** Unique identifier for the evaluation */
  evaluationId: string; // UUID from the Decision
  
  // Decision data
  /** Input parameters used for evaluation */
  parameters: Record<string, any>;
  /** Resulting action and priority */
  outcome: SSVCOutcome;
  
  // Evidence trail
  /** Evidence for each decision point */
  decisionEvidence: DecisionPointEvidence[];
  /** Data mappings used */
  dataMappings: DataMapping[];
  
  // Context
  /** Who performed this evaluation */
  evaluatedBy?: string;
  /** What this evaluation was for (CVE ID, etc.) */
  evaluatedFor?: string;
  /** Environment where evaluation was performed */
  environment?: string;
  
  // Integrity
  /** Hash of the entire audit entry for tamper detection */
  checksum?: string;
  /** Reference to previous audit entry for chain of custody */
  previousAuditId?: string;
}

/**
 * Data source usage details
 */
export interface DataSourceUsage {
  /** The data source that was consulted */
  source: DataSource;
  /** Whether this source was successfully accessed */
  accessed: boolean;
  /** Result returned from the source (if any) */
  result?: any;
  /** Error encountered when accessing source */
  error?: string;
  /** When this source was accessed */
  accessTime?: number;
}

/**
 * Decision path entry showing tree traversal
 */
export interface DecisionPathEntry {
  /** Decision point name */
  decisionPoint: string;
  /** Value chosen for this decision point */
  value: string;
  /** Evidence supporting this choice */
  evidence: DecisionPointEvidence;
  /** Order in the decision tree traversal */
  order: number;
}

/**
 * Comprehensive forensic report for investigations
 */
export interface ForensicReport {
  /** Unique identifier for this report */
  reportId: string;
  /** When this report was generated */
  generatedAt: number;
  /** Evaluation ID this report is for */
  evaluationId: string;
  
  // Decision analysis
  /** Complete path through the decision tree */
  decisionPath: DecisionPathEntry[];
  /** Final outcome of the decision */
  finalOutcome: SSVCOutcome;
  
  // Data source analysis
  /** All data sources that were consulted */
  dataSourcesUsed: DataSourceUsage[];
  /** Summary of data source usage */
  dataSourceSummary: {
    totalSources: number;
    successfulAccesses: number;
    failedAccesses: number;
    sourcesByType: Record<string, number>;
  };
  
  // Timeline
  /** Complete timeline of evaluation events */
  timeline: TimelineEntry[];
  /** Duration of the entire evaluation process */
  totalDuration?: number;
  
  // Verification analysis
  /** Summary of all verifications performed */
  verificationSummary: VerificationSummary;
  
  // Integrity
  /** Report integrity hash */
  reportChecksum?: string;
  /** Links to related audit entries */
  relatedAudits?: string[];
}

/**
 * Audit storage interface
 */
export interface AuditStorage {
  /** Store an audit entry */
  store(entry: AuditEntry): Promise<void>;
  /** Retrieve audit entry by ID */
  retrieve(auditId: string): Promise<AuditEntry | null>;
  /** Get audit history for an evaluation */
  getHistory(evaluationId: string): Promise<AuditEntry[]>;
  /** Search audit entries by criteria */
  search(criteria: AuditSearchCriteria): Promise<AuditEntry[]>;
  /** Verify audit chain integrity */
  verifyChain(startId: string, endId?: string): Promise<ChainVerificationResult>;
}

/**
 * Search criteria for audit entries
 */
export interface AuditSearchCriteria {
  /** Methodology name */
  methodology?: string;
  /** Date range */
  dateRange?: {
    start: number;
    end: number;
  };
  /** Who performed evaluations */
  evaluatedBy?: string;
  /** What evaluations were for */
  evaluatedFor?: string;
  /** Environment */
  environment?: string;
  /** Outcome action */
  action?: string;
  /** Limit results */
  limit?: number;
}

/**
 * Result of chain verification
 */
export interface ChainVerificationResult {
  /** Whether the chain is valid */
  valid: boolean;
  /** Issues found in the chain */
  issues: string[];
  /** Number of entries verified */
  entriesVerified: number;
  /** Broken chain links (if any) */
  brokenLinks?: Array<{
    fromId: string;
    toId: string;
    issue: string;
  }>;
}

/**
 * Audit service interface
 */
export interface AuditService {
  /** Create audit entry for an evaluation */
  createAuditEntry(
    evaluationId: string,
    methodology: string,
    version: string,
    parameters: Record<string, any>,
    outcome: SSVCOutcome,
    evidence: DecisionPointEvidence[],
    dataMappings: DataMapping[]
  ): Promise<AuditEntry>;
  
  /** Store audit entry */
  storeAudit(entry: AuditEntry): Promise<void>;
  
  /** Generate forensic report */
  generateForensicReport(evaluationId: string): Promise<ForensicReport>;
  
  /** Get audit history */
  getAuditHistory(evaluationId: string): Promise<AuditEntry[]>;
  
  /** Search audits */
  searchAudits(criteria: AuditSearchCriteria): Promise<AuditEntry[]>;
  
  /** Verify audit integrity */
  verifyAuditIntegrity(auditId: string): Promise<boolean>;
  
  /** Verify audit chain */
  verifyAuditChain(startId: string, endId?: string): Promise<ChainVerificationResult>;
  
  /** Export audit data */
  exportAudit(auditId: string, format: 'json' | 'pdf'): Promise<Buffer | string>;
}

/**
 * Exportable report formats
 */
export interface ExportableReport {
  /** Export as JSON */
  toJSON(): string;
  /** Export as PDF */
  toPDF(): Promise<Buffer>;
  /** Get report metadata */
  getMetadata(): {
    reportId: string;
    evaluationId: string;
    generatedAt: number;
    methodology: string;
    outcome: SSVCOutcome;
  };
}

/**
 * Audit event types for timeline tracking
 */
export enum AuditEventType {
  EVALUATION_STARTED = 'EVALUATION_STARTED',
  DATA_SOURCE_ACCESSED = 'DATA_SOURCE_ACCESSED',
  TRANSFORM_APPLIED = 'TRANSFORM_APPLIED',
  VERIFICATION_PERFORMED = 'VERIFICATION_PERFORMED',
  DECISION_POINT_RESOLVED = 'DECISION_POINT_RESOLVED',
  EVALUATION_COMPLETED = 'EVALUATION_COMPLETED',
  EVIDENCE_COLLECTED = 'EVIDENCE_COLLECTED',
  ERROR_OCCURRED = 'ERROR_OCCURRED'
}

/**
 * Structured audit event
 */
export interface AuditEvent {
  /** Event type */
  type: AuditEventType;
  /** When the event occurred */
  timestamp: number;
  /** Event details */
  details: Record<string, any>;
  /** Duration of the event (if applicable) */
  duration?: number;
  /** Related evaluation ID */
  evaluationId: string;
}

/**
 * Audit configuration
 */
export interface AuditConfig {
  /** Whether to store audit entries */
  enabled: boolean;
  /** Storage backend to use */
  storage: 'memory' | 'file' | 'database';
  /** Storage configuration */
  storageConfig?: Record<string, any>;
  /** Whether to generate checksums */
  generateChecksums: boolean;
  /** Hash algorithm for checksums */
  checksumAlgorithm: string;
  /** Whether to maintain audit chains */
  maintainChains: boolean;
  /** Maximum audit entries to keep */
  maxEntries?: number;
  /** Auto-export configuration */
  autoExport?: {
    enabled: boolean;
    format: 'json' | 'pdf';
    destination: string;
  };
}