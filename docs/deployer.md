# Deployer

CERT/CC Deployer Decision Model

**Version:** 1.0


## Decision Tree

```mermaid
flowchart TD


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

### ActionType
- defer
- scheduled
- out_of_cycle
- immediate

### DecisionPriorityLevel
- low
- medium
- high
- immediate

## Priority Mapping

- **defer** → low
- **scheduled** → medium
- **out_of_cycle** → high
- **immediate** → immediate

## Usage

```typescript
import { DecisionDeployer } from './plugins/deployer';

const decision = new DecisionDeployer({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```
