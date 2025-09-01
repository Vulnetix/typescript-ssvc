/**
 * SSVC TypeScript Library
 * 
 * Stakeholder-Specific Vulnerability Categorization with Plugin Architecture
 */

// Export core functionality
export { Decision, PluginRegistry, SSVCDecision, SSVCOutcome, SSVCPlugin, AuditableDecision } from './core';

// Export plugins
export { AILLMTriagePlugin } from './plugins/ai-llm-triage';
export { CISAPlugin } from './plugins/cisa';
export { CoordinatorPublicationPlugin } from './plugins/coordinator_publication';
export { CoordinatorTriagePlugin } from './plugins/coordinator_triage';
export { DeployerPlugin } from './plugins/deployer';
export { EngineerTriagePlugin } from './plugins/engineer_triage';
export { SupplierPlugin } from './plugins/supplier';

// Auto-register built-in plugins
import { Decision, PluginRegistry } from './core';
import { AILLMTriagePlugin } from './plugins/ai-llm-triage';
import { CISAPlugin } from './plugins/cisa';
import { CoordinatorPublicationPlugin } from './plugins/coordinator_publication';
import { CoordinatorTriagePlugin } from './plugins/coordinator_triage';
import { DeployerPlugin } from './plugins/deployer';
import { EngineerTriagePlugin } from './plugins/engineer_triage';
import { SupplierPlugin } from './plugins/supplier';

// Register plugins on module load
const registry = PluginRegistry.getInstance();
registry.register(new CISAPlugin());
registry.register(new CoordinatorTriagePlugin());
registry.register(new CoordinatorPublicationPlugin());
registry.register(new SupplierPlugin());
registry.register(new DeployerPlugin());
registry.register(new EngineerTriagePlugin());
registry.register(new AILLMTriagePlugin());

// Export legacy compatibility (deprecated)
export * from './decision';

// Convenience functions
export function createDecision(methodology: string, options: Record<string, any> = {}) {
  return new Decision(methodology, options);
}

export function listMethodologies(): string[] {
  return PluginRegistry.getInstance().list().map(plugin => plugin.name);
}

// Re-export generated plugin types for advanced usage (with prefixes to avoid conflicts)
export {
    AutomatableStatus as CISAAutomatableStatus, ExploitationStatus as CISAExploitationStatus, MissionWellbeingImpactLevel as CISAMissionWellbeingImpactLevel, TechnicalImpactLevel as CISATechnicalImpactLevel, DecisionCisa,
    OutcomeCisa
} from './plugins/cisa-generated';

export {
    UtilityLevel as CoordinatorUtilityLevel, DecisionCoordinatorTriage,
    OutcomeCoordinatorTriage, PublicSafetyImpactLevel, ReportCredibilityLevel, ReportPublicStatus, SupplierCardinalityLevel, SupplierContactedStatus
} from './plugins/coordinator_triage-generated';

export {
    DecisionCoordinatorPublication,
    OutcomeCoordinatorPublication, ExploitationStatus as PublicationExploitationStatus,
    PublicValueAddedLevel, SupplierInvolvementLevel
} from './plugins/coordinator_publication-generated';

export {
    DecisionSupplier,
    OutcomeSupplier, ExploitationStatus as SupplierExploitationStatus, PublicSafetyImpactLevel as SupplierPublicSafetyImpactLevel, TechnicalImpactLevel as SupplierTechnicalImpactLevel, UtilityLevel as SupplierUtilityLevel
} from './plugins/supplier-generated';

export {
    DecisionDeployer, ExploitationStatus as DeployerExploitationStatus, UtilityLevel as DeployerUtilityLevel,
    HumanImpactLevel, OutcomeDeployer, SystemExposureLevel
} from './plugins/deployer-generated';

export {
    ExploitationStatus as AILLMExploitationStatus, ApplicationAttackVector, DecisionAiLlmTriage, DeployerAttackVector, OutcomeAiLlmTriage, StakeholderRole, UserAttackVector
} from './plugins/ai_llm_triage-generated';

export {
    DecisionEngineerTriage, OutcomeEngineerTriage, Reachability, RemediationOption, MitigationOption, ReportedPriority
} from './plugins/engineer_triage-generated';

// Runtime YAML Evaluation API (completely isolated from generated plugins)
export * as Runtime from './runtime';

// Evidence Mapping and Data-Driven Evaluation System
export * from './evidence/types';
export * from './mapping/types';
export * from './audit/types';

// Configuration and Building
export { MethodologyConfigBuilder, DataSourceFactory } from './mapping/config';

// Data-Driven Evaluation Engine
export { DataDrivenEvaluator } from './evaluator/data-driven';
export { DataExtractor } from './evaluator/extractor';
export { TransformEngine, CommonTransforms, RuleValidator } from './evaluator/transformer';
export { DataValidator } from './evaluator/validator';

// Simple User-Facing API
export { 
  SSVCEvaluator, 
  quickEvaluate, 
  quickValidate,
  SimpleEvaluationResult,
  SimpleValidationResult
} from './api/simple';

// Auditable Decision Wrapper
export { 
  AuditableDecisionWrapper, 
  AuditableDecisionFactory, 
  AuditableDecisionUtils 
} from './audit/wrapper';
