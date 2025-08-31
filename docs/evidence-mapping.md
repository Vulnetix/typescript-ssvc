# Evidence Mapping & Audit Trail System

This document describes the evidence mapping and audit trail system for SSVC (Stakeholder-Specific Vulnerability Categorization). This system enables forensic-grade tracking of vulnerability decisions with full chain of custody.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Quick Start](#quick-start)
- [Evidence Collection](#evidence-collection)
- [Data Source Mapping](#data-source-mapping)
- [Transform Rules](#transform-rules)
- [Audit Trails](#audit-trails)
- [Forensic Reports](#forensic-reports)
- [Browser Compatibility](#browser-compatibility)
- [API Reference](#api-reference)

## Overview

The evidence mapping and audit trail system provides:

- **Evidence Collection**: Cryptographic integrity with 15+ hash algorithms
- **Data Source Abstraction**: Priority-based resolution from SQL, API, file, and manual sources
- **Transform Rules**: Map raw data to methodology-specific values
- **Audit Trails**: Complete timeline with chain of custody
- **Forensic Reports**: Export for compliance and investigation
- **Browser Compatibility**: Uses `crypto.randomUUID()` for universal support

## Core Concepts

### Evidence Structure
Evidence includes verification methods, sources, checksums, and metadata:

```typescript
interface DecisionPointEvidence {
  decisionPoint: string;
  value: string;
  verifications: VerificationMethod[];
}

interface VerificationMethod {
  method: 'automated' | 'manual' | 'hybrid';
  timestamp: number;
  source: string;
  result: string;
  evidence: EvidenceRecord;
}
```

### Data Sources
Five types of data sources with priority-based resolution:

1. **SQL**: Database queries with table/column mapping
2. **Document**: NoSQL/MongoDB with JSONPath extraction
3. **API**: HTTP endpoints with custom headers
4. **File**: Local files with MIME type handling
5. **Manual**: Human-provided input

### Transform Rules
Convert raw data to methodology values with source restrictions:

```typescript
interface TransformRule {
  sourceValue: string | RegExp;
  targetValue: string;
  applicableToSources: string[];
  applicableToMappings: string[];
}
```

## Quick Start

### Basic Usage

```typescript
import { createDecision, AuditableDecisionFactory } from 'ssvc';

// Create a basic decision
const decision = createDecision('cisa', {
  exploitation: 'active',
  automatable: 'yes',
  technical_impact: 'total',
  mission_wellbeing: 'high'
});

// Wrap for audit trail
const auditableDecision = AuditableDecisionFactory.wrapDecision(
  decision, 
  'cisa', 
  '1.0'
);

// Evaluate with audit tracking
const outcome = auditableDecision.evaluate();
console.log(`Decision: ${outcome.action} (${outcome.priority})`);
console.log(`Evaluation ID: ${auditableDecision.evaluationId}`);
```

### With Evidence Collection

```typescript
// Attach evidence to decision points
const evidence = {
  decisionPoint: 'exploitation',
  value: 'ACTIVE',
  verifications: [{
    method: 'automated',
    timestamp: Date.now(),
    source: 'nvd-api',
    result: 'Active exploitation detected',
    evidence: {
      verified: true,
      evidenceId: crypto.randomUUID(),
      collectedAt: Date.now(),
      collectedBy: 'nvd-scanner',
      urls: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1234'],
      notes: 'Multiple exploitation reports confirmed',
      checksums: [{
        algorithm: 'sha256',
        signature: 'abc123def456789...',
        timestamp: Date.now(),
        contentId: crypto.randomUUID()
      }]
    }
  }]
};

auditableDecision.attachEvidence('exploitation', evidence);
```

## Evidence Collection

### Hash Algorithm Support

The system supports 15+ cryptographic hash algorithms for evidence integrity:

```typescript
type HashAlgorithm = 
  | 'sha256' | 'sha512' | 'sha3-256' | 'sha3-512'
  | 'blake2b' | 'blake2s' | 'md5' | 'sha1'
  | 'ripemd160' | 'whirlpool' | 'tiger'
  | 'crc32' | 'adler32' | 'xxhash' | 'murmur3';
```

### Evidence Records

Each piece of evidence includes comprehensive metadata:

```typescript
interface EvidenceRecord {
  verified: boolean;
  evidenceId: string;
  collectedAt: number;
  collectedBy: string;
  urls?: string[];
  notes?: string;
  contents?: any;
  checksums: ChecksumRecord[];
}

interface ChecksumRecord {
  algorithm: HashAlgorithm;
  signature: string;
  timestamp: number;
  contentId: string;
}
```

### Multiple Verifications

Decision points support multiple verification methods:

```typescript
const multipleVerifications = {
  decisionPoint: 'technical_impact',
  value: 'TOTAL',
  verifications: [
    {
      method: 'automated',
      source: 'cvss-calculator',
      result: 'CVSS Base Score: 9.8 (Critical)',
      evidence: {
        verified: true,
        evidenceId: crypto.randomUUID(),
        collectedAt: Date.now(),
        collectedBy: 'cvss-analyzer',
        contents: { baseScore: 9.8, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
        checksums: [{
          algorithm: 'sha256',
          signature: 'def789abc123...',
          timestamp: Date.now(),
          contentId: crypto.randomUUID()
        }]
      }
    },
    {
      method: 'manual', 
      source: 'security-analyst',
      result: 'Confirmed total system compromise possible',
      evidence: {
        verified: true,
        evidenceId: crypto.randomUUID(),
        collectedAt: Date.now(),
        collectedBy: 'john.analyst',
        notes: 'Manual verification by senior security analyst',
        checksums: [{
          algorithm: 'sha512',
          signature: 'ghi456def789...',
          timestamp: Date.now(),
          contentId: crypto.randomUUID()
        }]
      }
    }
  ]
};
```

## Data Source Mapping

### Configuration

Configure data sources with priority-based resolution:

```typescript
import { DataSourceFactory, MethodologyConfigBuilder } from 'ssvc';

const config = new MethodologyConfigBuilder('cisa', '1.0')
  .decisionPoint('exploitation')
  .required(true)
  .validValues(['none', 'poc', 'active'])
  .dataSource(
    DataSourceFactory.api(
      'nvd-api',
      'NVD Vulnerability Database',
      1, // Highest priority
      {
        endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
        method: 'GET',
        headers: { 'apiKey': process.env.NVD_API_KEY }
      },
      'Official NVD vulnerability data',
      ['application/json']
    )
  )
  .dataSource(
    DataSourceFactory.manual(
      'analyst-input',
      'Security Analyst Assessment', 
      2, // Lower priority
      'Manual assessment by security analyst',
      ['text/plain']
    )
  )
  .build();
```

### Data Source Types

#### SQL Sources
```typescript
DataSourceFactory.sql(
  'vuln-db',
  'Vulnerability Database',
  1,
  {
    table: 'vulnerabilities',
    primaryKey: 'cve_id', 
    column: 'exploitation_status',
    query: 'SELECT exploitation_status FROM vulns WHERE cve_id = ?'
  },
  'Primary vulnerability database',
  ['application/json']
)
```

#### Document Sources
```typescript
DataSourceFactory.document(
  'mongo-threats',
  'Threat Intelligence DB',
  2,
  {
    collection: 'threat_intel',
    documentKey: 'cve_id',
    jsonPath: '$.exploitation.status'
  },
  'MongoDB threat intelligence collection',
  ['application/json', 'application/bson']
)
```

#### API Sources
```typescript
DataSourceFactory.api(
  'threat-feed',
  'Commercial Threat Feed',
  3,
  {
    endpoint: 'https://api.threatfeed.com/v1/cve/{cveId}',
    method: 'GET',
    headers: { 'Authorization': 'Bearer ${API_TOKEN}' }
  },
  'Commercial threat intelligence feed',
  ['application/json']
)
```

#### File Sources
```typescript
DataSourceFactory.file(
  'local-intel',
  'Local Intelligence Files',
  4,
  {
    filePath: './intel/{cveId}.json',
    mimeType: 'application/json'
  },
  'Local intelligence file system',
  ['application/json', 'text/plain']
)
```

## Transform Rules

### Basic Transformation

Transform raw data to methodology-specific values:

```typescript
import { TransformEngine, CommonTransforms } from 'ssvc';

const engine = new TransformEngine();

const rules = [
  {
    sourceValue: /^(active|exploitation|exploited)$/i,
    targetValue: 'ACTIVE',
    applicableToSources: ['nvd-api', 'threat-feed'],
    applicableToMappings: ['exploitation']
  },
  {
    sourceValue: /^(poc|proof.of.concept)$/i, 
    targetValue: 'POC',
    applicableToSources: ['analyst-input'],
    applicableToMappings: ['exploitation']
  }
];

const result = engine.transform(
  'exploitation detected', 
  rules, 
  'nvd-api', 
  'exploitation'
);
console.log(result.value); // 'ACTIVE'
```

### Common Transform Patterns

Pre-built transforms for common scenarios:

```typescript
// Boolean to Yes/No
const booleanRules = CommonTransforms.booleanToYesNo();
const result = engine.transform('true', booleanRules, 'manual', 'automatable');
console.log(result.value); // 'YES'

// Severity level normalization
const severityRules = CommonTransforms.severityLevels();
const severity = engine.transform('high', severityRules, 'cvss', 'impact');
console.log(severity.value); // 'HIGH'

// CVSS score to impact mapping
const cvssRules = CommonTransforms.cvssToImpact();
const impact = engine.transform('9.8', cvssRules, 'cvss-calc', 'technical_impact');
console.log(impact.value); // 'TOTAL'
```

### Source and Mapping Restrictions

Rules can be restricted to specific sources and mappings:

```typescript
const restrictedRules = [
  {
    sourceValue: 'confirmed',
    targetValue: 'ACTIVE',
    applicableToSources: ['nvd-api'], // Only for NVD API
    applicableToMappings: ['exploitation'] // Only for exploitation mapping
  },
  {
    sourceValue: 'confirmed', 
    targetValue: 'HIGH',
    applicableToSources: ['analyst-input'], // Only for analyst input
    applicableToMappings: ['mission_wellbeing'] // Only for mission impact
  }
];
```

## Audit Trails

### Timeline Tracking

Every action is recorded in the audit timeline:

```typescript
const timeline = auditableDecision.getTimeline();
console.log(`Timeline entries: ${timeline.length}`);

timeline.forEach(entry => {
  console.log(`${new Date(entry.timestamp).toISOString()}: ${entry.action}`);
  console.log(`  Details: ${entry.details}`);
  console.log(`  Duration: ${entry.duration}ms`);
});
```

### Audit Entries

Complete audit records with checksums:

```typescript
const auditEntry = auditableDecision.getAuditEntry();
console.log(`Audit ID: ${auditEntry.auditId}`);
console.log(`Methodology: ${auditEntry.methodology} v${auditEntry.version}`);
console.log(`Checksum: ${auditEntry.checksum}`);
console.log(`Evidence Count: ${Object.keys(auditEntry.evidence).length}`);
console.log(`Created: ${new Date(auditEntry.timestamp).toISOString()}`);
```

## Forensic Reports

### Generating Reports

Create comprehensive forensic reports:

```typescript
const forensicReport = auditableDecision.generateForensicReport();

console.log(`Report ID: ${forensicReport.reportId}`);
console.log(`Generated: ${new Date(forensicReport.timestamp)}`);
console.log(`Duration: ${forensicReport.totalDuration}ms`);
console.log(`Decision: ${forensicReport.outcome.action}`);
console.log(`Priority: ${forensicReport.outcome.priority}`);
```

### Report Structure

Forensic reports include:

- **Report Metadata**: ID, timestamp, duration
- **Decision Outcome**: Final action and priority
- **Decision Path**: Complete evaluation steps
- **Evidence Summary**: All collected evidence
- **Data Sources**: Sources used and their priorities
- **Chain of Custody**: Complete timeline
- **Checksums**: Integrity verification

### Export Formats

Export reports in multiple formats:

```typescript
// JSON export (default)
const jsonReport = JSON.stringify(forensicReport, null, 2);

// Custom processing for other formats
const reportData = {
  reportId: forensicReport.reportId,
  timestamp: forensicReport.timestamp,
  outcome: forensicReport.outcome,
  evidence: forensicReport.evidence,
  decisionPath: forensicReport.decisionPath
};

// Generate CSV summary
const csvReport = generateCSVSummary(reportData);

// Generate CSV summary
const csvReport = generateCSVReport(reportData);
```

## Browser Compatibility

### UUID Generation

The system uses browser-compatible `crypto.randomUUID()`:

```typescript
// Browser-compatible UUID generation
const evaluationId = crypto.randomUUID();
const evidenceId = crypto.randomUUID();
const contentId = crypto.randomUUID();

// Example evidence with browser-compatible UUIDs
const evidence = {
  evidenceId: crypto.randomUUID(),
  collectedAt: Date.now(),
  checksums: [{
    algorithm: 'sha256',
    contentId: crypto.randomUUID(),
    signature: 'abc123def456...',
    timestamp: Date.now()
  }]
};
```

### Web Crypto API

Hash calculations use the Web Crypto API when available:

```typescript
// Browser-compatible hash calculation
async function calculateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Usage in evidence collection
const signature = await calculateHash(JSON.stringify(evidenceData));
```

### Node.js Fallbacks

In Node.js environments, fallbacks are provided:

```typescript
// Node.js crypto module fallback
import { randomUUID, createHash } from 'crypto';

function generateUUID(): string {
  // Use Node.js crypto in server environments
  if (typeof window === 'undefined') {
    return randomUUID();
  }
  // Use browser crypto in client environments
  return crypto.randomUUID();
}

function calculateHashSync(data: string): string {
  if (typeof window === 'undefined') {
    return createHash('sha256').update(data).digest('hex');
  }
  // Use async Web Crypto API in browsers
  throw new Error('Use calculateHash() async method in browser');
}
```

## Complete Example

Here's a comprehensive example showing the full evidence mapping and audit trail workflow:

```typescript
import { 
  createDecision, 
  AuditableDecisionFactory,
  TransformEngine,
  CommonTransforms,
  DataSourceFactory
} from 'ssvc';

async function completeEvidenceWorkflow() {
  // 1. Create base decision
  const decision = createDecision('cisa', {
    exploitation: 'active',
    automatable: 'yes',
    technical_impact: 'total',
    mission_wellbeing: 'high'
  });

  // 2. Wrap for audit trail
  const auditableDecision = AuditableDecisionFactory.wrapDecision(
    decision, 
    'cisa', 
    '1.0'
  );

  console.log(`Evaluation ID: ${auditableDecision.evaluationId}`);

  // 3. Configure transform rules
  const engine = new TransformEngine();
  const rules = [
    {
      sourceValue: /^(active|exploited)$/i,
      targetValue: 'ACTIVE',
      applicableToSources: ['nvd-api'],
      applicableToMappings: ['exploitation']
    }
  ];

  // 4. Transform raw data
  const transformResult = engine.transform(
    'exploited', 
    rules, 
    'nvd-api', 
    'exploitation'
  );
  console.log(`Transformed: ${transformResult.value}`);

  // 5. Attach evidence
  const evidence = {
    decisionPoint: 'exploitation',
    value: 'ACTIVE',
    verifications: [{
      method: 'automated',
      timestamp: Date.now(),
      source: 'nvd-api',
      result: 'Active exploitation confirmed in NVD database',
      evidence: {
        verified: true,
        evidenceId: crypto.randomUUID(),
        collectedAt: Date.now(),
        collectedBy: 'nvd-scanner-v2.1',
        urls: ['https://nvd.nist.gov/vuln/detail/CVE-2024-1234'],
        notes: 'Confirmed through automated NVD scan',
        contents: {
          cveId: 'CVE-2024-1234',
          exploitabilitySubScore: 3.9,
          impactSubScore: 5.9,
          lastModifiedDate: '2024-01-15T10:30:00.000Z'
        },
        checksums: [{
          algorithm: 'sha256',
          signature: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
          timestamp: Date.now(),
          contentId: crypto.randomUUID()
        }]
      }
    }]
  };

  auditableDecision.attachEvidence('exploitation', evidence);

  // 6. Evaluate with full audit
  const outcome = auditableDecision.evaluate();
  console.log(`Decision: ${outcome.action} (Priority: ${outcome.priority})`);

  // 7. Generate forensic report
  const forensicReport = auditableDecision.generateForensicReport();
  console.log(`Forensic Report ID: ${forensicReport.reportId}`);
  console.log(`Total Duration: ${forensicReport.totalDuration}ms`);

  // 8. Export audit trail
  const timeline = auditableDecision.getTimeline();
  console.log(`Timeline entries: ${timeline.length}`);

  const auditEntry = auditableDecision.getAuditEntry();
  console.log(`Audit checksum: ${auditEntry.checksum}`);

  return {
    outcome,
    forensicReport,
    timeline,
    auditEntry
  };
}

// Run the complete workflow
completeEvidenceWorkflow()
  .then(result => {
    console.log('Evidence mapping and audit trail complete!');
    console.log('Final decision:', result.outcome);
  })
  .catch(error => {
    console.error('Workflow failed:', error);
  });
```

## API Reference

### Core Classes

#### AuditableDecisionWrapper
```typescript
class AuditableDecisionWrapper implements AuditableDecision {
  evaluationId: string;
  evaluate(): SSVCOutcome;
  attachEvidence(decisionPoint: string, evidence: DecisionPointEvidence): void;
  mapDataSource(decisionPoint: string, dataSource: DataSource): void;
  getAuditEntry(): AuditEntry;
  generateForensicReport(): ForensicReport;
  getEvidence(): Record<string, DecisionPointEvidence>;
  getDataSources(): Record<string, DataSource>;
  getTimeline(): TimelineEntry[];
  getWrappedDecision(): SSVCDecision;
}
```

#### AuditableDecisionFactory
```typescript
class AuditableDecisionFactory {
  static wrapDecision(
    decision: SSVCDecision, 
    methodology: string, 
    version: string
  ): AuditableDecision;
}
```

#### TransformEngine
```typescript
class TransformEngine {
  transform(
    value: any,
    rules: TransformRule[],
    sourceId: string, 
    mappingId: string
  ): { value: string; applied: TransformRule | null };
  
  validate(value: string, validValues: string[]): boolean;
  
  getApplicableRules(
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): TransformRule[];
}
```

#### DataSourceFactory
```typescript
class DataSourceFactory {
  static sql(
    sourceId: string, 
    name: string, 
    priority: number, 
    config: SQLConfig,
    description: string,
    mimeTypes: string[]
  ): DataSource;
  
  static document(
    sourceId: string, 
    name: string, 
    priority: number, 
    config: DocumentConfig,
    description: string,
    mimeTypes: string[]
  ): DataSource;
  
  static api(
    sourceId: string, 
    name: string, 
    priority: number, 
    config: APIConfig,
    description: string,
    mimeTypes: string[]
  ): DataSource;
  
  static file(
    sourceId: string, 
    name: string, 
    priority: number, 
    config: FileConfig,
    description: string,
    mimeTypes: string[]
  ): DataSource;
  
  static manual(
    sourceId: string, 
    name: string, 
    priority: number,
    description: string,
    mimeTypes: string[]
  ): DataSource;
}
```

### Helper Functions

#### createDecision
```typescript
function createDecision(
  methodology: string, 
  options: Record<string, any>
): Decision;
```

#### CommonTransforms
```typescript
class CommonTransforms {
  static booleanToYesNo(): TransformRule[];
  static severityLevels(): TransformRule[];
  static cvssToImpact(): TransformRule[];
  static confidenceToReliability(): TransformRule[];
}
```

For complete type definitions, see the TypeScript files in the `src/` directory.