/**
 * Evidence Types for SSVC Audit Trail
 * 
 * Comprehensive evidence structures for forensic-grade audit trails
 */

// Comprehensive hash algorithms supported
export type HashAlgorithm = 
  // SHA family
  | 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512-224' | 'sha512-256'
  // SHA-3 family
  | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512'
  // BLAKE family
  | 'blake2b' | 'blake2s' | 'blake3'
  // Legacy/specialized
  | 'md5' | 'ripemd160' | 'whirlpool';

/**
 * Cryptographic checksum for evidence integrity
 */
export interface Checksum {
  /** Hashing algorithm used */
  algorithm: HashAlgorithm;
  /** The computed hash/signature */
  signature: string;
  /** Optional URL to external signature file */
  signatureUrl?: string;
  /** Timestamp when hash was computed (milliseconds since epoch) */
  timestamp: number;
  /** UUID of the content that was hashed */
  contentId: string;
}

/**
 * Evidence collected for a decision point
 */
export interface Evidence {
  /** Whether the evidence has been verified */
  verified: boolean;
  /** Unique identifier for this evidence */
  evidenceId: string; // UUID
  /** Cryptographic checksums for integrity */
  checksums?: Checksum[];
  /** Related URLs for additional context */
  urls?: string[];
  /** Human-readable notes about this evidence */
  notes?: string;
  /** Raw contents of the evidence (if applicable) */
  contents?: string;
  /** When this evidence was collected (milliseconds since epoch) */
  collectedAt: number;
  /** System or user identifier who collected this evidence */
  collectedBy?: string;
}

/**
 * Verification performed for a decision point
 */
export interface Verification {
  /** Method used for verification (e.g., "API check", "Database query") */
  method: string;
  /** Source consulted (e.g., "NVD", "ExploitDB", "Internal DB") */
  source: string;
  /** When verification was performed (milliseconds since epoch) */
  timestamp: number;
  /** Result of the verification (what was found/not found) */
  result: string;
  /** The actual query/search performed (optional) */
  query?: string;
  /** Evidence collected during verification */
  evidence?: Evidence;
}

/**
 * Complete evidence for a single decision point
 */
export interface DecisionPointEvidence {
  /** Name of the decision point (e.g., "exploitation") */
  decisionPoint: string;
  /** Value chosen for this decision point (e.g., "NONE", "POC", "ACTIVE") */
  value: string;
  /** All verifications performed for this decision point */
  verifications: Verification[];
  /** Human-readable reasoning for the chosen value */
  reasoning?: string;
}

/**
 * Timeline entry for forensic tracking
 */
export interface TimelineEntry {
  /** When this event occurred (milliseconds since epoch) */
  timestamp: number;
  /** Description of the event */
  event: string;
  /** Additional details about the event */
  details: any;
}

/**
 * Summary of verification activities
 */
export interface VerificationSummary {
  /** Total number of verifications performed */
  totalVerifications: number;
  /** Number of successful verifications */
  successfulVerifications: number;
  /** Number of failed verifications */
  failedVerifications: number;
  /** Count of verifications by source */
  verificationsBySource: Record<string, number>;
}

/**
 * Raw data input provided by users
 */
export interface RawDataInput {
  /** Source ID that this data came from */
  sourceId: string; // Must match a configured DataSource
  /** When this data was collected */
  timestamp: number;
  /** The actual raw data */
  data: any;
  /** Optional metadata about the data */
  metadata?: {
    /** MIME type of the data */
    mimeType?: string;
    /** Character encoding (if applicable) */
    encoding?: string;
    /** Size in bytes */
    size?: number;
    /** Checksum for integrity verification */
    checksum?: Checksum;
  };
}

/**
 * Complete data package for evaluation
 */
export interface EvaluationDataPackage {
  /** Methodology to evaluate against */
  methodology: string;
  /** Raw data inputs from various sources */
  rawInputs: RawDataInput[];
  /** Optional context for the evaluation */
  context?: {
    /** Who performed this evaluation */
    evaluatedBy?: string;
    /** What this evaluation is for (CVE ID, vulnerability, etc.) */
    evaluatedFor?: string;
    /** Environment where evaluation was performed */
    environment?: string;
  };
}

/**
 * Validation error for data completeness issues
 */
export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Result of data validation
 */
export interface ValidationResult {
  /** Whether the data is complete and valid */
  valid: boolean;
  /** List of validation errors (if any) */
  errors: string[];
}

/**
 * Evidence collector interface
 */
export interface EvidenceCollector {
  /** Collect evidence from SQL sources */
  collectFromSQL(config: any): Promise<Evidence>;
  /** Collect evidence from API sources */
  collectFromAPI(config: any): Promise<Evidence>;
  /** Collect evidence from document sources */
  collectFromDocument(config: any): Promise<Evidence>;
  /** Collect evidence from file sources */
  collectFromFile(config: any): Promise<Evidence>;
  /** Collect evidence from manual input */
  collectFromManual(data: any): Promise<Evidence>;
  /** Verify checksum integrity */
  verifyChecksum(evidence: Evidence): boolean;
  /** Chain evidence for custody tracking */
  chainEvidence(current: Evidence, previous: Evidence): Evidence;
}