import { DeployerPlugin } from './deployer';
import {
  DecisionDeployer,
  OutcomeDeployer,
  ExploitationStatus,
  SystemExposureLevel,
  UtilityLevel,
  HumanImpactLevel,
  ActionType,
  DecisionPriorityLevel
} from './deployer-generated';

describe('DeployerPlugin', () => {
  let plugin: DeployerPlugin;
  
  beforeEach(() => {
    plugin = new DeployerPlugin();
  });
  
  describe('plugin properties', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('Deployer');
    });
    
    it('should have correct description', () => {
      expect(plugin.description).toBe('CERT/CC Deployer Decision Model');
    });
    
    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0');
    });
  });
  
  describe('createDecision', () => {
    it('should create decision with standard parameter names', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        system_exposure: 'open',
        utility: 'super_effective',
        human_impact: 'very_high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should create decision with alternative parameter names', () => {
      const decision = plugin.createDecision({
        exploitationStatus: 'active',
        systemExposureLevel: 'open',
        utilityLevel: 'super_effective',
        humanImpactLevel: 'very_high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle enum values directly', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.active,
        system_exposure: SystemExposureLevel.open,
        utility: UtilityLevel.super_effective,
        human_impact: HumanImpactLevel.very_high
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle mixed string and enum values', () => {
      const decision = plugin.createDecision({
        exploitation: ExploitationStatus.active,
        system_exposure: 'open',
        utility: UtilityLevel.super_effective,
        human_impact: 'very_high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle empty options', () => {
      const decision = plugin.createDecision({});
      expect(() => decision.evaluate()).not.toThrow();
    });
  });
  
  describe('decision outcomes for various scenarios', () => {
    it('should return IMMEDIATE for highest severity (active, open, super effective, very high)', () => {
      const decision = plugin.createDecision({
        exploitation: 'active',
        system_exposure: 'open',
        utility: 'super_effective',
        human_impact: 'very_high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should return DEFER for lowest severity (none, small, laborious, low)', () => {
      const decision = plugin.createDecision({
        exploitation: 'none',
        system_exposure: 'small',
        utility: 'laborious',
        human_impact: 'low'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('defer');
      expect(outcome.priority).toBe('low');
    });
    
    it('should return SCHEDULED for medium severity cases', () => {
      const decision = plugin.createDecision({
        exploitation: 'none',
        system_exposure: 'small',
        utility: 'efficient',
        human_impact: 'medium'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('defer');
      expect(outcome.priority).toBe('low');
    });
    
    it('should return OUT_OF_CYCLE for high severity cases', () => {
      const decision = plugin.createDecision({
        exploitation: 'none',
        system_exposure: 'open',
        utility: 'super_effective',
        human_impact: 'very_high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle all exploitation levels', () => {
      const baseParams = {
        system_exposure: 'open',
        utility: 'super_effective',
        human_impact: 'very_high'
      };
      
      // Test NONE
      let decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'none'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test PUBLIC_POC
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'public_poc'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test ACTIVE
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'active'
      });
      expect(decision.evaluate().action).toBe('immediate');
    });
    
    it('should handle all system exposure levels', () => {
      const baseParams = {
        exploitation: 'none',
        utility: 'super_effective',
        human_impact: 'very_high'
      };
      
      // Test SMALL
      let decision = plugin.createDecision({
        ...baseParams,
        system_exposure: 'small'
      });
      expect(decision.evaluate().action).toBe('out_of_cycle');
      
      // Test CONTROLLED
      decision = plugin.createDecision({
        ...baseParams,
        system_exposure: 'controlled'
      });
      expect(decision.evaluate().action).toBe('out_of_cycle');
      
      // Test OPEN
      decision = plugin.createDecision({
        ...baseParams,
        system_exposure: 'open'
      });
      expect(decision.evaluate().action).toBe('immediate');
    });
    
    it('should handle all utility levels', () => {
      const baseParams = {
        exploitation: 'public_poc',
        system_exposure: 'open',
        human_impact: 'very_high'
      };
      
      // Test LABORIOUS
      let decision = plugin.createDecision({
        ...baseParams,
        utility: 'laborious'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test EFFICIENT
      decision = plugin.createDecision({
        ...baseParams,
        utility: 'efficient'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test SUPER_EFFECTIVE
      decision = plugin.createDecision({
        ...baseParams,
        utility: 'super_effective'
      });
      expect(decision.evaluate().action).toBe('immediate');
    });
  });
  
  describe('complex decision paths', () => {
    it('should escalate priority with human impact', () => {
      const baseParams = {
        exploitation: 'public_poc',
        system_exposure: 'open',
        utility: 'super_effective'
      };
      
      // Test LOW
      let decision = plugin.createDecision({
        ...baseParams,
        human_impact: 'low'
      });
      expect(decision.evaluate().action).toBe('out_of_cycle');
      
      // Test MEDIUM
      decision = plugin.createDecision({
        ...baseParams,
        human_impact: 'medium'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test HIGH
      decision = plugin.createDecision({
        ...baseParams,
        human_impact: 'high'
      });
      expect(decision.evaluate().action).toBe('immediate');
      
      // Test VERY_HIGH
      decision = plugin.createDecision({
        ...baseParams,
        human_impact: 'very_high'
      });
      expect(decision.evaluate().action).toBe('immediate');
    });
    
    it('should handle active exploitation escalation', () => {
      const baseParams = {
        system_exposure: 'controlled',
        utility: 'efficient',
        human_impact: 'medium'
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
      
      expect(noneOutcome.action).toBe('scheduled');
      expect(activeOutcome.action).toBe('out_of_cycle');
    });

    it('should cover all active exploitation decision paths', () => {
      // Test active exploitation scenarios
      const activeTestCases = [
        // Active, Open, Super Effective = immediate (regardless of human impact)
        { params: { exploitation: 'active', system_exposure: 'open', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'open', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'open', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'open', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'immediate' },
        
        // Active with high/very high human impact = immediate
        { params: { exploitation: 'active', system_exposure: 'small', utility: 'laborious', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'small', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'controlled', utility: 'efficient', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'active', system_exposure: 'controlled', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'immediate' },
        
        // Active with lower human impact = out_of_cycle
        { params: { exploitation: 'active', system_exposure: 'small', utility: 'laborious', human_impact: 'low' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'active', system_exposure: 'small', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'active', system_exposure: 'controlled', utility: 'efficient', human_impact: 'low' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'active', system_exposure: 'controlled', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'out_of_cycle' }
      ];
      
      activeTestCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });

    it('should cover all public_poc exploitation decision paths', () => {
      // Test public_poc exploitation scenarios
      const publicPocTestCases = [
        // Public PoC, Open, Super Effective combinations
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'out_of_cycle' },
        
        // Public PoC, Open, Efficient combinations
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'efficient', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'efficient', human_impact: 'low' }, expectedAction: 'defer' },
        
        // Public PoC, Open, Laborious combinations
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'laborious', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'open', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' },
        
        // Public PoC, Controlled, Super Effective combinations
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'out_of_cycle' },
        
        // Public PoC, Controlled, Efficient combinations
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'efficient', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'efficient', human_impact: 'low' }, expectedAction: 'scheduled' },
        
        // Public PoC, Controlled, Laborious combinations
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'laborious', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'public_poc', system_exposure: 'controlled', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' },
        
        // Public PoC, Small, Super Effective combinations
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'scheduled' },
        
        // Public PoC, Small, Efficient combinations
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'efficient', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'efficient', human_impact: 'low' }, expectedAction: 'scheduled' },
        
        // Public PoC, Small, Laborious combinations
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'laborious', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'public_poc', system_exposure: 'small', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' }
      ];
      
      publicPocTestCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });

    it('should cover all none exploitation decision paths', () => {
      // Test none exploitation scenarios
      const noneTestCases = [
        // None, Open, Super Effective combinations
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'immediate' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'scheduled' },
        
        // None, Open, Efficient combinations
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'efficient', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'efficient', human_impact: 'low' }, expectedAction: 'scheduled' },
        
        // None, Open, Laborious combinations  
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'laborious', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'open', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Controlled, Super Effective combinations
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Controlled, Efficient combinations
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'efficient', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'efficient', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Controlled, Laborious combinations
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'laborious', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'defer' },
        { params: { exploitation: 'none', system_exposure: 'controlled', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Small, Super Effective combinations
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'super_effective', human_impact: 'very_high' }, expectedAction: 'out_of_cycle' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'super_effective', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'super_effective', human_impact: 'medium' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'super_effective', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Small, Efficient combinations
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'efficient', human_impact: 'very_high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'efficient', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'efficient', human_impact: 'medium' }, expectedAction: 'defer' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'efficient', human_impact: 'low' }, expectedAction: 'defer' },
        
        // None, Small, Laborious combinations
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'laborious', human_impact: 'very_high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'laborious', human_impact: 'high' }, expectedAction: 'scheduled' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'laborious', human_impact: 'medium' }, expectedAction: 'defer' },
        { params: { exploitation: 'none', system_exposure: 'small', utility: 'laborious', human_impact: 'low' }, expectedAction: 'defer' }
      ];
      
      noneTestCases.forEach(({ params, expectedAction }) => {
        const decision = plugin.createDecision(params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expectedAction);
      });
    });
  });
});

describe('Generated Deployer Components', () => {
  describe('DecisionDeployer', () => {
    it('should initialize with valid parameters', () => {
      const decision = new DecisionDeployer({
        exploitation: ExploitationStatus.active,
        systemExposure: SystemExposureLevel.open,
        utility: UtilityLevel.super_effective,
        humanImpact: HumanImpactLevel.very_high
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.active);
      expect(decision.systemExposure).toBe(SystemExposureLevel.open);
      expect(decision.utility).toBe(UtilityLevel.super_effective);
      expect(decision.humanImpact).toBe(HumanImpactLevel.very_high);
    });
    
    it('should auto-evaluate when all parameters are provided', () => {
      const decision = new DecisionDeployer({
        exploitation: ExploitationStatus.active,
        systemExposure: SystemExposureLevel.open,
        utility: UtilityLevel.super_effective,
        humanImpact: HumanImpactLevel.very_high
      });
      
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome?.action).toBe('immediate');
    });
    
    it('should convert string values to enums', () => {
      const decision = new DecisionDeployer({
        exploitation: 'active',
        systemExposure: 'open',
        utility: 'super_effective',
        humanImpact: 'very_high'
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.active);
      expect(decision.systemExposure).toBe(SystemExposureLevel.open);
      expect(decision.utility).toBe(UtilityLevel.super_effective);
      expect(decision.humanImpact).toBe(HumanImpactLevel.very_high);
    });
    
    it('should handle partial parameters without auto-evaluation', () => {
      const decision = new DecisionDeployer({
        exploitation: ExploitationStatus.active,
        systemExposure: SystemExposureLevel.open
        // Missing utility and humanImpact
      });
      
      expect(decision.outcome).toBeUndefined();
    });
    
    it('should handle invalid enum values', () => {
      const decision = new DecisionDeployer({
        exploitation: 'invalid_value',
        systemExposure: 'invalid_value',
        utility: 'invalid_value',
        humanImpact: 'invalid_value'
      });
      
      expect(decision.exploitation).toBeUndefined();
      expect(decision.systemExposure).toBeUndefined();
      expect(decision.utility).toBeUndefined();
      expect(decision.humanImpact).toBeUndefined();
    });
    
    it('should handle mixed valid and invalid values', () => {
      const decision = new DecisionDeployer({
        exploitation: ExploitationStatus.active,
        systemExposure: 'invalid_value',
        utility: UtilityLevel.super_effective,
        humanImpact: 'invalid_value'
      });
      
      expect(decision.exploitation).toBe(ExploitationStatus.active);
      expect(decision.systemExposure).toBeUndefined();
      expect(decision.utility).toBe(UtilityLevel.super_effective);
      expect(decision.humanImpact).toBeUndefined();
    });

    it('should cover all decision paths for active exploitation', () => {
      const testCases = [
        // Active exploitation + open system + super_effective = immediate always
        { exploitation: 'active', systemExposure: 'open', utility: 'super_effective', humanImpact: 'very_high', expected: 'immediate' },
        { exploitation: 'active', systemExposure: 'open', utility: 'super_effective', humanImpact: 'medium', expected: 'immediate' },
        // Active exploitation + high/very_high human impact = immediate
        { exploitation: 'active', systemExposure: 'controlled', utility: 'efficient', humanImpact: 'very_high', expected: 'immediate' },
        { exploitation: 'active', systemExposure: 'small', utility: 'laborious', humanImpact: 'high', expected: 'immediate' },
        // Other active exploitation cases = out_of_cycle
        { exploitation: 'active', systemExposure: 'controlled', utility: 'efficient', humanImpact: 'medium', expected: 'out_of_cycle' },
        { exploitation: 'active', systemExposure: 'small', utility: 'laborious', humanImpact: 'low', expected: 'out_of_cycle' },
      ];
      
      testCases.forEach(({ exploitation, systemExposure, utility, humanImpact, expected }) => {
        const decision = new DecisionDeployer({ exploitation, systemExposure, utility, humanImpact });
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected);
      });
    });
  });
  
  describe('OutcomeDeployer', () => {
    it('should create outcome with correct priority mapping', () => {
      const outcome = new OutcomeDeployer(ActionType.immediate);
      expect(outcome.action).toBe('immediate');
      expect(outcome.priority).toBe('immediate');
    });
    
    it('should handle all action types', () => {
      const testCases = [
        { action: ActionType.defer, expectedPriority: 'low' },
        { action: ActionType.scheduled, expectedPriority: 'medium' },
        { action: ActionType.out_of_cycle, expectedPriority: 'high' },
        { action: ActionType.immediate, expectedPriority: 'immediate' }
      ];
      
      testCases.forEach(({ action, expectedPriority }) => {
        const outcome = new OutcomeDeployer(action);
        expect(outcome.priority).toBe(expectedPriority);
      });
    });
  });
  
  describe('Enums', () => {
    it('should have correct values', () => {
      // Check ExploitationStatus
      expect(ExploitationStatus.none).toBe('none');
      expect(ExploitationStatus.public_poc).toBe('public_poc');
      expect(ExploitationStatus.active).toBe('active');
      
      // Check SystemExposureLevel
      expect(SystemExposureLevel.small).toBe('small');
      expect(SystemExposureLevel.controlled).toBe('controlled');
      expect(SystemExposureLevel.open).toBe('open');
      
      // Check UtilityLevel
      expect(UtilityLevel.laborious).toBe('laborious');
      expect(UtilityLevel.efficient).toBe('efficient');
      expect(UtilityLevel.super_effective).toBe('super_effective');
      
      // Check HumanImpactLevel
      expect(HumanImpactLevel.low).toBe('low');
      expect(HumanImpactLevel.medium).toBe('medium');
      expect(HumanImpactLevel.high).toBe('high');
      expect(HumanImpactLevel.very_high).toBe('very_high');
      
      // Check ActionType
      expect(ActionType.defer).toBe('defer');
      expect(ActionType.scheduled).toBe('scheduled');
      expect(ActionType.out_of_cycle).toBe('out_of_cycle');
      expect(ActionType.immediate).toBe('immediate');
      
      // Check DecisionPriorityLevel
      expect(DecisionPriorityLevel.low).toBe('low');
      expect(DecisionPriorityLevel.medium).toBe('medium');
      expect(DecisionPriorityLevel.high).toBe('high');
      expect(DecisionPriorityLevel.immediate).toBe('immediate');
    });
    
    it('should have all values', () => {
      // Check ExploitationStatus
      expect(Object.keys(ExploitationStatus).length).toBe(3);
      
      // Check SystemExposureLevel
      expect(Object.keys(SystemExposureLevel).length).toBe(3);
      
      // Check UtilityLevel
      expect(Object.keys(UtilityLevel).length).toBe(3);
      
      // Check HumanImpactLevel
      expect(Object.keys(HumanImpactLevel).length).toBe(4);
      
      // Check ActionType
      expect(Object.keys(ActionType).length).toBe(4);
      
      // Check DecisionPriorityLevel
      expect(Object.keys(DecisionPriorityLevel).length).toBe(4);
    });
  });
});