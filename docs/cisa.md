---
generated: true
source: methodologies/cisa.yaml
generator: scripts/generate-plugins.ts
lastGenerated: 2025-08-29T10:52:45.997Z
generatedFiles:
  typescript:
    path: /home/chris/github/typescript-ssvc/src/plugins/cisa-generated.ts
    checksum: 86ddad0d26da8fae95a05e3fab5ac57ecbcfeff7
---
# CISA

CISA Stakeholder-Specific Vulnerability Categorization

**Version:** 1.0
**URL:** https://www.cisa.gov/stakeholder-specific-vulnerability-categorization-ssvc

## Decision Tree

```mermaid
flowchart TD
  0{ExploitationStatus}
  1{AutomatableStatus}
  2{TechnicalImpactLevel}
  3{MissionWellbeingImpactLevel}
  4[ATTEND]
  4 --> 4_end((End))
  5{MissionWellbeingImpactLevel}
  6[ATTEND]
  6 --> 6_end((End))
  7{TechnicalImpactLevel}
  8{MissionWellbeingImpactLevel}
  9[TRACK_STAR]
  9 --> 9_end((End))
  10{MissionWellbeingImpactLevel}
  11[TRACK_STAR]
  11 --> 11_end((End))
  12{AutomatableStatus}
  13{TechnicalImpactLevel}
  14{MissionWellbeingImpactLevel}
  15[TRACK_STAR]
  15 --> 15_end((End))
  16[ATTEND]
  16 --> 16_end((End))
  17{MissionWellbeingImpactLevel}
  18[ATTEND]
  18 --> 18_end((End))
  19{TechnicalImpactLevel}
  20{MissionWellbeingImpactLevel}
  21[TRACK_STAR]
  21 --> 21_end((End))
  22{MissionWellbeingImpactLevel}
  23[TRACK_STAR]
  23 --> 23_end((End))
  24[ATTEND]
  24 --> 24_end((End))
  25{AutomatableStatus}
  26{TechnicalImpactLevel}
  27{MissionWellbeingImpactLevel}
  28[ATTEND]
  28 --> 28_end((End))
  29[ATTEND]
  29 --> 29_end((End))
  30[ACT]
  30 --> 30_end((End))
  31{MissionWellbeingImpactLevel}
  32[ATTEND]
  32 --> 32_end((End))
  33[ACT]
  33 --> 33_end((End))
  34[ACT]
  34 --> 34_end((End))
  35{TechnicalImpactLevel}
  36{MissionWellbeingImpactLevel}
  37[ATTEND]
  37 --> 37_end((End))
  38{MissionWellbeingImpactLevel}
  39[ATTEND]
  39 --> 39_end((End))
  40[ACT]
  40 --> 40_end((End))
  0 -->|NONE| 1
  1 -->|YES| 2
  2 -->|PARTIAL| 3
  3 -->|HIGH| 4
  2 -->|TOTAL| 5
  5 -->|HIGH| 6
  1 -->|NO| 7
  7 -->|PARTIAL| 8
  8 -->|HIGH| 9
  7 -->|TOTAL| 10
  10 -->|HIGH| 11
  0 -->|POC| 12
  12 -->|YES| 13
  13 -->|TOTAL| 14
  14 -->|MEDIUM| 15
  14 -->|HIGH| 16
  13 -->|PARTIAL| 17
  17 -->|HIGH| 18
  12 -->|NO| 19
  19 -->|PARTIAL| 20
  20 -->|HIGH| 21
  19 -->|TOTAL| 22
  22 -->|MEDIUM| 23
  22 -->|HIGH| 24
  0 -->|ACTIVE| 25
  25 -->|YES| 26
  26 -->|PARTIAL| 27
  27 -->|LOW| 28
  27 -->|MEDIUM| 29
  27 -->|HIGH| 30
  26 -->|TOTAL| 31
  31 -->|LOW| 32
  31 -->|MEDIUM| 33
  31 -->|HIGH| 34
  25 -->|NO| 35
  35 -->|PARTIAL| 36
  36 -->|HIGH| 37
  35 -->|TOTAL| 38
  38 -->|MEDIUM| 39
  38 -->|HIGH| 40
```

## Enums

### ExploitationStatus
- NONE
- POC
- ACTIVE

### AutomatableStatus
- YES
- NO

### TechnicalImpactLevel
- PARTIAL
- TOTAL

### MissionWellbeingImpactLevel
- LOW
- MEDIUM
- HIGH

## Priority Mapping

- **TRACK** → LOW
- **TRACK_STAR** → MEDIUM
- **ATTEND** → MEDIUM
- **ACT** → IMMEDIATE

## Usage

```typescript
import { DecisionCisa } from './plugins/cisa';

const decision = new DecisionCisa({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```

## Vector String Support

This methodology supports SSVC vector strings for compact representation and interchange.

### Parameter Abbreviations

| Parameter | Abbreviation | Value Mappings |
|-----------|--------------|----------------|
| exploitation | E | NONE→N, POC→P, ACTIVE→A |
| automatable | A | YES→Y, NO→N |
| technical_impact | T | PARTIAL→P, TOTAL→T |
| mission_wellbeing | M | LOW→L, MEDIUM→M, HIGH→H |

### Vector String Format

```
CISAv1/[parameters]/[timestamp]/
```

### Example Usage

```typescript
// Generate vector string from decision
const decision = new DecisionCisa({
  exploitation: "NONE",
  automatable: "YES",
  technical_impact: "PARTIAL",
  mission_wellbeing: "LOW"
});

const vectorString = decision.toVector();
console.log(vectorString);
// Output: CISAv1/E:N/A:Y/T:P/M:L/2024-07-23T20:34:21.000Z/

// Parse vector string to create decision
const parsedDecision = DecisionCisa.fromVector("CISAv1/E:N/A:Y/T:P/M:L/2024-07-23T20:34:21.000Z/");
const outcome = parsedDecision.evaluate();
```

## File Integrity Verification

The generated files in this methodology have SHA1 checksums for verification:

### Checksum Verification Commands

Verify the integrity of generated files using these commands:

```bash
# Verify TypeScript plugin file
echo "86ddad0d26da8fae95a05e3fab5ac57ecbcfeff7  /home/chris/github/typescript-ssvc/src/plugins/cisa-generated.ts" | sha1sum -c
```

**Why This Matters**: Checksum verification ensures that generated files haven't been tampered with or corrupted. This is important for:
- **Security**: Detecting unauthorized modifications to generated code
- **Integrity**: Ensuring files match their expected content exactly  
- **Trust**: Providing cryptographic proof that files are authentic
- **Debugging**: Confirming file corruption isn't causing unexpected behavior

Always verify checksums before deploying or using generated files in production environments.
