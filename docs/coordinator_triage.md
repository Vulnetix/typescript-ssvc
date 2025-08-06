# Coordinator Triage

CERT/CC Coordinator Triage Decision Model

**Version:** 1.0
**URL:** https://certcc.github.io/SSVC/howto/coordination_triage_decision/

## Decision Tree

```mermaid
flowchart TD
  0{ReportPublicStatus}
  1{SupplierContactedStatus}
  2{ReportCredibilityLevel}
  3{SupplierCardinalityLevel}
  4{UtilityLevel}
  5{PublicSafetyImpactLevel}
  6[COORDINATE]
  6 --> 6_end((End))
  7[TRACK]
  7 --> 7_end((End))
  8{PublicSafetyImpactLevel}
  9[TRACK]
  9 --> 9_end((End))
  10[DECLINE]
  10 --> 10_end((End))
  11[DECLINE]
  11 --> 11_end((End))
  12{UtilityLevel}
  13{PublicSafetyImpactLevel}
  14[TRACK]
  14 --> 14_end((End))
  15[DECLINE]
  15 --> 15_end((End))
  16[DECLINE]
  16 --> 16_end((End))
  17[DECLINE]
  17 --> 17_end((End))
  18[DECLINE]
  18 --> 18_end((End))
  19{SupplierCardinalityLevel}
  20{UtilityLevel}
  21{PublicSafetyImpactLevel}
  22[COORDINATE]
  22 --> 22_end((End))
  23[TRACK]
  23 --> 23_end((End))
  24[DECLINE]
  24 --> 24_end((End))
  25[DECLINE]
  25 --> 25_end((End))
  26[DECLINE]
  26 --> 26_end((End))
  27{SupplierContactedStatus}
  28{ReportCredibilityLevel}
  29{SupplierCardinalityLevel}
  30{SupplierEngagementLevel}
  31{UtilityLevel}
  32{PublicSafetyImpactLevel}
  33[COORDINATE]
  33 --> 33_end((End))
  34[TRACK]
  34 --> 34_end((End))
  35{PublicSafetyImpactLevel}
  36[TRACK]
  36 --> 36_end((End))
  37[TRACK]
  37 --> 37_end((End))
  38[TRACK]
  38 --> 38_end((End))
  39{UtilityLevel}
  40{PublicSafetyImpactLevel}
  41[COORDINATE]
  41 --> 41_end((End))
  42[TRACK]
  42 --> 42_end((End))
  43[TRACK]
  43 --> 43_end((End))
  44[DECLINE]
  44 --> 44_end((End))
  45{SupplierEngagementLevel}
  46{UtilityLevel}
  47{PublicSafetyImpactLevel}
  48[TRACK]
  48 --> 48_end((End))
  49[TRACK]
  49 --> 49_end((End))
  50[TRACK]
  50 --> 50_end((End))
  51[DECLINE]
  51 --> 51_end((End))
  52[DECLINE]
  52 --> 52_end((End))
  53[DECLINE]
  53 --> 53_end((End))
  54{SupplierCardinalityLevel}
  55{UtilityLevel}
  56{PublicSafetyImpactLevel}
  57[COORDINATE]
  57 --> 57_end((End))
  58[TRACK]
  58 --> 58_end((End))
  59[DECLINE]
  59 --> 59_end((End))
  60[DECLINE]
  60 --> 60_end((End))
  61[DECLINE]
  61 --> 61_end((End))
  0 -->|YES| 1
  1 -->|YES| 2
  2 -->|CREDIBLE| 3
  3 -->|MULTIPLE| 4
  4 -->|SUPER_EFFECTIVE| 5
  5 -->|SIGNIFICANT| 6
  5 -->|MINIMAL| 7
  4 -->|EFFICIENT| 8
  8 -->|SIGNIFICANT| 9
  8 -->|MINIMAL| 10
  4 -->|LABORIOUS| 11
  3 -->|ONE| 12
  12 -->|SUPER_EFFECTIVE| 13
  13 -->|SIGNIFICANT| 14
  13 -->|MINIMAL| 15
  12 -->|EFFICIENT| 16
  12 -->|LABORIOUS| 17
  2 -->|NOT_CREDIBLE| 18
  1 -->|NO| 19
  19 -->|MULTIPLE| 20
  20 -->|SUPER_EFFECTIVE| 21
  21 -->|SIGNIFICANT| 22
  21 -->|MINIMAL| 23
  20 -->|EFFICIENT| 24
  20 -->|LABORIOUS| 25
  19 -->|ONE| 26
  0 -->|NO| 27
  27 -->|YES| 28
  28 -->|CREDIBLE| 29
  29 -->|MULTIPLE| 30
  30 -->|ACTIVE| 31
  31 -->|SUPER_EFFECTIVE| 32
  32 -->|SIGNIFICANT| 33
  32 -->|MINIMAL| 34
  31 -->|EFFICIENT| 35
  35 -->|SIGNIFICANT| 36
  35 -->|MINIMAL| 37
  31 -->|LABORIOUS| 38
  30 -->|UNRESPONSIVE| 39
  39 -->|SUPER_EFFECTIVE| 40
  40 -->|SIGNIFICANT| 41
  40 -->|MINIMAL| 42
  39 -->|EFFICIENT| 43
  39 -->|LABORIOUS| 44
  29 -->|ONE| 45
  45 -->|ACTIVE| 46
  46 -->|SUPER_EFFECTIVE| 47
  47 -->|SIGNIFICANT| 48
  47 -->|MINIMAL| 49
  46 -->|EFFICIENT| 50
  46 -->|LABORIOUS| 51
  45 -->|UNRESPONSIVE| 52
  28 -->|NOT_CREDIBLE| 53
  27 -->|NO| 54
  54 -->|MULTIPLE| 55
  55 -->|SUPER_EFFECTIVE| 56
  56 -->|SIGNIFICANT| 57
  56 -->|MINIMAL| 58
  55 -->|EFFICIENT| 59
  55 -->|LABORIOUS| 60
  54 -->|ONE| 61
```

## Enums

### ReportPublicStatus
- YES
- NO

### SupplierContactedStatus
- YES
- NO

### ReportCredibilityLevel
- CREDIBLE
- NOT_CREDIBLE

### SupplierCardinalityLevel
- ONE
- MULTIPLE

### SupplierEngagementLevel
- ACTIVE
- UNRESPONSIVE

### UtilityLevel
- LABORIOUS
- EFFICIENT
- SUPER_EFFECTIVE

### PublicSafetyImpactLevel
- MINIMAL
- SIGNIFICANT

### ActionType
- DECLINE
- TRACK
- COORDINATE

### DecisionPriorityLevel
- LOW
- MEDIUM
- HIGH

## Priority Mapping

- **DECLINE** → LOW
- **TRACK** → MEDIUM
- **COORDINATE** → HIGH

## Usage

```typescript
import { DecisionCoordinatorTriage } from './plugins/coordinator_triage';

const decision = new DecisionCoordinatorTriage({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```
