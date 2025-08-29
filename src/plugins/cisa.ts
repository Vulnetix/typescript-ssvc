/**
 * CISA Plugin Wrapper
 * 
 * Wraps the generated CISA plugin to integrate with the core plugin system.
 */

import { SSVCPlugin, SSVCDecision, SSVCOutcome } from '../core';
import {
  DecisionCisa,
  OutcomeCisa,
  ExploitationStatus,
  AutomatableStatus,
  TechnicalImpactLevel,
  MissionWellbeingImpactLevel
} from './cisa-generated';

export class CISAPlugin extends SSVCPlugin {
  readonly name = 'CISA';
  readonly description = 'CISA Stakeholder-Specific Vulnerability Categorization';
  readonly version = '1.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new CISADecisionWrapper(options);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    const decision = DecisionCisa.fromVector(vectorString);
    return new CISADecisionWrapper({
      exploitation: decision.exploitation,
      automatable: decision.automatable,
      technical_impact: decision.technicalImpact,
      mission_wellbeing: decision.missionWellbeingImpact
    });
  }
}

class CISADecisionWrapper implements SSVCDecision {
  private decision: DecisionCisa;
  public outcome?: SSVCOutcome;
  
  constructor(options: Record<string, any>) {
    // Map the generic options to CISA-specific parameters
    const cisaOptions = {
      exploitation: this.mapValue(options.exploitation || options.exploitationStatus, ExploitationStatus),
      automatable: this.mapValue(options.automatable || options.automatableStatus, AutomatableStatus),
      technicalImpact: this.mapValue(options.technical_impact || options.technicalImpactLevel, TechnicalImpactLevel),
      missionWellbeingImpact: this.mapValue(options.mission_wellbeing || options.missionWellbeingImpactLevel, MissionWellbeingImpactLevel)
    };
    
    this.decision = new DecisionCisa(cisaOptions);
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