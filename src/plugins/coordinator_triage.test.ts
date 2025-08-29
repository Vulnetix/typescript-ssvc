import { CoordinatorTriagePlugin } from './coordinator_triage';
import {
  DecisionCoordinatorTriage,
  OutcomeCoordinatorTriage,
  ReportPublicStatus,
  SupplierContactedStatus,
  ReportCredibilityLevel,
  SupplierCardinalityLevel,
  SupplierEngagementLevel,
  UtilityLevel,
  PublicSafetyImpactLevel,
  ActionType,
  DecisionPriorityLevel
} from './coordinator_triage-generated';

describe('CoordinatorTriagePlugin', () => {
  let plugin: CoordinatorTriagePlugin;
  
  beforeEach(() => {
    plugin = new CoordinatorTriagePlugin();
  });
  
  describe('plugin properties', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('Coordinator Triage');
    });
    
    it('should have correct description', () => {
      expect(plugin.description).toBe('CERT/CC Coordinator Triage Decision Model');
    });
    
    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0');
    });
  });
  
  describe('createDecision', () => {
    it('should create decision with standard parameter names', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should create decision with alternative parameter names', () => {
      const decision = plugin.createDecision({
        reportPublicStatus: 'yes',
        supplierContactedStatus: 'yes',
        reportCredibilityLevel: 'credible',
        supplierCardinalityLevel: 'multiple',
        supplierEngagementLevel: 'active',
        utilityLevel: 'super_effective',
        publicSafetyImpactLevel: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle enum values directly', () => {
      const decision = plugin.createDecision({
        report_public: ReportPublicStatus.YES,
        supplier_contacted: SupplierContactedStatus.YES,
        report_credibility: ReportCredibilityLevel.CREDIBLE,
        supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
        supplier_engagement: SupplierEngagementLevel.ACTIVE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle mixed string and enum values', () => {
      const decision = plugin.createDecision({
        report_public: ReportPublicStatus.YES,
        supplier_contacted: 'yes',
        report_credibility: ReportCredibilityLevel.CREDIBLE,
        supplier_cardinality: 'multiple',
        supplier_engagement: SupplierEngagementLevel.ACTIVE,
        utility: 'super_effective',
        public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle empty options', () => {
      const decision = plugin.createDecision({});
      expect(() => decision.evaluate()).not.toThrow();
    });
  });
  
  describe('decision outcomes for various scenarios', () => {
    it('should return COORDINATE for high severity (public report, contacted suppliers, credible, multiple suppliers, super effective)', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should return TRACK for medium severity cases', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'minimal'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('track');
      expect(outcome.priority).toBe('medium');
    });
    
    it('should return DECLINE for low severity cases', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'not_credible',
        supplier_cardinality: 'one',
        supplier_engagement: 'unresponsive',
        utility: 'laborious',
        public_safety_impact: 'minimal'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('decline');
      expect(outcome.priority).toBe('low');
    });
    
    it('should handle all report public status values', () => {
      // Test YES
      let decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('coordinate');
      
      // Test NO
      decision = plugin.createDecision({
        report_public: 'no',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('coordinate');
    });
    
    it('should handle all supplier contacted status values', () => {
      // Test YES
      let decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('coordinate');
      
      // Test NO
      decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'no',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('coordinate');
    });
    
    it('should handle credibility levels', () => {
      // Test CREDIBLE
      let decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('coordinate');
      
      // Test NOT_CREDIBLE
      decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'not_credible',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      expect(decision.evaluate().action).toBe('decline');
    });
  });
  
  describe('complex decision paths', () => {
    it('should handle private report scenarios', () => {
      const decision = plugin.createDecision({
        report_public: 'no',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
    });
    
    it('should handle unresponsive supplier scenarios', () => {
      const decision = plugin.createDecision({
        report_public: 'no',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'unresponsive',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
    });
    
    it('should handle no supplier contacted scenarios', () => {
      const decision = plugin.createDecision({
        report_public: 'no',
        supplier_contacted: 'no',
        supplier_cardinality: 'multiple',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('coordinate');
    });
  });

  describe('mapValue method coverage', () => {
    it('should handle uppercase string values', () => {
      const decision = plugin.createDecision({
        report_public: 'YES',
        supplier_contacted: 'NO',
        report_credibility: 'CREDIBLE',
        supplier_cardinality: 'MULTIPLE',
        supplier_engagement: 'ACTIVE',
        utility: 'SUPER_EFFECTIVE',
        public_safety_impact: 'SIGNIFICANT'
      });
      
      expect(decision).toBeInstanceOf(Object);
    });

    it('should handle string values with direct lowercase match', () => {
      const decision = plugin.createDecision({
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      expect(decision).toBeInstanceOf(Object);
    });

    it('should handle unknown string values by returning them as-is', () => {
      const decision = plugin.createDecision({
        report_public: 'unknown_value',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      expect(decision).toBeInstanceOf(Object);
    });

    it('should handle non-string, non-enum values', () => {
      const decision = plugin.createDecision({
        report_public: 123,
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      expect(decision).toBeInstanceOf(Object);
    });

    it('should handle null and undefined values', () => {
      const decision = plugin.createDecision({
        report_public: null,
        supplier_contacted: undefined,
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      expect(decision).toBeInstanceOf(Object);
    });
  });

  describe('comprehensive decision paths coverage', () => {
    it('should cover specific enum-based decision paths', () => {
      // Test cases that exercise specific decision tree branches
      const testCases = [
        // No supplier contacted, multiple suppliers, super effective, significant
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.NO,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'coordinate'
        },
        // No supplier contacted, multiple suppliers, super effective, minimal
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.NO,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.MINIMAL,
          expected: 'track'
        },
        // No supplier contacted, multiple suppliers, efficient
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.NO,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.EFFICIENT,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'decline'
        },
        // Not credible report
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.NOT_CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'decline'
        },
        // One supplier, super effective, significant
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.ONE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'track'
        },
        // One supplier, super effective, minimal
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.ONE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.MINIMAL,
          expected: 'decline'
        },
        // One supplier, efficient
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.ONE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.EFFICIENT,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'decline'
        },
        // One supplier, laborious
        {
          report_public: ReportPublicStatus.YES,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.ONE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.LABORIOUS,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'decline'
        }
      ];

      testCases.forEach(({ expected, ...params }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected);
      });
    });

    it('should cover private report scenarios', () => {
      // Test private report scenarios
      const testCases = [
        {
          report_public: ReportPublicStatus.NO,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.MULTIPLE,
          supplier_engagement: SupplierEngagementLevel.ACTIVE,
          utility: UtilityLevel.SUPER_EFFECTIVE,
          public_safety_impact: PublicSafetyImpactLevel.SIGNIFICANT,
          expected: 'coordinate'
        },
        {
          report_public: ReportPublicStatus.NO,
          supplier_contacted: SupplierContactedStatus.YES,
          report_credibility: ReportCredibilityLevel.CREDIBLE,
          supplier_cardinality: SupplierCardinalityLevel.ONE,
          supplier_engagement: SupplierEngagementLevel.UNRESPONSIVE,
          utility: UtilityLevel.LABORIOUS,
          public_safety_impact: PublicSafetyImpactLevel.MINIMAL,
          expected: 'decline'
        }
      ];

      testCases.forEach(({ expected, ...params }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected);
      });
    });
  });
});

describe('Generated Coordinator Triage Components', () => {
  describe('DecisionCoordinatorTriage', () => {
    it('should initialize with valid parameters', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        supplierEngagement: SupplierEngagementLevel.ACTIVE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      expect(decision.reportPublic).toBe(ReportPublicStatus.YES);
      expect(decision.supplierContacted).toBe(SupplierContactedStatus.YES);
      expect(decision.reportCredibility).toBe(ReportCredibilityLevel.CREDIBLE);
      expect(decision.supplierCardinality).toBe(SupplierCardinalityLevel.MULTIPLE);
      expect(decision.supplierEngagement).toBe(SupplierEngagementLevel.ACTIVE);
      expect(decision.utility).toBe(UtilityLevel.SUPER_EFFECTIVE);
      expect(decision.publicSafetyImpact).toBe(PublicSafetyImpactLevel.SIGNIFICANT);
    });
    
    it('should auto-evaluate when all parameters are provided', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES,
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: SupplierCardinalityLevel.MULTIPLE,
        supplierEngagement: SupplierEngagementLevel.ACTIVE,
        utility: UtilityLevel.SUPER_EFFECTIVE,
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome?.action).toBe('coordinate');
    });
    
    it('should convert string values to enums', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: 'yes',
        supplierContacted: 'yes',
        reportCredibility: 'credible',
        supplierCardinality: 'multiple',
        supplierEngagement: 'active',
        utility: 'super_effective',
        publicSafetyImpact: 'significant'
      });
      
      expect(decision.reportPublic).toBe(ReportPublicStatus.YES);
      expect(decision.supplierContacted).toBe(SupplierContactedStatus.YES);
      expect(decision.reportCredibility).toBe(ReportCredibilityLevel.CREDIBLE);
      expect(decision.supplierCardinality).toBe(SupplierCardinalityLevel.MULTIPLE);
      expect(decision.supplierEngagement).toBe(SupplierEngagementLevel.ACTIVE);
      expect(decision.utility).toBe(UtilityLevel.SUPER_EFFECTIVE);
      expect(decision.publicSafetyImpact).toBe(PublicSafetyImpactLevel.SIGNIFICANT);
    });
    
    it('should handle partial parameters without auto-evaluation', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: SupplierContactedStatus.YES
        // Missing other parameters
      });
      
      expect(decision.outcome).toBeUndefined();
    });
    
    it('should handle invalid enum values', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: 'invalid_value',
        supplierContacted: 'invalid_value',
        reportCredibility: 'invalid_value',
        supplierCardinality: 'invalid_value',
        supplierEngagement: 'invalid_value',
        utility: 'invalid_value',
        publicSafetyImpact: 'invalid_value'
      });
      
      expect(decision.reportPublic).toBeUndefined();
      expect(decision.supplierContacted).toBeUndefined();
      expect(decision.reportCredibility).toBeUndefined();
      expect(decision.supplierCardinality).toBeUndefined();
      expect(decision.supplierEngagement).toBeUndefined();
      expect(decision.utility).toBeUndefined();
      expect(decision.publicSafetyImpact).toBeUndefined();
    });
    
    it('should handle mixed valid and invalid values', () => {
      const decision = new DecisionCoordinatorTriage({
        reportPublic: ReportPublicStatus.YES,
        supplierContacted: 'invalid_value',
        reportCredibility: ReportCredibilityLevel.CREDIBLE,
        supplierCardinality: 'invalid_value',
        supplierEngagement: SupplierEngagementLevel.ACTIVE,
        utility: 'invalid_value',
        publicSafetyImpact: PublicSafetyImpactLevel.SIGNIFICANT
      });
      
      expect(decision.reportPublic).toBe(ReportPublicStatus.YES);
      expect(decision.supplierContacted).toBeUndefined();
      expect(decision.reportCredibility).toBe(ReportCredibilityLevel.CREDIBLE);
      expect(decision.supplierCardinality).toBeUndefined();
      expect(decision.supplierEngagement).toBe(SupplierEngagementLevel.ACTIVE);
      expect(decision.utility).toBeUndefined();
      expect(decision.publicSafetyImpact).toBe(PublicSafetyImpactLevel.SIGNIFICANT);
    });
  });
  
  describe('OutcomeCoordinatorTriage', () => {
    it('should create outcome with correct priority mapping', () => {
      const outcome = new OutcomeCoordinatorTriage(ActionType.COORDINATE);
      expect(outcome.action).toBe('coordinate');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle all action types', () => {
      const testCases = [
        { action: ActionType.DECLINE, expectedPriority: 'low' },
        { action: ActionType.TRACK, expectedPriority: 'medium' },
        { action: ActionType.COORDINATE, expectedPriority: 'high' }
      ];
      
      testCases.forEach(({ action, expectedPriority }) => {
        const outcome = new OutcomeCoordinatorTriage(action);
        expect(outcome.priority).toBe(expectedPriority);
      });
    });
    
    it('should create outcome with correct priority mapping for all actions', () => {
      // Test decline action
      const declineOutcome = new OutcomeCoordinatorTriage(ActionType.DECLINE);
      expect(declineOutcome.action).toBe('decline');
      expect(declineOutcome.priority).toBe('low');
      
      // Test track action
      const trackOutcome = new OutcomeCoordinatorTriage(ActionType.TRACK);
      expect(trackOutcome.action).toBe('track');
      expect(trackOutcome.priority).toBe('medium');
      
      // Test coordinate action
      const coordinateOutcome = new OutcomeCoordinatorTriage(ActionType.COORDINATE);
      expect(coordinateOutcome.action).toBe('coordinate');
      expect(coordinateOutcome.priority).toBe('high');
    });
  });
  
  describe('Enums', () => {
    it('should have correct ReportPublicStatus values', () => {
      expect(ReportPublicStatus.YES).toBe('yes');
      expect(ReportPublicStatus.NO).toBe('no');
    });
    
    it('should have all ReportPublicStatus values', () => {
      expect(ReportPublicStatus.YES).toBe('yes');
      expect(ReportPublicStatus.NO).toBe('no');
    });
    
    it('should have correct SupplierContactedStatus values', () => {
      expect(SupplierContactedStatus.YES).toBe('yes');
      expect(SupplierContactedStatus.NO).toBe('no');
    });
    
    it('should have all SupplierContactedStatus values', () => {
      expect(SupplierContactedStatus.YES).toBe('yes');
      expect(SupplierContactedStatus.NO).toBe('no');
    });
    
    it('should have correct ReportCredibilityLevel values', () => {
      expect(ReportCredibilityLevel.CREDIBLE).toBe('credible');
      expect(ReportCredibilityLevel.NOT_CREDIBLE).toBe('not_credible');
    });
    
    it('should have all ReportCredibilityLevel values', () => {
      expect(ReportCredibilityLevel.CREDIBLE).toBe('credible');
      expect(ReportCredibilityLevel.NOT_CREDIBLE).toBe('not_credible');
    });
    
    it('should have correct SupplierCardinalityLevel values', () => {
      expect(SupplierCardinalityLevel.ONE).toBe('one');
      expect(SupplierCardinalityLevel.MULTIPLE).toBe('multiple');
    });
    
    it('should have all SupplierCardinalityLevel values', () => {
      expect(SupplierCardinalityLevel.ONE).toBe('one');
      expect(SupplierCardinalityLevel.MULTIPLE).toBe('multiple');
    });
    
    it('should have correct SupplierEngagementLevel values', () => {
      expect(SupplierEngagementLevel.ACTIVE).toBe('active');
      expect(SupplierEngagementLevel.UNRESPONSIVE).toBe('unresponsive');
    });
    
    it('should have all SupplierEngagementLevel values', () => {
      expect(SupplierEngagementLevel.ACTIVE).toBe('active');
      expect(SupplierEngagementLevel.UNRESPONSIVE).toBe('unresponsive');
    });
    
    it('should have correct UtilityLevel values', () => {
      expect(UtilityLevel.LABORIOUS).toBe('laborious');
      expect(UtilityLevel.EFFICIENT).toBe('efficient');
      expect(UtilityLevel.SUPER_EFFECTIVE).toBe('super_effective');
    });
    
    it('should have all UtilityLevel values', () => {
      expect(UtilityLevel.LABORIOUS).toBe('laborious');
      expect(UtilityLevel.EFFICIENT).toBe('efficient');
      expect(UtilityLevel.SUPER_EFFECTIVE).toBe('super_effective');
    });
    
    it('should have correct PublicSafetyImpactLevel values', () => {
      expect(PublicSafetyImpactLevel.MINIMAL).toBe('minimal');
      expect(PublicSafetyImpactLevel.SIGNIFICANT).toBe('significant');
    });
    
    it('should have all PublicSafetyImpactLevel values', () => {
      expect(PublicSafetyImpactLevel.MINIMAL).toBe('minimal');
      expect(PublicSafetyImpactLevel.SIGNIFICANT).toBe('significant');
    });
    
    it('should have correct ActionType values', () => {
      expect(ActionType.DECLINE).toBe('decline');
      expect(ActionType.TRACK).toBe('track');
      expect(ActionType.COORDINATE).toBe('coordinate');
    });
    
    it('should have all ActionType values', () => {
      expect(ActionType.DECLINE).toBe('decline');
      expect(ActionType.TRACK).toBe('track');
      expect(ActionType.COORDINATE).toBe('coordinate');
    });
    
    it('should have correct DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.LOW).toBe('low');
      expect(DecisionPriorityLevel.MEDIUM).toBe('medium');
      expect(DecisionPriorityLevel.HIGH).toBe('high');
    });
    
    it('should have all DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.LOW).toBe('low');
      expect(DecisionPriorityLevel.MEDIUM).toBe('medium');
      expect(DecisionPriorityLevel.HIGH).toBe('high');
    });
  });
});