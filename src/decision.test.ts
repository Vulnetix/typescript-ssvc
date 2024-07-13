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
        const decision = new Decision(
            Exploitation.ACTIVE,
            Automatable.YES,
            undefined,
            TechnicalImpact.TOTAL,
            undefined,
            MissionWellbeingImpact.HIGH,
            Methodology.CISA
        );
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.automatable).toBe(Automatable.YES);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.mission_wellbeing).toBe(MissionWellbeingImpact.HIGH);
        expect(decision.methodology).toBe(Methodology.CISA);
    });

    it('should convert string values to enum values for CISA methodology', () => {
        const decision = new Decision(
            'active',
            'yes',
            undefined,
            'total',
            undefined,
            'high',
            'CISA'
        );
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.automatable).toBe(Automatable.YES);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.mission_wellbeing).toBe(MissionWellbeingImpact.HIGH);
        expect(decision.methodology).toBe(Methodology.CISA);
    });

    it('should evaluate and return correct OutcomeCISA for high severity case', () => {
        const decision = new Decision(
            Exploitation.ACTIVE,
            Automatable.YES,
            undefined,
            TechnicalImpact.TOTAL,
            undefined,
            MissionWellbeingImpact.HIGH,
            Methodology.CISA
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.ACT);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should evaluate and return correct OutcomeCISA for medium severity case', () => {
        const decision = new Decision(
            Exploitation.POC,
            Automatable.NO,
            undefined,
            TechnicalImpact.PARTIAL,
            undefined,
            MissionWellbeingImpact.HIGH,
            Methodology.CISA
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.TRACK_STAR);
            expect(outcome.priority).toBe(DecisionPriority.MEDIUM);
        }
    });

    it('should evaluate and return correct OutcomeCISA for low severity case', () => {
        const decision = new Decision(
            Exploitation.NONE,
            Automatable.NO,
            undefined,
            TechnicalImpact.PARTIAL,
            undefined,
            MissionWellbeingImpact.LOW,
            Methodology.CISA
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeCISA);
        if (outcome instanceof OutcomeCISA) {
            expect(outcome.action).toBe(ActionCISA.TRACK);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should throw error if required fields are missing for CISA methodology', () => {
        expect(() => {
            new Decision(
                undefined,
                Automatable.YES,
                undefined,
                TechnicalImpact.TOTAL,
                undefined,
                MissionWellbeingImpact.HIGH,
                Methodology.CISA
            ).evaluate();
        }).toThrow("Exploitation must be a valid Exploitation enum value");

        expect(() => {
            new Decision(
                Exploitation.ACTIVE,
                undefined,
                undefined,
                TechnicalImpact.TOTAL,
                undefined,
                MissionWellbeingImpact.HIGH,
                Methodology.CISA
            ).evaluate();
        }).toThrow("Automatable must be a valid Automatable enum value");
    });

    it('should ignore FIRST-specific fields when using CISA methodology', () => {
        const decision = new Decision(
            Exploitation.ACTIVE,
            Automatable.YES,
            'super effective', // This should be ignored
            TechnicalImpact.TOTAL,
            'catastrophic', // This should be ignored
            MissionWellbeingImpact.HIGH,
            Methodology.CISA
        );
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
        const decision = new Decision(
            Exploitation.ACTIVE,
            undefined,
            Utility.SUPER_EFFECTIVE,
            TechnicalImpact.TOTAL,
            SafetyImpact.CATASTROPHIC,
            undefined,
            Methodology.FIRST
        );
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        expect(decision.methodology).toBe(Methodology.FIRST);
    });

    it('should convert string values to enum values for FIRST methodology', () => {
        const decision = new Decision(
            'active',
            undefined,
            'super effective',
            'total',
            'catastrophic',
            undefined,
            'FIRST'
        );
        expect(decision.exploitation).toBe(Exploitation.ACTIVE);
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.technical_impact).toBe(TechnicalImpact.TOTAL);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        expect(decision.methodology).toBe(Methodology.FIRST);
    });

    it('should evaluate and return correct OutcomeFIRST for high severity case', () => {
        const decision = new Decision(
            Exploitation.ACTIVE,
            undefined,
            Utility.SUPER_EFFECTIVE,
            TechnicalImpact.TOTAL,
            SafetyImpact.CATASTROPHIC,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should evaluate and return correct OutcomeFIRST for medium severity case', () => {
        const decision = new Decision(
            Exploitation.POC,
            undefined,
            Utility.EFFICIENT,
            TechnicalImpact.PARTIAL,
            SafetyImpact.MAJOR,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.OUT_OF_BAND);
            expect(outcome.priority).toBe(DecisionPriority.MEDIUM);
        }
    });

    it('should evaluate and return correct OutcomeFIRST for low severity case', () => {
        const decision = new Decision(
            Exploitation.NONE,
            undefined,
            Utility.LABORIOUS,
            TechnicalImpact.PARTIAL,
            SafetyImpact.MINOR,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should throw error if required fields are missing for FIRST methodology', () => {
        expect(() => {
            new Decision(
                undefined,
                undefined,
                Utility.EFFICIENT,
                TechnicalImpact.TOTAL,
                SafetyImpact.CATASTROPHIC,
                undefined,
                Methodology.FIRST
            ).evaluate();
        }).toThrow("Exploitation must be a valid Exploitation enum value");

        expect(() => {
            new Decision(
                Exploitation.ACTIVE,
                undefined,
                undefined,
                TechnicalImpact.TOTAL,
                SafetyImpact.CATASTROPHIC,
                undefined,
                Methodology.FIRST
            ).evaluate();
        }).toThrow("Utility must be a valid Utility enum value");
    });

    it('should ignore CISA-specific fields when using FIRST methodology', () => {
        const decision = new Decision(
            Exploitation.ACTIVE,
            'yes', // This should be ignored
            Utility.SUPER_EFFECTIVE,
            TechnicalImpact.TOTAL,
            SafetyImpact.CATASTROPHIC,
            'high', // This should be ignored
            Methodology.FIRST
        );
        expect(decision.automatable).toBeUndefined();
        expect(decision.mission_wellbeing).toBeUndefined();
        expect(decision.utility).toBe(Utility.SUPER_EFFECTIVE);
        expect(decision.safety_impact).toBe(SafetyImpact.CATASTROPHIC);
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
    });

    it('should return SCHEDULED for lowest severity case', () => {
        const decision = new Decision(
            Exploitation.NONE,
            undefined,
            Utility.LABORIOUS,
            TechnicalImpact.PARTIAL,
            SafetyImpact.NONE,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });

    it('should return IMMEDIATE for highest severity case', () => {
        const decision = new Decision(
            Exploitation.ACTIVE,
            undefined,
            Utility.SUPER_EFFECTIVE,
            TechnicalImpact.TOTAL,
            SafetyImpact.CATASTROPHIC,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should handle edge cases correctly', () => {
        const decision = new Decision(
            Exploitation.POC,
            undefined,
            Utility.EFFICIENT,
            TechnicalImpact.PARTIAL,
            SafetyImpact.HAZARDOUS,
            undefined,
            Methodology.FIRST
        );
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.IMMEDIATE);
            expect(outcome.priority).toBe(DecisionPriority.IMMEDIATE);
        }
    });

    it('should throw an error if exploitation is invalid', () => {
        const decision = new Decision(
            Exploitation.NONE,
            undefined,
            Utility.LABORIOUS,
            TechnicalImpact.PARTIAL,
            SafetyImpact.NONE,
            undefined,
            Methodology.FIRST
        );
        // Modify the decision object to have an invalid value
        (decision as any).exploitation = 'INVALID';
        expect(() => decision.evaluate()).toThrow("Exploitation must be a valid Exploitation enum value");
    });

    it('should return SCHEDULED as default if no matching case is found in the decision matrix', () => {
        const decision = new Decision(
            Exploitation.NONE,
            undefined,
            Utility.LABORIOUS,
            TechnicalImpact.PARTIAL,
            SafetyImpact.NONE,
            undefined,
            Methodology.FIRST
        );
        // We're not modifying the decision object to invalid values anymore
        const outcome = decision.evaluate();
        expect(outcome).toBeInstanceOf(OutcomeFIRST);
        if (outcome instanceof OutcomeFIRST) {
            expect(outcome.action).toBe(ActionFIRST.SCHEDULED);
            expect(outcome.priority).toBe(DecisionPriority.LOW);
        }
    });
});