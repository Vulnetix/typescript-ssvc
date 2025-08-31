# Evidence Mapping & Audit Trail System - README Section

This file contains documentation that should be added to the main README.md to describe the evidence mapping and audit trail features.

## Evidence Mapping & Audit Trail System

The SSVC TypeScript library includes a comprehensive evidence mapping and audit trail system designed for forensic-grade vulnerability decision tracking. This system provides complete chain of custody documentation suitable for regulatory compliance and forensic investigation.

### Key Features

- **🔐 Cryptographic Integrity**: 15+ hash algorithms for evidence verification
- **📋 Multiple Verification Methods**: Automated, manual, and hybrid verification support
- **🗃️ Data Source Abstraction**: Priority-based resolution from SQL, API, file, and manual sources
- **🔄 Transform Rules Engine**: Map raw data to methodology values with source/mapping restrictions
- **📊 Complete Audit Trails**: Timeline tracking with forensic reporting
- **🌐 Browser Compatible**: Uses `crypto.randomUUID()` for universal support
- **📝 Export Capabilities**: JSON and custom format support

### Quick Start

```typescript
import { 
  createDecision, 
  AuditableDecisionFactory 
} from 'ssvc';

// Create auditable decision with full tracking
const decision = createDecision('cisa', {
  exploitation: 'active',
  automatable: 'yes',
  technical_impact: 'total',
  mission_wellbeing: 'high'
});

const auditableDecision = AuditableDecisionFactory.wrapDecision(
  decision, 
  'cisa', 
  '1.0'
);

// Attach evidence with cryptographic integrity
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
      checksums: [{
        algorithm: 'sha256',
        signature: 'abc123...',
        timestamp: Date.now(),
        contentId: crypto.randomUUID()
      }]
    }
  }]
};

auditableDecision.attachEvidence('exploitation', evidence);

// Evaluate with complete audit trail
const outcome = auditableDecision.evaluate();
const forensicReport = auditableDecision.generateForensicReport();

console.log(`Decision: ${outcome.action}`);
console.log(`Report ID: ${forensicReport.reportId}`);
```

### Evidence Collection

Evidence records include comprehensive metadata for forensic analysis:

- **Unique Identifiers**: Browser-compatible UUIDs for all entities
- **Timestamps**: Precise collection and verification times
- **Source Attribution**: Complete provenance tracking
- **Cryptographic Hashes**: Multiple algorithms (SHA-256, SHA-512, Blake2b, etc.)
- **Content Preservation**: Raw data storage with integrity verification
- **Chain of Custody**: Complete audit trail from collection to decision

### Data Source Integration

Configure priority-based data source resolution:

```typescript
import { DataSourceFactory, MethodologyConfigBuilder } from 'ssvc';

const config = new MethodologyConfigBuilder('cisa', '1.0')
  .decisionPoint('exploitation')
  .dataSource(
    DataSourceFactory.api(
      'nvd-api',
      'NVD Database',
      1, // Highest priority
      {
        endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
        method: 'GET'
      },
      'Official NIST vulnerability database',
      ['application/json']
    )
  )
  .dataSource(
    DataSourceFactory.manual(
      'analyst-input',
      'Security Analyst Assessment',
      2, // Lower priority
      'Manual security analysis',
      ['text/plain']
    )
  )
  .build();
```

**Supported Data Source Types:**
- **SQL**: Database queries with table/column mapping
- **Document**: NoSQL/MongoDB with JSONPath extraction  
- **API**: HTTP endpoints with authentication
- **File**: Local file system with MIME type handling
- **Manual**: Human-provided input with validation

### Transform Rules

Map raw data to methodology values with flexible rules:

```typescript
import { TransformEngine, CommonTransforms } from 'ssvc';

const engine = new TransformEngine();

// Custom transform rules
const rules = [
  {
    sourceValue: /^(active|exploitation|exploited)$/i,
    targetValue: 'ACTIVE',
    applicableToSources: ['nvd-api'],
    applicableToMappings: ['exploitation']
  }
];

const result = engine.transform(
  'exploited', 
  rules, 
  'nvd-api', 
  'exploitation'
);
// result.value === 'ACTIVE'

// Use common patterns
const booleanRules = CommonTransforms.booleanToYesNo();
const severity = CommonTransforms.severityLevels();
const cvssRules = CommonTransforms.cvssToImpact();
```

### Forensic Reporting

Generate comprehensive forensic reports for compliance:

```typescript
const forensicReport = auditableDecision.generateForensicReport();

// Report includes:
// - Complete decision timeline
// - All evidence with checksums
// - Data source resolution paths
// - Transform rule applications
// - Audit trail with integrity verification
// - Export capabilities (JSON, custom)

console.log(`Report ID: ${forensicReport.reportId}`);
console.log(`Evidence Count: ${Object.keys(forensicReport.evidence).length}`);
console.log(`Timeline Entries: ${forensicReport.decisionPath.length}`);
```

### Examples

The `/examples` directory contains comprehensive demonstrations:

- **`evidence-mapping-demo.ts`**: Complete system demonstration
- **`quick-evidence-example.ts`**: Minimal usage example
- **`transform-rules-example.ts`**: Transform engine showcase
- **`verification-example.js`**: End-to-end verification

Run examples with:
```bash
npx ts-node examples/evidence-mapping-demo.ts
npx ts-node examples/quick-evidence-example.ts
npx ts-node examples/transform-rules-example.ts
node verification-example.js
```

### Documentation

- **[Evidence Mapping Guide](docs/evidence-mapping.md)**: Complete system documentation
- **[API Reference](docs/evidence-mapping.md#api-reference)**: Detailed API documentation
- **[Browser Compatibility](docs/evidence-mapping.md#browser-compatibility)**: Cross-platform usage

### Use Cases

This system is designed for:

- **Regulatory Compliance**: SOX, GDPR, HIPAA audit requirements
- **Forensic Investigation**: Complete chain of custody documentation
- **Risk Management**: Evidence-based decision justification
- **Quality Assurance**: Verification of decision processes
- **Automation Integration**: API-driven vulnerability management
- **Incident Response**: Forensic-grade decision documentation

### Browser Compatibility

The system uses modern web standards for universal compatibility:

- **UUID Generation**: `crypto.randomUUID()` (no external dependencies)
- **Hash Calculations**: Web Crypto API with Node.js fallbacks
- **JSON Export**: Standard serialization for all platforms
- **Memory Efficient**: Streaming processing for large datasets

### Security Features

- **Cryptographic Integrity**: Multiple hash algorithms prevent tampering
- **Immutable Audit Trail**: Timeline entries cannot be modified
- **Source Verification**: Complete provenance tracking
- **Access Logging**: All operations recorded with timestamps
- **Export Security**: Checksums included in all exports

This evidence mapping system transforms SSVC from a decision framework into a complete forensic documentation platform suitable for enterprise and regulatory environments.