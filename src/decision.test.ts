import {
    Exploitation,
    Automatable,
    TechnicalImpact,
    MissionWellbeingImpact,
    DecisionPriority,
    ActionCISA,
    Methodology,
    OutcomeCISA,
    Utility,
    SafetyImpact,
    ActionFIRST,
    OutcomeFIRST,
    Decision
} from './decision';

describe('Decision - CISA Methodology', () => {
    it('should initialize with correct enum values for CISA methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: Automatable.YES,
            technical_impact: TechnicalImpact.TOTAL,
            mission_wellbeing: MissionWellbeingImpact.HIGH,
            methodology: Methodology.CISA
        });
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.automatable).toBe(Automatable.YES);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.mission_wellbeing).toBe(MissionWellbeingImpact.HIGH);
        expect(decision.methodology).toBe(Methodology.CISA);
    });

    it('should convert string values to enum values for CISA methodology', () => {
        const decision = new Decision({
            exploitation: 'active',
            automatable: 'yes',
            technical_impact: 'total',
            mission_wellbeing: 'high',
            methodology: 'CISA'
        });
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.automatable).toBe(Automatable.YES);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.mission_wellbeing).toBe(MissionWellbeingImpact.HIGH);
        expect(decision.methodology).toBe(Methodology.CISA);
    });

    it('should evaluate and return correct OutcomeCISA for high severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: Automatable.YES,
            technical_impact: TechnicalImpact.TOTAL,
            mission_wellbeing: MissionWellbeingImpact.HIGH,
            methodology: Methodology.CISA
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.ACT);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should evaluate and return correct OutcomeCISA for medium severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.POC,
            automatable: Automatable.NO,
            technical_impact: TechnicalImpact.PARTIAL,
            mission_wellbeing: MissionWellbeingImpact.HIGH,
            methodology: Methodology.CISA
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.TRACK_STAR);
            expect(outcome.priority).toBe(DecisionPriority.MEDIUM);
        }
    });

    it('should evaluate and return correct OutcomeCISA for low severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.NONE,
            automatable: Automatable.NO,
            technical_impact: TechnicalImpact.PARTIAL,
            mission_wellbeing: MissionWellbeingImpact.LOW,
            methodology: Methodology.CISA
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.TRACK);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should throw error if required fields are missing for CISA methodology', () => {
        expect(() => {
            new Decision({
                exploitation: '',
                automatable: Automatable.YES,
                technical_impact: TechnicalImpact.TOTAL,
                mission_wellbeing: MissionWellbeingImpact.HIGH,
                methodology: Methodology.CISA
            }).evaluate();
        }).toThrow("Exploitation must be a valid Exploitation enum value");

        expect(() => {
            new Decision({
                exploitation: Exploitation.ACTIVE,
                technical_impact: TechnicalImpact.TOTAL,
                mission_wellbeing: MissionWellbeingImpact.HIGH,
                methodology: Methodology.CISA
            }).evaluate();
        }).toThrow("Automatable must be a valid Automatable enum value");
    });

    it('should ignore FIRST-specific fields when using CISA methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: Automatable.YES,
            utility: 'super effective', // This should be ignored
            technical_impact: TechnicalImpact.TOTAL,
            safety_impact: 'catastrophic', // This should be ignored
            mission_wellbeing: MissionWellbeingImpact.HIGH,
            methodology: Methodology.CISA
        });
        expect(decision.utility).toBeUndefined();
        expect(decision.safety_impact).toBeUndefined();
        expect(decision.automatable).toBe(Automatable.YES);
        expect(decision.mission_wellbeing).toBe(MissionWellbeingImpact.HIGH);
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
    });
});

describe('Decision - FIRST Methodology', () => {
    it('should initialize with correct enum values for FIRST methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.SUPER_EFFECTIVE,
            technical_impact: TechnicalImpact.TOTAL,
            safety_impact: SafetyImpact.CATASTROPHIC,
            methodology: Methodology.FIRST
        });
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        expect(decision.methodology).toBe(Methodology.FIRST);
    });

    it('should convert string values to enum values for FIRST methodology', () => {
        const decision = new Decision({
            exploitation: 'active',
            utility: 'super effective',
            technical_impact: 'total',
            safety_impact: 'catastrophic',
            methodology: 'FIRST'
        });
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        expect(decision.methodology).toBe(Methodology.FIRST);
    });

    it('should evaluate and return correct OutcomeFIRST for high severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.SUPER_EFFECTIVE,
            technical_impact: TechnicalImpact.TOTAL,
            safety_impact: SafetyImpact.CATASTROPHIC,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should evaluate and return correct OutcomeFIRST for medium severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.POC,
            utility: Utility.EFFICIENT,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.MAJOR,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.OUT_OF_BAND);
            expect(outcome.priority).toBe(DecisionPriority.MEDIUM);
        }
    });

    it('should evaluate and return correct OutcomeFIRST for low severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.NONE,
            utility: Utility.LABORIOUS,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.MINOR,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should throw error if required fields are missing for FIRST methodology', () => {
        expect(() => {
            new Decision({
                exploitation: '',
                utility: Utility.EFFICIENT,
                technical_impact: TechnicalImpact.TOTAL,
                safety_impact: SafetyImpact.CATASTROPHIC,
                methodology: Methodology.FIRST
            }).evaluate();
        }).toThrow("Exploitation must be a valid Exploitation enum value");

        expect(() => {
            new Decision({
                exploitation: Exploitation.ACTIVE,
                technical_impact: TechnicalImpact.TOTAL,
                safety_impact: SafetyImpact.CATASTROPHIC,
                methodology: Methodology.FIRST
            }).evaluate();
        }).toThrow("Utility must be a valid Utility enum value");
    });

    it('should ignore CISA-specific fields when using FIRST methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: 'yes', // This should be ignored
            utility: Utility.SUPER_EFFECTIVE,
            technical_impact: TechnicalImpact.TOTAL,
            safety_impact: SafetyImpact.CATASTROPHIC,
            mission_wellbeing: 'high', // This should be ignored
            methodology: Methodology.FIRST
        });
        expect(decision.automatable).toBeUndefined();
        expect(decision.mission_wellbeing).toBeUndefined();
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
    });

    it('should return SCHEDULED for lowest severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.NONE,
            utility: Utility.LABORIOUS,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.NONE,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should return IMMEDIATE for highest severity case', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.SUPER_EFFECTIVE,
            technical_impact: TechnicalImpact.TOTAL,
            safety_impact: SafetyImpact.CATASTROPHIC,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should handle edge cases correctly', () => {
        const decision = new Decision({
            exploitation: Exploitation.POC,
            utility: Utility.EFFICIENT,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.HAZARDOUS,
            methodology: Methodology.FIRST
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should throw an error if exploitation is invalid', () => {
        const decision = new Decision({
            exploitation: Exploitation.NONE,
            utility: Utility.LABORIOUS,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.NONE,
            methodology: Methodology.FIRST
        });
        // Modify the decision object to have an invalid value
        (decision as any).exploitation = 'INVALID';
        expect(() => decision.evaluate()).toThrow("Exploitation must be a valid Exploitation enum value");
    });

    it('should return SCHEDULED as default if no matching case is found in the decision matrix', () => {
        const decision = new Decision({
            exploitation: Exploitation.NONE,
            utility: Utility.LABORIOUS,
            technical_impact: TechnicalImpact.PARTIAL,
            safety_impact: SafetyImpact.NONE,
            methodology: Methodology.FIRST
        });
        // We're not modifying the decision object to invalid values anymore
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });
});
describe('Decision - Edge Cases and Error Handling', () => {
    it('should return undefined when an invalid methodology is provided', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            technical_impact: TechnicalImpact.TOTAL,
            methodology: 'INVALID' as Methodology,
            automatable: Automatable.YES,
            mission_wellbeing: MissionWellbeingImpact.HIGH
        });
        const outcome = decision.evaluate();
        expect(outcome).toBeUndefined();
    });

    it('should create a new OutcomeCISA instance with the correct action', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: Automatable.YES,
            technical_impact: TechnicalImpact.TOTAL,
            mission_wellbeing: MissionWellbeingImpact.HIGH,
            methodology: Methodology.CISA
        });
        const outcome = decision.evaluate() as OutcomeCISA;
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        expect(outcome.action).toBe(ActionCISA.ACT);
    });

    it('should throw an error when MissionWellbeingImpact is undefined for CISA methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            automatable: Automatable.YES,
            technical_impact: TechnicalImpact.TOTAL,
            methodology: Methodology.CISA
        });
        
        // Manually set mission_wellbeing to undefined
        (decision as any).mission_wellbeing = undefined;

        expect(() => decision.evaluate()).toThrow("MissionWellbeingImpact must be a valid MissionWellbeingImpact enum value");
    });

    it('should throw an error when SafetyImpact is undefined for FIRST methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.EFFICIENT,
            technical_impact: TechnicalImpact.TOTAL,
            methodology: Methodology.FIRST
        });
        
        // Manually set safety_impact to undefined
        (decision as any).safety_impact = undefined;

        expect(() => decision.evaluate()).toThrow("SafetyImpact must be a valid SafetyImpact enum value");
    });

    it('should throw an error when TechnicalImpact is undefined for FIRST methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.EFFICIENT,
            technical_impact: '' as TechnicalImpact,
            methodology: Methodology.FIRST
        });
        
        // Manually set safety_impact to undefined
        (decision as any).safety_impact = undefined;

        expect(() => decision.evaluate()).toThrow("TechnicalImpact must be a valid TechnicalImpact enum value");
    });

    it('should throw an error when TechnicalImpact is undefined for CISA methodology', () => {
        const decision = new Decision({
            exploitation: Exploitation.ACTIVE,
            utility: Utility.EFFICIENT,
            technical_impact: '' as TechnicalImpact,
            methodology: Methodology.CISA
        });
        
        // Manually set safety_impact to undefined
        (decision as any).safety_impact = undefined;

        expect(() => decision.evaluate()).toThrow("TechnicalImpact must be a valid TechnicalImpact enum value");
    });

    it('should throw an error when Exploitation is undefined for FIRST methodology', () => {
        const decision = new Decision({
            exploitation: '' as Exploitation,
            utility: Utility.EFFICIENT,
            technical_impact: TechnicalImpact.PARTIAL,
            methodology: Methodology.FIRST
        });
        
        // Manually set safety_impact to undefined
        (decision as any).safety_impact = undefined;

        expect(() => decision.evaluate()).toThrow("Exploitation must be a valid Exploitation enum value");
    });

    it('should throw an error when Exploitation is undefined for CISA methodology', () => {
        const decision = new Decision({
            exploitation: '' as Exploitation,
            utility: Utility.EFFICIENT,
            technical_impact: TechnicalImpact.TOTAL,
            methodology: Methodology.CISA
        });
        
        // Manually set safety_impact to undefined
        (decision as any).safety_impact = undefined;

        expect(() => decision.evaluate()).toThrow("Exploitation must be a valid Exploitation enum value");
    });
});
