# Supplier

CERT/CC Supplier Decision Model

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

### UtilityLevel
- laborious
- efficient
- super_effective

### TechnicalImpactLevel
- partial
- total

### PublicSafetyImpactLevel
- minimal
- significant

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
import { DecisionSupplier } from './plugins/supplier';

const decision = new DecisionSupplier({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```
