"use strict";
/**
 * Runtime YAML Evaluation Tests
 *
 * Comprehensive tests for the runtime YAML evaluation system
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const runtime_1 = require(".");
describe('Runtime YAML Evaluation System', () => {
    let cisaYaml;
    let coordinatorTriageYaml;
    let invalidYaml;
    beforeAll(() => {
        // Load existing methodology YAML files for testing
        const methodologiesDir = path.join(__dirname, '../methodologies');
        cisaYaml = fs.readFileSync(path.join(methodologiesDir, 'cisa.yaml'), 'utf8');
        coordinatorTriageYaml = fs.readFileSync(path.join(methodologiesDir, 'coordinator_triage.yaml'), 'utf8');
        // Create invalid YAML for error testing
        invalidYaml = `
name: "Invalid"
description: "Invalid methodology"
version: "1.0"
enums:
  MissingEnum:
    - VALUE1
priorityMap:
  ACTION1: HIGH
decisionTree:
  type: NonExistentEnum
  children:
    VALUE1: ACTION1
defaultAction: ACTION1
`;
    });
    describe('YAML Validation', () => {
        test('should validate correct CISA YAML', () => {
            var _a;
            const result = (0, runtime_1.validateYAML)(cisaYaml);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.methodology).toBeDefined();
            expect((_a = result.methodology) === null || _a === void 0 ? void 0 : _a.name).toBe('CISA');
        });
        test('should validate correct Coordinator Triage YAML', () => {
            const result = (0, runtime_1.validateYAML)(coordinatorTriageYaml);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.methodology).toBeDefined();
        });
        test('should reject invalid YAML', () => {
            const result = (0, runtime_1.validateYAML)(invalidYaml);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.methodology).toBeUndefined();
        });
        test('should handle malformed YAML', () => {
            const malformedYaml = 'invalid: yaml: content: [unclosed';
            const result = (0, runtime_1.validateYAML)(malformedYaml);
            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('Failed to parse YAML');
        });
    });
    describe('Runtime Decision Creation and Evaluation', () => {
        test('should create and evaluate CISA decision', () => {
            const decision = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'active',
                automatable: 'yes',
                technical_impact: 'total',
                mission_wellbeing: 'high'
            });
            expect(decision).toBeInstanceOf(runtime_1.RuntimeDecision);
            const outcome = decision.evaluate();
            expect(outcome.action).toBe('ACT');
            expect(outcome.priority).toBe('IMMEDIATE');
        });
        test('should handle different parameter naming conventions', () => {
            const decision1 = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'poc',
                automatable: 'no',
                technicalImpact: 'partial',
                missionWellbeingImpact: 'medium'
            });
            const decision2 = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'poc',
                automatable: 'no',
                technical_impact: 'partial',
                mission_wellbeing: 'medium'
            });
            const outcome1 = decision1.evaluate();
            const outcome2 = decision2.evaluate();
            expect(outcome1.action).toBe(outcome2.action);
            expect(outcome1.priority).toBe(outcome2.priority);
        });
        test('should handle missing parameters with default action', () => {
            const decision = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'none'
                // Missing other required parameters
            });
            const outcome = decision.evaluate();
            expect(outcome.action).toBe('TRACK'); // Default action for CISA
        });
        test('should handle case-insensitive enum values', () => {
            const decision = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'ACTIVE',
                automatable: 'YES',
                technical_impact: 'TOTAL',
                mission_wellbeing: 'HIGH'
            });
            const outcome = decision.evaluate();
            expect(outcome.action).toBe('ACT');
            expect(outcome.priority).toBe('IMMEDIATE');
        });
    });
    describe('Direct YAML Evaluation', () => {
        test('should evaluate YAML directly', () => {
            const outcome = (0, runtime_1.customFromYAML)(cisaYaml, {
                exploitation: 'active',
                automatable: 'yes',
                technical_impact: 'total',
                mission_wellbeing: 'high'
            });
            expect(outcome.action).toBe('ACT');
            expect(outcome.priority).toBe('IMMEDIATE');
        });
        test('should handle coordinator triage methodology', () => {
            const outcome = (0, runtime_1.customFromYAML)(coordinatorTriageYaml, {
                report_public: 'yes',
                supplier_contacted: 'yes',
                report_credibility: 'credible',
                supplier_cardinality: 'multiple'
            });
            expect(outcome.action).toBeDefined();
            expect(outcome.priority).toBeDefined();
        });
    });
    describe('Runtime Plugin System', () => {
        test('should create runtime plugin from YAML', () => {
            const plugin = (0, runtime_1.createRuntimePlugin)(cisaYaml);
            expect(plugin).toBeInstanceOf(runtime_1.RuntimeSSVCPlugin);
            expect(plugin.name).toBe('CISA');
            expect(plugin.description).toContain('CISA');
            expect(plugin.version).toBe('1.0');
        });
        test('should create decisions from plugin', () => {
            const plugin = (0, runtime_1.createRuntimePlugin)(cisaYaml);
            const decision = plugin.createDecision({
                exploitation: 'poc',
                automatable: 'yes',
                technical_impact: 'partial',
                mission_wellbeing: 'low'
            });
            const outcome = decision.evaluate();
            expect(outcome.action).toBeDefined();
            expect(outcome.priority).toBeDefined();
        });
    });
    describe('Vector String Support', () => {
        test('should check vector string support', () => {
            const cisaSupportsVectors = (0, runtime_1.supportsVectorStrings)(cisaYaml);
            expect(typeof cisaSupportsVectors).toBe('boolean');
        });
        test('should generate and parse vector strings if supported', () => {
            if ((0, runtime_1.supportsVectorStrings)(cisaYaml)) {
                const vectorString = (0, runtime_1.generateRuntimeVectorString)(cisaYaml, {
                    exploitation: 'active',
                    automatable: 'yes',
                    technical_impact: 'total',
                    mission_wellbeing: 'high'
                });
                expect(vectorString).toMatch(/^CISA/);
                expect(vectorString).toContain('/');
                const parsedParams = (0, runtime_1.parseRuntimeVectorString)(cisaYaml, vectorString);
                expect(parsedParams).toBeDefined();
                expect(typeof parsedParams).toBe('object');
            }
        });
    });
    describe('Methodology Metadata', () => {
        test('should extract methodology metadata', () => {
            const metadata = (0, runtime_1.getMethodologyMetadata)(cisaYaml);
            expect(metadata.name).toBe('CISA');
            expect(metadata.description).toContain('CISA');
            expect(metadata.version).toBe('1.0');
            expect(metadata.url).toContain('cisa.gov');
        });
        test('should get methodology enums', () => {
            const enums = (0, runtime_1.getMethodologyEnums)(cisaYaml);
            expect(enums).toBeDefined();
            expect(enums.ExploitationStatus).toContain('ACTIVE');
            expect(enums.AutomatableStatus).toContain('YES');
            expect(enums.TechnicalImpactLevel).toContain('TOTAL');
        });
        test('should get priority map', () => {
            const priorityMap = (0, runtime_1.getMethodologyPriorityMap)(cisaYaml);
            expect(priorityMap).toBeDefined();
            expect(priorityMap.ACT).toBe('IMMEDIATE');
            expect(priorityMap.TRACK).toBe('LOW');
        });
    });
    describe('Batch Evaluation', () => {
        test('should batch evaluate multiple parameter sets', () => {
            const parameterSets = [
                {
                    exploitation: 'active',
                    automatable: 'yes',
                    technical_impact: 'total',
                    mission_wellbeing: 'high'
                },
                {
                    exploitation: 'none',
                    automatable: 'no',
                    technical_impact: 'partial',
                    mission_wellbeing: 'low'
                },
                {
                    exploitation: 'poc',
                    automatable: 'yes',
                    technical_impact: 'total',
                    mission_wellbeing: 'medium'
                }
            ];
            const outcomes = (0, runtime_1.batchEvaluate)(cisaYaml, parameterSets);
            expect(outcomes).toHaveLength(3);
            expect(outcomes[0].action).toBe('ACT');
            expect(outcomes[0].priority).toBe('IMMEDIATE');
            outcomes.forEach(outcome => {
                expect(outcome.action).toBeDefined();
                expect(outcome.priority).toBeDefined();
            });
        });
    });
    describe('Runtime Evaluation Statistics', () => {
        test('should create evaluation stats', () => {
            const stats = new runtime_1.RuntimeEvaluationStats(cisaYaml);
            expect(stats).toBeInstanceOf(runtime_1.RuntimeEvaluationStats);
        });
        test('should get all available actions', () => {
            const stats = new runtime_1.RuntimeEvaluationStats(cisaYaml);
            const actions = stats.getAllActions();
            expect(actions).toContain('ACT');
            expect(actions).toContain('ATTEND');
            expect(actions).toContain('TRACK');
            expect(actions).toContain('TRACK_STAR');
            expect(actions.length).toBeGreaterThan(0);
        });
        test('should get all available priorities', () => {
            const stats = new runtime_1.RuntimeEvaluationStats(cisaYaml);
            const priorities = stats.getAllPriorities();
            expect(priorities).toContain('IMMEDIATE');
            expect(priorities).toContain('MEDIUM');
            expect(priorities).toContain('LOW');
            expect(priorities.length).toBeGreaterThan(0);
        });
        test('should calculate decision tree depth', () => {
            const stats = new runtime_1.RuntimeEvaluationStats(cisaYaml);
            const depth = stats.getDecisionTreeDepth();
            expect(typeof depth).toBe('number');
            expect(depth).toBeGreaterThan(0);
        });
        test('should count total decision paths', () => {
            const stats = new runtime_1.RuntimeEvaluationStats(cisaYaml);
            const pathCount = stats.getTotalDecisionPaths();
            expect(typeof pathCount).toBe('number');
            expect(pathCount).toBeGreaterThan(0);
        });
    });
    describe('Runtime Decision Methods', () => {
        test('should provide additional runtime-specific methods', () => {
            const decision = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'active',
                automatable: 'yes',
                technical_impact: 'total',
                mission_wellbeing: 'high'
            });
            const methodology = decision.getMethodology();
            expect(methodology.name).toBe('CISA');
            const parameters = decision.getParameters();
            expect(parameters.exploitation).toBe('active');
            const enums = decision.getAvailableEnums();
            expect(enums.ExploitationStatus).toContain('ACTIVE');
            const priorityMap = decision.getPriorityMap();
            expect(priorityMap.ACT).toBe('IMMEDIATE');
        });
        test('should support parameter updates', () => {
            const decision = (0, runtime_1.createRuntimeDecision)(cisaYaml, {
                exploitation: 'none',
                automatable: 'no',
                technical_impact: 'partial',
                mission_wellbeing: 'low'
            });
            const outcome1 = decision.evaluate();
            decision.updateParameters({
                exploitation: 'active',
                mission_wellbeing: 'high'
            });
            const outcome2 = decision.evaluate();
            expect(outcome2.action).not.toBe(outcome1.action);
            expect(outcome2.action).toBe('ACT');
        });
    });
    describe('Error Handling', () => {
        test('should handle invalid YAML gracefully', () => {
            expect(() => {
                (0, runtime_1.createRuntimePlugin)(invalidYaml);
            }).toThrow();
        });
        test('should handle missing methodology gracefully', () => {
            expect(() => {
                (0, runtime_1.getMethodologyMetadata)('invalid yaml content');
            }).toThrow();
        });
        test('should handle vector operations on non-vector methodologies', () => {
            const testYaml = cisaYaml.replace(/vectorMetadata:[\s\S]*?(?=\n[a-zA-Z]|$)/, '');
            if (!(0, runtime_1.supportsVectorStrings)(testYaml)) {
                expect(() => {
                    (0, runtime_1.generateRuntimeVectorString)(testYaml, {
                        exploitation: 'active'
                    });
                }).toThrow();
            }
        });
    });
    describe('Integration with Existing System', () => {
        test('should be compatible with SSVCOutcome interface', () => {
            const outcome = (0, runtime_1.customFromYAML)(cisaYaml, {
                exploitation: 'active',
                automatable: 'yes',
                technical_impact: 'total',
                mission_wellbeing: 'high'
            });
            // Should have SSVCOutcome properties
            expect(outcome).toHaveProperty('action');
            expect(outcome).toHaveProperty('priority');
            expect(typeof outcome.action).toBe('string');
            expect(typeof outcome.priority).toBe('string');
        });
        test('should work with different methodology files', () => {
            const methodologiesDir = path.join(__dirname, '../methodologies');
            const yamlFiles = fs.readdirSync(methodologiesDir)
                .filter(file => file.endsWith('.yaml'))
                .slice(0, 3); // Test first 3 files
            for (const file of yamlFiles) {
                const yamlContent = fs.readFileSync(path.join(methodologiesDir, file), 'utf8');
                const validation = (0, runtime_1.validateYAML)(yamlContent);
                if (validation.valid) {
                    const plugin = (0, runtime_1.createRuntimePlugin)(yamlContent);
                    expect(plugin.name).toBeDefined();
                    expect(plugin.description).toBeDefined();
                    expect(plugin.version).toBeDefined();
                }
            }
        });
    });
});
