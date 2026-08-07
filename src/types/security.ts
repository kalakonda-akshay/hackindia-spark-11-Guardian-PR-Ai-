export type Severity = "critical" | "high" | "medium" | "low";
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type PullRequestStatus = "reviewing" | "approved" | "blocked" | "pending";
export type AgentStatus = "running" | "completed" | "waiting" | "failed";

export type Metric = {
  label: string;
  value: number;
  suffix?: string;
  delta: string;
  severity?: Severity;
};

export type PullRequest = {
  id: string;
  repository: string;
  title: string;
  author: string;
  status: PullRequestStatus;
  risk: RiskLevel;
  securityScore: number;
  updated: string;
  changedFiles: string[];
  summary: string;
  findings: SecurityFinding[];
  dependencyFindings: string[];
  qualityFindings: string[];
  attackSimulation: string;
  suggestedFixes: string[];
  comments: string[];
};

export type SecurityFinding = {
  id: string;
  title: string;
  severity: Severity;
  repository: string;
  timestamp: string;
  description: string;
};

export type Agent = {
  name: string;
  status: AgentStatus;
  latency: string;
  workload: number;
};

export type TimelineEvent = {
  id: string;
  time: string;
  agent: string;
  event: string;
  severity: Severity | "info";
};

export type TrendPoint = {
  label: string;
  score: number;
  critical: number;
  high: number;
};

export type HeatmapRow = {
  repository: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

export type VulnerabilityCategory = {
  name: string;
  count: number;
  severity: Severity;
  description: string;
};

export type RepositoryHealth = {
  repository: string;
  securityScore: number;
  openPrs: number;
  averageReviewTime: string;
  criticalIssues: number;
};

export type ReportStatus = "open" | "resolved" | "blocked" | "approved";

export type SecurityReport = {
  id: string;
  repository: string;
  pullRequest: string;
  title: string;
  author: string;
  date: string;
  status: ReportStatus;
  severity: Severity;
  score: number;
  executiveSummary: string;
  securityFindings: string[];
  dependencyFindings: string[];
  qualityFindings: string[];
  attackSimulations: string[];
  recommendations: string[];
};
