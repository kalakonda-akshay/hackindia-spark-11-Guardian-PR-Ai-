import { SecurityFinding, Severity } from "../../models/security.types.js";
import { DiffHunk, DiffLine } from "../../models/github.types.js";

/**
 * Static analysis rule engine to quickly detect obvious secrets and dangerous functions
 * before sending code to the expensive AI layer.
 */
export class RuleEngine {
  private rules = [
    // Secrets
    { id: "SEC-001", regex: /(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/, type: "Secret", name: "GitHub Token", severity: "CRITICAL" as Severity, cwe: "CWE-798" },
    { id: "SEC-002", regex: /AKIA[0-9A-Z]{16}/, type: "Secret", name: "AWS Access Key", severity: "CRITICAL" as Severity, cwe: "CWE-798" },
    { id: "SEC-003", regex: /-----BEGIN (RSA|OPENSSH|DSA|EC|PGP) PRIVATE KEY-----/, type: "Secret", name: "Private Key", severity: "CRITICAL" as Severity, cwe: "CWE-798" },
    { id: "SEC-004", regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/, type: "Secret", name: "JWT Token", severity: "HIGH" as Severity, cwe: "CWE-798" },
    { id: "SEC-005", regex: /(password|secret|api_key|apikey|token)["']?\s*[:=]\s*["'][a-zA-Z0-9\-_]+["']/, type: "Secret", name: "Hardcoded Credential/Secret", severity: "HIGH" as Severity, cwe: "CWE-798" },
    
    // Cryptography
    { id: "CRYPTO-001", regex: /crypto\.createHash\(['"](md5|sha1)["']\)/i, type: "Cryptography", name: "Weak Hash Algorithm", severity: "MEDIUM" as Severity, cwe: "CWE-328" },
    { id: "CRYPTO-002", regex: /Math\.random\(\)/, type: "Cryptography", name: "Weak Randomness", severity: "LOW" as Severity, cwe: "CWE-338" }, // Context dependent, but good to flag

    // Code Quality / Injection
    { id: "INJ-001", regex: /\beval\s*\(/, type: "Code Quality", name: "Dangerous eval()", severity: "CRITICAL" as Severity, cwe: "CWE-95" },
    { id: "INJ-002", regex: /\bexec\s*\(/, type: "Code Quality", name: "Dangerous exec()", severity: "HIGH" as Severity, cwe: "CWE-78" },
    { id: "INJ-003", regex: /child_process\.(exec|spawn|fork)\s*\(/, type: "Code Quality", name: "Shell Execution", severity: "MEDIUM" as Severity, cwe: "CWE-78" },
    { id: "INJ-004", regex: /innerHTML\s*=|v-html=|dangerouslySetInnerHTML/, type: "Web", name: "Potential XSS", severity: "MEDIUM" as Severity, cwe: "CWE-79" },
    { id: "INJ-005", regex: /\b(SELECT|INSERT|UPDATE|DELETE).*\$\{.*\}/i, type: "Injection", name: "Potential SQL Injection", severity: "CRITICAL" as Severity, cwe: "CWE-89" },
  ];

  public scanHunks(filename: string, hunks: DiffHunk[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    for (const hunk of hunks) {
      for (const line of hunk.lines) {
        // Only scan added lines for new vulnerabilities
        if (line.type === "add") {
          for (const rule of this.rules) {
            if (rule.regex.test(line.content)) {
              findings.push({
                ruleId: rule.id,
                title: rule.name,
                description: `Detected a potential ${rule.name} matching pattern \`${rule.regex.source}\`.`,
                severity: rule.severity,
                confidence: "CERTAIN",
                cwe: rule.cwe,
                evidence: line.content.trim(),
                file: filename,
                line: line.newLineNumber,
                suggestedFix: "Remove or mitigate the insecure pattern.",
              });
            }
          }
        }
      }
    }

    return findings;
  }
}

export const ruleEngine = new RuleEngine();
