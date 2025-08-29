import { SSVCPlugin, SSVCDecision } from '../core';
import {
  DecisionDeployer,
  ExploitationStatus,
  SystemExposureLevel,
  UtilityLevel,
  HumanImpactLevel
} from './deployer-generated';

export class DeployerPlugin extends SSVCPlugin {
  readonly name = 'Deployer';
  readonly description = 'CERT/CC Deployer Decision Model';
  readonly version = '1.0';

  createDecision(options: Record<string, any> = {}): SSVCDecision {
    // Map parameter names to handle different naming conventions
    const params: Record<string, any> = {};

    // Map exploitation
    if (options.exploitation !== undefined) {
      params.exploitation = this.convertToEnum(
        options.exploitation,
        ExploitationStatus
      );
    } else if (options.exploitationStatus !== undefined) {
      params.exploitation = this.convertToEnum(
        options.exploitationStatus,
        ExploitationStatus
      );
    }

    // Map system exposure
    if (options.system_exposure !== undefined) {
      params.systemExposure = this.convertToEnum(
        options.system_exposure,
        SystemExposureLevel
      );
    } else if (options.systemExposureLevel !== undefined) {
      params.systemExposure = this.convertToEnum(
        options.systemExposureLevel,
        SystemExposureLevel
      );
    }

    // Map utility
    if (options.utility !== undefined) {
      params.utility = this.convertToEnum(
        options.utility,
        UtilityLevel
      );
    } else if (options.utilityLevel !== undefined) {
      params.utility = this.convertToEnum(
        options.utilityLevel,
        UtilityLevel
      );
    }

    // Map human impact
    if (options.human_impact !== undefined) {
      params.humanImpact = this.convertToEnum(
        options.human_impact,
        HumanImpactLevel
      );
    } else if (options.humanImpactLevel !== undefined) {
      params.humanImpact = this.convertToEnum(
        options.humanImpactLevel,
        HumanImpactLevel
      );
    }

    return new DecisionDeployer(params);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    return DecisionDeployer.fromVector(vectorString);
  }

  private convertToEnum<T extends Record<string, string>>(
    value: any,
    enumObject: T
  ): T[keyof T] | undefined {
    if (value === undefined || value === null) return undefined;
    
    // If it's already an enum value, return it
    if (Object.values(enumObject).includes(value)) {
      return value;
    }
    
    // Convert string to enum value (case insensitive)
    const stringValue = String(value).toLowerCase();
    const enumKey = Object.keys(enumObject).find(key => 
      enumObject[key as keyof T].toLowerCase() === stringValue
    );
    
    return enumKey ? enumObject[enumKey as keyof T] : undefined;
  }
}