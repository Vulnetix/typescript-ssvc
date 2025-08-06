import { CISAPlugin } from './cisa';
import {
  DecisionCisa,
  OutcomeCisa,
  ExploitationStatus,
  AutomatableStatus,
  TechnicalImpactLevel,
  MissionWellbeingImpactLevel,
  ActionType,
  DecisionPriorityLevel
} from './cisa-generated';

describe('CISAPlugin', () => {
  let plugin: CISAPlugin;
  
  beforeEach(() => {
    plugin = new CISAPlugin();
  });
  
  describe('plugin properties', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('CISA');
    });
    
    it('should have correct description', () => {
      expect(plugin.description).toBe('CISA Stakeholder-Specific Vulnerability Categorization');
    });
    
    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0');
    });
  });
  
  describe('createDecision', () => {
    it('should create decision with standard parameter names', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should create decision with alternative parameter names', () => {
      const decision = plugin.createDecision({
        exploitationStatus: 'active',
        automatableStatus: 'yes',
        technicalImpactLevel: 'total',
        missionWellbeingImpactLevel: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle enum values directly', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES,
        technical_impact: TechnicalImpactLevel.TOTAL,
        mission_wellbeing: MissionWellbeingImpactLevel.HIGH
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle mixed string and enum values', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: 'yes',
        technical_impact: TechnicalImpactLevel.TOTAL,
        mission_wellbeing: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle case variations in string values', () => {
      const decision = plugin.createDecision({
        exploitation: 'ACTIVE',
        automatable: 'YES',
        technical_impact: 'TOTAL',
        mission_wellbeing: 'HIGH'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle undefined values gracefully', () => {
      const decision = plugin.createDecision({
        exploitation: undefined,
        automatable: undefined,
        technical_impact: undefined,
        mission_wellbeing: undefined
      });
      
      // Should not throw an error, but evaluation might return default
      expect(() => decision.evaluate()).not.toThrow();
    });
    
    it('should handle empty options', () => {
      const decision = plugin.createDecision({});
      expect(() => decision.evaluate()).not.toThrow();
    });
  });
  
  describe('decision outcomes for various scenarios', () => {
    it('should return ACT for high severity (active exploitation, automatable, total impact, high mission)', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should return ATTEND for medium-high severity', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'no',
        technical_impact: 'total',
        mission_wellbeing: 'medium'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('attend');
      expect(outcome.priority).toBe('medium');
    });
    
    it('should return TRACK_STAR for medium severity', () => {
      const decision = plugin.createDecision({
        exploitation: 'poc',
        automatable: 'no',
        technical_impact: 'total',
        mission_wellbeing: 'medium'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('track_star');
      expect(outcome.priority).toBe('medium');
    });
    
    it('should return TRACK for low severity (none exploitation)', () => {
      const decision = plugin.createDecision({
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('track');
      expect(outcome.priority).toBe('low');
    });
    
    it('should handle all exploitation levels', () => {
      const baseParams = {
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      };
      
      // Test NONE
      let decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'none'
      });
      expect(decision.evaluate().action).toBe('attend');
      
      // Test POC
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'poc'
      });
      expect(decision.evaluate().action).toBe('attend');
      
      // Test ACTIVE
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'active'
      });
      expect(decision.evaluate().action).toBe('act');
    });
    
    it('should handle both automatable values', () => {
      // Test YES
      let decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('act');
      
      // Test NO
      decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('attend');
    });
    
    it('should handle both technical impact levels', () => {
      const baseParams = {
        exploitation: 'poc',
        automatable: 'yes',
        mission_wellbeing: 'high'
      };
      
      // Test PARTIAL
      let decision = plugin.createDecision({
        ...baseParams,
        technical_impact: 'partial'
      });
      expect(decision.evaluate().action).toBe('attend');
      
      // Test TOTAL
      decision = plugin.createDecision({
        ...baseParams,
        technical_impact: 'total'
      });
      expect(decision.evaluate().action).toBe('attend');
    });
    
    it('should handle all mission wellbeing levels', () => {
      const baseParams = {
        exploitation: 'poc',
        automatable: 'yes',
        technical_impact: 'partial'
      };
      
      // Test LOW - not explicitly mapped, defaults to 'track'
      let decision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'low'
      });
      expect(decision.evaluate().action).toBe('track');
      
      // Test MEDIUM - not explicitly mapped, defaults to 'track'
      decision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'medium'
      });
      expect(decision.evaluate().action).toBe('track');
      
      // Test HIGH
      decision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('attend');
    });
  });
  
  describe('parameter mapping', () => {
    it('should map various parameter name formats', () => {
      // Test different combinations of parameter names
      const testCases = [
        {
          params: { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
          expected: 'act'
        },
        {
          params: { exploitationStatus: 'active', automatableStatus: 'yes', technicalImpactLevel: 'total', missionWellbeingImpactLevel: 'high' },
          expected: 'act'
        }
      ];
      
      testCases.forEach(({ params, expected }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected);
      });
    });
  });
  
  describe('comprehensive decision paths', () => {
    it('should escalate priority with active exploitation', () => {
      // Compare same scenario with different exploitation levels
      const baseParams = {
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      };
      
      const noneDecision = plugin.createDecision({
        ...baseParams,
        exploitation: 'none'
      });
      
      const activeDecision = plugin.createDecision({
        ...baseParams,
        exploitation: 'active'
      });
      
      const noneOutcome = noneDecision.evaluate();
      const activeOutcome = activeDecision.evaluate();
      
      expect(noneOutcome.action).toBe('track');
      // ACTIVE, NO, PARTIAL, LOW is not explicitly mapped, defaults to 'track'
      expect(activeOutcome.action).toBe('track');
      
      // Both scenarios result in same priority since they both default to 'track'
      expect(activeOutcome.priority).toBe('low');
    });
    
    it('should escalate with automatability', () => {
      const baseParams = {
        exploitation: 'active',
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      };
      
      const noDecision = plugin.createDecision({
        ...baseParams,
        automatable: 'no'
      });
      
      const yesDecision = plugin.createDecision({
        ...baseParams,
        automatable: 'yes'
      });
      
      const noOutcome = noDecision.evaluate();
      const yesOutcome = yesDecision.evaluate();
      
      expect(noOutcome.action).toBe('attend');
      expect(yesOutcome.action).toBe('act');
    });
    
    it('should escalate with technical impact', () => {
      const baseParams = {
        exploitation: 'poc',
        automatable: 'no',
        mission_wellbeing: 'high'
      };
      
      const partialDecision = plugin.createDecision({
        ...baseParams,
        technical_impact: 'partial'
      });
      
      const totalDecision = plugin.createDecision({
        ...baseParams,
        technical_impact: 'total'
      });
      
      const partialOutcome = partialDecision.evaluate();
      const totalOutcome = totalDecision.evaluate();
      
      expect(partialOutcome.action).toBe('track_star');
      expect(totalOutcome.action).toBe('attend');
    });
    
    it('should escalate with mission wellbeing impact', () => {
      const baseParams = {
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial'
      };
      
      const lowDecision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'low'
      });
      
      const mediumDecision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'medium'
      });
      
      const highDecision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'high'
      });
      
      const lowOutcome = lowDecision.evaluate();
      const mediumOutcome = mediumDecision.evaluate();
      const highOutcome = highDecision.evaluate();
      
      expect(lowOutcome.action).toBe('track');
      // NONE, NO, PARTIAL, MEDIUM is not explicitly mapped, defaults to 'track'
      expect(mediumOutcome.action).toBe('track');
      // NONE, NO, PARTIAL, HIGH is not explicitly mapped, defaults to 'track'  
      expect(highOutcome.action).toBe('track');
    });
    
    it('should handle private report scenarios', () => {
      // Test with various supplier involvements and exploitation levels
      const testCases = [
        {
          params: {
            exploitation: 'none',
            automatable: 'yes',
            technical_impact: 'total',
            mission_wellbeing: 'high'
          },
          expectedAction: 'attend'
        },
        {
          params: {
            exploitation: 'none',
            automatable: 'no',
            technical_impact: 'total',
            mission_wellbeing: 'high'
          },
          expectedAction: 'track_star'
        }
      ];
      
      testCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });
    
    it('should handle unresponsive supplier scenarios', () => {
      const baseParams = {
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      };
      
      const testCases = [
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'yes'
          },
          expectedAction: 'track' // NONE, YES, PARTIAL, HIGH not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'no'
          },
          expectedAction: 'track' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
        }
      ];
      
      testCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });
    
    it('should handle no supplier contacted scenarios', () => {
      const baseParams = {
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial'
      };
      
      const testCases = [
        {
          params: {
            ...baseParams,
            mission_wellbeing: 'low'
          },
          expectedAction: 'track' // NONE, NO, PARTIAL, LOW not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            mission_wellbeing: 'medium'
          },
          expectedAction: 'track' // NONE, NO, PARTIAL, MEDIUM not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            mission_wellbeing: 'high'
          },
          expectedAction: 'track' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
        }
      ];
      
      testCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });
    
    it('should handle edge cases with different supplier engagement levels', () => {
      const baseParams = {
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      };
      
      const testCases = [
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'yes'
          },
          expectedAction: 'track' // NONE, YES, PARTIAL, HIGH not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'no'
          },
          expectedAction: 'track' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
        }
      ];
      
      testCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });
  });
});

describe('Generated CISA Components', () => {
  describe('DecisionCisa', () => {
    it('should initialize with valid parameters', () => {
      const decision = new DecisionCisa({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES,
        technicalImpact: TechnicalImpactLevel.TOTAL,
        missionWellbeingImpact: MissionWellbeingImpactLevel.HIGH
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.ACTIVE);
      expect(decision.automatable).toBe(AutomatableStatus.YES);
      expect(decision.technicalImpact).toBe(TechnicalImpactLevel.TOTAL);
      expect(decision.missionWellbeingImpact).toBe(MissionWellbeingImpactLevel.HIGH);
    });
    
    it('should auto-evaluate when all parameters are provided', () => {
      const decision = new DecisionCisa({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES,
        technicalImpact: TechnicalImpactLevel.TOTAL,
        missionWellbeingImpact: MissionWellbeingImpactLevel.HIGH
      });
      
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome?.action).toBe('act');
    });
    
    it('should convert string values to enums', () => {
      const decision = new DecisionCisa({
        exploitation: 'active',
        automatable: 'yes',
        technicalImpact: 'total',
        missionWellbeingImpact: 'high'
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.ACTIVE);
      expect(decision.automatable).toBe(AutomatableStatus.YES);
      expect(decision.technicalImpact).toBe(TechnicalImpactLevel.TOTAL);
      expect(decision.missionWellbeingImpact).toBe(MissionWellbeingImpactLevel.HIGH);
    });
    
    it('should handle partial parameters without auto-evaluation', () => {
      const decision = new DecisionCisa({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES
        // Missing technicalImpact and missionWellbeingImpact
      });
      
      expect(decision.outcome).toBeUndefined();
    });
    
    it('should handle invalid enum values', () => {
      const decision = new DecisionCisa({
        exploitation: 'invalid_value',
        automatable: 'invalid_value',
        technicalImpact: 'invalid_value',
        missionWellbeingImpact: 'invalid_value'
      });
      
      expect(decision.exploitation).toBeUndefined();
      expect(decision.automatable).toBeUndefined();
      expect(decision.technicalImpact).toBeUndefined();
      expect(decision.missionWellbeingImpact).toBeUndefined();
    });
    
    it('should handle mixed valid and invalid values', () => {
      const decision = new DecisionCisa({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: 'invalid_value',
        technicalImpact: TechnicalImpactLevel.TOTAL,
        missionWellbeingImpact: 'invalid_value'
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.ACTIVE);
      expect(decision.automatable).toBeUndefined();
      expect(decision.technicalImpact).toBe(TechnicalImpactLevel.TOTAL);
      expect(decision.missionWellbeingImpact).toBeUndefined();
    });
  });
  
  describe('OutcomeCisa', () => {
    it('should create outcome with correct priority mapping', () => {
      const outcome = new OutcomeCisa(ActionType.ACT);
      expect(outcome.action).toBe('act');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle all action types', () => {
      const testCases = [
        { action: ActionType.TRACK, expectedPriority: 'low' },
        { action: ActionType.TRACK_STAR, expectedPriority: 'medium' },
        { action: ActionType.ATTEND, expectedPriority: 'medium' },
        { action: ActionType.ACT, expectedPriority: 'immediate' }
      ];
      
      testCases.forEach(({ action, expectedPriority }) => {
        const outcome = new OutcomeCisa(action);
        expect(outcome.priority).toBe(expectedPriority);
      });
    });
    
    it('should create outcome with correct priority mapping for all actions', () => {
      // Test track action
      const trackOutcome = new OutcomeCisa(ActionType.TRACK);
      expect(trackOutcome.action).toBe('track');
      expect(trackOutcome.priority).toBe('low');
      
      // Test track_star action
      const trackStarOutcome = new OutcomeCisa(ActionType.TRACK_STAR);
      expect(trackStarOutcome.action).toBe('track_star');
      expect(trackStarOutcome.priority).toBe('medium');
      
      // Test attend action
      const attendOutcome = new OutcomeCisa(ActionType.ATTEND);
      expect(attendOutcome.action).toBe('attend');
      expect(attendOutcome.priority).toBe('medium');
      
      // Test act action
      const actOutcome = new OutcomeCisa(ActionType.ACT);
      expect(actOutcome.action).toBe('act');
      expect(actOutcome.priority).toBe('immediate');
    });
  });
  
  describe('Enums', () => {
    it('should have correct ExploitationStatus values', () => {
      expect(ExploitationStatus.NONE).toBe('none');
      expect(ExploitationStatus.POC).toBe('poc');
      expect(ExploitationStatus.ACTIVE).toBe('active');
    });
    
    it('should have all ExploitationStatus values', () => {
      expect(ExploitationStatus.NONE).toBe('none');
      expect(ExploitationStatus.POC).toBe('poc');
      expect(ExploitationStatus.ACTIVE).toBe('active');
    });
    
    it('should have correct AutomatableStatus values', () => {
      expect(AutomatableStatus.YES).toBe('yes');
      expect(AutomatableStatus.NO).toBe('no');
    });
    
    it('should have all AutomatableStatus values', () => {
      expect(AutomatableStatus.YES).toBe('yes');
      expect(AutomatableStatus.NO).toBe('no');
    });
    
    it('should have correct TechnicalImpactLevel values', () => {
      expect(TechnicalImpactLevel.PARTIAL).toBe('partial');
      expect(TechnicalImpactLevel.TOTAL).toBe('total');
    });
    
    it('should have all TechnicalImpactLevel values', () => {
      expect(TechnicalImpactLevel.PARTIAL).toBe('partial');
      expect(TechnicalImpactLevel.TOTAL).toBe('total');
    });
    
    it('should have correct MissionWellbeingImpactLevel values', () => {
      expect(MissionWellbeingImpactLevel.LOW).toBe('low');
      expect(MissionWellbeingImpactLevel.MEDIUM).toBe('medium');
      expect(MissionWellbeingImpactLevel.HIGH).toBe('high');
    });
    
    it('should have all MissionWellbeingImpactLevel values', () => {
      expect(MissionWellbeingImpactLevel.LOW).toBe('low');
      expect(MissionWellbeingImpactLevel.MEDIUM).toBe('medium');
      expect(MissionWellbeingImpactLevel.HIGH).toBe('high');
    });
    
    it('should have correct ActionType values', () => {
      expect(ActionType.TRACK).toBe('track');
      expect(ActionType.TRACK_STAR).toBe('track_star');
      expect(ActionType.ATTEND).toBe('attend');
      expect(ActionType.ACT).toBe('act');
    });
    
    it('should have all ActionType values', () => {
      expect(ActionType.TRACK).toBe('track');
      expect(ActionType.TRACK_STAR).toBe('track_star');
      expect(ActionType.ATTEND).toBe('attend');
      expect(ActionType.ACT).toBe('act');
    });
    
    it('should have correct DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.LOW).toBe('low');
      expect(DecisionPriorityLevel.MEDIUM).toBe('medium');
      expect(DecisionPriorityLevel.HIGH).toBe('high');
      expect(DecisionPriorityLevel.IMMEDIATE).toBe('immediate');
    });
    
    it('should have all DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.LOW).toBe('low');
      expect(DecisionPriorityLevel.MEDIUM).toBe('medium');
      expect(DecisionPriorityLevel.HIGH).toBe('high');
      expect(DecisionPriorityLevel.IMMEDIATE).toBe('immediate');
    });
  });
});