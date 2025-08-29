/**
 * SSVC TypeScript Library
 * 
 * Stakeholder-Specific Vulnerability Categorization with Plugin Architecture
 */

// Export core functionality
export { Decision, PluginRegistry, SSVCPlugin, SSVCDecision, SSVCOutcome } from './core';

// Export plugins
export { CISAPlugin } from './plugins/cisa';
export { CoordinatorTriagePlugin } from './plugins/coordinator_triage';
export { CoordinatorPublicationPlugin } from './plugins/coordinator_publication';
export { SupplierPlugin } from './plugins/supplier';
export { DeployerPlugin } from './plugins/deployer';
export { AILLMTriagePlugin } from './plugins/ai-llm-triage';

// Auto-register built-in plugins
import { PluginRegistry, Decision } from './core';
import { CISAPlugin } from './plugins/cisa';
import { CoordinatorTriagePlugin } from './plugins/coordinator_triage';
import { CoordinatorPublicationPlugin } from './plugins/coordinator_publication';
import { SupplierPlugin } from './plugins/supplier';
import { DeployerPlugin } from './plugins/deployer';
import { AILLMTriagePlugin } from './plugins/ai-llm-triage';

// Register plugins on module load
const registry = PluginRegistry.getInstance();
registry.register(new CISAPlugin());
registry.register(new CoordinatorTriagePlugin());
registry.register(new CoordinatorPublicationPlugin());
registry.register(new SupplierPlugin());
registry.register(new DeployerPlugin());
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
  ExploitationStatus as CISAExploitationStatus,
  AutomatableStatus as CISAAutomatableStatus,
  TechnicalImpactLevel as CISATechnicalImpactLevel,
  MissionWellbeingImpactLevel as CISAMissionWellbeingImpactLevel,
  DecisionCisa,
  OutcomeCisa
} from './plugins/cisa-generated';

export {
  ReportPublicStatus,
  SupplierContactedStatus,
  ReportCredibilityLevel,
  SupplierCardinalityLevel,
  UtilityLevel as CoordinatorUtilityLevel,
  PublicSafetyImpactLevel,
  DecisionCoordinatorTriage,
  OutcomeCoordinatorTriage
} from './plugins/coordinator_triage-generated';

export {
  SupplierInvolvementLevel,
  ExploitationStatus as PublicationExploitationStatus,
  PublicValueAddedLevel,
  DecisionCoordinatorPublication,
  OutcomeCoordinatorPublication
} from './plugins/coordinator_publication-generated';

export {
  ExploitationStatus as SupplierExploitationStatus,
  UtilityLevel as SupplierUtilityLevel,
  TechnicalImpactLevel as SupplierTechnicalImpactLevel,
  PublicSafetyImpactLevel as SupplierPublicSafetyImpactLevel,
  DecisionSupplier,
  OutcomeSupplier
} from './plugins/supplier-generated';

export {
  ExploitationStatus as DeployerExploitationStatus,
  SystemExposureLevel,
  UtilityLevel as DeployerUtilityLevel,
  HumanImpactLevel,
  DecisionDeployer,
  OutcomeDeployer
} from './plugins/deployer-generated';

export {
  ExploitationStatus as AILLMExploitationStatus,
  StakeholderRole,
  DeployerAttackVector,
  ApplicationAttackVector,
  UserAttackVector,
  DecisionAiLlmTriage,
  OutcomeAiLlmTriage
} from './plugins/ai_llm_triage-generated';