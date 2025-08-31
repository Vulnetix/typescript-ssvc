#!/usr/bin/env npx ts-node

/**
 * Evidence Mapping & Audit Trail System Demo
 * 
 * This example demonstrates the complete evidence mapping and audit trail
 * system with forensic-grade tracking, data source integration, and 
 * transform rules.
 */

import { randomUUID } from 'crypto';
import {
  AuditableDecisionFactory,
  CommonTransforms,
  createDecision,
  DataSourceFactory,
  TransformEngine
} from '../src/index';

async function demonstrateEvidenceMappingSystem() {
  console.log('🔍 SSVC Evidence Mapping & Audit Trail System Demo\n');
  
  try {
    // ===== STEP 1: Basic Auditable Decision =====
    console.log('1. ✅ Creating auditable decision...');
    
    const basicDecision = createDecision('cisa', {
      exploitation: 'active',
      automatable: 'yes',
      technical_impact: 'total',
      mission_wellbeing: 'high'
    });

    const auditableDecision = AuditableDecisionFactory.wrapDecision(
      basicDecision, 
      'cisa', 
      '1.0'
    );

    console.log(`   → Evaluation ID: ${auditableDecision.evaluationId}`);
    console.log('   ✓ Auditable decision wrapper created');

    // ===== STEP 2: Transform Rules Configuration =====
    console.log('\n2. ✅ Configuring transform rules...');
    
    const engine = new TransformEngine();
    
    // Custom transform rules for different data sources
    const customRules = [
      {
        sourceValue: /^(active|exploitation|exploited|confirmed)$/i,
        targetValue: 'ACTIVE',
        applicableToSources: ['nvd-api', 'mitre-cve'],
        applicableToMappings: ['exploitation']
      },
      {
        sourceValue: /^(poc|proof.of.concept|demo)$/i,
        targetValue: 'POC', 
        applicableToSources: ['security-research', 'analyst'],
        applicableToMappings: ['exploitation']
      },
      {
        sourceValue: /^(none|not.exploited|safe)$/i,
        targetValue: 'NONE',
        applicableToSources: ['nvd-api', 'analyst'],
        applicableToMappings: ['exploitation']
      }
    ];

    // Test transform rules
    const nvdResult = engine.transform('exploited', customRules, 'nvd-api', 'exploitation');
    const analystResult = engine.transform('poc', customRules, 'analyst', 'exploitation');
    
    console.log(`   → NVD 'exploited' transforms to: ${nvdResult.value}`);
    console.log(`   → Analyst 'poc' transforms to: ${analystResult.value}`);

    // Use common transforms
    const booleanRules = CommonTransforms.booleanToYesNo();
    const boolResult = engine.transform('true', booleanRules, 'manual', 'automatable');
    console.log(`   → Boolean 'true' transforms to: ${boolResult.value}`);

    // ===== STEP 3: Data Source Configuration =====
    console.log('\n3. ✅ Configuring data sources...');
    
    const nvdSource = DataSourceFactory.api(
      'nvd-api',
      'National Vulnerability Database',
      1, // Highest priority
      {
        endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
        method: 'GET',
        headers: { 'apiKey': '${NVD_API_KEY}' }
      },
      'Official NIST vulnerability database',
      ['application/json']
    );

    const analystSource = DataSourceFactory.manual(
      'security-analyst',
      'Security Analyst Assessment',
      2, // Lower priority
      'Manual security analyst evaluation',
      ['text/plain', 'application/json']
    );

    const threatFeedSource = DataSourceFactory.api(
      'commercial-feed',
      'Commercial Threat Intelligence',
      3,
      {
        endpoint: 'https://api.threatfeed.example.com/v1/vulnerabilities/{cveId}',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ${THREAT_FEED_TOKEN}' }
      },
      'Commercial threat intelligence feed',
      ['application/json']
    );

    console.log(`   → Data Source 1: ${nvdSource.name} (Priority: ${nvdSource.priority})`);
    console.log(`   → Data Source 2: ${analystSource.name} (Priority: ${analystSource.priority})`);
    console.log(`   → Data Source 3: ${threatFeedSource.name} (Priority: ${threatFeedSource.priority})`);

    // Map data sources to decision
    auditableDecision.mapDataSource('exploitation', nvdSource);
    auditableDecision.mapDataSource('technical_impact', analystSource);

    // ===== STEP 4: Evidence Collection =====
    console.log('\n4. ✅ Collecting and attaching evidence...');
    
    // Evidence for exploitation decision point
    const exploitationEvidence = {
      decisionPoint: 'exploitation',
      value: 'ACTIVE',
      verifications: [
        {
          method: 'automated',
          timestamp: Date.now(),
          source: 'nvd-api-scanner',
          result: 'Active exploitation confirmed in NVD database scan',
          evidence: {
            verified: true,
            evidenceId: randomUUID(),
            collectedAt: Date.now(),
            collectedBy: 'nvd-automated-scanner-v3.2',
            urls: [
              'https://nvd.nist.gov/vuln/detail/CVE-2024-1234',
              'https://www.cve.org/CVERecord?id=CVE-2024-1234'
            ],
            notes: 'Automated scan detected multiple exploitation instances',
            contents: {
              cveId: 'CVE-2024-1234',
              cvssV3: {
                baseScore: 9.8,
                vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H'
              },
              exploitabilitySubScore: 3.9,
              impactSubScore: 5.9,
              lastModifiedDate: '2024-08-30T10:15:00.000Z',
              publishedDate: '2024-08-25T14:30:00.000Z'
            },
            checksums: [
              {
                algorithm: 'sha256',
                signature: '7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730',
                timestamp: Date.now(),
                contentId: randomUUID()
              },
              {
                algorithm: 'sha512',
                signature: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3b7b9c5d8b9c8fb2e0c3d6f8e9a0c1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
                timestamp: Date.now(),
                contentId: randomUUID()
              }
            ]
          }
        },
        {
          method: 'manual',
          timestamp: Date.now() + 1000,
          source: 'senior-security-analyst',
          result: 'Manual verification confirms active exploitation in the wild',
          evidence: {
            verified: true,
            evidenceId: randomUUID(),
            collectedAt: Date.now() + 1000,
            collectedBy: 'jane.analyst@company.com',
            notes: 'Cross-referenced with threat intelligence feeds and security blogs. Multiple PoCs available.',
            urls: [
              'https://blog.security-research.com/cve-2024-1234-analysis',
              'https://github.com/security-research/cve-2024-1234-poc'
            ],
            contents: {
              analystNotes: 'Confirmed through multiple independent sources',
              confidence: 'high',
              threatLevel: 'critical',
              recommendedAction: 'immediate patching required'
            },
            checksums: [
              {
                algorithm: 'blake2b',
                signature: '3a8c2b5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
                timestamp: Date.now() + 1000,
                contentId: randomUUID()
              }
            ]
          }
        }
      ]
    };

    auditableDecision.attachEvidence('exploitation', exploitationEvidence);

    // Evidence for technical impact decision point
    const technicalImpactEvidence = {
      decisionPoint: 'technical_impact',
      value: 'TOTAL',
      verifications: [
        {
          method: 'hybrid',
          timestamp: Date.now() + 2000,
          source: 'impact-analysis-system',
          result: 'Automated analysis with manual validation confirms total system impact',
          evidence: {
            verified: true,
            evidenceId: randomUUID(),
            collectedAt: Date.now() + 2000,
            collectedBy: 'impact-analyzer-v2.0',
            notes: 'CVSS analysis combined with manual system architecture review',
            contents: {
              cvssImpactScore: 5.9,
              confidentialityImpact: 'HIGH',
              integrityImpact: 'HIGH', 
              availabilityImpact: 'HIGH',
              systemsAffected: ['web-server', 'database', 'file-system'],
              criticalityAssessment: 'mission-critical systems compromised'
            },
            checksums: [
              {
                algorithm: 'sha3-256',
                signature: '1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
                timestamp: Date.now() + 2000,
                contentId: randomUUID()
              }
            ]
          }
        }
      ]
    };

    auditableDecision.attachEvidence('technical_impact', technicalImpactEvidence);

    console.log('   ✓ Evidence attached to exploitation decision point');
    console.log('   ✓ Evidence attached to technical_impact decision point');
    console.log('   → Multiple verification methods used (automated, manual, hybrid)');

    // ===== STEP 5: Decision Evaluation =====
    console.log('\n5. ✅ Evaluating decision with full audit trail...');
    
    const startTime = Date.now();
    const outcome = auditableDecision.evaluate();
    const evaluationTime = Date.now() - startTime;
    
    console.log(`   → Decision: ${outcome.action}`);
    console.log(`   → Priority: ${outcome.priority}`);
    console.log(`   → Evaluation time: ${evaluationTime}ms`);
    console.log('   ✓ Decision evaluated with complete audit tracking');

    // ===== STEP 6: Audit Trail Analysis =====
    console.log('\n6. ✅ Analyzing audit trail and timeline...');
    
    const timeline = auditableDecision.getTimeline();
    console.log(`   → Timeline entries: ${timeline.length}`);
    
    timeline.forEach((entry, index) => {
      const timestamp = new Date(entry.timestamp).toISOString();
      console.log(`   ${index + 1}. ${timestamp}: ${entry.event}`);
      if (entry.details && typeof entry.details === 'object') {
        console.log(`      └─ ${JSON.stringify(entry.details, null, 6).replace(/\n/g, '\n      ')}`);
      }
    });

    const auditEntry = auditableDecision.getAuditEntry();
    console.log(`   → Audit ID: ${auditEntry.auditId}`);
    console.log(`   → Methodology: ${auditEntry.methodology} v${auditEntry.methodologyVersion}`);
    console.log(`   → Checksum: ${auditEntry.checksum ? 'Generated' : 'Missing'}`);
    
    // ===== STEP 7: Evidence and Data Source Summary =====
    console.log('\n7. ✅ Evidence and data source summary...');
    
    const allEvidence = auditableDecision.getEvidence();
    const evidenceCount = Object.keys(allEvidence).length;
    console.log(`   → Evidence collected for ${evidenceCount} decision points`);
    
    Object.entries(allEvidence).forEach(([decisionPoint, evidence]) => {
      console.log(`   ${decisionPoint.toUpperCase()}:`);
      console.log(`     └─ Value: ${evidence.value}`);
      console.log(`     └─ Verifications: ${evidence.verifications.length}`);
      
      evidence.verifications.forEach((verification: any, idx: number) => {
        const evidenceId = verification.evidence?.evidenceId || 'N/A';
        console.log(`       ${idx + 1}. ${verification.method} (${verification.source}) - ID: ${evidenceId.substring(0, 8)}...`);
      });
    });

    const dataSources = auditableDecision.getDataSources();
    const sourceCount = Object.keys(dataSources).length;
    console.log(`   → Data sources mapped to ${sourceCount} decision points`);
    
    Object.entries(dataSources).forEach(([decisionPoint, source]) => {
      console.log(`   ${decisionPoint.toUpperCase()}: ${source.name} (Priority: ${source.priority})`);
    });

    // ===== STEP 8: Forensic Report Generation =====
    console.log('\n8. ✅ Generating comprehensive forensic report...');
    
    const forensicReport = auditableDecision.generateForensicReport();
    console.log(`   → Report ID: ${forensicReport.reportId}`);
    const generatedAt = forensicReport.generatedAt;
    let generatedDateStr = 'N/A';
    if (generatedAt && !isNaN(generatedAt)) {
      try {
        generatedDateStr = new Date(generatedAt).toISOString();
      } catch (e) {
        generatedDateStr = `Invalid date (${generatedAt})`;
      }
    }
    console.log(`   → Generated: ${generatedDateStr}`);
    console.log(`   → Total duration: ${forensicReport.totalDuration}ms`);
    console.log(`   → Decision path entries: ${forensicReport.decisionPath.length}`);
    console.log(`   → Data sources used: ${forensicReport.dataSourcesUsed.length}`);
    console.log(`   → Verification summary: ${forensicReport.verificationSummary.totalVerifications} total, ${forensicReport.verificationSummary.successfulVerifications} successful`);
    console.log('   ✓ Forensic report contains complete chain of custody');

    // ===== STEP 9: Export and Serialization =====
    console.log('\n9. ✅ Export capabilities...');
    
    // JSON export (full forensic report)
    const jsonExport = JSON.stringify(forensicReport, null, 2);
    console.log(`   → JSON export size: ${(jsonExport.length / 1024).toFixed(2)} KB`);
    
    // Compact audit summary
    const auditSummary = {
      evaluationId: auditableDecision.evaluationId,
      methodology: auditEntry.methodology,
      version: auditEntry.methodologyVersion,
      timestamp: auditEntry.timestamp,
      outcome: outcome,
      evidenceCount: evidenceCount,
      verificationsCount: forensicReport.verificationSummary.totalVerifications,
      successfulVerifications: forensicReport.verificationSummary.successfulVerifications,
      timelineEntries: timeline.length,
      checksum: auditEntry.checksum
    };
    
    const summaryExport = JSON.stringify(auditSummary, null, 2);
    console.log(`   → Summary export size: ${(summaryExport.length / 1024).toFixed(2)} KB`);
    console.log('   ✓ Multiple export formats available');

    // ===== STEP 10: Verification and Integrity =====
    console.log('\n10. ✅ Verification and integrity checks...');
    
    // Verify evidence integrity
    let evidenceIntegrityPassed = true;
    Object.values(allEvidence).forEach((evidence: any) => {
      evidence.verifications.forEach((verification: any) => {
        if (!verification.evidence?.evidenceId) {
          evidenceIntegrityPassed = false;
        }
        if (!verification.evidence?.checksums || verification.evidence.checksums.length === 0) {
          evidenceIntegrityPassed = false;
        }
      });
    });

    console.log(`   → Evidence integrity: ${evidenceIntegrityPassed ? '✓ PASSED' : '❌ FAILED'}`);
    console.log(`   → UUID format validation: ${auditableDecision.evaluationId.length === 36 ? '✓ PASSED' : '❌ FAILED'}`);
    console.log(`   → Timeline consistency: ${timeline.length > 0 ? '✓ PASSED' : '❌ FAILED'}`);
    console.log(`   → Audit checksum present: ${auditEntry.checksum ? '✓ PASSED' : '❌ FAILED'}`);

    // ===== FINAL SUMMARY =====
    console.log('\n🎉 EVIDENCE MAPPING & AUDIT TRAIL SYSTEM DEMO COMPLETE!\n');
    
    console.log('✅ System Capabilities Demonstrated:');
    console.log('  • Browser-compatible randomUUID() for all identifiers');
    console.log('  • Comprehensive evidence collection with multiple verification methods');
    console.log('  • Data source mapping with priority-based resolution');
    console.log('  • Transform rules engine with source/mapping restrictions');
    console.log('  • Complete audit trail with timeline tracking');
    console.log('  • Forensic-grade reporting with chain of custody');
    console.log('  • Multiple hash algorithms for evidence integrity (15+ supported)');
    console.log('  • Export capabilities for compliance and investigation');
    console.log('  • Full integration with existing SSVC decision system');
    console.log('  • Suitable for regulatory compliance and forensic investigation');

    return {
      outcome,
      forensicReport,
      auditSummary,
      timeline,
      evidence: allEvidence,
      dataSources
    };

  } catch (error) {
    const err = error as Error;
    console.error('\n❌ Demo failed:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    return null;
  }
}

// Run the demo if this script is executed directly
if (process.argv[1].endsWith('evidence-mapping-demo.ts')) {
  demonstrateEvidenceMappingSystem().then(result => {
    if (result) {
      console.log('\n📋 Demo completed successfully!');
      console.log(`Final decision: ${result.outcome.action} (${result.outcome.priority})`);
      process.exit(0);
    } else {
      console.log('\n💥 Demo failed - see error messages above');
      process.exit(1);
    }
  });
}

export { demonstrateEvidenceMappingSystem };
