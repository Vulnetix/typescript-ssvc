import { CoordinatorTriagePlugin } from './coordinator_triage';
import {
  DecisionCoordinatorTriage,
  OutcomeCoordinatorTriage,
  ReportPublicStatus,
  SupplierContactedStatus,
  ReportCredibilityLevel,
  SupplierCardinalityLevel,
  UtilityLevel,
  PublicSafetyImpactLevel,
  ActionType,
  PriorityLevel
} from './coordinator_triage-generated';

describe('CoordinatorTriagePlugin', () => {
  let plugin: CoordinatorTriagePlugin;
  
  beforeEach(() => {
    plugin = new CoordinatorTriagePlugin();
  });
  
  describe('Basic functionality', () => {
    it('should have correct name and description', () => {
      expect(plugin.name).toBe('Coordinator Triage');
      expect(plugin.description).toBe('CERT/CC Coordinator Triage Decision Model');
    });
    
    it('should create decision with valid parameters', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      expect(decision).toBeDefined();
      const outcome = decision.evaluate();
      expect(outcome).toBeDefined();
    });
    
    it('should handle mixed parameter formats', () => {
      const decision = plugin.createDecision({
        reportPublicStatus: 'yes',
        supplierContactedStatus: 'yes',
        reportCredibilityLevel: 'credible',
        supplierCardinalityLevel: 'one',
        utilityLevel: 'efficient',
        publicSafetyImpactLevel: 'minimal'
      });
      
      expect(decision).toBeDefined();
      const outcome = decision.evaluate();
      expect(outcome).toBeDefined();
    });
    
    it('should evaluate and return coordinate action', () => {
      const outcome = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const result = outcome.evaluate();
      expect(result.action).toBe('COORDINATE');
      expect(result.priority).toBe('HIGH');
    });
    
    it('should evaluate and return decline action', () => {
      const outcome = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'not_credible',
        supplier_cardinality: 'one',
        utility: 'laborious',
        public_safety_impact: 'minimal'
      });
      
      const result = outcome.evaluate();
      expect(result.action).toBe('DECLINE');
      expect(result.priority).toBe('LOW');
    });
  });
  
  describe('Decision tree logic - comprehensive coverage', () => {
    it('should handle all coordinate paths', () => {
      const coordinateCases = [
        // Report public=yes, supplier contacted=yes, credible, multiple suppliers, super_effective utility
        { 
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=yes, supplier contacted=no, credible, multiple suppliers, super_effective utility
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=no, supplier contacted=yes, credible, multiple suppliers, super_effective utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=no, supplier contacted=yes, credible, multiple suppliers, laborious utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=no, supplier contacted=yes, credible, one supplier, laborious utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=no, supplier contacted=yes, not_credible, multiple suppliers, super_effective utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        // Report public=no, supplier contacted=no, credible, multiple suppliers, super_effective utility
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        }
      ];

      coordinateCases.forEach(({ params, expected }) => {
        const outcome = plugin.createDecision(params);
        const result = outcome.evaluate();
        expect(result.action).toBe(expected.action);
        expect(result.priority).toBe(expected.priority);
      });
    });

    it('should handle all track paths', () => {
      const trackCases = [
        // Report public=yes, supplier contacted=yes, credible, multiple suppliers, super_effective, minimal impact
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=yes, supplier contacted=yes, credible, multiple suppliers, efficient utility
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=yes, supplier contacted=yes, credible, one supplier, super_effective utility
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=yes, supplier contacted=no, credible, multiple suppliers, super_effective, minimal impact
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=no, supplier contacted=yes, credible, multiple suppliers, super_effective, minimal impact
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=no, supplier contacted=yes, credible, multiple suppliers, efficient utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=no, supplier contacted=yes, credible, one supplier, super_effective utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=no, supplier contacted=yes, credible, one supplier, efficient utility
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        },
        // Report public=no, supplier contacted=no, credible, multiple suppliers, super_effective, minimal impact
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'TRACK', priority: 'MEDIUM' }
        }
      ];

      trackCases.forEach(({ params, expected }) => {
        const outcome = plugin.createDecision(params);
        const result = outcome.evaluate();
        expect(result.action).toBe(expected.action);
        expect(result.priority).toBe(expected.priority);
      });
    });

    it('should handle all decline paths', () => {
      const declineCases = [
        // Report public=yes, supplier contacted=yes, credible, multiple suppliers, efficient, minimal impact
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // All laborious paths for credible reports
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // One supplier paths
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // All not_credible paths for report_public=yes, supplier_contacted=yes
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // More not_credible paths for various combinations
        {
          params: { report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'not_credible', supplier_cardinality: 'one', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // Report public=no, supplier contacted=yes, credible, one supplier, efficient, minimal impact
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // Report public=no, supplier contacted=yes, credible, one supplier, laborious, minimal impact
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'credible', supplier_cardinality: 'one', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // Report public=no, supplier contacted=yes, not_credible, multiple, super_effective, minimal
        {
          params: { report_public: 'no', supplier_contacted: 'yes', report_credibility: 'not_credible', supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        // More paths for complete coverage
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'yes', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'efficient', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'significant' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: { report_public: 'no', supplier_contacted: 'no', report_credibility: 'credible', supplier_cardinality: 'multiple', utility: 'laborious', public_safety_impact: 'minimal' },
          expected: { action: 'DECLINE', priority: 'LOW' }
        }
      ];

      declineCases.forEach(({ params, expected }) => {
        const outcome = plugin.createDecision(params);
        const result = outcome.evaluate();
        expect(result.action).toBe(expected.action);
        expect(result.priority).toBe(expected.priority);
      });
    });
  });
});

describe('DecisionCoordinatorTriage', () => {
  describe('Constructor', () => {
    it('should create instance with enum parameters', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      expect(decision.reportPublic).toBe(ReportPublicStatus.YES);
      expect(decision.supplierContacted).toBe(SupplierContactedStatus.YES);
      expect(decision.reportCredibility).toBe(ReportCredibilityLevel.CREDIBLE);
      expect(decision.supplierCardinality).toBe(SupplierCardinalityLevel.MULTIPLE);
      expect(decision.utility).toBe(UtilityLevel.SUPER_EFFECTIVE);
      expect(decision.publicSafetyImpact).toBe(PublicSafetyImpactLevel.SIGNIFICANT);
    });
    
    it('should auto-evaluate when all parameters are provided', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome?.action).toBe(ActionType.COORDINATE);
      expect(decision.outcome?.priority).toBe(PriorityLevel.HIGH);
    });
    
    it('should handle string parameters', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: 'yes',
        supplierContacted: 'yes',
        reportCredibility: 'credible',
        supplierCardinality: 'one',
        utility: 'efficient',
        publicSafetyImpact: 'minimal'
      });
      
      expect(decision.reportPublic).toBe(ReportPublicStatus.YES);
      expect(decision.supplierContacted).toBe(SupplierContactedStatus.YES);
      expect(decision.reportCredibility).toBe(ReportCredibilityLevel.CREDIBLE);
      expect(decision.supplierCardinality).toBe(SupplierCardinalityLevel.ONE);
      expect(decision.utility).toBe(UtilityLevel.EFFICIENT);
      expect(decision.publicSafetyImpact).toBe(PublicSafetyImpactLevel.MINIMAL);
    });
    
    it('should handle invalid string parameters gracefully', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: 'invalid_value',
        supplierContacted: 'yes',
        reportCredibility: 'credible',
        supplierCardinality: 'one',
        utility: 'efficient',
        publicSafetyImpact: 'minimal'
      });
      
      expect(decision.reportPublic).toBeUndefined();
      expect(decision.supplierContacted).toBe(SupplierContactedStatus.YES);
    });
    
    it('should evaluate correctly', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe(ActionType.COORDINATE);
      expect(outcome.priority).toBe(PriorityLevel.HIGH);
    });
  });

  describe('Vector serialization', () => {
    it('should serialize to vector format', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });

      const vector = decision.toVector();
      expect(vector).toMatch(/^COORD_TRIAGEv1\/RP:Y\/SC:Y\/RC:C\/CA:M\/U:S\/PS:S\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/$/);
    });

    it('should serialize with different parameter combinations', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.NO,
        supplierContacted: SupplierContactedStatus.NO,
        reportCredibility: ReportCredibilityLevel.NOT_CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.ONE,
        utility: UtilityLevel.LABORIOUS,
        publicSafetyImpact: PublicSafetyImpactLevel.MINIMAL
      });

      const vector = decision.toVector();
      expect(vector).toMatch(/^COORD_TRIAGEv1\/RP:N\/SC:N\/RC:N\/CA:O\/U:L\/PS:M\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/$/);
    });

    it('should handle undefined parameters in vector', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: undefined,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.ONE,
        utility: UtilityLevel.EFFICIENT,
        publicSafetyImpact: PublicSafetyImpactLevel.MINIMAL
      });

      const vector = decision.toVector();
      expect(vector).toContain('RP:');
      expect(vector).toContain('SC:Y');
      expect(vector).toContain('RC:C');
    });

    it('should throw error for invalid vector format', () => {
      expect(() => {
        DecisionCoordinatorTriage.fromVector('invalid-vector-format');
      }).toThrow('Invalid vector string format for Coordinator Triage');
    });

    it('should throw error for malformed vector', () => {
      expect(() => {
        DecisionCoordinatorTriage.fromVector('COORD_TRIAGEv1/malformed');
      }).toThrow('Invalid vector string format for Coordinator Triage');
    });
  });
});

describe('Coordinator Triage Enums', () => {
  describe('ReportPublicStatus', () => {
    it('should have correct values', () => {
      expect(ReportPublicStatus.YES).toBe('yes');
      expect(ReportPublicStatus.NO).toBe('no');
    });
    
    it('should have all expected values', () => {
      expect(ReportPublicStatus.YES).toBe('yes');
      expect(ReportPublicStatus.NO).toBe('no');
    });
  });
  
  describe('SupplierContactedStatus', () => {
    it('should have correct values', () => {
      expect(SupplierContactedStatus.YES).toBe('yes');
      expect(SupplierContactedStatus.NO).toBe('no');
    });
    
    it('should have all expected values', () => {
      expect(SupplierContactedStatus.YES).toBe('yes');
      expect(SupplierContactedStatus.NO).toBe('no');
    });
  });
  
  describe('ReportCredibilityLevel', () => {
    it('should have correct values', () => {
      expect(ReportCredibilityLevel.CREDIBLE).toBe('credible');
      expect(ReportCredibilityLevel.NOT_CREDIBLE).toBe('not_credible');
    });
    
    it('should have all expected values', () => {
      expect(ReportCredibilityLevel.CREDIBLE).toBe('credible');
      expect(ReportCredibilityLevel.NOT_CREDIBLE).toBe('not_credible');
    });
  });
  
  describe('SupplierCardinalityLevel', () => {
    it('should have correct values', () => {
      expect(SupplierCardinalityLevel.ONE).toBe('one');
      expect(SupplierCardinalityLevel.MULTIPLE).toBe('multiple');
    });
    
    it('should have all expected values', () => {
      expect(SupplierCardinalityLevel.ONE).toBe('one');
      expect(SupplierCardinalityLevel.MULTIPLE).toBe('multiple');
    });
  });
  
  describe('UtilityLevel', () => {
    it('should have correct values', () => {
      expect(UtilityLevel.LABORIOUS).toBe('laborious');
      expect(UtilityLevel.EFFICIENT).toBe('efficient');
      expect(UtilityLevel.SUPER_EFFECTIVE).toBe('super_effective');
    });
    
    it('should have all expected values', () => {
      expect(UtilityLevel.LABORIOUS).toBe('laborious');
      expect(UtilityLevel.EFFICIENT).toBe('efficient');
      expect(UtilityLevel.SUPER_EFFECTIVE).toBe('super_effective');
    });
  });
  
  describe('PublicSafetyImpactLevel', () => {
    it('should have correct values', () => {
      expect(PublicSafetyImpactLevel.MINIMAL).toBe('minimal');
      expect(PublicSafetyImpactLevel.SIGNIFICANT).toBe('significant');
    });
    
    it('should have all expected values', () => {
      expect(PublicSafetyImpactLevel.MINIMAL).toBe('minimal');
      expect(PublicSafetyImpactLevel.SIGNIFICANT).toBe('significant');
    });
  });
  
  describe('ActionType', () => {
    it('should have correct values', () => {
      expect(ActionType.DECLINE).toBe('DECLINE');
      expect(ActionType.TRACK).toBe('TRACK');
      expect(ActionType.COORDINATE).toBe('COORDINATE');
    });
    
    it('should have all expected values', () => {
      expect(ActionType.DECLINE).toBe('DECLINE');
      expect(ActionType.TRACK).toBe('TRACK');
      expect(ActionType.COORDINATE).toBe('COORDINATE');
    });
  });
  
  describe('PriorityLevel', () => {
    it('should have correct values', () => {
      expect(PriorityLevel.LOW).toBe('LOW');
      expect(PriorityLevel.MEDIUM).toBe('MEDIUM');
      expect(PriorityLevel.HIGH).toBe('HIGH');
    });
    
    it('should have all expected values', () => {
      expect(PriorityLevel.LOW).toBe('LOW');
      expect(PriorityLevel.MEDIUM).toBe('MEDIUM');
      expect(PriorityLevel.HIGH).toBe('HIGH');
    });
  });
});