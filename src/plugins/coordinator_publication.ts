import { SSVCPlugin, SSVCDecision } from '../core';
import {
  DecisionCoordinatorPublication,
  SupplierInvolvementLevel,
  ExploitationStatus,
  PublicValueAddedLevel
} from './coordinator_publication-generated';

export class CoordinatorPublicationPlugin extends SSVCPlugin {
  readonly name = 'Coordinator Publication';
  readonly description = 'CERT/CC Coordinator Publication Decision Model';
  readonly version = '1.0';

  createDecision(options: Record<string, any> = {}): SSVCDecision {
    // Map parameter names to handle different naming conventions
    const params: Record<string, any> = {};

    // Map supplier involvement
    if (options.supplier_involvement !== undefined) {
      params.supplierInvolvement = this.convertToEnum(
        options.supplier_involvement,
        SupplierInvolvementLevel
      );
    } else if (options.supplierInvolvementLevel !== undefined) {
      params.supplierInvolvement = this.convertToEnum(
        options.supplierInvolvementLevel,
        SupplierInvolvementLevel
      );
    }

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

    // Map public value added
    if (options.public_value_added !== undefined) {
      params.publicValueAdded = this.convertToEnum(
        options.public_value_added,
        PublicValueAddedLevel
      );
    } else if (options.publicValueAddedLevel !== undefined) {
      params.publicValueAdded = this.convertToEnum(
        options.publicValueAddedLevel,
        PublicValueAddedLevel
      );
    }

    return new DecisionCoordinatorPublication(params);
  }
  
  fromVector(vectorString: string): SSVCDecision {
    return DecisionCoordinatorPublication.fromVector(vectorString);
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