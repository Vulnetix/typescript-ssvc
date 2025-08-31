---
generated: true
source: methodologies/deployer.yaml
generator: scripts/generate-plugins.ts
lastGenerated: 2025-08-31T12:19:10.855Z
generatedFiles:
  typescript:
    path: /home/chris/github/typescript-ssvc/src/plugins/deployer-generated.ts
    checksum: 5a60410e62bd5482031a6003bcadca8ba85c7546
---

# Deployer

CERT/CC Deployer Decision Model

**Version:** 1.0
**URL:** https://certcc.github.io/SSVC/howto/deployer_tree/

## Decision Tree

```mermaid
flowchart LR
  0{ExploitationStatus}
  1{SystemExposureLevel}
  2{UtilityLevel}
  3{HumanImpactLevel}
  4[defer]
  5[defer]
  6[scheduled]
  7[scheduled]
  8{HumanImpactLevel}
  9[defer]
  10[defer]
  11[scheduled]
  12[scheduled]
  13{HumanImpactLevel}
  14[defer]
  15[scheduled]
  16[scheduled]
  17[out_of_cycle]
  18{UtilityLevel}
  19{HumanImpactLevel}
  20[defer]
  21[defer]
  22[scheduled]
  23[scheduled]
  24{HumanImpactLevel}
  25[defer]
  26[scheduled]
  27[scheduled]
  28[out_of_cycle]
  29{HumanImpactLevel}
  30[defer]
  31[scheduled]
  32[out_of_cycle]
  33[out_of_cycle]
  34{UtilityLevel}
  35{HumanImpactLevel}
  36[defer]
  37[scheduled]
  38[scheduled]
  39[out_of_cycle]
  40{HumanImpactLevel}
  41[scheduled]
  42[scheduled]
  43[out_of_cycle]
  44[out_of_cycle]
  45{HumanImpactLevel}
  46[scheduled]
  47[out_of_cycle]
  48[out_of_cycle]
  49[immediate]
  50{SystemExposureLevel}
  51{UtilityLevel}
  52{HumanImpactLevel}
  53[defer]
  54[scheduled]
  55[scheduled]
  56[out_of_cycle]
  57{HumanImpactLevel}
  58[scheduled]
  59[scheduled]
  60[out_of_cycle]
  61[out_of_cycle]
  62{HumanImpactLevel}
  63[scheduled]
  64[out_of_cycle]
  65[out_of_cycle]
  66[immediate]
  67{UtilityLevel}
  68{HumanImpactLevel}
  69[scheduled]
  70[scheduled]
  71[out_of_cycle]
  72[out_of_cycle]
  73{HumanImpactLevel}
  74[scheduled]
  75[out_of_cycle]
  76[out_of_cycle]
  77[immediate]
  78{HumanImpactLevel}
  79[out_of_cycle]
  80[out_of_cycle]
  81[immediate]
  82[immediate]
  83{UtilityLevel}
  84{HumanImpactLevel}
  85[scheduled]
  86[out_of_cycle]
  87[out_of_cycle]
  88[immediate]
  89{HumanImpactLevel}
  90[out_of_cycle]
  91[out_of_cycle]
  92[immediate]
  93[immediate]
  94{HumanImpactLevel}
  95[out_of_cycle]
  96[immediate]
  97[immediate]
  98[immediate]
  99{SystemExposureLevel}
  100{UtilityLevel}
  101{HumanImpactLevel}
  102[scheduled]
  103[scheduled]
  104[out_of_cycle]
  105[immediate]
  106{HumanImpactLevel}
  107[scheduled]
  108[out_of_cycle]
  109[out_of_cycle]
  110[immediate]
  111{HumanImpactLevel}
  112[out_of_cycle]
  113[out_of_cycle]
  114[immediate]
  115[immediate]
  116{UtilityLevel}
  117{HumanImpactLevel}
  118[scheduled]
  119[out_of_cycle]
  120[out_of_cycle]
  121[immediate]
  122{HumanImpactLevel}
  123[out_of_cycle]
  124[out_of_cycle]
  125[immediate]
  126[immediate]
  127{HumanImpactLevel}
  128[out_of_cycle]
  129[immediate]
  130[immediate]
  131[immediate]
  132{UtilityLevel}
  133{HumanImpactLevel}
  134[out_of_cycle]
  135[out_of_cycle]
  136[immediate]
  137[immediate]
  138{HumanImpactLevel}
  139[out_of_cycle]
  140[immediate]
  141[immediate]
  142[immediate]
  143{HumanImpactLevel}
  144[immediate]
  145[immediate]
  146[immediate]
  147[immediate]
  0 -->|none| 1
  1 -->|small| 2
  2 -->|laborious| 3
  3 -->|low| 4
  3 -->|medium| 5
  3 -->|high| 6
  3 -->|very_high| 7
  2 -->|efficient| 8
  8 -->|low| 9
  8 -->|medium| 10
  8 -->|high| 11
  8 -->|very_high| 12
  2 -->|super_effective| 13
  13 -->|low| 14
  13 -->|medium| 15
  13 -->|high| 16
  13 -->|very_high| 17
  1 -->|controlled| 18
  18 -->|laborious| 19
  19 -->|low| 20
  19 -->|medium| 21
  19 -->|high| 22
  19 -->|very_high| 23
  18 -->|efficient| 24
  24 -->|low| 25
  24 -->|medium| 26
  24 -->|high| 27
  24 -->|very_high| 28
  18 -->|super_effective| 29
  29 -->|low| 30
  29 -->|medium| 31
  29 -->|high| 32
  29 -->|very_high| 33
  1 -->|open| 34
  34 -->|laborious| 35
  35 -->|low| 36
  35 -->|medium| 37
  35 -->|high| 38
  35 -->|very_high| 39
  34 -->|efficient| 40
  40 -->|low| 41
  40 -->|medium| 42
  40 -->|high| 43
  40 -->|very_high| 44
  34 -->|super_effective| 45
  45 -->|low| 46
  45 -->|medium| 47
  45 -->|high| 48
  45 -->|very_high| 49
  0 -->|public_poc| 50
  50 -->|small| 51
  51 -->|laborious| 52
  52 -->|low| 53
  52 -->|medium| 54
  52 -->|high| 55
  52 -->|very_high| 56
  51 -->|efficient| 57
  57 -->|low| 58
  57 -->|medium| 59
  57 -->|high| 60
  57 -->|very_high| 61
  51 -->|super_effective| 62
  62 -->|low| 63
  62 -->|medium| 64
  62 -->|high| 65
  62 -->|very_high| 66
  50 -->|controlled| 67
  67 -->|laborious| 68
  68 -->|low| 69
  68 -->|medium| 70
  68 -->|high| 71
  68 -->|very_high| 72
  67 -->|efficient| 73
  73 -->|low| 74
  73 -->|medium| 75
  73 -->|high| 76
  73 -->|very_high| 77
  67 -->|super_effective| 78
  78 -->|low| 79
  78 -->|medium| 80
  78 -->|high| 81
  78 -->|very_high| 82
  50 -->|open| 83
  83 -->|laborious| 84
  84 -->|low| 85
  84 -->|medium| 86
  84 -->|high| 87
  84 -->|very_high| 88
  83 -->|efficient| 89
  89 -->|low| 90
  89 -->|medium| 91
  89 -->|high| 92
  89 -->|very_high| 93
  83 -->|super_effective| 94
  94 -->|low| 95
  94 -->|medium| 96
  94 -->|high| 97
  94 -->|very_high| 98
  0 -->|active| 99
  99 -->|small| 100
  100 -->|laborious| 101
  101 -->|low| 102
  101 -->|medium| 103
  101 -->|high| 104
  101 -->|very_high| 105
  100 -->|efficient| 106
  106 -->|low| 107
  106 -->|medium| 108
  106 -->|high| 109
  106 -->|very_high| 110
  100 -->|super_effective| 111
  111 -->|low| 112
  111 -->|medium| 113
  111 -->|high| 114
  111 -->|very_high| 115
  99 -->|controlled| 116
  116 -->|laborious| 117
  117 -->|low| 118
  117 -->|medium| 119
  117 -->|high| 120
  117 -->|very_high| 121
  116 -->|efficient| 122
  122 -->|low| 123
  122 -->|medium| 124
  122 -->|high| 125
  122 -->|very_high| 126
  116 -->|super_effective| 127
  127 -->|low| 128
  127 -->|medium| 129
  127 -->|high| 130
  127 -->|very_high| 131
  99 -->|open| 132
  132 -->|laborious| 133
  133 -->|low| 134
  133 -->|medium| 135
  133 -->|high| 136
  133 -->|very_high| 137
  132 -->|efficient| 138
  138 -->|low| 139
  138 -->|medium| 140
  138 -->|high| 141
  138 -->|very_high| 142
  132 -->|super_effective| 143
  143 -->|low| 144
  143 -->|medium| 145
  143 -->|high| 146
  143 -->|very_high| 147
```

## Enums

### ExploitationStatus

- none
- public_poc
- active

### SystemExposureLevel

- small
- controlled
- open

### UtilityLevel

- laborious
- efficient
- super_effective

### HumanImpactLevel

- low
- medium
- high
- very_high

## Priority Mapping

- **defer** → low
- **scheduled** → medium
- **out_of_cycle** → high
- **immediate** → immediate

## Usage

```typescript
import { DecisionDeployer } from "./plugins/deployer";

const decision = new DecisionDeployer({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```

## Vector String Support

This methodology supports SSVC vector strings for compact representation and interchange.

### Parameter Abbreviations

| Parameter       | Abbreviation | Value Mappings                              |
| --------------- | ------------ | ------------------------------------------- |
| exploitation    | E            | none→N, public_poc→P, active→A              |
| system_exposure | SE           | small→S, controlled→C, open→O               |
| utility         | U            | laborious→L, efficient→E, super_effective→S |
| human_impact    | HI           | low→L, medium→M, high→H, very_high→V        |

### Vector String Format

```
DEPLOYERv1/[parameters]/[timestamp]/
```

### Example Usage

```typescript
// Generate vector string from decision
const decision = new DecisionDeployer({
  exploitation: "none",
  system_exposure: "small",
  utility: "laborious",
  human_impact: "low",
});

const vectorString = decision.toVector();
console.log(vectorString);
// Output: DEPLOYERv1/E:N/SE:S/U:L/HI:L/2024-07-23T20:34:21.000Z/

// Parse vector string to create decision
const parsedDecision = DecisionDeployer.fromVector(
  "DEPLOYERv1/E:N/SE:S/U:L/HI:L/2024-07-23T20:34:21.000Z/",
);
const outcome = parsedDecision.evaluate();
```

## File Integrity Verification

The generated files in this methodology have SHA1 checksums for verification:

### Checksum Verification Commands

Verify the integrity of generated files using these commands:

```bash
# Verify TypeScript plugin file
echo "5a60410e62bd5482031a6003bcadca8ba85c7546  /home/chris/github/typescript-ssvc/src/plugins/deployer-generated.ts" | sha1sum -c
```

**Why This Matters**: Checksum verification ensures that generated files haven't been tampered with or corrupted. This is important for:

- **Security**: Detecting unauthorized modifications to generated code
- **Integrity**: Ensuring files match their expected content exactly
- **Trust**: Providing cryptographic proof that files are authentic
- **Debugging**: Confirming file corruption isn't causing unexpected behavior

Always verify checksums before deploying or using generated files in production environments.
