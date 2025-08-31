/**
 * Transform Rules Engine
 * 
 * Applies transformation rules to convert raw data values to methodology enum values
 */

import { TransformRule } from '../mapping/types';

/**
 * Result of applying a transform rule
 */
export interface TransformResult {
  /** The transformed value */
  value: string;
  /** Whether transformation was successful */
  success: boolean;
  /** The rule that was applied (if any) */
  appliedRule?: TransformRule;
  /** Original value before transformation */
  originalValue: any;
  /** Any error that occurred */
  error?: string;
}

/**
 * Transform engine for applying rules to raw data values
 */
export class TransformEngine {
  
  /**
   * Apply transformation rules to a value
   */
  transform(
    value: any,
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): TransformResult {
    const stringValue = this.normalizeValue(value);
    
    // Get applicable rules for this source and mapping
    const applicableRules = this.getApplicableRules(rules, sourceId, mappingId);
    
    // Try each rule in order
    for (const rule of applicableRules) {
      try {
        if (this.testRule(stringValue, rule)) {
          return {
            value: rule.targetValue,
            success: true,
            appliedRule: rule,
            originalValue: value
          };
        }
      } catch (error) {
        // Rule testing failed, continue to next rule
        console.warn(`Rule failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // No rule matched, return normalized original value
    return {
      value: stringValue.toUpperCase(),
      success: true,
      originalValue: value
    };
  }
  
  /**
   * Test if a rule matches a value
   */
  private testRule(value: string, rule: TransformRule): boolean {
    if (rule.sourceValue instanceof RegExp) {
      return rule.sourceValue.test(value);
    } else {
      return this.compareStrings(value, String(rule.sourceValue));
    }
  }
  
  /**
   * Compare strings with various matching strategies
   */
  private compareStrings(value: string, ruleValue: string): boolean {
    // Exact match (case-insensitive)
    if (value.toLowerCase() === ruleValue.toLowerCase()) {
      return true;
    }
    
    // Trimmed match
    if (value.trim().toLowerCase() === ruleValue.trim().toLowerCase()) {
      return true;
    }
    
    // Word boundary match (for partial matches)
    const valueWords = value.toLowerCase().split(/\s+/);
    const ruleWords = ruleValue.toLowerCase().split(/\s+/);
    
    // Check if all rule words are present in value
    if (ruleWords.every(ruleWord => valueWords.some(valueWord => valueWord.includes(ruleWord)))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Normalize a value to a string for comparison
   */
  private normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    if (typeof value === 'number') {
      return String(value);
    }
    
    if (typeof value === 'object') {
      // For objects/arrays, convert to JSON string
      try {
        return JSON.stringify(value);
      } catch (error) {
        return String(value);
      }
    }
    
    return String(value).trim();
  }
  
  /**
   * Get rules that apply to a specific source and mapping
   */
  getApplicableRules(
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): TransformRule[] {
    return rules.filter(rule => {
      // If no restrictions specified, rule applies to all
      const hasSourceRestriction = rule.applicableToSources.length > 0;
      const hasMappingRestriction = rule.applicableToMappings.length > 0;
      
      if (!hasSourceRestriction && !hasMappingRestriction) {
        return true;
      }
      
      // Check source restriction
      if (hasSourceRestriction && !rule.applicableToSources.includes(sourceId)) {
        return false;
      }
      
      // Check mapping restriction
      if (hasMappingRestriction && !rule.applicableToMappings.includes(mappingId)) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Validate that a transformed value is in the list of valid values
   */
  validate(value: string, validValues: string[]): boolean {
    return validValues.includes(value);
  }
  
  /**
   * Batch transform multiple values
   */
  batchTransform(
    values: any[],
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): TransformResult[] {
    return values.map(value => this.transform(value, rules, sourceId, mappingId));
  }
  
  /**
   * Test rules against sample data
   */
  testRules(
    sampleData: Array<{ value: any; expectedResult: string }>,
    rules: TransformRule[],
    sourceId: string,
    mappingId: string
  ): Array<{ 
    input: any; 
    expected: string; 
    actual: string; 
    success: boolean; 
    appliedRule?: TransformRule 
  }> {
    return sampleData.map(sample => {
      const result = this.transform(sample.value, rules, sourceId, mappingId);
      return {
        input: sample.value,
        expected: sample.expectedResult,
        actual: result.value,
        success: result.value === sample.expectedResult,
        appliedRule: result.appliedRule
      };
    });
  }
}

/**
 * Pre-built transform rule patterns for common scenarios
 */
export class CommonTransforms {
  
  /**
   * Create boolean transformation rules (true/false -> YES/NO)
   */
  static booleanToYesNo(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^(true|1|yes|y|on|enabled)$/i,
        targetValue: 'YES',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(false|0|no|n|off|disabled)$/i,
        targetValue: 'NO',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
  
  /**
   * Create numeric range transformation rules
   */
  static numericRange(
    ranges: Array<{ min?: number; max?: number; targetValue: string }>,
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return ranges.map(range => ({
      sourceValue: new RegExp(`^\\d+(\\.\\d+)?$`), // Matches numbers
      targetValue: range.targetValue,
      applicableToMappings,
      applicableToSources
    }));
  }
  
  /**
   * Create severity level transformations (low/medium/high variations)
   */
  static severityLevels(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^(low|minimal|minor|1)$/i,
        targetValue: 'LOW',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(medium|moderate|med|2)$/i,
        targetValue: 'MEDIUM',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(high|severe|major|critical|3)$/i,
        targetValue: 'HIGH',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
  
  /**
   * Create exploit status transformations
   */
  static exploitStatus(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^(none|no.*(exploit|attack)|not.*(exploitable|vulnerable))$/i,
        targetValue: 'NONE',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(poc|proof.of.concept|theoretical|possible)$/i,
        targetValue: 'POC',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(active|exploitation|exploited|in.the.wild|weaponized)$/i,
        targetValue: 'ACTIVE',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
  
  /**
   * Create CVSS score to impact level transformations
   */
  static cvssToImpact(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^([0-3](\.\d)?|low)$/i,
        targetValue: 'LOW',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^([4-6](\.\d)?|medium)$/i,
        targetValue: 'MEDIUM',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^([7-8](\.\d)?|high)$/i,
        targetValue: 'HIGH',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^([9-9](\.\d)?|9\.[\d]|10(\.0)?|critical)$/i,
        targetValue: 'CRITICAL',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
  
  /**
   * Create text sentiment transformations (positive/negative -> YES/NO)
   */
  static sentiment(
    applicableToMappings: string[] = [],
    applicableToSources: string[] = []
  ): TransformRule[] {
    return [
      {
        sourceValue: /^(positive|good|success|available|present|confirmed)$/i,
        targetValue: 'YES',
        applicableToMappings,
        applicableToSources
      },
      {
        sourceValue: /^(negative|bad|failure|unavailable|absent|denied)$/i,
        targetValue: 'NO',
        applicableToMappings,
        applicableToSources
      }
    ];
  }
}

/**
 * Rule validation utilities
 */
export class RuleValidator {
  
  /**
   * Validate that transform rules are properly formed
   */
  static validateRules(rules: TransformRule[]): Array<{ rule: TransformRule; issues: string[] }> {
    return rules.map(rule => ({
      rule,
      issues: this.validateSingleRule(rule)
    }));
  }
  
  private static validateSingleRule(rule: TransformRule): string[] {
    const issues: string[] = [];
    
    // Check source value
    if (!rule.sourceValue) {
      issues.push('Source value is required');
    } else if (typeof rule.sourceValue === 'string' && rule.sourceValue.trim() === '') {
      issues.push('Source value cannot be empty string');
    }
    
    // Check target value
    if (!rule.targetValue || rule.targetValue.trim() === '') {
      issues.push('Target value is required and cannot be empty');
    }
    
    // Check arrays are valid
    if (!Array.isArray(rule.applicableToMappings)) {
      issues.push('applicableToMappings must be an array');
    }
    
    if (!Array.isArray(rule.applicableToSources)) {
      issues.push('applicableToSources must be an array');
    }
    
    // Validate regex if present
    if (rule.sourceValue instanceof RegExp) {
      try {
        // Test the regex with a simple string
        rule.sourceValue.test('test');
      } catch (error) {
        issues.push(`Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return issues;
  }
  
  /**
   * Check for conflicting rules that might produce ambiguous results
   */
  static findConflicts(rules: TransformRule[]): Array<{
    rule1: TransformRule;
    rule2: TransformRule;
    conflict: string;
  }> {
    const conflicts = [];
    
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        // Check if rules have overlapping scope
        const hasOverlappingScope = this.hasOverlappingScope(rule1, rule2);
        
        if (hasOverlappingScope) {
          // Check if they could match the same values
          const couldConflict = this.couldRulesConflict(rule1, rule2);
          
          if (couldConflict) {
            conflicts.push({
              rule1,
              rule2,
              conflict: 'Rules have overlapping scope and could match the same values'
            });
          }
        }
      }
    }
    
    return conflicts;
  }
  
  private static hasOverlappingScope(rule1: TransformRule, rule2: TransformRule): boolean {
    // Check if mappings overlap
    const mappingsOverlap = rule1.applicableToMappings.length === 0 || 
                           rule2.applicableToMappings.length === 0 ||
                           rule1.applicableToMappings.some(m => rule2.applicableToMappings.includes(m));
    
    // Check if sources overlap
    const sourcesOverlap = rule1.applicableToSources.length === 0 || 
                          rule2.applicableToSources.length === 0 ||
                          rule1.applicableToSources.some(s => rule2.applicableToSources.includes(s));
    
    return mappingsOverlap && sourcesOverlap;
  }
  
  private static couldRulesConflict(rule1: TransformRule, rule2: TransformRule): boolean {
    // This is a simplified check
    // In practice, you'd want more sophisticated pattern analysis
    
    if (rule1.targetValue === rule2.targetValue) {
      return false; // Same target, no conflict
    }
    
    // If both are exact strings, check for exact match
    if (typeof rule1.sourceValue === 'string' && typeof rule2.sourceValue === 'string') {
      return rule1.sourceValue.toLowerCase() === rule2.sourceValue.toLowerCase();
    }
    
    // For regex patterns, this would require complex analysis
    return true; // Assume potential conflict for safety
  }
}