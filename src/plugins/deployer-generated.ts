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
  defer = 'defer',
  scheduled = 'scheduled',
  out_of_cycle = 'out_of_cycle',
  immediate = 'immediate'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  IMMEDIATE = 'immediate'
}

export const priorityMap = {
  [ActionType.defer]: PriorityLevel.LOW,
  [ActionType.scheduled]: PriorityLevel.MEDIUM,
  [ActionType.out_of_cycle]: PriorityLevel.HIGH,
  [ActionType.immediate]: PriorityLevel.IMMEDIATE
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

  toVector(): string {
    if (!this.outcome) {
      this.evaluate();
    }
    
    const exploitationVector = {"none":"N","public_poc":"P","active":"A"}[this.exploitation?.toString?.()?.toUpperCase?.() ?? ''] || this.exploitation || '';
    const system_exposureVector = {"small":"S","controlled":"C","open":"O"}[this.systemExposure?.toString?.()?.toUpperCase?.() ?? ''] || this.systemExposure || '';
    const utilityVector = {"laborious":"L","efficient":"E","super_effective":"S"}[this.utility?.toString?.()?.toUpperCase?.() ?? ''] || this.utility || '';
    const human_impactVector = {"low":"L","medium":"M","high":"H","very_high":"V"}[this.humanImpact?.toString?.()?.toUpperCase?.() ?? ''] || this.humanImpact || '';
    const timestamp = new Date().toISOString();
    return `DEPLOYERv1/E:${exploitationVector}/SE:${system_exposureVector}/U:${utilityVector}/HI:${human_impactVector}/${timestamp}/`;
  }

  static fromVector(vectorString: string): DecisionDeployer {
    const regex = /^DEPLOYERv1\/(.+)\/([0-9T:\-\.Z]+)\/?$/;
    const match = vectorString.match(regex);
    
    if (!match) {
      throw new Error(`Invalid vector string format for Deployer: ${vectorString}`);
    }
    
    const paramsString = match[1];
    const params = new Map<string, string>();
    
    const paramPairs = paramsString.split('/');
    for (const pair of paramPairs) {
      const [key, value] = pair.split(':');
      if (key && value !== undefined) {
        params.set(key, value);
      }
    }
    
    const exploitationMatch = params.get('E');
    const system_exposureMatch = params.get('SE');
    const utilityMatch = params.get('U');
    const human_impactMatch = params.get('HI');
    
    return new DecisionDeployer({
      exploitation: {"N":"none","P":"public_poc","A":"active"}[exploitationMatch || ''] || exploitationMatch,
      systemExposure: {"S":"small","C":"controlled","O":"open"}[system_exposureMatch || ''] || system_exposureMatch,
      utility: {"L":"laborious","E":"efficient","S":"super_effective"}[utilityMatch || ''] || utilityMatch,
      humanImpact: {"L":"low","M":"medium","H":"high","V":"very_high"}[human_impactMatch || ''] || human_impactMatch,
    });
  }

  private traverseTree(): any {
    // Traverse the decision tree to determine the outcome
    if (this.exploitation === ExploitationStatus.none) {
      if (this.systemExposure === SystemExposureLevel.small) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.scheduled;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.scheduled;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.controlled) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.scheduled;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.open) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
    }
    else if (this.exploitation === ExploitationStatus.public_poc) {
      if (this.systemExposure === SystemExposureLevel.small) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.defer;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.controlled) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.out_of_cycle;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.open) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
    }
    else if (this.exploitation === ExploitationStatus.active) {
      if (this.systemExposure === SystemExposureLevel.small) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.controlled) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.scheduled;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
      else if (this.systemExposure === SystemExposureLevel.open) {
        if (this.utility === UtilityLevel.laborious) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.efficient) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.out_of_cycle;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
        else if (this.utility === UtilityLevel.super_effective) {
          if (this.humanImpact === HumanImpactLevel.low) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.medium) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.high) {
            return ActionType.immediate;
          }
          else if (this.humanImpact === HumanImpactLevel.very_high) {
            return ActionType.immediate;
          }
        }
      }
    }
    
    // Default action for unmapped paths
    return ActionType.defer;
  }
}
