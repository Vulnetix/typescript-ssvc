/**
 * Coordinator Triage Plugin
 * 
 * CERT/CC Coordinator Triage Decision Model
 * Generated from YAML configuration.
 */

export enum ReportPublicStatus {
  YES = "yes",
  NO = "no"
}

export enum SupplierContactedStatus {
  YES = "yes",
  NO = "no"
}

export enum ReportCredibilityLevel {
  CREDIBLE = "credible",
  NOT_CREDIBLE = "not_credible"
}

export enum SupplierCardinalityLevel {
  ONE = "one",
  MULTIPLE = "multiple"
}

export enum SupplierEngagementLevel {
  ACTIVE = "active",
  UNRESPONSIVE = "unresponsive"
}

export enum UtilityLevel {
  LABORIOUS = "laborious",
  EFFICIENT = "efficient",
  SUPER_EFFECTIVE = "super_effective"
}

export enum PublicSafetyImpactLevel {
  MINIMAL = "minimal",
  SIGNIFICANT = "significant"
}

export enum ActionType {
  DECLINE = "decline",
  TRACK = "track",
  COORDINATE = "coordinate"
}

export enum DecisionPriorityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

export const priorityMap = {
  [ActionType.DECLINE]: DecisionPriorityLevel.LOW,
  [ActionType.TRACK]: DecisionPriorityLevel.MEDIUM,
  [ActionType.COORDINATE]: DecisionPriorityLevel.HIGH
};

export class OutcomeCoordinatorTriage {
  priority: string;
  action: string;

  constructor(action: any) {
    this.priority = (priorityMap as any)[action];
    this.action = action;
  }
}

interface DecisionCoordinatorTriageOptions {
  reportPublic?: ReportPublicStatus | string;
  supplierContacted?: SupplierContactedStatus | string;
  reportCredibility?: ReportCredibilityLevel | string;
  supplierCardinality?: SupplierCardinalityLevel | string;
  supplierEngagement?: SupplierEngagementLevel | string;
  utility?: UtilityLevel | string;
  publicSafetyImpact?: PublicSafetyImpactLevel | string;
}

export class DecisionCoordinatorTriage {
  reportPublic?: ReportPublicStatus;
  supplierContacted?: SupplierContactedStatus;
  reportCredibility?: ReportCredibilityLevel;
  supplierCardinality?: SupplierCardinalityLevel;
  supplierEngagement?: SupplierEngagementLevel;
  utility?: UtilityLevel;
  publicSafetyImpact?: PublicSafetyImpactLevel;
  outcome?: OutcomeCoordinatorTriage;

  constructor(options: DecisionCoordinatorTriageOptions = {}) {
    if (typeof options.reportPublic === 'string') {
      this.reportPublic = Object.values(ReportPublicStatus).find(v => v === options.reportPublic) as ReportPublicStatus || undefined;
    } else {
      this.reportPublic = options.reportPublic;
    }
    if (typeof options.supplierContacted === 'string') {
      this.supplierContacted = Object.values(SupplierContactedStatus).find(v => v === options.supplierContacted) as SupplierContactedStatus || undefined;
    } else {
      this.supplierContacted = options.supplierContacted;
    }
    if (typeof options.reportCredibility === 'string') {
      this.reportCredibility = Object.values(ReportCredibilityLevel).find(v => v === options.reportCredibility) as ReportCredibilityLevel || undefined;
    } else {
      this.reportCredibility = options.reportCredibility;
    }
    if (typeof options.supplierCardinality === 'string') {
      this.supplierCardinality = Object.values(SupplierCardinalityLevel).find(v => v === options.supplierCardinality) as SupplierCardinalityLevel || undefined;
    } else {
      this.supplierCardinality = options.supplierCardinality;
    }
    if (typeof options.supplierEngagement === 'string') {
      this.supplierEngagement = Object.values(SupplierEngagementLevel).find(v => v === options.supplierEngagement) as SupplierEngagementLevel || undefined;
    } else {
      this.supplierEngagement = options.supplierEngagement;
    }
    if (typeof options.utility === 'string') {
      this.utility = Object.values(UtilityLevel).find(v => v === options.utility) as UtilityLevel || undefined;
    } else {
      this.utility = options.utility;
    }
    if (typeof options.publicSafetyImpact === 'string') {
      this.publicSafetyImpact = Object.values(PublicSafetyImpactLevel).find(v => v === options.publicSafetyImpact) as PublicSafetyImpactLevel || undefined;
    } else {
      this.publicSafetyImpact = options.publicSafetyImpact;
    }
    
    // Always try to evaluate if we have the minimum required parameters
    if (this.reportPublic !== undefined && this.supplierContacted !== undefined && this.reportCredibility !== undefined && this.supplierCardinality !== undefined && this.supplierEngagement !== undefined && this.utility !== undefined && this.publicSafetyImpact !== undefined) {
      this.outcome = this.evaluate();
    }
  }

  evaluate(): OutcomeCoordinatorTriage {
    const action = this.traverseTree();
    this.outcome = new OutcomeCoordinatorTriage(action);
    return this.outcome;
  }

  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
    if (this.reportPublic === ReportPublicStatus.YES) {
      if (this.supplierContacted === SupplierContactedStatus.YES) {
        if (this.reportCredibility === ReportCredibilityLevel.CREDIBLE) {
          if (this.supplierCardinality === SupplierCardinalityLevel.MULTIPLE) {
            if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
              if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                return ActionType.COORDINATE;
              }
              else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                return ActionType.TRACK;
              }
            }
            else if (this.utility === UtilityLevel.EFFICIENT) {
              if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                return ActionType.TRACK;
              }
              else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                return ActionType.DECLINE;
              }
            }
            else if (this.utility === UtilityLevel.LABORIOUS) {
              return ActionType.DECLINE;
            }
          }
          else if (this.supplierCardinality === SupplierCardinalityLevel.ONE) {
            if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
              if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                return ActionType.TRACK;
              }
              else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                return ActionType.DECLINE;
              }
            }
            else if (this.utility === UtilityLevel.EFFICIENT) {
              return ActionType.DECLINE;
            }
            else if (this.utility === UtilityLevel.LABORIOUS) {
              return ActionType.DECLINE;
            }
          }
        }
        else if (this.reportCredibility === ReportCredibilityLevel.NOT_CREDIBLE) {
          return ActionType.DECLINE;
        }
      }
      else if (this.supplierContacted === SupplierContactedStatus.NO) {
        if (this.supplierCardinality === SupplierCardinalityLevel.MULTIPLE) {
          if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
            if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
              return ActionType.COORDINATE;
            }
            else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
              return ActionType.TRACK;
            }
          }
          else if (this.utility === UtilityLevel.EFFICIENT) {
            return ActionType.DECLINE;
          }
          else if (this.utility === UtilityLevel.LABORIOUS) {
            return ActionType.DECLINE;
          }
        }
        else if (this.supplierCardinality === SupplierCardinalityLevel.ONE) {
          return ActionType.DECLINE;
        }
      }
    }
    else if (this.reportPublic === ReportPublicStatus.NO) {
      if (this.supplierContacted === SupplierContactedStatus.YES) {
        if (this.reportCredibility === ReportCredibilityLevel.CREDIBLE) {
          if (this.supplierCardinality === SupplierCardinalityLevel.MULTIPLE) {
            if (this.supplierEngagement === SupplierEngagementLevel.ACTIVE) {
              if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
                if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                  return ActionType.COORDINATE;
                }
                else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                  return ActionType.TRACK;
                }
              }
              else if (this.utility === UtilityLevel.EFFICIENT) {
                if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                  return ActionType.TRACK;
                }
                else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                  return ActionType.TRACK;
                }
              }
              else if (this.utility === UtilityLevel.LABORIOUS) {
                return ActionType.TRACK;
              }
            }
            else if (this.supplierEngagement === SupplierEngagementLevel.UNRESPONSIVE) {
              if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
                if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                  return ActionType.COORDINATE;
                }
                else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                  return ActionType.TRACK;
                }
              }
              else if (this.utility === UtilityLevel.EFFICIENT) {
                return ActionType.TRACK;
              }
              else if (this.utility === UtilityLevel.LABORIOUS) {
                return ActionType.DECLINE;
              }
            }
          }
          else if (this.supplierCardinality === SupplierCardinalityLevel.ONE) {
            if (this.supplierEngagement === SupplierEngagementLevel.ACTIVE) {
              if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
                if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
                  return ActionType.TRACK;
                }
                else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
                  return ActionType.TRACK;
                }
              }
              else if (this.utility === UtilityLevel.EFFICIENT) {
                return ActionType.TRACK;
              }
              else if (this.utility === UtilityLevel.LABORIOUS) {
                return ActionType.DECLINE;
              }
            }
            else if (this.supplierEngagement === SupplierEngagementLevel.UNRESPONSIVE) {
              return ActionType.DECLINE;
            }
          }
        }
        else if (this.reportCredibility === ReportCredibilityLevel.NOT_CREDIBLE) {
          return ActionType.DECLINE;
        }
      }
      else if (this.supplierContacted === SupplierContactedStatus.NO) {
        if (this.supplierCardinality === SupplierCardinalityLevel.MULTIPLE) {
          if (this.utility === UtilityLevel.SUPER_EFFECTIVE) {
            if (this.publicSafetyImpact === PublicSafetyImpactLevel.SIGNIFICANT) {
              return ActionType.COORDINATE;
            }
            else if (this.publicSafetyImpact === PublicSafetyImpactLevel.MINIMAL) {
              return ActionType.TRACK;
            }
          }
          else if (this.utility === UtilityLevel.EFFICIENT) {
            return ActionType.DECLINE;
          }
          else if (this.utility === UtilityLevel.LABORIOUS) {
            return ActionType.DECLINE;
          }
        }
        else if (this.supplierCardinality === SupplierCardinalityLevel.ONE) {
          return ActionType.DECLINE;
        }
      }
    }
    
    // Default action for unmapped paths
    return ActionType.DECLINE;
  }
}
