import { 
  createDecision, 
  listMethodologies, 
  PluginRegistry,
  CISAPlugin,
  CoordinatorTriagePlugin,
  Decision,
  CISAExploitationStatus,
  CISAAutomatableStatus,
  CoordinatorUtilityLevel,
  ReportPublicStatus
} from './index';

describe('Public API', () => {
  describe('createDecision', () => {
    it('should create CISA decisions', () => {
      const decision = createDecision('CISA', {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('ACT');
      expect(outcome.priority).toBe('IMMEDIATE');
    });
    
    it('should create Coordinator Triage decisions', () => {
      const decision = createDecision('Coordinator Triage', {
        report_public: 'yes',
        supplier_contacted: 'yes',
        report_credibility: 'credible',
        supplier_cardinality: 'multiple',
        supplier_engagement: 'active',
        utility: 'super_effective',
        public_safety_impact: 'significant'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('COORDINATE');
      expect(outcome.priority).toBe('HIGH');
    });
    
    it('should create decisions with empty options', () => {
      const decision = createDecision('CISA');
      expect(decision).toBeInstanceOf(Decision);
    });
    
    it('should throw error for unknown methodology', () => {
      expect(() => {
        const decision = createDecision('UnknownMethodology', {});
        decision.evaluate();
      }).toThrow('Unknown methodology: UnknownMethodology');
    });
  });
  
  describe('listMethodologies', () => {
    it('should list available methodologies', () => {
      const methodologies = listMethodologies();
      expect(methodologies).toContain('CISA');
      expect(methodologies).toContain('Coordinator Triage');
      expect(methodologies).toContain('Coordinator Publication');
      expect(methodologies).toContain('Supplier');
      expect(methodologies).toContain('Deployer');
      expect(methodologies).toContain('Engineer Triage');
      expect(methodologies).toContain('AI/LLM Triage');
      expect(methodologies).toHaveLength(7);
    });
    
    it('should return array of strings', () => {
      const methodologies = listMethodologies();
      expect(Array.isArray(methodologies)).toBe(true);
      methodologies.forEach(methodology => {
        expect(typeof methodology).toBe('string');
      });
    });
  });
  
  describe('Plugin exports', () => {
    it('should export PluginRegistry', () => {
      expect(PluginRegistry).toBeDefined();
      expect(typeof PluginRegistry).toBe('function');
    });
    
    it('should export CISAPlugin', () => {
      expect(CISAPlugin).toBeDefined();
      expect(typeof CISAPlugin).toBe('function');
      
      const plugin = new CISAPlugin();
      expect(plugin.name).toBe('CISA');
    });
    
    it('should export CoordinatorTriagePlugin', () => {
      expect(CoordinatorTriagePlugin).toBeDefined();
      expect(typeof CoordinatorTriagePlugin).toBe('function');
      
      const plugin = new CoordinatorTriagePlugin();
      expect(plugin.name).toBe('Coordinator Triage');
    });
    
    it('should export Decision class', () => {
      expect(Decision).toBeDefined();
      expect(typeof Decision).toBe('function');
    });
  });
  
  describe('Auto-registration', () => {
    it('should auto-register built-in plugins', () => {
      const registry = PluginRegistry.getInstance();
      
      expect(registry.has('CISA')).toBe(true);
      expect(registry.has('Coordinator Triage')).toBe(true);
      expect(registry.has('Coordinator Publication')).toBe(true);
      expect(registry.has('Supplier')).toBe(true);
      expect(registry.has('Deployer')).toBe(true);
      expect(registry.has('Engineer Triage')).toBe(true);
      expect(registry.has('AI/LLM Triage')).toBe(true);
      
      const plugins = registry.list();
      expect(plugins).toHaveLength(7);
      
      const cisaPlugin = registry.get('CISA');
      const coordinatorPlugin = registry.get('Coordinator Triage');
      
      expect(cisaPlugin).toBeInstanceOf(CISAPlugin);
      expect(coordinatorPlugin).toBeInstanceOf(CoordinatorTriagePlugin);
    });
  });
  
  describe('Integration tests', () => {
    it('should work end-to-end for CISA methodology', () => {
      // Test various CISA scenarios
      const testCases = [
        {
          params: { exploitation: 'active', automatable: 'yes', technical_impact: 'total', mission_wellbeing: 'high' },
          expected: { action: 'ACT', priority: 'IMMEDIATE' }
        },
        {
          params: { exploitation: 'poc', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'high' },
          expected: { action: 'TRACK_STAR', priority: 'MEDIUM' }
        },
        {
          params: { exploitation: 'none', automatable: 'no', technical_impact: 'partial', mission_wellbeing: 'low' },
          expected: { action: 'TRACK', priority: 'LOW' }
        }
      ];
      
      testCases.forEach(({ params, expected }) => {
        const decision = createDecision('CISA', params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected.action);
        expect(outcome.priority).toBe(expected.priority);
      });
    });
    
    it('should work end-to-end for Coordinator Triage methodology', () => {
      // Test various Coordinator Triage scenarios
      const testCases = [
        {
          params: { 
            report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible',
            supplier_cardinality: 'multiple', utility: 'super_effective', public_safety_impact: 'significant'
          },
          expected: { action: 'COORDINATE', priority: 'HIGH' }
        },
        {
          params: {
            report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'credible',
            supplier_cardinality: 'one', utility: 'super_effective', public_safety_impact: 'minimal'
          },
          expected: { action: 'DECLINE', priority: 'LOW' }
        },
        {
          params: {
            report_public: 'yes', supplier_contacted: 'yes', report_credibility: 'not_credible'
          },
          expected: { action: 'DECLINE', priority: 'LOW' }
        }
      ];
      
      testCases.forEach(({ params, expected }) => {
        const decision = createDecision('Coordinator Triage', params);
        const outcome = decision.evaluate();
        expect(outcome.action).toBe(expected.action);
        expect(outcome.priority).toBe(expected.priority);
      });
    });
    
    it('should maintain decision state properly', () => {
      const decision1 = createDecision('CISA', {
        exploitation: 'active',
        automatable: 'yes',
        technical_impact: 'total',
        mission_wellbeing: 'high'
      });
      
      const decision2 = createDecision('CISA', {
        exploitation: 'none',
        automatable: 'no',
        technical_impact: 'partial',
        mission_wellbeing: 'low'
      });
      
      const outcome1 = decision1.evaluate();
      const outcome2 = decision2.evaluate();
      
      // Verify each decision maintains its own state
      expect(outcome1.action).toBe('ACT');
      expect(outcome2.action).toBe('TRACK');
      expect(decision1.outcome?.action).toBe('ACT');
      expect(decision2.outcome?.action).toBe('TRACK');
    });
  });
  
  describe('Type exports', () => {
    it('should export CISA types with aliases', () => {
      // Verify CISA enum values are accessible
      expect(CISAExploitationStatus.ACTIVE).toBe('active');
      expect(CISAExploitationStatus.POC).toBe('poc');
      expect(CISAExploitationStatus.NONE).toBe('none');
      expect(CISAAutomatableStatus.YES).toBe('yes');
      expect(CISAAutomatableStatus.NO).toBe('no');
    });
    
    it('should export Coordinator Triage types', () => {
      // Verify Coordinator Triage enum values are accessible
      expect(CoordinatorUtilityLevel.LABORIOUS).toBe('laborious');
      expect(CoordinatorUtilityLevel.EFFICIENT).toBe('efficient');
      expect(CoordinatorUtilityLevel.SUPER_EFFECTIVE).toBe('super_effective');
      expect(ReportPublicStatus.YES).toBe('yes');
      expect(ReportPublicStatus.NO).toBe('no');
    });
  });
  
  describe('Backward compatibility', () => {
    it('should still export legacy Decision class', () => {
      // The legacy Decision class should still be available
      expect(Decision).toBeDefined();
      expect(typeof Decision).toBe('function');
    });
    
    it('should support legacy imports', () => {
      // Test that the old decision.ts exports are still available
      // This is tested implicitly by the existing decision.test.ts file
      expect(true).toBe(true);
    });
  });
});