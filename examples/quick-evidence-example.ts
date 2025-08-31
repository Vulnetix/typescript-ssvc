#!/usr/bin/env npx ts-node

/**
 * Quick Evidence Mapping Example
 * 
 * A minimal example showing the basic evidence mapping and audit trail features.
 */

import { randomUUID } from 'crypto';
import {
  AuditableDecisionFactory,
  createDecision
} from '../src/index';

async function quickEvidenceExample() {
  console.log('🔍 Quick Evidence Mapping Example\n');
  
  // 1. Create auditable decision
  const decision = createDecision('cisa', {
    exploitation: 'active',
    automatable: 'yes', 
    technical_impact: 'total',
    mission_wellbeing: 'high'
  });

  const auditableDecision = AuditableDecisionFactory.wrapDecision(
    decision, 
    'cisa', 
    '1.0'
  );

  console.log(`Evaluation ID: ${auditableDecision.evaluationId}`);

  // 2. Attach simple evidence
  const evidence = {
    decisionPoint: 'exploitation',
    value: 'ACTIVE', 
    verifications: [{
      method: 'automated',
      timestamp: Date.now(),
      source: 'nvd-api',
      result: 'Active exploitation detected',
      evidence: {
        verified: true,
        evidenceId: randomUUID(),
        collectedAt: Date.now(),
        collectedBy: 'automated-scanner',
        notes: 'Confirmed through NVD database scan',
        checksums: [{
          algorithm: 'sha256',
          signature: 'abc123def456...',
          timestamp: Date.now(),
          contentId: randomUUID()
        }]
      }
    }]
  };

  auditableDecision.attachEvidence('exploitation', evidence);

  // 3. Evaluate with audit trail
  const outcome = auditableDecision.evaluate();
  console.log(`Decision: ${outcome.action} (Priority: ${outcome.priority})`);

  // 4. Generate forensic report
  const forensicReport = auditableDecision.generateForensicReport();
  console.log(`Report ID: ${forensicReport.reportId}`);
  console.log(`Duration: ${forensicReport.totalDuration}ms`);

  // 5. Show timeline
  const timeline = auditableDecision.getTimeline();
  console.log(`Timeline entries: ${timeline.length}`);

  console.log('\n✅ Quick evidence mapping example complete!');
  
  return { outcome, forensicReport, timeline };
}

// Run if executed directly
if (process.argv[1].endsWith('quick-evidence-example.ts')) {
  quickEvidenceExample().then(result => {
    console.log(`\nFinal decision: ${result.outcome.action}`);
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export { quickEvidenceExample };
