enum ExploitationLevel {
    NONE = "none",
    POC = "poc",
    ACTIVE = "active"
}

enum Automatable {
    YES = "yes",
    NO = "no"
}

enum TechnicalImpact {
    PARTIAL = "partial",
    TOTAL = "total"
}

enum MissionWellbeingImpact {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

enum DecisionPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    IMMEDIATE = "immediate"
}

enum ActionCISA {
    TRACK = "Track",
    TRACK_STAR = "Track*",
    ATTEND = "Attend",
    ACT = "Act"
}

enum Methodology {
    FIRST = "FIRST",
    CISA = "CISA"
}

const priorityMap: Record<ActionCISA, DecisionPriority> = {
    [ActionCISA.TRACK]: DecisionPriority.LOW,
    [ActionCISA.TRACK_STAR]: DecisionPriority.MEDIUM,
    [ActionCISA.ATTEND]: DecisionPriority.MEDIUM,
    [ActionCISA.ACT]: DecisionPriority.IMMEDIATE,
};

class OutcomeCISA {
    priority: DecisionPriority;
    action: ActionCISA;

    constructor(action: ActionCISA) {
        this.priority = priorityMap[action];
        this.action = action;
    }
}
class Decision {
    exploitation?: ExploitationLevel;
    automatable?: Automatable;
    technical_impact?: TechnicalImpact;
    mission_wellbeing?: MissionWellbeingImpact;
    outcome?: OutcomeCISA;
    methodology: Methodology = Methodology.CISA;

    constructor(
        exploitation?: ExploitationLevel | string,
        automatable?: Automatable | string,
        technical_impact?: TechnicalImpact | string,
        mission_wellbeing?: MissionWellbeingImpact | string,
        methodology: Methodology | string = Methodology.CISA
    ) {
        this.exploitation = this.toEnum(ExploitationLevel, exploitation);
        this.automatable = this.toEnum(Automatable, automatable);
        this.technical_impact = this.toEnum(TechnicalImpact, technical_impact);
        this.mission_wellbeing = this.toEnum(MissionWellbeingImpact, mission_wellbeing);
        this.methodology = this.toEnum(Methodology, methodology) ?? Methodology.CISA;

        if (
            this.exploitation !== undefined &&
            this.automatable !== undefined &&
            this.technical_impact !== undefined &&
            this.mission_wellbeing !== undefined
        ) {
            this.evaluate();
        }
    }

    private toEnum<T extends { [key: string]: string }>(
        enumObj: T,
        value?: T[keyof T] | string
    ): T[keyof T] | undefined {
        if (value === undefined) {
            return undefined;
        }
        if (typeof value === 'string') {
            const enumValue = Object.entries(enumObj).find(([_, val]) => val === value);
            return enumValue ? enumValue[1] as T[keyof T] : undefined;
        }
        return value;
    }

    evaluate(): OutcomeCISA | undefined {
        if (this.methodology === Methodology.CISA) {
            return this.cisa();
        }
        return undefined;
    }
    cisa(): OutcomeCISA {
        this.validateCisa();

        const decisionMatrix: Record<ExploitationLevel, Record<Automatable, Partial<Record<TechnicalImpact, Partial<Record<MissionWellbeingImpact, ActionCISA>>>>>> = {
            [ExploitationLevel.NONE]: {
                [Automatable.YES]: {
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ATTEND
                    },
                },
                [Automatable.NO]: {
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.HIGH]: ActionCISA.TRACK_STAR
                    },
                },
            },
            [ExploitationLevel.POC]: {
                [Automatable.YES]: {
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.MEDIUM]: ActionCISA.TRACK_STAR,
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ATTEND,
                    },
                    [TechnicalImpact.PARTIAL]: {
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ATTEND
                    },
                },
                [Automatable.NO]: {
                    [TechnicalImpact.PARTIAL]: {
                        [MissionWellbeingImpact.HIGH]: ActionCISA.TRACK_STAR
                    },
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.MEDIUM]: ActionCISA.TRACK_STAR,
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ATTEND,
                    },
                },
            },
            [ExploitationLevel.ACTIVE]: {
                [Automatable.YES]: {
                    [TechnicalImpact.PARTIAL]: {
                        [MissionWellbeingImpact.LOW]: ActionCISA.ATTEND,
                        [MissionWellbeingImpact.MEDIUM]: ActionCISA.ATTEND,
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ACT,
                    },
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.LOW]: ActionCISA.ATTEND,
                        [MissionWellbeingImpact.MEDIUM]: ActionCISA.ACT,
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ACT,
                    },
                },
                [Automatable.NO]: {
                    [TechnicalImpact.PARTIAL]: {
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ATTEND
                    },
                    [TechnicalImpact.TOTAL]: {
                        [MissionWellbeingImpact.MEDIUM]: ActionCISA.ATTEND,
                        [MissionWellbeingImpact.HIGH]: ActionCISA.ACT,
                    },
                },
            },
        };

        const action = decisionMatrix[this.exploitation!]?.[this.automatable!]?.[this.technical_impact!]?.[this.mission_wellbeing!] ?? ActionCISA.TRACK;
        return new OutcomeCISA(action);
    }

    private validateCisa(): void {
        if (this.exploitation === undefined) {
            throw new Error("ExploitationLevel has not been provided");
        }
        if (this.automatable === undefined) {
            throw new Error("Automatable has not been provided");
        }
        if (this.technical_impact === undefined) {
            throw new Error("TechnicalImpact has not been provided");
        }
        if (this.mission_wellbeing === undefined) {
            throw new Error("MissionWellbeingImpact has not been provided");
        }
    }

}