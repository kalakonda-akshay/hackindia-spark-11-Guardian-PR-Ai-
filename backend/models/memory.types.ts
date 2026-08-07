import { SecurityFinding } from "./security.types.js";

export interface HistoricalFinding extends SecurityFinding {
  resolvedAt: string;
  resolution: "FIXED" | "FALSE_POSITIVE" | "ACCEPTED_RISK";
  pullRequestUrl: string;
}

export interface TeamStandard {
  ruleId: string;
  description: string;
  enforcementLevel: "STRICT" | "WARNING" | "IGNORE";
}

export interface MemoryResult {
  similarPastFindings: HistoricalFinding[];
  applicableStandards: TeamStandard[];
  duplicateCount: number;
  falsePositiveHints: string[];
}
