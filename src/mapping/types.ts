/**
 * Data Source Mapping Types for SSVC Evidence System
 * 
 * Types for mapping raw data sources to SSVC decision points
 */

/**
 * Types of data sources supported
 */
export type DataSourceType = 'sql' | 'document' | 'api' | 'file' | 'manual';

/**
 * Configuration for different data source types
 */
export interface DataSourceConfig {
  // SQL sources
  /** Database table name */
  table?: string;
  /** Primary key column name */
  primaryKey?: string;
  /** Column name to extract value from */
  column?: string;
  /** Custom SQL query */
  query?: string;
  
  // Document sources (NoSQL, MongoDB, etc.)
  /** Collection or container name */
  collection?: string;
  /** Document identifier field */
  documentKey?: string;
  /** JSONPath expression to extract value */
  jsonPath?: string;
  
  // API sources
  /** API endpoint URL */
  endpoint?: string;
  /** HTTP method */
  method?: string;
  /** HTTP headers */
  headers?: Record<string, string>;
  
  // File sources
  /** Path to the file */
  filePath?: string;
  /** MIME type of the file content */
  mimeType?: string;
}

/**
 * Data source definition
 */
export interface DataSource {
  /** Unique identifier for this data source */
  sourceId: string;
  /** Human-readable name for this source */
  name: string;
  /** Type of data source */
  type: DataSourceType;
  /** Description of what this source provides */
  description: string;
  /** Priority for resolution (1 = highest priority) */
  priority: number;
  /** Whether this source is currently active/available */
  isActive: boolean;
  /** Connection string or URL for the data source */
  connectionString?: string;
  /** MIME types this source can provide */
  mimeTypes: string[];
  /** Last time this source was accessed */
  lastAccessed?: number;
  /** Source-specific configuration */
  config: DataSourceConfig;
}

/**
 * Transform rule for mapping raw values to methodology values
 */
export interface TransformRule {
  /** Source value to match (string or regex) */
  sourceValue: string | RegExp;
  /** Target methodology value */
  targetValue: string;
  /** List of DataMapping IDs this rule applies to */
  applicableToMappings: string[];
  /** List of DataSource IDs this rule applies to */
  applicableToSources: string[];
}

/**
 * Data mapping configuration for a methodology
 */
export interface DataMapping {
  /** Unique identifier for this mapping */
  mappingId: string; // UUID
  /** Methodology this mapping applies to */
  methodology: string;
  /** Data sources for this mapping */
  dataSources: DataSource[];
  /** Transform rules for converting raw data */
  transformRules?: TransformRule[];
}

/**
 * Configuration for mapping decision points to data sources
 */
export interface DecisionPointMapping {
  /** Decision point name (e.g., "exploitation") */
  decisionPoint: string;
  /** Whether this decision point is required for evaluation */
  required: boolean;
  /** Data sources ordered by priority */
  dataSources: DataSource[];
  /** Transform rules specific to this decision point */
  transformRules: TransformRule[];
  /** Default value if no data is available */
  defaultValue?: string;
  /** Valid enum values for this decision point */
  validValues: string[];
  /** JSONPath expression to extract value from raw data */
  extractionPath?: string;
}

/**
 * Complete methodology data configuration
 */
export interface MethodologyDataConfig {
  /** Methodology name */
  methodology: string;
  /** Methodology version */
  version: string;
  /** Mappings for each decision point */
  decisionPointMappings: DecisionPointMapping[];
}

/**
 * Result of mapping a single decision point
 */
export interface MappingResult {
  /** The mapped value for the decision point */
  value: string;
  /** Evidence collected during mapping */
  evidence: any; // Will be DecisionPointEvidence from evidence types
  /** The data source that was used (null if default was used) */
  sourceUsed: DataSource | null;
}

/**
 * Result of mapping all decision points
 */
export interface MappedDecisionValues {
  /** Parameters mapped for the decision */
  parameters: Record<string, any>;
  /** Evidence for each decision point */
  evidence: Record<string, any>; // Will be DecisionPointEvidence
  /** Sources used for each decision point */
  sourcesUsed: Record<string, DataSource | null>;
}

/**
 * Data extraction result from a source
 */
export interface ExtractionResult {
  /** Extracted raw value */
  value: any;
  /** Success indicator */
  success: boolean;
  /** Error message if extraction failed */
  error?: string;
  /** Metadata about the extraction */
  metadata?: {
    /** Time extraction was performed */
    timestamp: number;
    /** Query or path used for extraction */
    query?: string;
    /** Response size or record count */
    size?: number;
  };
}

/**
 * Data source accessor interface
 */
export interface DataSourceAccessor {
  /** Extract data from SQL source */
  extractFromSQL(config: DataSourceConfig, input: any): Promise<ExtractionResult>;
  /** Extract data from document source */
  extractFromDocument(config: DataSourceConfig, input: any): Promise<ExtractionResult>;
  /** Extract data from API source */
  extractFromAPI(config: DataSourceConfig, input: any): Promise<ExtractionResult>;
  /** Extract data from file source */
  extractFromFile(config: DataSourceConfig, input: any): Promise<ExtractionResult>;
  /** Extract data from manual input */
  extractFromManual(input: any): Promise<ExtractionResult>;
}

/**
 * Transform engine interface
 */
export interface TransformEngine {
  /** Apply transform rules to a value */
  transform(
    value: any,
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): string;
  /** Validate that a value matches expected enum values */
  validate(value: string, validValues: string[]): boolean;
  /** Get applicable rules for a source and mapping */
  getApplicableRules(
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): TransformRule[];
}

/**
 * Data mapper interface
 */
export interface DataMapper {
  /** Register a data mapping */
  registerMapping(mapping: DataMapping): void;
  /** Get registered mapping by ID */
  getMapping(mappingId: string): DataMapping | undefined;
  /** Map raw data to decision point value */
  mapDecisionPoint(
    mapping: DecisionPointMapping,
    rawInputs: any[]
  ): Promise<MappingResult>;
  /** Check if data is available for a decision point */
  hasDataForDecisionPoint(mapping: DecisionPointMapping, rawInputs: any[]): boolean;
}