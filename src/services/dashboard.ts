import {
  dashboardMetrics,
  agents,
  heatmapRows,
  issueDistribution,
  pipelineStages,
  pullRequests,
  repositoryHealth,
  securityTrend,
  timelineEvents,
  topVulnerabilities,
  vulnerabilityFeed,
} from "../features/dashboard/data";
import type {
  HeatmapRow,
  Agent,
  Metric,
  PullRequest,
  RepositoryHealth,
  SecurityFinding,
  TimelineEvent,
  TrendPoint,
  VulnerabilityCategory,
} from "../types/security";
import { requestOrMock } from "./api-client";

export type DashboardPayload = {
  metrics: Metric[];
  securityScore: number;
  agents: Agent[];
  pullRequests: PullRequest[];
  pipelineStages: string[];
  timelineEvents: TimelineEvent[];
  securityTrend: TrendPoint[];
  heatmapRows: HeatmapRow[];
  issueDistribution: Array<{ name: string; value: number }>;
  topVulnerabilities: VulnerabilityCategory[];
  vulnerabilityFeed: SecurityFinding[];
  repositoryHealth: RepositoryHealth[];
};

export function getDashboard() {
  return requestOrMock<DashboardPayload>("/dashboard", () => ({
    metrics: dashboardMetrics,
    securityScore: 88,
    agents,
    pullRequests,
    pipelineStages,
    timelineEvents,
    securityTrend,
    heatmapRows,
    issueDistribution,
    topVulnerabilities,
    vulnerabilityFeed,
    repositoryHealth,
  }));
}
