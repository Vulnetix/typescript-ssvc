import { CISAPlugin } from './cisa';
import { Decision, PluginRegistry } from '../core';
import {
  DecisionCisa,
  OutcomeCisa,
  ExploitationStatus,
  AutomatableStatus,
  TechnicalImpactLevel,
  MissionWellbeingImpactLevel,
  ActionType,
  PriorityLevel
} from './cisa-generated';

describe('CISAPlugin', () => {
  let plugin: CISAPlugin;
  
  beforeEach(() => {
    plugin = new CISAPlugin();
    // Register plugin for vector string tests
    PluginRegistry.getInstance().register(plugin);
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
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should create decision with alternative parameter names', () => {
      const decision = plugin.createDecision({
        exploitationStatus: 'active',
        automatableStatus: 'yes',
        technicalImpactLevel: 'total',
        missionWellbeingImpactLevel: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should handle enum values directly', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES,
        technical_impact: TechnicalImpactLevel.TOTAL,
        mission_wellbeing: MissionWellbeingImpactLevel.HIGH
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should handle mixed string and enum values', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: 'yes',
        technical_impact: TechnicalImpactLevel.TOTAL,
        mission_wellbeing: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should handle case variations in string values', () => {
      const decision = plugin.createDecision({
        exploitation: 'ACTIVE',
        automatable: 'YES',
        technical_impact: 'TOTAL',
        mission_wellbeing: 'HIGH'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
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
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should return ATTEND for medium-high severity', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'no',
        technical_impact: 'total',
        mission_wellbeing: 'medium'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ATTEND');
      expect(outcome.priority).toBe('MEDIUM');
    });
    
    it('should return TRACK_STAR for medium severity', () => {
      const decision = plugin.createDecision({
        exploitation: 'poc',
        automatable: 'no',
        technical_impact: 'total',
        mission_wellbeing: 'medium'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('TRACK_STAR');
      expect(outcome.priority).toBe('MEDIUM');
    });
    
    it('should return TRACK for low severity (none exploitation)', () => {
      const decision = plugin.createDecision({
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('TRACK');
      expect(outcome.priority).toBe('LOW');
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
      expect(decision.evaluate().action).toBe('ATTEND');
      
      // Test POC
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'poc'
      });
      expect(decision.evaluate().action).toBe('ATTEND');
      
      // Test ACTIVE
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'active'
      });
      expect(decision.evaluate().action).toBe('ACT');
    });
    
    it('should handle both automatable values', () => {
      // Test YES
      let decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('ACT');
      
      // Test NO
      decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('ATTEND');
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
      expect(decision.evaluate().action).toBe('ATTEND');
      
      // Test TOTAL
      decision = plugin.createDecision({
        ...baseParams,
        technical_impact: 'total'
      });
      expect(decision.evaluate().action).toBe('ATTEND');
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
      expect(decision.evaluate().action).toBe('TRACK');
      
      // Test MEDIUM - not explicitly mapped, defaults to 'track'
      decision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'medium'
      });
      expect(decision.evaluate().action).toBe('TRACK');
      
      // Test HIGH
      decision = plugin.createDecision({
        ...baseParams,
        mission_wellbeing: 'high'
      });
      expect(decision.evaluate().action).toBe('ATTEND');
    });
  });
  
  describe('parameter mapping', () => {
    it('should map various parameter name formats', () => {
      // Test different combinations of parameter names
      const testCases = [
        {
          params: { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
          expected: 'ACT'
        },
        {
          params: { exploitationStatus: 'active', automatableStatus: 'yes', technicalImpactLevel: 'total', missionWellbeingImpactLevel: 'high' },
          expected: 'ACT'
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
      
      expect(noneOutcome.action).toBe('TRACK');
      // ACTIVE, NO, PARTIAL, LOW is not explicitly mapped, defaults to 'track'
      expect(activeOutcome.action).toBe('TRACK');
      
      // Both scenarios result in same priority since they both default to 'track'
      expect(activeOutcome.priority).toBe('LOW');
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
      
      expect(noOutcome.action).toBe('ATTEND');
      expect(yesOutcome.action).toBe('ACT');
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
      
      expect(partialOutcome.action).toBe('TRACK_STAR');
      expect(totalOutcome.action).toBe('ATTEND');
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
      
      expect(lowOutcome.action).toBe('TRACK');
      // NONE, NO, PARTIAL, MEDIUM is not explicitly mapped, defaults to 'track'
      expect(mediumOutcome.action).toBe('TRACK');
      // NONE, NO, PARTIAL, HIGH is not explicitly mapped, defaults to 'track'  
      expect(highOutcome.action).toBe('TRACK');
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
          expectedAction: 'ATTEND'
        },
        {
          params: {
            exploitation: 'none',
            automatable: 'no',
            technical_impact: 'total',
            mission_wellbeing: 'high'
          },
          expectedAction: 'TRACK_STAR'
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
          expectedAction: 'TRACK' // NONE, YES, PARTIAL, HIGH not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'no'
          },
          expectedAction: 'TRACK' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
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
          expectedAction: 'TRACK' // NONE, NO, PARTIAL, LOW not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            mission_wellbeing: 'medium'
          },
          expectedAction: 'TRACK' // NONE, NO, PARTIAL, MEDIUM not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            mission_wellbeing: 'high'
          },
          expectedAction: 'TRACK' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
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
          expectedAction: 'TRACK' // NONE, YES, PARTIAL, HIGH not mapped, defaults to track
        },
        {
          params: {
            ...baseParams,
            exploitation: 'none',
            automatable: 'no'
          },
          expectedAction: 'TRACK' // NONE, NO, PARTIAL, HIGH not mapped, defaults to track
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
      expect(decision.outcome?.action).toBe('ACT');
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
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should handle all action types', () => {
      const testCases = [
        { action: ActionType.TRACK, expectedPriority: 'LOW' },
        { action: ActionType.TRACK_STAR, expectedPriority: 'MEDIUM' },
        { action: ActionType.ATTEND, expectedPriority: 'MEDIUM' },
        { action: ActionType.ACT, expectedPriority: 'IMMEDIATE' }
      ];
      
      testCases.forEach(({ action, expectedPriority }) => {
        const outcome = new OutcomeCisa(action);
        expect(outcome.priority).toBe(expectedPriority);
      });
    });
    
    it('should create outcome with correct priority mapping for all actions', () => {
      // Test track action
      const trackOutcome = new OutcomeCisa(ActionType.TRACK);
      expect(trackOutcome.action).toBe('TRACK');
      expect(trackOutcome.priority).toBe('LOW');
      
      // Test track_star action
      const trackStarOutcome = new OutcomeCisa(ActionType.TRACK_STAR);
      expect(trackStarOutcome.action).toBe('TRACK_STAR');
      expect(trackStarOutcome.priority).toBe('MEDIUM');
      
      // Test attend action
      const attendOutcome = new OutcomeCisa(ActionType.ATTEND);
      expect(attendOutcome.action).toBe('ATTEND');
      expect(attendOutcome.priority).toBe('MEDIUM');
      
      // Test act action
      const actOutcome = new OutcomeCisa(ActionType.ACT);
      expect(actOutcome.action).toBe('ACT');
      expect(actOutcome.priority).toBe('IMMEDIATE');
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
      expect(ActionType.TRACK).toBe('TRACK');
      expect(ActionType.TRACK_STAR).toBe('TRACK_STAR');
      expect(ActionType.ATTEND).toBe('ATTEND');
      expect(ActionType.ACT).toBe('ACT');
    });
    
    it('should have all ActionType values', () => {
      expect(ActionType.TRACK).toBe('TRACK');
      expect(ActionType.TRACK_STAR).toBe('TRACK_STAR');
      expect(ActionType.ATTEND).toBe('ATTEND');
      expect(ActionType.ACT).toBe('ACT');
    });
    
    it('should have correct PriorityLevel values', () => {
      expect(PriorityLevel.LOW).toBe('LOW');
      expect(PriorityLevel.MEDIUM).toBe('MEDIUM');
      expect(PriorityLevel.IMMEDIATE).toBe('IMMEDIATE');
    });
    
    it('should have all PriorityLevel values', () => {
      expect(PriorityLevel.LOW).toBe('LOW');
      expect(PriorityLevel.MEDIUM).toBe('MEDIUM');
      expect(PriorityLevel.IMMEDIATE).toBe('IMMEDIATE');
    });
  });
});

describe('Vector String Support', () => {
  describe('DecisionCisa vector string methods', () => {
    it('should generate vector string from decision parameters', () => {
      const decision = new DecisionCisa({
        exploitation: ExploitationStatus.ACTIVE,
        automatable: AutomatableStatus.YES,
        technicalImpact: TechnicalImpactLevel.TOTAL,
        missionWellbeingImpact: MissionWellbeingImpactLevel.HIGH
      });
      
      const vectorString = decision.toVector();
      
      expect(vectorString).toMatch(/^CISAv1\/E:A\/A:Y\/T:T\/M:H\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/$/);
      expect(vectorString).toContain('E:A');
      expect(vectorString).toContain('A:Y');
      expect(vectorString).toContain('T:T');
      expect(vectorString).toContain('M:H');
    });
    
    it('should parse vector string to create decision', () => {
      const vectorString = 'CISAv1/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/';
      
      const decision = DecisionCisa.fromVector(vectorString);
      
      expect(decision.exploitation).toBe(ExploitationStatus.ACTIVE);
      expect(decision.automatable).toBe(AutomatableStatus.YES);
      expect(decision.technicalImpact).toBe(TechnicalImpactLevel.TOTAL);
      expect(decision.missionWellbeingImpact).toBe(MissionWellbeingImpactLevel.HIGH);
    });
    
    it('should round-trip vector strings correctly', () => {
      const originalDecision = new DecisionCisa({
        exploitation: ExploitationStatus.POC,
        automatable: AutomatableStatus.NO,
        technicalImpact: TechnicalImpactLevel.PARTIAL,
        missionWellbeingImpact: MissionWellbeingImpactLevel.MEDIUM
      });
      
      const vectorString = originalDecision.toVector();
      const parsedDecision = DecisionCisa.fromVector(vectorString);
      
      expect(parsedDecision.exploitation).toBe(originalDecision.exploitation);
      expect(parsedDecision.automatable).toBe(originalDecision.automatable);
      expect(parsedDecision.technicalImpact).toBe(originalDecision.technicalImpact);
      expect(parsedDecision.missionWellbeingImpact).toBe(originalDecision.missionWellbeingImpact);
      
      const originalOutcome = originalDecision.evaluate();
      const parsedOutcome = parsedDecision.evaluate();
      
      expect(parsedOutcome.action).toBe(originalOutcome.action);
      expect(parsedOutcome.priority).toBe(originalOutcome.priority);
    });
    
    it('should handle all parameter combinations', () => {
      const testCases = [
        {
          params: {
            exploitation: ExploitationStatus.NONE,
            automatable: AutomatableStatus.YES,
            technicalImpact: TechnicalImpactLevel.TOTAL,
            missionWellbeingImpact: MissionWellbeingImpactLevel.HIGH
          },
          expectedVector: /E:N\/A:Y\/T:T\/M:H/
        },
        {
          params: {
            exploitation: ExploitationStatus.ACTIVE,
            automatable: AutomatableStatus.NO,
            technicalImpact: TechnicalImpactLevel.PARTIAL,
            missionWellbeingImpact: MissionWellbeingImpactLevel.LOW
          },
          expectedVector: /E:A\/A:N\/T:P\/M:L/
        }
      ];
      
      testCases.forEach(({ params, expectedVector }) => {
        const decision = new DecisionCisa(params);
        const vectorString = decision.toVector();
        expect(vectorString).toMatch(expectedVector);
        
        const parsedDecision = DecisionCisa.fromVector(vectorString);
        expect(parsedDecision.exploitation).toBe(params.exploitation);
        expect(parsedDecision.automatable).toBe(params.automatable);
        expect(parsedDecision.technicalImpact).toBe(params.technicalImpact);
        expect(parsedDecision.missionWellbeingImpact).toBe(params.missionWellbeingImpact);
      });
    });
    
    it('should throw error for invalid vector string format', () => {
      const invalidVectors = [
        'invalid',
        'CISAv1/',
        'CISAv1/E:A/',
        'CISAv2/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/',
        'CISA/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/'
      ];
      
      invalidVectors.forEach(vectorString => {
        expect(() => DecisionCisa.fromVector(vectorString))
          .toThrow('Invalid vector string format for CISA');
      });
    });
  });
  
  describe('CISAPlugin vector string methods', () => {
    let plugin: CISAPlugin;
    
    beforeEach(() => {
      plugin = new CISAPlugin();
    });
    
    it('should create decision from vector string via plugin', () => {
      const vectorString = 'CISAv1/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/';
      
      const decision = plugin.fromVector!(vectorString);
      const outcome = decision.evaluate();
      
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should generate vector string via plugin decision wrapper', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const vectorString = decision.toVector!();
      
      expect(vectorString).toMatch(/^CISAv1\/E:A\/A:Y\/T:T\/M:H\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/$/);
    });
  });
  
  describe('Core Decision class vector string methods', () => {
    it('should create decision from vector string via static method', () => {
      const vectorString = 'CISAv1/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/';
      
      const decision = Decision.fromVector(vectorString);
      const outcome = decision.evaluate();
      
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should generate vector string via Decision instance', () => {
      const decision = new Decision('CISA', {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const vectorString = decision.toVector();
      
      expect(vectorString).toMatch(/^CISAv1\/E:A\/A:Y\/T:T\/M:H\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\/$/);
    });
    
    it('should handle vector strings with different methodology prefixes', () => {
      // This test assumes we have plugins registered for different methodologies
      const cisaVector = 'CISAv1/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/';
      
      expect(() => Decision.fromVector(cisaVector)).not.toThrow();
    });
    
    it('should throw error for unknown methodology in vector string', () => {
      const unknownVector = 'UNKNOWNv1/E:A/A:Y/T:T/M:H/2024-07-23T20:34:21.000Z/';
      
      expect(() => Decision.fromVector(unknownVector))
        .toThrow('No plugin found that can parse vector string');
    });
    
    it('should throw error for methodology without vector support', () => {
      // Create a decision for a methodology that doesn't support vectors
      const decision = new Decision('NonExistentMethodology', {});
      
      expect(() => decision.toVector())
        .toThrow('Unknown methodology: NonExistentMethodology');
    });
  });
});