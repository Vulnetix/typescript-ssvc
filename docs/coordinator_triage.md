---
generated: true
source: methodologies/coordinator_triage.yaml
generator: scripts/generate-plugins.ts
lastGenerated: 2025-08-31T12:19:08.754Z
generatedFiles:
  typescript:
    path: /home/chris/github/typescript-ssvc/src/plugins/coordinator_triage-generated.ts
    checksum: 4e34c94a073e1f206b9e8fe919afc40a0b2016f1
---

# Coordinator Triage

CERT/CC Coordinator Triage Decision Model

**Version:** 1.0
**URL:** https://certcc.github.io/SSVC/howto/coordination_triage_decision/

## Decision Tree

```mermaid
flowchart LR
  0{ReportPublicStatus}
  1{SupplierContactedStatus}
  2{ReportCredibilityLevel}
  3{SupplierCardinalityLevel}
  4{UtilityLevel}
  5{PublicSafetyImpactLevel}
  6[COORDINATE]
  7[TRACK]
  8{PublicSafetyImpactLevel}
  9[TRACK]
  10[DECLINE]
  11{PublicSafetyImpactLevel}
  12[DECLINE]
  13[DECLINE]
  14{UtilityLevel}
  15{PublicSafetyImpactLevel}
  16[TRACK]
  17[DECLINE]
  18{PublicSafetyImpactLevel}
  19[DECLINE]
  20[DECLINE]
  21{PublicSafetyImpactLevel}
  22[DECLINE]
  23[DECLINE]
  24{SupplierCardinalityLevel}
  25{UtilityLevel}
  26{PublicSafetyImpactLevel}
  27[DECLINE]
  28[DECLINE]
  29{PublicSafetyImpactLevel}
  30[DECLINE]
  31[DECLINE]
  32{PublicSafetyImpactLevel}
  33[DECLINE]
  34[DECLINE]
  35{UtilityLevel}
  36{PublicSafetyImpactLevel}
  37[DECLINE]
  38[DECLINE]
  39{PublicSafetyImpactLevel}
  40[DECLINE]
  41[DECLINE]
  42{PublicSafetyImpactLevel}
  43[DECLINE]
  44[DECLINE]
  45{ReportCredibilityLevel}
  46{SupplierCardinalityLevel}
  47{UtilityLevel}
  48{PublicSafetyImpactLevel}
  49[COORDINATE]
  50[TRACK]
  51{PublicSafetyImpactLevel}
  52[DECLINE]
  53[DECLINE]
  54{PublicSafetyImpactLevel}
  55[DECLINE]
  56[DECLINE]
  57{UtilityLevel}
  58{PublicSafetyImpactLevel}
  59[DECLINE]
  60[DECLINE]
  61{PublicSafetyImpactLevel}
  62[DECLINE]
  63[DECLINE]
  64{PublicSafetyImpactLevel}
  65[DECLINE]
  66[DECLINE]
  67{SupplierCardinalityLevel}
  68{UtilityLevel}
  69{PublicSafetyImpactLevel}
  70[DECLINE]
  71[DECLINE]
  72{PublicSafetyImpactLevel}
  73[DECLINE]
  74[DECLINE]
  75{PublicSafetyImpactLevel}
  76[DECLINE]
  77[DECLINE]
  78{UtilityLevel}
  79{PublicSafetyImpactLevel}
  80[DECLINE]
  81[DECLINE]
  82{PublicSafetyImpactLevel}
  83[DECLINE]
  84[DECLINE]
  85{PublicSafetyImpactLevel}
  86[DECLINE]
  87[DECLINE]
  88{SupplierContactedStatus}
  89{ReportCredibilityLevel}
  90{SupplierCardinalityLevel}
  91{UtilityLevel}
  92{PublicSafetyImpactLevel}
  93[COORDINATE]
  94[TRACK]
  95{PublicSafetyImpactLevel}
  96[TRACK]
  97[TRACK]
  98{PublicSafetyImpactLevel}
  99[COORDINATE]
  100[COORDINATE]
  101{UtilityLevel}
  102{PublicSafetyImpactLevel}
  103[TRACK]
  104[TRACK]
  105{PublicSafetyImpactLevel}
  106[TRACK]
  107[DECLINE]
  108{PublicSafetyImpactLevel}
  109[COORDINATE]
  110[DECLINE]
  111{SupplierCardinalityLevel}
  112{UtilityLevel}
  113{PublicSafetyImpactLevel}
  114[COORDINATE]
  115[DECLINE]
  116{PublicSafetyImpactLevel}
  117[DECLINE]
  118[DECLINE]
  119{PublicSafetyImpactLevel}
  120[DECLINE]
  121[DECLINE]
  122{UtilityLevel}
  123{PublicSafetyImpactLevel}
  124[DECLINE]
  125[DECLINE]
  126{PublicSafetyImpactLevel}
  127[DECLINE]
  128[DECLINE]
  129{PublicSafetyImpactLevel}
  130[DECLINE]
  131[DECLINE]
  132{ReportCredibilityLevel}
  133{SupplierCardinalityLevel}
  134{UtilityLevel}
  135{PublicSafetyImpactLevel}
  136[COORDINATE]
  137[TRACK]
  138{PublicSafetyImpactLevel}
  139[DECLINE]
  140[DECLINE]
  141{PublicSafetyImpactLevel}
  142[DECLINE]
  143[DECLINE]
  144{UtilityLevel}
  145{PublicSafetyImpactLevel}
  146[DECLINE]
  147[DECLINE]
  148{PublicSafetyImpactLevel}
  149[DECLINE]
  150[DECLINE]
  151{PublicSafetyImpactLevel}
  152[DECLINE]
  153[DECLINE]
  154{SupplierCardinalityLevel}
  155{UtilityLevel}
  156{PublicSafetyImpactLevel}
  157[DECLINE]
  158[DECLINE]
  159{PublicSafetyImpactLevel}
  160[DECLINE]
  161[DECLINE]
  162{PublicSafetyImpactLevel}
  163[DECLINE]
  164[DECLINE]
  165{UtilityLevel}
  166{PublicSafetyImpactLevel}
  167[DECLINE]
  168[DECLINE]
  169{PublicSafetyImpactLevel}
  170[DECLINE]
  171[DECLINE]
  172{PublicSafetyImpactLevel}
  173[DECLINE]
  174[DECLINE]
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
  11 -->|SIGNIFICANT| 12
  11 -->|MINIMAL| 13
  3 -->|ONE| 14
  14 -->|SUPER_EFFECTIVE| 15
  15 -->|SIGNIFICANT| 16
  15 -->|MINIMAL| 17
  14 -->|EFFICIENT| 18
  18 -->|SIGNIFICANT| 19
  18 -->|MINIMAL| 20
  14 -->|LABORIOUS| 21
  21 -->|SIGNIFICANT| 22
  21 -->|MINIMAL| 23
  2 -->|NOT_CREDIBLE| 24
  24 -->|MULTIPLE| 25
  25 -->|SUPER_EFFECTIVE| 26
  26 -->|SIGNIFICANT| 27
  26 -->|MINIMAL| 28
  25 -->|EFFICIENT| 29
  29 -->|SIGNIFICANT| 30
  29 -->|MINIMAL| 31
  25 -->|LABORIOUS| 32
  32 -->|SIGNIFICANT| 33
  32 -->|MINIMAL| 34
  24 -->|ONE| 35
  35 -->|SUPER_EFFECTIVE| 36
  36 -->|SIGNIFICANT| 37
  36 -->|MINIMAL| 38
  35 -->|EFFICIENT| 39
  39 -->|SIGNIFICANT| 40
  39 -->|MINIMAL| 41
  35 -->|LABORIOUS| 42
  42 -->|SIGNIFICANT| 43
  42 -->|MINIMAL| 44
  1 -->|NO| 45
  45 -->|CREDIBLE| 46
  46 -->|MULTIPLE| 47
  47 -->|SUPER_EFFECTIVE| 48
  48 -->|SIGNIFICANT| 49
  48 -->|MINIMAL| 50
  47 -->|EFFICIENT| 51
  51 -->|SIGNIFICANT| 52
  51 -->|MINIMAL| 53
  47 -->|LABORIOUS| 54
  54 -->|SIGNIFICANT| 55
  54 -->|MINIMAL| 56
  46 -->|ONE| 57
  57 -->|SUPER_EFFECTIVE| 58
  58 -->|SIGNIFICANT| 59
  58 -->|MINIMAL| 60
  57 -->|EFFICIENT| 61
  61 -->|SIGNIFICANT| 62
  61 -->|MINIMAL| 63
  57 -->|LABORIOUS| 64
  64 -->|SIGNIFICANT| 65
  64 -->|MINIMAL| 66
  45 -->|NOT_CREDIBLE| 67
  67 -->|MULTIPLE| 68
  68 -->|SUPER_EFFECTIVE| 69
  69 -->|SIGNIFICANT| 70
  69 -->|MINIMAL| 71
  68 -->|EFFICIENT| 72
  72 -->|SIGNIFICANT| 73
  72 -->|MINIMAL| 74
  68 -->|LABORIOUS| 75
  75 -->|SIGNIFICANT| 76
  75 -->|MINIMAL| 77
  67 -->|ONE| 78
  78 -->|SUPER_EFFECTIVE| 79
  79 -->|SIGNIFICANT| 80
  79 -->|MINIMAL| 81
  78 -->|EFFICIENT| 82
  82 -->|SIGNIFICANT| 83
  82 -->|MINIMAL| 84
  78 -->|LABORIOUS| 85
  85 -->|SIGNIFICANT| 86
  85 -->|MINIMAL| 87
  0 -->|NO| 88
  88 -->|YES| 89
  89 -->|CREDIBLE| 90
  90 -->|MULTIPLE| 91
  91 -->|SUPER_EFFECTIVE| 92
  92 -->|SIGNIFICANT| 93
  92 -->|MINIMAL| 94
  91 -->|EFFICIENT| 95
  95 -->|SIGNIFICANT| 96
  95 -->|MINIMAL| 97
  91 -->|LABORIOUS| 98
  98 -->|SIGNIFICANT| 99
  98 -->|MINIMAL| 100
  90 -->|ONE| 101
  101 -->|SUPER_EFFECTIVE| 102
  102 -->|SIGNIFICANT| 103
  102 -->|MINIMAL| 104
  101 -->|EFFICIENT| 105
  105 -->|SIGNIFICANT| 106
  105 -->|MINIMAL| 107
  101 -->|LABORIOUS| 108
  108 -->|SIGNIFICANT| 109
  108 -->|MINIMAL| 110
  89 -->|NOT_CREDIBLE| 111
  111 -->|MULTIPLE| 112
  112 -->|SUPER_EFFECTIVE| 113
  113 -->|SIGNIFICANT| 114
  113 -->|MINIMAL| 115
  112 -->|EFFICIENT| 116
  116 -->|SIGNIFICANT| 117
  116 -->|MINIMAL| 118
  112 -->|LABORIOUS| 119
  119 -->|SIGNIFICANT| 120
  119 -->|MINIMAL| 121
  111 -->|ONE| 122
  122 -->|SUPER_EFFECTIVE| 123
  123 -->|SIGNIFICANT| 124
  123 -->|MINIMAL| 125
  122 -->|EFFICIENT| 126
  126 -->|SIGNIFICANT| 127
  126 -->|MINIMAL| 128
  122 -->|LABORIOUS| 129
  129 -->|SIGNIFICANT| 130
  129 -->|MINIMAL| 131
  88 -->|NO| 132
  132 -->|CREDIBLE| 133
  133 -->|MULTIPLE| 134
  134 -->|SUPER_EFFECTIVE| 135
  135 -->|SIGNIFICANT| 136
  135 -->|MINIMAL| 137
  134 -->|EFFICIENT| 138
  138 -->|SIGNIFICANT| 139
  138 -->|MINIMAL| 140
  134 -->|LABORIOUS| 141
  141 -->|SIGNIFICANT| 142
  141 -->|MINIMAL| 143
  133 -->|ONE| 144
  144 -->|SUPER_EFFECTIVE| 145
  145 -->|SIGNIFICANT| 146
  145 -->|MINIMAL| 147
  144 -->|EFFICIENT| 148
  148 -->|SIGNIFICANT| 149
  148 -->|MINIMAL| 150
  144 -->|LABORIOUS| 151
  151 -->|SIGNIFICANT| 152
  151 -->|MINIMAL| 153
  132 -->|NOT_CREDIBLE| 154
  154 -->|MULTIPLE| 155
  155 -->|SUPER_EFFECTIVE| 156
  156 -->|SIGNIFICANT| 157
  156 -->|MINIMAL| 158
  155 -->|EFFICIENT| 159
  159 -->|SIGNIFICANT| 160
  159 -->|MINIMAL| 161
  155 -->|LABORIOUS| 162
  162 -->|SIGNIFICANT| 163
  162 -->|MINIMAL| 164
  154 -->|ONE| 165
  165 -->|SUPER_EFFECTIVE| 166
  166 -->|SIGNIFICANT| 167
  166 -->|MINIMAL| 168
  165 -->|EFFICIENT| 169
  169 -->|SIGNIFICANT| 170
  169 -->|MINIMAL| 171
  165 -->|LABORIOUS| 172
  172 -->|SIGNIFICANT| 173
  172 -->|MINIMAL| 174
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

### UtilityLevel

- LABORIOUS
- EFFICIENT
- SUPER_EFFECTIVE

### PublicSafetyImpactLevel

- MINIMAL
- SIGNIFICANT

## Priority Mapping

- **DECLINE** → LOW
- **TRACK** → MEDIUM
- **COORDINATE** → HIGH

## Usage

```typescript
import { DecisionCoordinatorTriage } from "./plugins/coordinator_triage";

const decision = new DecisionCoordinatorTriage({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```

## Vector String Support

This methodology supports SSVC vector strings for compact representation and interchange.

### Parameter Abbreviations

| Parameter            | Abbreviation | Value Mappings                              |
| -------------------- | ------------ | ------------------------------------------- |
| report_public        | RP           | YES→Y, NO→N                                 |
| supplier_contacted   | SC           | YES→Y, NO→N                                 |
| report_credibility   | RC           | CREDIBLE→C, NOT_CREDIBLE→N                  |
| supplier_cardinality | CA           | ONE→O, MULTIPLE→M                           |
| utility              | U            | LABORIOUS→L, EFFICIENT→E, SUPER_EFFECTIVE→S |
| public_safety        | PS           | MINIMAL→M, SIGNIFICANT→S                    |

### Vector String Format

```
COORD_TRIAGEv1/[parameters]/[timestamp]/
```

### Example Usage

```typescript
// Generate vector string from decision
const decision = new DecisionCoordinatorTriage({
  report_public: "YES",
  supplier_contacted: "YES",
  report_credibility: "CREDIBLE",
  supplier_cardinality: "ONE",
  utility: "LABORIOUS",
  public_safety: "MINIMAL",
});

const vectorString = decision.toVector();
console.log(vectorString);
// Output: COORD_TRIAGEv1/RP:Y/SC:Y/RC:C/CA:O/U:L/PS:M/2024-07-23T20:34:21.000Z/

// Parse vector string to create decision
const parsedDecision = DecisionCoordinatorTriage.fromVector(
  "COORD_TRIAGEv1/RP:Y/SC:Y/RC:C/CA:O/U:L/PS:M/2024-07-23T20:34:21.000Z/",
);
const outcome = parsedDecision.evaluate();
```

## File Integrity Verification

The generated files in this methodology have SHA1 checksums for verification:

### Checksum Verification Commands

Verify the integrity of generated files using these commands:

```bash
# Verify TypeScript plugin file
echo "4e34c94a073e1f206b9e8fe919afc40a0b2016f1  /home/chris/github/typescript-ssvc/src/plugins/coordinator_triage-generated.ts" | sha1sum -c
```

**Why This Matters**: Checksum verification ensures that generated files haven't been tampered with or corrupted. This is important for:

- **Security**: Detecting unauthorized modifications to generated code
- **Integrity**: Ensuring files match their expected content exactly
- **Trust**: Providing cryptographic proof that files are authentic
- **Debugging**: Confirming file corruption isn't causing unexpected behavior

Always verify checksums before deploying or using generated files in production environments.
