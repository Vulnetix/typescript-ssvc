    export enum Exploitation {
        NONE = "none",
        POC = "poc",
        ACTIVE = "active"
    }

    export enum Automatable {
        YES = "yes",
        NO = "no"
    }

    export enum TechnicalImpact {
        PARTIAL = "partial",
        TOTAL = "total"
    }

    export enum MissionWellbeingImpact {
        LOW = "low",
        MEDIUM = "medium",
        HIGH = "high"
    }

    export enum DecisionPriority {
        LOW = "low",
        MEDIUM = "medium",
        HIGH = "high",
        IMMEDIATE = "immediate"
    }

    export enum Utility {
        LABORIOUS = "laborious",
        EFFICIENT = "efficient",
        SUPER_EFFECTIVE = "super effective"
    }

    export enum SafetyImpact {
        NONE = "none",
        MINOR = "minor",
        MAJOR = "major",
        HAZARDOUS = "hazardous",
        CATASTROPHIC = "catastrophic"
    }

    export enum ActionFIRST {
        SCHEDULED = "scheduled",
        OUT_OF_BAND = "out-of-band",
        IMMEDIATE = "immediate"
    }

    export enum ActionCISA {
        TRACK = "Track",
        TRACK_STAR = "Track*",
        ATTEND = "Attend",
        ACT = "Act"
    }

    export enum Methodology {
        FIRST = "FIRST",
        CISA = "CISA"
    }

    const priorityMap: Record<ActionCISA | ActionFIRST, DecisionPriority> = {
        [ActionCISA.TRACK]: DecisionPriority.LOW,
        [ActionCISA.TRACK_STAR]: DecisionPriority.MEDIUM,
        [ActionCISA.ATTEND]: DecisionPriority.MEDIUM,
        [ActionCISA.ACT]: DecisionPriority.IMMEDIATE,
        [ActionFIRST.SCHEDULED]: DecisionPriority.LOW,
        [ActionFIRST.OUT_OF_BAND]: DecisionPriority.MEDIUM,
        [ActionFIRST.IMMEDIATE]: DecisionPriority.IMMEDIATE,
    };

    export class OutcomeCISA {
        priority: DecisionPriority;
        action: ActionCISA;

        constructor(action: ActionCISA) {
            this.priority = priorityMap[action];
            this.action = action;
        }
    }
    export class OutcomeFIRST {
        priority: DecisionPriority;
        action: ActionFIRST;

        constructor(action: ActionFIRST) {
            this.priority = priorityMap[action];
            this.action = action;
        }
    }
    type DecisionOptions = {
        exploitation: Exploitation | string;
        technical_impact: TechnicalImpact | string;
        methodology: Methodology | string;
        automatable?: Automatable | string;
        mission_wellbeing?: MissionWellbeingImpact | string;
        utility?: Utility | string;
        safety_impact?: SafetyImpact | string;
    };
    
    export class Decision {
        exploitation?: Exploitation;
        automatable?: Automatable;
        utility?: Utility;
        technical_impact?: TechnicalImpact;
        safety_impact?: SafetyImpact;
        mission_wellbeing?: MissionWellbeingImpact;
        outcome?: OutcomeCISA | OutcomeFIRST;
        methodology?: Methodology = Methodology.CISA;

        constructor(options: DecisionOptions) {
            this.methodology = this.toEnum(Methodology, options.methodology);    
            this.exploitation = this.toEnum(Exploitation, options.exploitation);
            this.technical_impact = this.toEnum(TechnicalImpact, options.technical_impact);
            if (this.methodology === Methodology.CISA) {
                this.automatable = this.toEnum(Automatable, options.automatable);
                this.mission_wellbeing = this.toEnum(MissionWellbeingImpact, options.mission_wellbeing);
            }
            if (this.methodology === Methodology.FIRST) {
                this.utility = this.toEnum(Utility, options.utility);
                this.safety_impact = this.toEnum(SafetyImpact, options.safety_impact);
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
        }

        evaluate(): OutcomeCISA | OutcomeFIRST | undefined {
            if (this.methodology === Methodology.CISA) {
                return this.cisa();
            } else if (this.methodology === Methodology.FIRST) {
                return this.first();
            }
            return undefined;
        }

        cisa(): OutcomeCISA {
            this.validateCisa();

            const decisionMatrix: Record<Exploitation, Record<Automatable, Partial<Record<TechnicalImpact, Partial<Record<MissionWellbeingImpact, ActionCISA>>>>>> = {
                [Exploitation.NONE]: {
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
                [Exploitation.POC]: {
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
                [Exploitation.ACTIVE]: {
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

        first(): OutcomeFIRST {
            this.validateFirst();
        
            const decisionMatrix: Record<Exploitation, Record<Utility, Record<TechnicalImpact, Record<SafetyImpact, ActionFIRST>>>> = {
                [Exploitation.POC]: {
                    [Utility.LABORIOUS]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.OUT_OF_BAND,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                    [Utility.EFFICIENT]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                    [Utility.SUPER_EFFECTIVE]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                },
                [Exploitation.NONE]: {
                    [Utility.LABORIOUS]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.OUT_OF_BAND,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.OUT_OF_BAND,
                        },
                    },
                    [Utility.EFFICIENT]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.OUT_OF_BAND,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                    [Utility.SUPER_EFFECTIVE]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.SCHEDULED,
                            [SafetyImpact.MINOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.MAJOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                },
                [Exploitation.ACTIVE]: {
                    [Utility.LABORIOUS]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.MINOR]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.MINOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                    [Utility.EFFICIENT]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.OUT_OF_BAND,
                            [SafetyImpact.MINOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MINOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                    [Utility.SUPER_EFFECTIVE]: {
                        [TechnicalImpact.PARTIAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MINOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                        [TechnicalImpact.TOTAL]: {
                            [SafetyImpact.NONE]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MINOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.MAJOR]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.HAZARDOUS]: ActionFIRST.IMMEDIATE,
                            [SafetyImpact.CATASTROPHIC]: ActionFIRST.IMMEDIATE,
                        },
                    },
                },
            };

            const action = decisionMatrix[this.exploitation!]?.[this.utility!]?.[this.technical_impact!]?.[this.safety_impact!] ?? ActionFIRST.SCHEDULED;
            return new OutcomeFIRST(action)
        }

        private validateCommon(): void {
            if (!Object.values(Exploitation).includes(this.exploitation as Exploitation)) {
                throw new Error("Exploitation must be a valid Exploitation enum value");
            }
            if (!Object.values(TechnicalImpact).includes(this.technical_impact as TechnicalImpact)) {
                throw new Error("TechnicalImpact must be a valid TechnicalImpact enum value");
            }
        }
        
        private validateCisa(): void {
            this.validateCommon()
            if (!this.automatable || !Object.values(Automatable).includes(this.automatable as Automatable)) {
                throw new Error("Automatable must be a valid Automatable enum value");
            }
            if (!this.mission_wellbeing || !Object.values(MissionWellbeingImpact).includes(this.mission_wellbeing as MissionWellbeingImpact)) {
                throw new Error("MissionWellbeingImpact must be a valid MissionWellbeingImpact enum value");
            }
        }
        
        private validateFirst(): void {
            this.validateCommon()
            if (!this.utility || !Object.values(Utility).includes(this.utility as Utility)) {
                throw new Error("Utility must be a valid Utility enum value");
            }
            if (!this.safety_impact || !Object.values(SafetyImpact).includes(this.safety_impact as SafetyImpact)) {
                throw new Error("SafetyImpact must be a valid SafetyImpact enum value");
            }
        }
    }