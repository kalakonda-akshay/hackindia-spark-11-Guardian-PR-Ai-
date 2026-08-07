export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type Confidence = "CERTAIN" | "FIRM" | "TENTATIVE";

export interface SecurityFinding {
  ruleId: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: Confidence;
  cwe?: string;
  owaspMapping?: string;
  evidence: string;
  file: string;
  line?: number;
  suggestedFix?: string;
  secureReplacementCode?: string;
  references?: string[];
  // AI Explanations
  explanation?: string;
  exploitability?: string;
  impact?: string;
}

export interface SecurityResult {
  findings: SecurityFinding[];
  riskScore: number;
  securitySummary: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passedChecks: number;
  failedChecks: number;
}
