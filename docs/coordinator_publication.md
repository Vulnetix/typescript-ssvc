# Coordinator Publication

CERT/CC Coordinator Publication Decision Model

**Version:** 1.0


## Decision Tree

```mermaid
flowchart TD


```

## Enums

### SupplierInvolvementLevel
- fix_ready
- cooperative
- uncooperative_unresponsive

### ExploitationStatus
- none
- public_poc
- active

### PublicValueAddedLevel
- limited
- ampliative
- precedence

### ActionType
- publish
- dont_publish

### DecisionPriorityLevel
- low
- high

## Priority Mapping

- **publish** → high
- **dont_publish** → low

## Usage

```typescript
import { DecisionCoordinatorPublication } from './plugins/coordinator_publication';

const decision = new DecisionCoordinatorPublication({
  // Add parameters based on methodology
});

const outcome = decision.evaluate();
console.log(outcome.action, outcome.priority);
```
