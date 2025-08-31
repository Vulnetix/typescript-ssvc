---
generated: true
source: methodologies/ai_llm_triage.yaml
generator: scripts/generate-plugins.ts
lastGenerated: 2025-08-31T12:19:02.482Z
generatedFiles:
  typescript:
    path: /home/chris/github/typescript-ssvc/src/plugins/ai_llm_triage-generated.ts
    checksum: 62bd31b5580d96280d558b35b427aac925fae461
---

# AI/LLM Triage

AI and LLM Vulnerability Triage for stakeholder-specific decision making

**Version:** 1.0

## Decision Tree

```mermaid
flowchart LR
  0{ExploitationStatus}
  1{StakeholderRole}
  2{DeployerAttackVector}
  3[ASSESS_RISK]
  4[ASSESS_RISK]
  5[MONITOR]
  6{ApplicationAttackVector}
  7[MONITOR]
  8[PROMPT_SANITIZATION]
  9[FINETUNE_GUARDRAILS]
  10[MONITOR]
  11[MONITOR]
  12{UserAttackVector}
  13[ASSESS_RISK]
  14[LOW_TRUST]
  15[LOW_TRUST]
  16{StakeholderRole}
  17{DeployerAttackVector}
  18[FINETUNE_GUARDRAILS]
  19[RETRAIN_MODEL]
  20[ASSESS_RISK]
  21{ApplicationAttackVector}
  22[PROMPT_SANITIZATION]
  23[FINETUNE_GUARDRAILS]
  24[RETRAIN_MODEL]
  25[FINETUNE_GUARDRAILS]
  26[PROMPT_SANITIZATION]
  27{UserAttackVector}
  28[FINETUNE_GUARDRAILS]
  29[HIGH_RISK]
  30[HIGH_RISK]
  31{StakeholderRole}
  32{DeployerAttackVector}
  33[IMMEDIATE_ACTION]
  34[IMMEDIATE_ACTION]
  35[RETRAIN_MODEL]
  36{ApplicationAttackVector}
  37[FINETUNE_GUARDRAILS]
  38[RETRAIN_MODEL]
  39[IMMEDIATE_ACTION]
  40[RETRAIN_MODEL]
  41[FINETUNE_GUARDRAILS]
  42{UserAttackVector}
  43[IMMEDIATE_ACTION]
  44[IMMEDIATE_ACTION]
  45[IMMEDIATE_ACTION]
  0 -->|NONE| 1
  1 -->|DEPLOYER| 2
  2 -->|SUPPLY_CHAIN| 3
  2 -->|MODEL_POISONING| 4
  2 -->|INFRASTRUCTURE_COMPROMISE| 5
  1 -->|APPLICATION| 6
  6 -->|PROMPT_INJECTION| 7
  6 -->|TOOL_MISUSE| 8
  6 -->|PRIVILEGE_ESCALATION| 9
  6 -->|MEMORY_MANIPULATION| 10
  6 -->|ALIGNMENT_BYPASS| 11
  1 -->|USER| 12
  12 -->|DATA_EXTRACTION| 13
  12 -->|PROMPT_MANIPULATION| 14
  12 -->|OUTPUT_MANIPULATION| 15
  0 -->|POC| 16
  16 -->|DEPLOYER| 17
  17 -->|SUPPLY_CHAIN| 18
  17 -->|MODEL_POISONING| 19
  17 -->|INFRASTRUCTURE_COMPROMISE| 20
  16 -->|APPLICATION| 21
  21 -->|PROMPT_INJECTION| 22
  21 -->|TOOL_MISUSE| 23
  21 -->|PRIVILEGE_ESCALATION| 24
  21 -->|MEMORY_MANIPULATION| 25
  21 -->|ALIGNMENT_BYPASS| 26
  16 -->|USER| 27
  27 -->|DATA_EXTRACTION| 28
  27 -->|PROMPT_MANIPULATION| 29
  27 -->|OUTPUT_MANIPULATION| 30
  0 -->|ACTIVE| 31
  31 -->|DEPLOYER| 32
  32 -->|SUPPLY_CHAIN| 33
  32 -->|MODEL_POISONING| 34
  32 -->|INFRASTRUCTURE_COMPROMISE| 35
  31 -->|APPLICATION| 36
  36 -->|PROMPT_INJECTION| 37
  36 -->|TOOL_MISUSE| 38
  36 -->|PRIVILEGE_ESCALATION| 39
  36 -->|MEMORY_MANIPULATION| 40
  36 -->|ALIGNMENT_BYPASS| 41
  31 -->|USER| 42
  42 -->|DATA_EXTRACTION| 43
  42 -->|PROMPT_MANIPULATION| 44
  42 -->|OUTPUT_MANIPULATION| 45
```

## Enums

### ExploitationStatus

- NONE
- POC
- ACTIVE

### StakeholderRole

- DEPLOYER
- APPLICATION
- USER

### DeployerAttackVector

- SUPPLY_CHAIN
- MODEL_POISONING
- INFRASTRUCTURE_COMPROMISE

### ApplicationAttackVector

- PROMPT_INJECTION
- TOOL_MISUSE
- PRIVILEGE_ESCALATION
- MEMORY_MANIPULATION
- ALIGNMENT_BYPASS

### UserAttackVector

- DATA_EXTRACTION
- PROMPT_MANIPULATION
- OUTPUT_MANIPULATION

## Priority Mapping

- **MONITOR** → LOW
- **ASSESS_RISK** → LOW
- **PROMPT_SANITIZATION** → MEDIUM
- **FINETUNE_GUARDRAILS** → MEDIUM
- **RETRAIN_MODEL** → HIGH
- **HIGH_RISK** → HIGH
- **LOW_TRUST** → MEDIUM
- **IMMEDIATE_ACTION** → IMMEDIATE

## Usage

```typescript
import { DecisionAiLlmTriage } from "./plugins/ai_llm_triage";

const decision = new DecisionAiLlmTriage({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```

## Vector String Support

This methodology supports SSVC vector strings for compact representation and interchange.

### Parameter Abbreviations

| Parameter                 | Abbreviation | Value Mappings                                                                                            |
| ------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| exploitation              | E            | NONE→N, POC→P, ACTIVE→A                                                                                   |
| stakeholder_role          | SR           | DEPLOYER→D, APPLICATION→A, USER→U                                                                         |
| deployer_attack_vector    | DAV          | SUPPLY_CHAIN→SC, MODEL_POISONING→MP, INFRASTRUCTURE_COMPROMISE→IC                                         |
| application_attack_vector | AAV          | PROMPT_INJECTION→PI, TOOL_MISUSE→TM, PRIVILEGE_ESCALATION→PE, MEMORY_MANIPULATION→MM, ALIGNMENT_BYPASS→AB |
| user_attack_vector        | UAV          | DATA_EXTRACTION→DE, PROMPT_MANIPULATION→PM, OUTPUT_MANIPULATION→OM                                        |

### Vector String Format

```
AI_LLMv2/[parameters]/[timestamp]/
```

### Example Usage

```typescript
// Generate vector string from decision
const decision = new DecisionAiLlmTriage({
  exploitation: "NONE",
  stakeholder_role: "DEPLOYER",
  deployer_attack_vector: "SUPPLY_CHAIN",
  application_attack_vector: "PROMPT_INJECTION",
  user_attack_vector: "DATA_EXTRACTION",
});

const vectorString = decision.toVector();
console.log(vectorString);
// Output: AI_LLMv2/E:N/SR:D/DAV:SC/AAV:PI/UAV:DE/2024-07-23T20:34:21.000Z/

// Parse vector string to create decision
const parsedDecision = DecisionAiLlmTriage.fromVector(
  "AI_LLMv2/E:N/SR:D/DAV:SC/AAV:PI/UAV:DE/2024-07-23T20:34:21.000Z/",
);
const outcome = parsedDecision.evaluate();
```

## File Integrity Verification

The generated files in this methodology have SHA1 checksums for verification:

### Checksum Verification Commands

Verify the integrity of generated files using these commands:

```bash
# Verify TypeScript plugin file
echo "62bd31b5580d96280d558b35b427aac925fae461  /home/chris/github/typescript-ssvc/src/plugins/ai_llm_triage-generated.ts" | sha1sum -c
```

**Why This Matters**: Checksum verification ensures that generated files haven't been tampered with or corrupted. This is important for:

- **Security**: Detecting unauthorized modifications to generated code
- **Integrity**: Ensuring files match their expected content exactly
- **Trust**: Providing cryptographic proof that files are authentic
- **Debugging**: Confirming file corruption isn't causing unexpected behavior

Always verify checksums before deploying or using generated files in production environments.
