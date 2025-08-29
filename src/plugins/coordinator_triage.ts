/**
 * Coordinator Triage Plugin Wrapper
 * 
 * Wraps the generated Coordinator Triage plugin to integrate with the core plugin system.
 */

import { SSVCPlugin, SSVCDecision, SSVCOutcome } from '../core';
import {
  DecisionCoordinatorTriage,
  OutcomeCoordinatorTriage,
  ReportPublicStatus,
  SupplierContactedStatus,
  ReportCredibilityLevel,
  SupplierCardinalityLevel,
  UtilityLevel,
  PublicSafetyImpactLevel
} from './coordinator_triage-generated';

export class CoordinatorTriagePlugin extends SSVCPlugin {
  readonly name = 'Coordinator Triage';
  readonly description = 'CERT/CC Coordinator Triage Decision Model';
  readonly version = '1.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new CoordinatorTriageDecisionWrapper(options);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    const decision = DecisionCoordinatorTriage.fromVector(vectorString);
    return new CoordinatorTriageDecisionWrapper({
      report_public: decision.reportPublic,
      supplier_contacted: decision.supplierContacted,
      report_credibility: decision.reportCredibility,
      supplier_cardinality: decision.supplierCardinality,
      utility: decision.utility,
      public_safety: decision.publicSafetyImpact
    });
  }
}

class CoordinatorTriageDecisionWrapper implements SSVCDecision {
  private decision: DecisionCoordinatorTriage;
  public outcome?: SSVCOutcome;
  
  constructor(options: Record<string, any>) {
    // Map the generic options to Coordinator Triage-specific parameters
    const coordinatorOptions = {
      reportPublic: this.mapValue(options.report_public || options.reportPublicStatus, ReportPublicStatus),
      supplierContacted: this.mapValue(options.supplier_contacted || options.supplierContactedStatus, SupplierContactedStatus),
      reportCredibility: this.mapValue(options.report_credibility || options.reportCredibilityLevel, ReportCredibilityLevel),
      supplierCardinality: this.mapValue(options.supplier_cardinality || options.supplierCardinalityLevel, SupplierCardinalityLevel),
      utility: this.mapValue(options.utility || options.utilityLevel, UtilityLevel),
      publicSafetyImpact: this.mapValue(options.public_safety_impact || options.publicSafetyImpactLevel, PublicSafetyImpactLevel)
    };
    
    this.decision = new DecisionCoordinatorTriage(coordinatorOptions);
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