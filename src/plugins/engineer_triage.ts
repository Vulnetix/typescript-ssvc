/**
 * Engineer Triage Plugin Wrapper
 * 
 * Wraps the generated Engineer Triage plugin to integrate with the core plugin system.
 */

import { SSVCPlugin, SSVCDecision, SSVCOutcome } from '../core';
import {
  DecisionEngineerTriage,
  OutcomeEngineerTriage,
  Reachability,
  RemediationOption,
  MitigationOption,
  ReportedPriority
} from './engineer_triage-generated';

export class EngineerTriagePlugin extends SSVCPlugin {
  readonly name = 'Engineer Triage';
  readonly description = 'Developer-focused vulnerability triage methodology for determining appropriate response actions based on reachability, remediation options, mitigation capabilities, and priority';
  readonly version = '1.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new EngineerTriageDecisionWrapper(options);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    const decision = DecisionEngineerTriage.fromVector(vectorString);
    return new EngineerTriageDecisionWrapper({
      reachability: decision.reachability,
      remediation_option: decision.remediationOption,
      mitigation_option: decision.mitigationOption,
      reported_priority: decision.reportedPriority
    });
  }
}

class EngineerTriageDecisionWrapper implements SSVCDecision {
  private decision: DecisionEngineerTriage;
  public outcome?: SSVCOutcome;
  
  constructor(options: Record<string, any>) {
    // Map the generic options to Engineer Triage-specific parameters
    const engineerTriageOptions = {
      reachability: this.mapValue(options.reachability, Reachability),
      remediationOption: this.mapValue(options.remediation_option || options.remediationOption, RemediationOption),
      mitigationOption: this.mapValue(options.mitigation_option || options.mitigationOption, MitigationOption),
      reportedPriority: this.mapValue(options.reported_priority || options.reportedPriority, ReportedPriority)
    };
    
    this.decision = new DecisionEngineerTriage(engineerTriageOptions);
  }
  
  evaluate(): SSVCOutcome {
    const outcome = this.decision.evaluate();
    this.outcome = {
      action: outcome.action,
      priority: outcome.priority
    };
    return this.outcome;
  }
  
  toVector(): string {
    return this.decision.toVector();
  }
  
  private mapValue(value: any, enumType: any): any {
    if (!value) return undefined;
    
    // If it's already the right type, return it
    if (Object.values(enumType).includes(value)) {
      return value;
    }
    
    // If it's a string, try to find the matching enum value
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase();
      const enumKey = Object.keys(enumType).find(key => key === upperValue);
      if (enumKey) {
        return (enumType as any)[enumKey];
      }
      
      // Try direct string value match
      const enumValue = Object.values(enumType).find(v => v === value.toLowerCase());
      if (enumValue) {
        return enumValue;
      }
    }
    
    return value;
  }
}