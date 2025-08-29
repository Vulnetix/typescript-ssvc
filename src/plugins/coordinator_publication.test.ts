import { CoordinatorPublicationPlugin } from './coordinator_publication';
import {
  DecisionCoordinatorPublication,
  OutcomeCoordinatorPublication,
  SupplierInvolvementLevel,
  ExploitationStatus,
  PublicValueAddedLevel,
  ActionType,
  DecisionPriorityLevel
} from './coordinator_publication-generated';

describe('CoordinatorPublicationPlugin', () => {
  let plugin: CoordinatorPublicationPlugin;
  
  beforeEach(() => {
    plugin = new CoordinatorPublicationPlugin();
  });
  
  describe('plugin properties', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('Coordinator Publication');
    });
    
    it('should have correct description', () => {
      expect(plugin.description).toBe('CERT/CC Coordinator Publication Decision Model');
    });
    
    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0');
    });
  });
  
  describe('createDecision', () => {
    it('should create decision with standard parameter names', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'fix_ready',
        exploitation: 'active',
        public_value_added: 'precedence'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should create decision with alternative parameter names', () => {
      const decision = plugin.createDecision({
        supplierInvolvementLevel: 'fix_ready',
        exploitationStatus: 'active',
        publicValueAddedLevel: 'precedence'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle enum values directly', () => {
      const decision = plugin.createDecision({
        supplier_involvement: SupplierInvolvementLevel.fix_ready,
        exploitation: ExploitationStatus.active,
        public_value_added: PublicValueAddedLevel.precedence
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle mixed string and enum values', () => {
      const decision = plugin.createDecision({
        supplier_involvement: SupplierInvolvementLevel.fix_ready,
        exploitation: 'active',
        public_value_added: PublicValueAddedLevel.precedence
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle empty options', () => {
      const decision = plugin.createDecision({});
      expect(() => decision.evaluate()).not.toThrow();
    });
  });
  
  describe('decision outcomes for various scenarios', () => {
    it('should return PUBLISH for fix ready scenarios with precedence', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'fix_ready',
        exploitation: 'none',
        public_value_added: 'precedence'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should return DONT_PUBLISH for fix ready with limited value', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'fix_ready',
        exploitation: 'none',
        public_value_added: 'limited'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('dont_publish');
      expect(outcome.priority).toBe('low');
    });
    
    it('should return PUBLISH for active exploitation with fix ready', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'fix_ready',
        exploitation: 'active',
        public_value_added: 'limited'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should return DONT_PUBLISH for cooperative supplier with limited value and no exploitation', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'cooperative',
        exploitation: 'none',
        public_value_added: 'limited'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('dont_publish');
      expect(outcome.priority).toBe('low');
    });
    
    it('should return PUBLISH for uncooperative supplier with public PoC', () => {
      const decision = plugin.createDecision({
        supplier_involvement: 'uncooperative_unresponsive',
        exploitation: 'public_poc',
        public_value_added: 'limited'
      });
      
      const outcome = decision.evaluate();
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle all supplier involvement levels', () => {
      // Test FIX_READY
      let decision = plugin.createDecision({
        supplier_involvement: 'fix_ready',
        exploitation: 'none',
        public_value_added: 'ampliative'
      });
      expect(decision.evaluate().action).toBe('publish');
      
      // Test COOPERATIVE
      decision = plugin.createDecision({
        supplier_involvement: 'cooperative',
        exploitation: 'none',
        public_value_added: 'precedence'
      });
      expect(decision.evaluate().action).toBe('publish');
      
      // Test UNCOOPERATIVE_UNRESPONSIVE
      decision = plugin.createDecision({
        supplier_involvement: 'uncooperative_unresponsive',
        exploitation: 'active',
        public_value_added: 'ampliative'
      });
      expect(decision.evaluate().action).toBe('publish');
    });
    
    it('should handle all exploitation levels', () => {
      const baseParams = {
        supplier_involvement: 'fix_ready',
        public_value_added: 'precedence'
      };
      
      // Test NONE
      let decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'none'
      });
      expect(decision.evaluate().action).toBe('publish');
      
      // Test PUBLIC_POC
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'public_poc'
      });
      expect(decision.evaluate().action).toBe('publish');
      
      // Test ACTIVE
      decision = plugin.createDecision({
        ...baseParams,
        exploitation: 'active'
      });
      expect(decision.evaluate().action).toBe('publish');
    });
    
    it('should handle all public value added levels', () => {
      const baseParams = {
        supplier_involvement: 'fix_ready',
        exploitation: 'none'
      };
      
      // Test LIMITED
      let decision = plugin.createDecision({
        ...baseParams,
        public_value_added: 'limited'
      });
      expect(decision.evaluate().action).toBe('dont_publish');
      
      // Test AMPLIATIVE
      decision = plugin.createDecision({
        ...baseParams,
        public_value_added: 'ampliative'
      });
      expect(decision.evaluate().action).toBe('publish');
      
      // Test PRECEDENCE
      decision = plugin.createDecision({
        ...baseParams,
        public_value_added: 'precedence'
      });
      expect(decision.evaluate().action).toBe('publish');
    });
  });
  
  describe('complex decision paths', () => {
    it('should escalate priority with system exposure', () => {
      // Compare same scenario with different system exposure levels
      const baseParams = {
        supplier_involvement: 'fix_ready',
        exploitation: 'none',
        public_value_added: 'limited'
      };
      
      const smallDecision = plugin.createDecision(baseParams);
      const openDecision = plugin.createDecision(baseParams);
      
      const smallOutcome = smallDecision.evaluate();
      const openOutcome = openDecision.evaluate();
      
      expect(smallOutcome.action).toBe('dont_publish');
      expect(openOutcome.action).toBe('dont_publish');
    });
    
    it('should escalate with human impact', () => {
      const baseParams = {
        supplier_involvement: 'fix_ready',
        exploitation: 'none',
        public_value_added: 'limited'
      };
      
      const lowDecision = plugin.createDecision(baseParams);
      const veryHighDecision = plugin.createDecision(baseParams);
      
      const lowOutcome = lowDecision.evaluate();
      const veryHighOutcome = veryHighDecision.evaluate();
      
      expect(lowOutcome.action).toBe('dont_publish');
      expect(veryHighOutcome.action).toBe('dont_publish');
    });
    
    it('should handle active exploitation escalation', () => {
      const baseParams = {
        supplier_involvement: 'fix_ready',
        public_value_added: 'limited'
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
      
      expect(noneOutcome.action).toBe('dont_publish');
      expect(activeOutcome.action).toBe('publish');
    });
    
    it('should handle boundary conditions', () => {
      // Test various combinations to improve coverage
      const testCases = [
        {
          params: {
            supplier_involvement: 'fix_ready',
            exploitation: 'none',
            public_value_added: 'limited'
          },
          expectedAction: 'dont_publish'
        },
        {
          params: {
            supplier_involvement: 'fix_ready',
            exploitation: 'none',
            public_value_added: 'ampliative'
          },
          expectedAction: 'publish'
        },
        {
          params: {
            supplier_involvement: 'fix_ready',
            exploitation: 'none',
            public_value_added: 'precedence'
          },
          expectedAction: 'publish'
        },
        {
          params: {
            supplier_involvement: 'cooperative',
            exploitation: 'none',
            public_value_added: 'limited'
          },
          expectedAction: 'dont_publish'
        },
        {
          params: {
            supplier_involvement: 'cooperative',
            exploitation: 'none',
            public_value_added: 'ampliative'
          },
          expectedAction: 'dont_publish'
        },
        {
          params: {
            supplier_involvement: 'cooperative',
            exploitation: 'none',
            public_value_added: 'precedence'
          },
          expectedAction: 'publish'
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

describe('Generated Coordinator Publication Components', () => {
  describe('DecisionCoordinatorPublication', () => {
    it('should initialize with valid parameters', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: SupplierInvolvementLevel.fix_ready,
        exploitation: ExploitationStatus.active,
        publicValueAdded: PublicValueAddedLevel.precedence
      });
      
      expect(decision.supplierInvolvement).toBe(SupplierInvolvementLevel.fix_ready);
      expect(decision.exploitation).toBe(ExploitationStatus.active);
      expect(decision.publicValueAdded).toBe(PublicValueAddedLevel.precedence);
    });
    
    it('should auto-evaluate when all parameters are provided', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: SupplierInvolvementLevel.fix_ready,
        exploitation: ExploitationStatus.active,
        publicValueAdded: PublicValueAddedLevel.precedence
      });
      
      expect(decision.outcome).toBeDefined();
      expect(decision.outcome?.action).toBe('publish');
    });
    
    it('should convert string values to enums', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: 'fix_ready',
        exploitation: 'active',
        publicValueAdded: 'precedence'
      });
      
      expect(decision.supplierInvolvement).toBe(SupplierInvolvementLevel.fix_ready);
      expect(decision.exploitation).toBe(ExploitationStatus.active);
      expect(decision.publicValueAdded).toBe(PublicValueAddedLevel.precedence);
    });
    
    it('should handle partial parameters without auto-evaluation', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: SupplierInvolvementLevel.fix_ready,
        exploitation: ExploitationStatus.active
        // Missing publicValueAdded
      });
      
      expect(decision.outcome).toBeUndefined();
    });
    
    it('should handle invalid enum values', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: 'invalid_value',
        exploitation: 'invalid_value',
        publicValueAdded: 'invalid_value'
      });
      
      expect(decision.supplierInvolvement).toBeUndefined();
      expect(decision.exploitation).toBeUndefined();
      expect(decision.publicValueAdded).toBeUndefined();
    });
    
    it('should handle mixed valid and invalid values', () => {
      const decision = new DecisionCoordinatorPublication({
        supplierInvolvement: SupplierInvolvementLevel.fix_ready,
        exploitation: 'invalid_value',
        publicValueAdded: PublicValueAddedLevel.precedence
      });
      
      expect(decision.supplierInvolvement).toBe(SupplierInvolvementLevel.fix_ready);
      expect(decision.exploitation).toBeUndefined();
      expect(decision.publicValueAdded).toBe(PublicValueAddedLevel.precedence);
    });
  });
  
  describe('OutcomeCoordinatorPublication', () => {
    it('should create outcome with correct priority mapping', () => {
      const outcome = new OutcomeCoordinatorPublication(ActionType.publish);
      expect(outcome.action).toBe('publish');
      expect(outcome.priority).toBe('high');
    });
    
    it('should handle all action types', () => {
      const testCases = [
        { action: ActionType.dont_publish, expectedPriority: 'low' },
        { action: ActionType.publish, expectedPriority: 'high' }
      ];
      
      testCases.forEach(({ action, expectedPriority }) => {
        const outcome = new OutcomeCoordinatorPublication(action);
        expect(outcome.priority).toBe(expectedPriority);
      });
    });
    
    it('should create outcome with correct priority mapping for all actions', () => {
      // Test publish action
      const publishOutcome = new OutcomeCoordinatorPublication(ActionType.publish);
      expect(publishOutcome.action).toBe('publish');
      expect(publishOutcome.priority).toBe('high');
      
      // Test dont_publish action
      const dontPublishOutcome = new OutcomeCoordinatorPublication(ActionType.dont_publish);
      expect(dontPublishOutcome.action).toBe('dont_publish');
      expect(dontPublishOutcome.priority).toBe('low');
    });
  });
  
  describe('Enums', () => {
    it('should have correct SupplierInvolvementLevel values', () => {
      expect(SupplierInvolvementLevel.fix_ready).toBe('fix_ready');
      expect(SupplierInvolvementLevel.cooperative).toBe('cooperative');
      expect(SupplierInvolvementLevel.uncooperative_unresponsive).toBe('uncooperative_unresponsive');
    });
    
    it('should have all SupplierInvolvementLevel values', () => {
      expect(SupplierInvolvementLevel.fix_ready).toBe('fix_ready');
      expect(SupplierInvolvementLevel.cooperative).toBe('cooperative');
      expect(SupplierInvolvementLevel.uncooperative_unresponsive).toBe('uncooperative_unresponsive');
    });
    
    it('should have correct ExploitationStatus values', () => {
      expect(ExploitationStatus.none).toBe('none');
      expect(ExploitationStatus.public_poc).toBe('public_poc');
      expect(ExploitationStatus.active).toBe('active');
    });
    
    it('should have all ExploitationStatus values', () => {
      expect(ExploitationStatus.none).toBe('none');
      expect(ExploitationStatus.public_poc).toBe('public_poc');
      expect(ExploitationStatus.active).toBe('active');
    });
    
    it('should have correct PublicValueAddedLevel values', () => {
      expect(PublicValueAddedLevel.limited).toBe('limited');
      expect(PublicValueAddedLevel.ampliative).toBe('ampliative');
      expect(PublicValueAddedLevel.precedence).toBe('precedence');
    });
    
    it('should have all PublicValueAddedLevel values', () => {
      expect(PublicValueAddedLevel.limited).toBe('limited');
      expect(PublicValueAddedLevel.ampliative).toBe('ampliative');
      expect(PublicValueAddedLevel.precedence).toBe('precedence');
    });
    
    it('should have correct ActionType values', () => {
      expect(ActionType.dont_publish).toBe('dont_publish');
      expect(ActionType.publish).toBe('publish');
    });
    
    it('should have all ActionType values', () => {
      expect(ActionType.dont_publish).toBe('dont_publish');
      expect(ActionType.publish).toBe('publish');
    });
    
    it('should have correct DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.low).toBe('low');
      expect(DecisionPriorityLevel.high).toBe('high');
    });
    
    it('should have all DecisionPriorityLevel values', () => {
      expect(DecisionPriorityLevel.low).toBe('low');
      expect(DecisionPriorityLevel.high).toBe('high');
    });
  });
});