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
  5{TechnicalImpactLevel}
  6{MissionWellbeingImpactLevel}
  7[TRACK_STAR]
  7 --> 7_end((End))
  8{AutomatableStatus}
  9{TechnicalImpactLevel}
  10{MissionWellbeingImpactLevel}
  11[TRACK_STAR]
  11 --> 11_end((End))
  12[ATTEND]
  12 --> 12_end((End))
  13{MissionWellbeingImpactLevel}
  14[ATTEND]
  14 --> 14_end((End))
  15{TechnicalImpactLevel}
  16{MissionWellbeingImpactLevel}
  17[TRACK_STAR]
  17 --> 17_end((End))
  18{MissionWellbeingImpactLevel}
  19[TRACK_STAR]
  19 --> 19_end((End))
  20[ATTEND]
  20 --> 20_end((End))
  21{AutomatableStatus}
  22{TechnicalImpactLevel}
  23{MissionWellbeingImpactLevel}
  24[ATTEND]
  24 --> 24_end((End))
  25[ATTEND]
  25 --> 25_end((End))
  26[ACT]
  26 --> 26_end((End))
  27{MissionWellbeingImpactLevel}
  28[ATTEND]
  28 --> 28_end((End))
  29[ACT]
  29 --> 29_end((End))
  30[ACT]
  30 --> 30_end((End))
  31{TechnicalImpactLevel}
  32{MissionWellbeingImpactLevel}
  33[ATTEND]
  33 --> 33_end((End))
  34{MissionWellbeingImpactLevel}
  35[ATTEND]
  35 --> 35_end((End))
  36[ACT]
  36 --> 36_end((End))
  0 -->|NONE| 1
  1 -->|YES| 2
  2 -->|TOTAL| 3
  3 -->|HIGH| 4
  1 -->|NO| 5
  5 -->|TOTAL| 6
  6 -->|HIGH| 7
  0 -->|POC| 8
  8 -->|YES| 9
  9 -->|TOTAL| 10
  10 -->|MEDIUM| 11
  10 -->|HIGH| 12
  9 -->|PARTIAL| 13
  13 -->|HIGH| 14
  8 -->|NO| 15
  15 -->|PARTIAL| 16
  16 -->|HIGH| 17
  15 -->|TOTAL| 18
  18 -->|MEDIUM| 19
  18 -->|HIGH| 20
  0 -->|ACTIVE| 21
  21 -->|YES| 22
  22 -->|PARTIAL| 23
  23 -->|LOW| 24
  23 -->|MEDIUM| 25
  23 -->|HIGH| 26
  22 -->|TOTAL| 27
  27 -->|LOW| 28
  27 -->|MEDIUM| 29
  27 -->|HIGH| 30
  21 -->|NO| 31
  31 -->|PARTIAL| 32
  32 -->|HIGH| 33
  31 -->|TOTAL| 34
  34 -->|MEDIUM| 35
  34 -->|HIGH| 36
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

### DecisionPriorityLevel
- LOW
- MEDIUM
- HIGH
- IMMEDIATE

### ActionType
- TRACK
- TRACK_STAR
- ATTEND
- ACT

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
