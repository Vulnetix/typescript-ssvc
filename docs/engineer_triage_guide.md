# Engineer Triage Methodology - Comprehensive Guide

## Introduction

The Engineer Triage methodology is a developer-focused vulnerability prioritization framework designed to help software engineers make informed decisions about vulnerability response actions. Unlike traditional CVSS scoring that focuses on theoretical impact, Engineer Triage emphasizes **actionability** and **practical remediation paths** available to development teams.

### Philosophy

This methodology recognizes that software engineers need to balance security concerns with development velocity, technical constraints, and operational realities. It provides four clear action-oriented outcomes that integrate directly into development workflows:

- **NIGHTLY_AUTO_PATCH**: Routine automated patching in scheduled deployments
- **DROP_TOOLS**: Immediate action required - stop current work and address now
- **SPIKE_EFFORT**: Time-boxed investigation and planning needed before implementation
- **BACKLOG**: Schedule for future sprint or iteration

### Decision Tree Structure

The methodology uses a 4-level decision tree with consistent depth across all paths:
1. **Reachability** → Can the vulnerable code path be executed?
2. **Remediation Option** → What patching options are available?
3. **Mitigation Option** → What defensive measures can be implemented?
4. **Reported Priority** → What is the severity/impact rating?

## The Four Decision Points - Data Gathering Guide

### 1. Reachability Assessment

**Purpose**: Determine if the vulnerable code can actually be executed in your application context.

#### Available Options
- **VERIFIED_REACHABLE**: Confirmed that vulnerable code paths can be executed
- **VERIFIED_UNREACHABLE**: Confirmed that vulnerable code paths cannot be reached
- **UNKNOWN**: Default state when reachability cannot be determined (treated as reachable for safety)

#### How to Gather Data

**Static Analysis Tools (SAST)**
```bash
# CodeQL analysis
codeql database analyze codeql-db --format=sarif-latest --output=results.sarif

# Semgrep scanning
semgrep --config=auto --json --output=semgrep.json src/

# SonarQube analysis
sonar-scanner -Dsonar.projectKey=myproject
```

**Code Coverage Analysis**
```bash
# Node.js with Jest
npm test -- --coverage
cat coverage/lcov-report/index.html  # Look for uncovered lines

# Python with pytest-cov
pytest --cov=src --cov-report=html
cat htmlcov/index.html

# Go test coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

**Call Graph Analysis**
- Use IDE features (VS Code "Find All References", IntelliJ "Call Hierarchy")
- Language-specific tools:
  - JavaScript: `madge --circular src/`
  - Python: `pycallgraph` or `py-call-graph`
  - Java: IDE dependency analysis or `jdeps`

**Runtime Monitoring**
- APM tools (New Relic, DataDog APM, Application Insights)
- Distributed tracing (Jaeger, Zipkin)
- Application logs showing code path execution

**Decision Guidelines**
- Default to **UNKNOWN** when in doubt (safer to assume reachable)
- Use **VERIFIED_UNREACHABLE** only with high confidence (dead code, disabled features)
- **VERIFIED_REACHABLE** when you have evidence of execution paths

### 2. Remediation Option Discovery

**Purpose**: Understand what patching options are available and the effort required.

#### Available Options
- **PATCHABLE_DEPLOYMENT**: Can be fixed by redeployment without code changes
- **PATCHABLE_VERSION_LOCKED**: Version constraints exist, requires planning and testing
- **PATCHABLE_MANUAL**: Manual patching required, version not locked
- **PATCH_UNAVAILABLE**: Patch exists, but there is no patch available from vendor or direct dependencies yet
- **NO_PATCH**: Vendor has no plans to patch (EOL, abandoned project), open source is not maintained, or too early for a patch yet

#### How to Gather Data

**Package Manager Analysis**
```bash
# npm ecosystem
npm audit                           # Show vulnerable packages
npm audit fix --dry-run            # Show what would be updated
npm outdated                        # Check for available updates
cat package-lock.json | jq '.packages'  # Check locked versions

# Python ecosystem
pip-audit                          # Scan for vulnerabilities
safety check                       # Alternative vulnerability scanner
pip list --outdated               # Check for updates
cat requirements.txt               # Check version constraints

# Java ecosystem
mvn dependency:tree                # Show dependency tree
mvn versions:display-dependency-updates  # Show available updates
cat pom.xml                        # Check version constraints

# Go ecosystem
go list -m -u all                  # Show available updates
cat go.mod                         # Check version constraints
go mod graph                       # Show dependency graph
```

**Version Constraint Analysis**
```json
// package.json - version locked
"dependencies": {
  "express": "=4.17.1"    // Exact version (locked)
  "lodash": "^4.17.20"    // Caret range (deployment patchable)
  "axios": "~1.3.0"       // Tilde range (deployment patchable)
}
```

**Vendor Advisory Checking**
- GitHub Security Advisories: `https://github.com/advisories`
- npm advisories: `https://www.npmjs.com/advisories`
- PyPI security: `https://pypa.io/project/pypi-security/`
- NVD database: `https://nvd.nist.gov/vuln/search`
- OSV database: `https://osv.dev/list`

**Decision Guidelines**
- **PATCHABLE_DEPLOYMENT**: Loose version constraints, automated builds
- **PATCHABLE_VERSION_LOCKED**: Exact versions pinned for compatibility
- **PATCHABLE_MANUAL**: Patches available but require manual intervention
- **PATCH_UNAVAILABLE**: Vendor aware but no patch timeline
- **NO_PATCH**: EOL software or abandoned projects

### 3. Mitigation Options Analysis

**Purpose**: Identify defensive measures that can reduce risk while waiting for patches.

#### Available Options
- **INFRASTRUCTURE**: Network/deployment-level controls
- **CODE_CHANGE**: Application code modifications needed
- **UPSTREAM_PR**: Can contribute fix to open source project
- **ALTERNATIVE**: Can replace with alternative library/approach
- **AUTOMATION**: Can implement automated defensive measures

**Decision Guidelines**
- **INFRASTRUCTURE**: WAF rules, network controls, API gateway policies
- **CODE_CHANGE**: Input validation, sanitization, feature toggles
- **UPSTREAM_PR**: Active open source project with security response
- **ALTERNATIVE**: Mature alternatives with similar functionality
- **AUTOMATION**: CI/CD pipeline security controls, automated monitoring

### 4. Priority Determination

**Purpose**: Understand the severity and urgency of the vulnerability.

#### Available Options
- **CRITICAL**: Severe impact, immediate exploitation risk
- **HIGH**: Significant impact, likely exploitation
- **MEDIUM**: Moderate impact, possible exploitation
- **LOW**: Minor impact, unlikely exploitation

#### How to Gather Data

**CVSS Score Mapping**
```
CVSS 9.0-10.0  → CRITICAL
CVSS 7.0-8.9   → HIGH
CVSS 4.0-6.9   → MEDIUM
CVSS 0.0-3.9   → LOW
```

**Vulnerability Database Queries**
```bash
# OSV database API
curl "https://api.osv.dev/v1/query" -d '{"package": {"name": "package-name", "ecosystem": "npm"}}'

# GitHub Advisory API
curl -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/advisories?ecosystem=npm&affects=package-name"

# NVD API v2
curl "https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=package-name"
```

**EPSS (Exploit Prediction Scoring System)**
```bash
# Check exploitation probability
curl "https://api.first.org/data/v1/epss?cve=CVE-2023-1234"
```

**Scanner Output Interpretation**
```bash
# Snyk output parsing
snyk test --json | jq '.vulnerabilities[] | {severity: .severity, cvss: .cvssScore}'

# Trivy container scanning
trivy image --format json your-image:tag | jq '.Results[].Vulnerabilities[] | {severity: .Severity, cvss: .CVSS}'

# OSV-Scanner output
osv-scanner --format json . | jq '.results[] | {severity: .severity, cvss: .cvss_score}'
```

**Internal Risk Assessment Factors**
- Business criticality of affected system
- Data sensitivity (PII, financial, health records)
- Network exposure (internet-facing vs internal)
- User impact scope (single user vs organization-wide)
- Regulatory requirements (SOC2, HIPAA, PCI-DSS)

## Data Sources Reference

### Security Scanner Outputs

**Software Composition Analysis (SCA)**
- **Snyk**: Dependency vulnerabilities with fix guidance
- **Dependabot**: GitHub's automated dependency updates
- **OSV-Scanner**: Google's official OSV database scanner
- **npm audit**: Built-in npm vulnerability scanning
- **pip-audit**: PyPA's official Python vulnerability scanner

**Static Application Security Testing (SAST)**
- **CodeQL**: GitHub's semantic code analysis
- **SonarQube**: Code quality and security scanning
- **Semgrep**: Fast, customizable static analysis
- **Bandit**: Python-specific security scanner

**Container Scanning**
- **Trivy**: Comprehensive container vulnerability scanner
- **Grype**: Fast vulnerability scanner for containers
- **Clair**: Open source container vulnerability scanner

### Vulnerability Databases

**Primary Sources**
- **NVD**: National Vulnerability Database (NIST)
- **OSV**: Open Source Vulnerabilities database (Google)
- **GHSA**: GitHub Security Advisories
- **CVE**: Common Vulnerabilities and Exposures

**Ecosystem-Specific**
- **npm**: Node.js package vulnerabilities
- **PyPI**: Python package security advisories  
- **RubySec**: Ruby gem vulnerability database
- **Rust Security**: Rust crate vulnerabilities

## Practical Decision Examples

### Example 1: npm audit Finding

**Scanner Output:**
```json
{
  "vulnerabilities": {
    "lodash": {
      "severity": "high",
      "via": ["CVE-2023-1234"],
      "fixAvailable": "4.17.21"
    }
  }
}
```

**Decision Process:**
1. **Reachability**: `grep -r "lodash" src/` → Found imports → **VERIFIED_REACHABLE**
2. **Remediation**: `package.json` shows `"lodash": "^4.17.15"` → **PATCHABLE_DEPLOYMENT**
3. **Mitigation**: Can't easily replace lodash → **AUTOMATION** (dependency update automation)
4. **Priority**: CVSS 7.2 → **HIGH**

**Result**: **NIGHTLY_AUTO_PATCH** (unreachable + patchable deployment + any priority)

### Example 2: Container Scan Critical Finding

**Scanner Output:**
```json
{
  "Target": "myapp:latest",
  "Vulnerabilities": [{
    "VulnerabilityID": "CVE-2023-5678",
    "Severity": "CRITICAL",
    "PkgName": "openssl",
    "InstalledVersion": "1.1.1k",
    "FixedVersion": "1.1.1l"
  }]
}
```

**Decision Process:**
1. **Reachability**: OpenSSL used by web server → **VERIFIED_REACHABLE**
2. **Remediation**: Base image update available → **PATCHABLE_DEPLOYMENT**  
3. **Mitigation**: Rebuild container with updated base → **AUTOMATION**
4. **Priority**: CVE marked CRITICAL → **CRITICAL**

**Result**: **SPIKE_EFFORT** (reachable + deployment + automation + critical)

### Example 3: Dependabot Alert

**Alert Details:**
- Package: `express` version 4.16.4
- Vulnerability: DoS via malformed Accept-Language header
- CVSS: 6.5 (MEDIUM)
- Fixed in: 4.17.0+
- Version constraint: `"express": "=4.16.4"`

**Decision Process:**
1. **Reachability**: Express is main web framework → **VERIFIED_REACHABLE**
2. **Remediation**: Exact version pinned for stability → **PATCHABLE_VERSION_LOCKED**
3. **Mitigation**: Requires code changes and testing → **CODE_CHANGE**
4. **Priority**: CVSS 6.5 → **MEDIUM**

**Result**: **SPIKE_EFFORT** (reachable + version locked + code change + medium)

## Action Outcomes Explained

### NIGHTLY_AUTO_PATCH (Priority: Low)
- **When**: Routine vulnerabilities in unreachable code or deployment-patchable dependencies
- **Action**: Include in next scheduled maintenance window
- **Timeline**: Next automated deployment cycle (typically 24-48 hours)
- **Effort**: Minimal - automated systems handle patching

### DROP_TOOLS (Priority: Immediate)  
- **When**: Critical/high vulnerabilities in reachable code requiring immediate attention
- **Action**: Stop current work, create incident, implement fix immediately
- **Timeline**: Within hours, not days
- **Effort**: All hands on deck, may require emergency deployment

### SPIKE_EFFORT (Priority: High)
- **When**: Complex vulnerabilities requiring investigation and planning
- **Action**: Schedule time-boxed research spike (2-8 hours)
- **Timeline**: Within current sprint, before implementation
- **Effort**: Research alternatives, plan implementation approach, estimate effort

### BACKLOG (Priority: Medium)
- **When**: Vulnerabilities in unreachable code that need eventual attention
- **Action**: Add to product backlog with appropriate priority
- **Timeline**: Next planning cycle or subsequent sprint
- **Effort**: Normal development workflow, proper planning and testing

## Integration with Development Workflow

### CI/CD Pipeline Integration
```yaml
# Example GitHub Actions workflow
- name: Security Scan
  run: |
    osv-scanner --format json . > scan-results.json
    # Process results with SSVC Engineer Triage
    node scripts/triage-vulnerabilities.js scan-results.json
```

### Issue Tracking Integration
- **DROP_TOOLS**: P0 incident ticket
- **SPIKE_EFFORT**: Research story in current sprint
- **BACKLOG**: Backlog item with security label
- **NIGHTLY_AUTO_PATCH**: Automated dependency update PR

### Team Communication
- Slack/Teams integration for DROP_TOOLS alerts
- Sprint planning agenda items for SPIKE_EFFORT findings
- Security champions review for BACKLOG items

This comprehensive approach ensures that vulnerability triage becomes a repeatable, data-driven process that integrates seamlessly with existing development practices while maintaining appropriate urgency for legitimate security threats.