/**
 * AI/LLM Triage Plugin Wrapper
 * 
 * Wraps the generated AI/LLM Triage plugin to integrate with the core plugin system.
 */

import { SSVCPlugin, SSVCDecision, SSVCOutcome } from '../core';
import {
  DecisionAiLlmTriage,
  OutcomeAiLlmTriage,
  ExploitationStatus,
  StakeholderRole,
  DeployerAttackVector,
  ApplicationAttackVector,
  UserAttackVector
} from './ai_llm_triage-generated';

export class AILLMTriagePlugin extends SSVCPlugin {
  readonly name = 'AI/LLM Triage';
  readonly description = 'AI and LLM Vulnerability Triage for stakeholder-specific decision making';
  readonly version = '1.0';
  
  createDecision(options: Record<string, any>): SSVCDecision {
    return new AILLMTriageDecisionWrapper(options);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    const decision = DecisionAiLlmTriage.fromVector(vectorString);
    return new AILLMTriageDecisionWrapper({
      exploitation: decision.exploitation,
      stakeholder_role: decision.stakeholderRole,
      deployer_attack_vector: decision.deployerAttackVector,
      application_attack_vector: decision.applicationAttackVector,
      user_attack_vector: decision.userAttackVector
    });
  }
}

class AILLMTriageDecisionWrapper implements SSVCDecision {
  private decision: DecisionAiLlmTriage;
  public outcome?: SSVCOutcome;
  
  constructor(options: Record<string, any>) {
    // Map the generic options to AI/LLM Triage-specific parameters
    const aiLlmOptions = {
      exploitation: this.mapValue(options.exploitation || options.exploitationStatus, ExploitationStatus),
      stakeholderRole: this.mapValue(options.stakeholder_role || options.stakeholderRole || options.role, StakeholderRole),
      deployerAttackVector: this.mapValue(options.deployer_attack_vector || options.deployerAttackVector, DeployerAttackVector),
      applicationAttackVector: this.mapValue(options.application_attack_vector || options.applicationAttackVector, ApplicationAttackVector),
      userAttackVector: this.mapValue(options.user_attack_vector || options.userAttackVector, UserAttackVector)
    };
    
    this.decision = new DecisionAiLlmTriage(aiLlmOptions);
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
      
      // Try direct string value match (case insensitive)
      const enumValue = Object.values(enumType).find(v => 
        typeof v === 'string' && v.toUpperCase() === upperValue
      );
      if (enumValue) {
        return enumValue;
      }
      
      // Try with underscores replaced by spaces or vice versa
      const normalizedValue = value.replace(/[_\s]/g, '_').toUpperCase();
      const enumValue2 = Object.values(enumType).find(v => 
        typeof v === 'string' && v.toUpperCase() === normalizedValue
      );
      if (enumValue2) {
        return enumValue2;
      }
    }
    
    return value;
  }
}