import { SSVCPlugin, SSVCDecision } from '../core';
import {
  DecisionSupplier,
  ExploitationStatus,
  UtilityLevel,
  TechnicalImpactLevel,
  PublicSafetyImpactLevel
} from './supplier-generated';

export class SupplierPlugin extends SSVCPlugin {
  readonly name = 'Supplier';
  readonly description = 'CERT/CC Supplier Decision Model';
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

    // Map technical impact
    if (options.technical_impact !== undefined) {
      params.technicalImpact = this.convertToEnum(
        options.technical_impact,
        TechnicalImpactLevel
      );
    } else if (options.technicalImpactLevel !== undefined) {
      params.technicalImpact = this.convertToEnum(
        options.technicalImpactLevel,
        TechnicalImpactLevel
      );
    }

    // Map public safety impact
    if (options.public_safety_impact !== undefined) {
      params.publicSafetyImpact = this.convertToEnum(
        options.public_safety_impact,
        PublicSafetyImpactLevel
      );
    } else if (options.publicSafetyImpactLevel !== undefined) {
      params.publicSafetyImpact = this.convertToEnum(
        options.publicSafetyImpactLevel,
        PublicSafetyImpactLevel
      );
    }

    return new DecisionSupplier(params);
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