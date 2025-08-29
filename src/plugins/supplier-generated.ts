/**
 * Supplier Plugin
 * 
 * CERT/CC Supplier Decision Model
 * Generated from YAML configuration.
 */

export enum ExploitationStatus {
  none = "none",
  public_poc = "public_poc",
  active = "active"
}

export enum UtilityLevel {
  laborious = "laborious",
  efficient = "efficient",
  super_effective = "super_effective"
}

export enum TechnicalImpactLevel {
  partial = "partial",
  total = "total"
}

export enum PublicSafetyImpactLevel {
  minimal = "minimal",
  significant = "significant"
}

export enum ActionType {
  defer = "defer",
  scheduled = "scheduled",
  out_of_cycle = "out_of_cycle",
  immediate = "immediate"
}

export enum DecisionPriorityLevel {
  low = "low",
  medium = "medium",
  high = "high",
  immediate = "immediate"
}

export const priorityMap = {
  [ActionType.defer]: DecisionPriorityLevel.low,
  [ActionType.scheduled]: DecisionPriorityLevel.medium,
  [ActionType.out_of_cycle]: DecisionPriorityLevel.high,
  [ActionType.immediate]: DecisionPriorityLevel.immediate
};

export class OutcomeSupplier {
  priority: string;
  action: string;

  constructor(action: any) {
    this.priority = (priorityMap as any)[action];
    this.action = action;
  }
}

interface DecisionSupplierOptions {
  exploitation?: ExploitationStatus | string;
  utility?: UtilityLevel | string;
  technicalImpact?: TechnicalImpactLevel | string;
  publicSafetyImpact?: PublicSafetyImpactLevel | string;
}

export class DecisionSupplier {
  exploitation?: ExploitationStatus;
  utility?: UtilityLevel;
  technicalImpact?: TechnicalImpactLevel;
  publicSafetyImpact?: PublicSafetyImpactLevel;
  outcome?: OutcomeSupplier;

  constructor(options: DecisionSupplierOptions = {}) {
    if (typeof options.exploitation === 'string') {
      this.exploitation = Object.values(ExploitationStatus).find(v => v === options.exploitation) as ExploitationStatus || undefined;
    } else {
      this.exploitation = options.exploitation;
    }
    if (typeof options.utility === 'string') {
      this.utility = Object.values(UtilityLevel).find(v => v === options.utility) as UtilityLevel || undefined;
    } else {
      this.utility = options.utility;
    }
    if (typeof options.technicalImpact === 'string') {
      this.technicalImpact = Object.values(TechnicalImpactLevel).find(v => v === options.technicalImpact) as TechnicalImpactLevel || undefined;
    } else {
      this.technicalImpact = options.technicalImpact;
    }
    if (typeof options.publicSafetyImpact === 'string') {
      this.publicSafetyImpact = Object.values(PublicSafetyImpactLevel).find(v => v === options.publicSafetyImpact) as PublicSafetyImpactLevel || undefined;
    } else {
      this.publicSafetyImpact = options.publicSafetyImpact;
    }
    
    // Always try to evaluate if we have the minimum required parameters
    if (this.exploitation !== undefined && this.utility !== undefined && this.technicalImpact !== undefined && this.publicSafetyImpact !== undefined) {
      this.outcome = this.evaluate();
    }
  }

  evaluate(): OutcomeSupplier {
    const action = this.traverseTree();
    this.outcome = new OutcomeSupplier(action);
    return this.outcome;
  }

  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
    
    // Active exploitation scenarios
    if (this.exploitation === ExploitationStatus.active) {
      // Active, Super Effective, Total, Significant = immediate
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Active, Super Effective, Total, Minimal = immediate
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.immediate;
      }
      
      // Active, Super Effective, Partial, Significant = immediate
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Active, Super Effective, Partial, Minimal = out_of_cycle
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.out_of_cycle;
      }
      
      // Active, Efficient, Total, Significant = immediate
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Active, Efficient, Total, Minimal = out_of_cycle
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.out_of_cycle;
      }
      
      // Active, Efficient, Partial, Significant = immediate
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Active, Efficient, Partial, Minimal = out_of_cycle
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.out_of_cycle;
      }
      
      // Active, Laborious, Total, Significant = immediate
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Active, Laborious, Total, Minimal = out_of_cycle
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.out_of_cycle;
      }
      
      // Active, Laborious, Partial, Significant = out_of_cycle
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // Active, Laborious, Partial, Minimal = scheduled
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
    }
    
    // Public PoC exploitation scenarios
    if (this.exploitation === ExploitationStatus.public_poc) {
      // Public PoC, Super Effective, Total, Significant = immediate
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.immediate;
      }
      
      // Public PoC, Super Effective, Total, Minimal = out_of_cycle
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Super Effective, Partial, Significant = out_of_cycle
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Super Effective, Partial, Minimal = scheduled
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Efficient, Total, Significant = out_of_cycle
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Efficient, Total, Minimal = scheduled
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Efficient, Partial, Significant = out_of_cycle
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Efficient, Partial, Minimal = scheduled
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Laborious, Total, Significant = out_of_cycle
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Laborious, Total, Minimal = scheduled
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Laborious, Partial, Significant = scheduled
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Laborious, Partial, Minimal = defer
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.defer;
      }
    }
    
    // None exploitation scenarios
    if (this.exploitation === ExploitationStatus.none) {
      // None, Super Effective, Total, Significant = out_of_cycle
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.out_of_cycle;
      }
      
      // None, Super Effective, Total, Minimal = scheduled
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // None, Super Effective, Partial, Significant = scheduled
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // None, Super Effective, Partial, Minimal = defer
      if (this.utility === UtilityLevel.super_effective && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.defer;
      }
      
      // None, Efficient, Total, Significant = scheduled
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // None, Efficient, Total, Minimal = scheduled
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.scheduled;
      }
      
      // None, Efficient, Partial, Significant = scheduled
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // None, Efficient, Partial, Minimal = defer
      if (this.utility === UtilityLevel.efficient && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.defer;
      }
      
      // None, Laborious, Total, Significant = scheduled
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // None, Laborious, Total, Minimal = defer
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.total && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.defer;
      }
      
      // None, Laborious, Partial, Significant = scheduled
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.significant) {
        return ActionType.scheduled;
      }
      
      // None, Laborious, Partial, Minimal = defer
      if (this.utility === UtilityLevel.laborious && 
          this.technicalImpact === TechnicalImpactLevel.partial && 
          this.publicSafetyImpact === PublicSafetyImpactLevel.minimal) {
        return ActionType.defer;
      }
    }
    
    // Default action for unmapped paths
    return ActionType.defer;
  }
}