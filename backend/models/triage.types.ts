import { ChangedFile } from "./github.types.js";

export type PRClassification = 
  | "Feature" 
  | "Bug Fix" 
  | "Refactor" 
  | "Documentation" 
  | "Dependency Update" 
  | "Configuration Change" 
  | "Security Related" 
  | "Test Only" 
  | "Mixed";

export type PRComplexity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TriageResult {
  summary: string;
  riskScore: number; // e.g., 0-100
  complexity: PRComplexity;
  classification: PRClassification[];
  languages: string[];
  frameworks: string[];
  priorityFiles: string[];
  sensitiveFiles: string[];
  recommendedReviewStrategy: string;
}

export interface TriageAgentRequest {
  reviewRequest: any; // Context passed from orchestrator
  changedFiles: ChangedFile[]; // Ideally, the triage agent would fetch these, but orchestrator might pass them
}
