# TypeScript implementation of SSVC (Stakeholder-Specific Vulnerability Categorization)

[![NPM Version](https://img.shields.io/npm/v/ssvc?style=flat)](https://www.npmjs.com/package/ssvc)
[![NPM License](https://img.shields.io/npm/l/ssvc?style=flat)](https://github.com/trivialsec/typescript-ssvc/blob/master/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dt/ssvc.svg?style=flat)](https://www.npmjs.com/package/ssvc)

[![NPM](https://nodei.co/npm/ssvc.png?downloads=true)](https://www.npmjs.com/package/ssvc)

A prioritization framework to triage CVE vulnerabilities as an alternative or compliment to CVSS.

This library provides a comprehensive solution to using the SSVC framework with both CISA and FIRST methodologies. It includes examples of high, medium, and low severity decision prioritizations for each methodology.

## Installation

```sh
npm install ssvc
```

## Decision Trees

### CISA

![CISA](.assets/SSVC_CISA.png)

### FIRST

![FIRST](.assets/SSVC_PSIRT.png)

## Decision Class Usage Guide

The `Decision` class is used to evaluate cybersecurity decisions based on different methodologies. This guide demonstrates how to use the class with both CISA and FIRST methodologies.

### Importing the Necessary Components

First, import the required classes and enums:

```javascript
import { 
  Decision, 
  Exploitation, 
  Automatable, 
  Utility,
  TechnicalImpact, 
  MissionWellbeingImpact,
  SafetyImpact, 
  Methodology 
} from './decision';
```

> **Note**: The `Decision` constructor also accepts string inputs for enum values:

### CISA Methodology Examples

```javascript
const cisaHigh = new Decision({
  methodology: Methodology.CISA,
  exploitation: Exploitation.ACTIVE,
  automatable: Automatable.YES,
  technical_impact: TechnicalImpact.TOTAL,
  mission_wellbeing: MissionWellbeingImpact.HIGH
});
console.log(cisaHigh.evaluate());
// Expected output: OutcomeCISA { action: 'Act', priority: 'immediate' }
```

```javascript
const cisaStringInputs = new Decision({
  methodology: 'CISA',
  exploitation: 'active',
  automatable: 'yes',
  technical_impact: 'total',
  mission_wellbeing: 'high'
});
console.log(cisaStringInputs.evaluate());
// Expected output: OutcomeCISA { action: 'Act', priority: 'immediate' }
```

```javascript
const cisaMedium = new Decision({
  methodology: Methodology.CISA,
  exploitation: Exploitation.POC,
  automatable: Automatable.NO,
  technical_impact: TechnicalImpact.PARTIAL,
  mission_wellbeing: MissionWellbeingImpact.MEDIUM
});
console.log(cisaMedium.evaluate());
// Expected output: OutcomeCISA { action: 'Track*', priority: 'medium' }
```

### FIRST Methodology Examples

```javascript
const firstHigh = new Decision({
  methodology: Methodology.FIRST,
  exploitation: Exploitation.ACTIVE,
  utility: Utility.SUPER_EFFECTIVE,
  technical_impact: TechnicalImpact.TOTAL,
  safety_impact: SafetyImpact.CATASTROPHIC
});
console.log(firstHigh.evaluate());
// Expected output: OutcomeFIRST { action: 'immediate', priority: 'immediate' }
```

#### Example 3: Low Severity Case

```javascript
const firstStringInputs = new Decision({
  methodology: 'FIRST',
  exploitation: 'poc',
  utility: 'efficient',
  technical_impact: 'partial',
  safety_impact: 'major'
});
console.log(firstStringInputs.evaluate());
// Expected output: OutcomeFIRST { action: 'out-of-band', priority: 'medium' }
```
