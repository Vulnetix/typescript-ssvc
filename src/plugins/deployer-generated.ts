/**
 * Deployer Plugin
 * 
 * CERT/CC Deployer Decision Model
 * Generated from YAML configuration.
 */

export enum ExploitationStatus {
  none = "none",
  public_poc = "public_poc",
  active = "active"
}

export enum SystemExposureLevel {
  small = "small",
  controlled = "controlled",
  open = "open"
}

export enum UtilityLevel {
  laborious = "laborious",
  efficient = "efficient",
  super_effective = "super_effective"
}

export enum HumanImpactLevel {
  low = "low",
  medium = "medium",
  high = "high",
  very_high = "very_high"
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

export class OutcomeDeployer {
  priority: string;
  action: string;

  constructor(action: any) {
    this.priority = (priorityMap as any)[action];
    this.action = action;
  }
}

interface DecisionDeployerOptions {
  exploitation?: ExploitationStatus | string;
  systemExposure?: SystemExposureLevel | string;
  utility?: UtilityLevel | string;
  humanImpact?: HumanImpactLevel | string;
}

export class DecisionDeployer {
  exploitation?: ExploitationStatus;
  systemExposure?: SystemExposureLevel;
  utility?: UtilityLevel;
  humanImpact?: HumanImpactLevel;
  outcome?: OutcomeDeployer;

  constructor(options: DecisionDeployerOptions = {}) {
    if (typeof options.exploitation === 'string') {
      this.exploitation = Object.values(ExploitationStatus).find(v => v === options.exploitation) as ExploitationStatus || undefined;
    } else {
      this.exploitation = options.exploitation;
    }
    if (typeof options.systemExposure === 'string') {
      this.systemExposure = Object.values(SystemExposureLevel).find(v => v === options.systemExposure) as SystemExposureLevel || undefined;
    } else {
      this.systemExposure = options.systemExposure;
    }
    if (typeof options.utility === 'string') {
      this.utility = Object.values(UtilityLevel).find(v => v === options.utility) as UtilityLevel || undefined;
    } else {
      this.utility = options.utility;
    }
    if (typeof options.humanImpact === 'string') {
      this.humanImpact = Object.values(HumanImpactLevel).find(v => v === options.humanImpact) as HumanImpactLevel || undefined;
    } else {
      this.humanImpact = options.humanImpact;
    }
    
    // Always try to evaluate if we have the minimum required parameters
    if (this.exploitation !== undefined && this.systemExposure !== undefined && this.utility !== undefined && this.humanImpact !== undefined) {
      this.outcome = this.evaluate();
    }
  }

  evaluate(): OutcomeDeployer {
    const action = this.traverseTree();
    this.outcome = new OutcomeDeployer(action);
    return this.outcome;
  }

  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
    // Handle Active exploitation scenarios
    if (this.exploitation === ExploitationStatus.active) {
      // Active exploitation with any open system and super effective utility = immediate
      if (this.systemExposure === SystemExposureLevel.open && this.utility === UtilityLevel.super_effective) {
        return ActionType.immediate;
      }
      
      // Active exploitation with high/very high human impact = immediate
      if (this.humanImpact === HumanImpactLevel.high || this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Most other active exploitation scenarios default to out_of_cycle or immediate
      return ActionType.out_of_cycle;
    }
    
    // Handle Public PoC exploitation scenarios
    if (this.exploitation === ExploitationStatus.public_poc) {
      // Public PoC, Open, Super Effective, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Open, Super Effective, High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Open, Efficient, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Open, Efficient, High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Controlled, Super Effective, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Controlled, Super Effective, High = immediate
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Controlled, Efficient, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Small, Super Effective, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Public PoC, Open, Super Effective, Medium = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.immediate;
      }
      
      // Public PoC, Open, Super Effective, Low = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Open, Efficient, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Controlled, Super Effective, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Controlled, Super Effective, Low = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Controlled, Efficient, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Controlled, Efficient, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Controlled, Laborious, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Super Effective, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Super Effective, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Efficient, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Efficient, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Efficient, Low = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Small, Laborious, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // Public PoC, Small, Laborious, High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Small, Laborious, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Controlled, Laborious, High = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Controlled, Laborious, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Controlled, Efficient, Low = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Small, Efficient, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Small, Super Effective, Low = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.scheduled;
      }
      
      // Public PoC, Controlled, Laborious, Low = defer
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // Public PoC, Small, Laborious, Low = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // Special case: Public PoC, Open, Laborious, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // Special case: Public PoC, Open, Laborious, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // Special case: Public PoC, Open, Laborious, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
    }
    
    // Handle None exploitation scenarios
    if (this.exploitation === ExploitationStatus.none) {
      // None, Open, Super Effective, Very High = immediate
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.immediate;
      }
      
      // None, Open, Super Effective, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Open, Super Effective, Medium = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.out_of_cycle;
      }
      
      // None, Open, Super Effective, Low = scheduled
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.scheduled;
      }
      
      // None, Open, Efficient, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Open, Efficient, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Open, Efficient, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // None, Open, Efficient, Low = scheduled
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.scheduled;
      }
      
      // None, Open, Laborious, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Open, Laborious, High = scheduled
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Open, Laborious, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.open && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Super Effective, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Controlled, Super Effective, High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Controlled, Super Effective, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Super Effective, Low = defer
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // None, Controlled, Efficient, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Controlled, Efficient, High = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Efficient, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Efficient, Low = defer
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // None, Controlled, Laborious, Very High = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Laborious, High = scheduled
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Controlled, Laborious, Medium = defer
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.defer;
      }
      
      // None, Controlled, Laborious, Low = defer
      if (this.systemExposure === SystemExposureLevel.controlled && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // None, Small, Super Effective, Very High = out_of_cycle
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.out_of_cycle;
      }
      
      // None, Small, Super Effective, High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Small, Super Effective, Medium = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.scheduled;
      }
      
      // None, Small, Super Effective, Low = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.super_effective && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // None, Small, Efficient, Very High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.scheduled;
      }
      
      // None, Small, Efficient, High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Small, Efficient, Medium = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.defer;
      }
      
      // None, Small, Efficient, Low = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.efficient && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
      
      // None, Small, Laborious, Very High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.very_high) {
        return ActionType.scheduled;
      }
      
      // None, Small, Laborious, High = scheduled
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.high) {
        return ActionType.scheduled;
      }
      
      // None, Small, Laborious, Medium = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.medium) {
        return ActionType.defer;
      }
      
      // None, Small, Laborious, Low = defer
      if (this.systemExposure === SystemExposureLevel.small && 
          this.utility === UtilityLevel.laborious && 
          this.humanImpact === HumanImpactLevel.low) {
        return ActionType.defer;
      }
    }
    
    // Default action for unmapped paths
    return ActionType.defer;
  }
}