/**
 * Coordinator Publication Plugin
 * 
 * CERT/CC Coordinator Publication Decision Model
 * Generated from YAML configuration.
 */

export enum SupplierInvolvementLevel {
  fix_ready = "fix_ready",
  cooperative = "cooperative",
  uncooperative_unresponsive = "uncooperative_unresponsive"
}

export enum ExploitationStatus {
  none = "none",
  public_poc = "public_poc",
  active = "active"
}

export enum PublicValueAddedLevel {
  limited = "limited",
  ampliative = "ampliative",
  precedence = "precedence"
}

export enum ActionType {
  publish = "publish",
  dont_publish = "dont_publish"
}

export enum DecisionPriorityLevel {
  low = "low",
  high = "high"
}

export const priorityMap = {
  [ActionType.publish]: DecisionPriorityLevel.high,
  [ActionType.dont_publish]: DecisionPriorityLevel.low
};

export class OutcomeCoordinatorPublication {
  priority: string;
  action: string;

  constructor(action: any) {
    this.priority = (priorityMap as any)[action];
    this.action = action;
  }
}

interface DecisionCoordinatorPublicationOptions {
  supplierInvolvement?: SupplierInvolvementLevel | string;
  exploitation?: ExploitationStatus | string;
  publicValueAdded?: PublicValueAddedLevel | string;
}

export class DecisionCoordinatorPublication {
  supplierInvolvement?: SupplierInvolvementLevel;
  exploitation?: ExploitationStatus;
  publicValueAdded?: PublicValueAddedLevel;
  outcome?: OutcomeCoordinatorPublication;

  constructor(options: DecisionCoordinatorPublicationOptions = {}) {
    if (typeof options.supplierInvolvement === 'string') {
      this.supplierInvolvement = Object.values(SupplierInvolvementLevel).find(v => v === options.supplierInvolvement) as SupplierInvolvementLevel || undefined;
    } else {
      this.supplierInvolvement = options.supplierInvolvement;
    }
    if (typeof options.exploitation === 'string') {
      this.exploitation = Object.values(ExploitationStatus).find(v => v === options.exploitation) as ExploitationStatus || undefined;
    } else {
      this.exploitation = options.exploitation;
    }
    if (typeof options.publicValueAdded === 'string') {
      this.publicValueAdded = Object.values(PublicValueAddedLevel).find(v => v === options.publicValueAdded) as PublicValueAddedLevel || undefined;
    } else {
      this.publicValueAdded = options.publicValueAdded;
    }
    
    // Always try to evaluate if we have the minimum required parameters
    if (this.supplierInvolvement !== undefined && this.exploitation !== undefined && this.publicValueAdded !== undefined) {
      this.outcome = this.evaluate();
    }
  }

  evaluate(): OutcomeCoordinatorPublication {
    const action = this.traverseTree();
    this.outcome = new OutcomeCoordinatorPublication(action);
    return this.outcome;
  }

  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
    
    // Uncooperative/Unresponsive supplier scenarios
    if (this.supplierInvolvement === SupplierInvolvementLevel.uncooperative_unresponsive) {
      // Active exploitation always leads to publish
      if (this.exploitation === ExploitationStatus.active) {
        return ActionType.publish;
      }
      
      // Public PoC with any value added level leads to publish
      if (this.exploitation === ExploitationStatus.public_poc) {
        return ActionType.publish;
      }
      
      // None exploitation with precedence value added leads to publish
      if (this.exploitation === ExploitationStatus.none && 
          this.publicValueAdded === PublicValueAddedLevel.precedence) {
        return ActionType.publish;
      }
      
      // None or Public PoC with limited or ampliative value added leads to dont_publish
      if ((this.exploitation === ExploitationStatus.none || this.exploitation === ExploitationStatus.public_poc) &&
          (this.publicValueAdded === PublicValueAddedLevel.limited || this.publicValueAdded === PublicValueAddedLevel.ampliative)) {
        return ActionType.dont_publish;
      }
    }
    
    // Cooperative supplier scenarios
    if (this.supplierInvolvement === SupplierInvolvementLevel.cooperative) {
      // Active exploitation always leads to publish
      if (this.exploitation === ExploitationStatus.active) {
        return ActionType.publish;
      }
      
      // None exploitation with precedence value added leads to publish
      if (this.exploitation === ExploitationStatus.none && 
          this.publicValueAdded === PublicValueAddedLevel.precedence) {
        return ActionType.publish;
      }
      
      // Public PoC with ampliative or precedence value added leads to publish
      if (this.exploitation === ExploitationStatus.public_poc && 
          (this.publicValueAdded === PublicValueAddedLevel.ampliative || this.publicValueAdded === PublicValueAddedLevel.precedence)) {
        return ActionType.publish;
      }
      
      // Other combinations lead to dont_publish
      return ActionType.dont_publish;
    }
    
    // Fix Ready supplier scenarios
    if (this.supplierInvolvement === SupplierInvolvementLevel.fix_ready) {
      // Active exploitation always leads to publish
      if (this.exploitation === ExploitationStatus.active) {
        return ActionType.publish;
      }
      
      // Any exploitation with ampliative or precedence value added leads to publish
      if ((this.publicValueAdded === PublicValueAddedLevel.ampliative || this.publicValueAdded === PublicValueAddedLevel.precedence)) {
        return ActionType.publish;
      }
      
      // None or Public PoC with limited value added leads to dont_publish
      if ((this.exploitation === ExploitationStatus.none || this.exploitation === ExploitationStatus.public_poc) &&
          this.publicValueAdded === PublicValueAddedLevel.limited) {
        return ActionType.dont_publish;
      }
    }
    
    // Default action for unmapped paths
    return ActionType.dont_publish;
  }
}