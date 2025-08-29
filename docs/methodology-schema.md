# SSVC Methodology Schema Validation

This document describes the schema validation system for SSVC methodology YAML files, which ensures all methodologies follow a consistent hierarchical tree structure.

## Overview

The schema validation system enforces consistent structure across all SSVC methodologies, ensuring:

- **Hierarchical Tree Structure**: All methodologies must use nested decision trees (not flat arrays)
- **Consistent Depth**: All decision paths within a methodology must have identical depth
- **Complete Validation**: Schema validation, enum usage validation, and tree structure validation

## Schema Location

The JSON Schema is located at: `methodologies/schema.json`

## Validation Script

Run validation with:

```bash
just validate-methodologies
# or directly:
npx ts-node scripts/validate-methodologies.ts
```

## Required YAML Structure

### Basic Structure

```yaml
name: "Methodology Name"
description: "Description of the methodology"
version: "1.0"
url: "https://optional-documentation-url.com"  # Optional

enums:
  DecisionPointEnum:
    - VALUE_ONE
    - VALUE_TWO
  # ... more enums

priorityMap:
  ACTION_ONE: priority_level
  ACTION_TWO: priority_level

defaultAction: DEFAULT_ACTION

decisionTree:
  type: FirstDecisionPointEnum
  children:
    VALUE_ONE:
      type: SecondDecisionPointEnum
      children:
        NESTED_VALUE: FINAL_ACTION
    VALUE_TWO: FINAL_ACTION
```

### Tree Structure Requirements

1. **Hierarchical Structure**: Use nested `type` and `children` objects, not flat arrays
2. **Consistent Depth**: All paths from root to leaf must have the same number of levels
3. **Leaf Nodes**: Terminal nodes must be action strings (not objects)
4. **Type References**: All `type` values must reference declared enums

### Valid Tree Example (4 levels)

```yaml
decisionTree:
  type: ExploitationStatus           # Level 1
  children:
    NONE:
      type: AutomatableStatus        # Level 2
      children:
        "YES":
          type: TechnicalImpactLevel # Level 3
          children:
            TOTAL:
              type: MissionWellbeingImpactLevel # Level 4
              children:
                HIGH: ATTEND         # Leaf action
                MEDIUM: TRACK        # Leaf action
```

### Invalid Structures

❌ **Flat Array Structure**:
```yaml
decisionTree:
  - conditions:
      exploitation: none
      automatable: "yes"
    action: track
```

❌ **Inconsistent Depth**:
```yaml
decisionTree:
  type: FirstLevel
  children:
    A:
      type: SecondLevel
      children:
        X: ACTION_ONE        # 3 levels
        Y:
          type: ThirdLevel
          children:
            Z: ACTION_TWO    # 4 levels - INCONSISTENT!
```

## Enum Requirements

### Declaration
All enum types used in the decision tree must be declared in the `enums` section:

```yaml
enums:
  ExploitationStatus:
    - NONE
    - POC
    - ACTIVE
  # Must declare all enum types used in decisionTree
```

### Usage Validation
- All declared enums must be used in the decision tree
- All enum types referenced in the tree must be declared
- Unused enum declarations will cause validation errors

## Priority Mapping

### Structure
```yaml
priorityMap:
  ACTION_NAME: priority_level  # Both uppercase and lowercase supported
  another_action: priority     # Mixed case and underscores allowed
```

### Requirements
- Every action used in the decision tree must have a priority mapping
- Every priority mapping must correspond to an actual action
- The `defaultAction` must also have a priority mapping
- Action names support both uppercase and lowercase letters, plus underscores
- Priority levels support both uppercase and lowercase letters, plus underscores

## Validation Checks

The validator performs these checks:

### 1. JSON Schema Validation
- Validates overall YAML structure
- Ensures required fields are present
- Validates data types and patterns

### 2. Tree Depth Consistency
- Verifies all paths have identical depth
- Reports inconsistent depths with specific values found

### 3. Enum Usage Validation
- Checks that all declared enums are used
- Verifies all referenced enums are declared
- Reports unused or undeclared enum types

### 4. Priority Mapping Validation
- Ensures all actions have priority mappings
- Checks for orphaned priority mappings
- Validates defaultAction has mapping

### 5. Coverage Analysis
- Calculates percentage of possible paths explicitly defined
- Issues warnings for very low coverage (< 25%)
- Sparse trees with default actions are acceptable

## Methodology Examples

### CISA (Sparse Tree)
- **Depth**: 4 levels consistently
- **Coverage**: ~47% (acceptable with default action)
- **Structure**: Hierarchical with some branches undefined (uses defaultAction)

### Coordinator Publication (Complete Tree)  
- **Depth**: 3 levels consistently
- **Coverage**: 100% (all combinations explicitly defined)
- **Structure**: Fully enumerated hierarchical tree

### Coordinator Triage (Complex Tree)
- **Depth**: 6 levels consistently  
- **Coverage**: ~100% (nearly all combinations defined)
- **Structure**: Deep hierarchical tree with complete enumeration

### Deployer (Complete Tree)
- **Depth**: 4 levels consistently
- **Coverage**: 100% (all combinations explicitly defined)
- **Structure**: Fully enumerated hierarchical tree

### Supplier (Complete Tree)
- **Depth**: 4 levels consistently
- **Coverage**: 100% (all combinations explicitly defined)  
- **Structure**: Fully enumerated hierarchical tree

## Integration with Build Process

The validation is integrated into the build process:

```bash
# Validation runs before plugin generation
just generate-plugins  # Runs validate-methodologies first

# Full development cycle
just dev  # Includes validation, generation, build, and test
```

## Error Messages

### Common Error Types

**Schema Validation Errors**:
```
/decisionTree: must be object
/priorityMap: must NOT have additional properties
```

**Depth Consistency Errors**:
```
Inconsistent tree depth: found depths 4, 5, 6. All paths should have the same depth.
```

**Enum Usage Errors**:
```
Decision tree uses undeclared enum type: UndefinedEnum
Declared enum type is never used: UnusedEnum
```

**Priority Mapping Errors**:
```
Action 'NEW_ACTION' has no priority mapping
Priority mapping exists for unused action: OLD_ACTION
```

## Migration Guide

### Converting Flat Arrays to Trees

**Before (Flat Array)**:
```yaml
decisionTree:
  - conditions:
      param1: value1
      param2: value2
    action: result1
  - conditions:
      param1: value1
      param2: value3
    action: result2
```

**After (Hierarchical Tree)**:
```yaml
decisionTree:
  type: Param1Enum
  children:
    value1:
      type: Param2Enum  
      children:
        value2: result1
        value3: result2
```

### Ensuring Consistent Depth

1. **Identify the maximum depth** needed across all decision paths
2. **Pad shorter paths** by adding intermediate decision points or using default actions
3. **Verify all paths** reach the same depth before terminating in actions

## Troubleshooting

### "Inconsistent tree depth" Error
- Map out all decision paths from root to leaf
- Identify paths with different lengths
- Restructure to ensure consistent depth across all branches

### "Declared enum type is never used" Error  
- Remove unused enum declarations from the `enums` section
- Or add the enum to the decision tree if it should be used

### "Priority mapping" Errors
- Ensure every action in the tree has a priority mapping
- Remove priority mappings for actions not used in the tree
- Verify the defaultAction has a priority mapping

## Best Practices

1. **Design First**: Plan your decision tree structure before writing YAML
2. **Consistent Naming**: Use consistent naming patterns for enums and actions
3. **Document Decisions**: Use clear, descriptive enum and action names
4. **Validate Early**: Run validation frequently during development
5. **Complete Coverage**: Aim for complete enumeration or ensure default action is appropriate
6. **Test Integration**: Verify generated plugins work correctly after structural changes

## Schema Evolution

When updating the schema:

1. **Test Backwards Compatibility**: Ensure existing methodologies still validate
2. **Update Documentation**: Reflect schema changes in this guide
3. **Version the Schema**: Consider schema versioning for breaking changes
4. **Coordinate Changes**: Update both schema and validator logic together

The validation system ensures all SSVC methodologies maintain consistent, predictable structure while allowing for different coverage patterns and complexity levels appropriate to each use case.