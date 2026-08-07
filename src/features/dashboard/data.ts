import type {
  Agent,
  HeatmapRow,
  Metric,
  PullRequest,
  RepositoryHealth,
  TimelineEvent,
  TrendPoint,
  VulnerabilityCategory,
} from "../../types/security";

export const dashboardMetrics: Metric[] = [
  { label: "Total PRs", value: 184, delta: "+18 this week" },
  { label: "Reviewed PRs", value: 142, delta: "77% automated coverage" },
  { label: "Pending Reviews", value: 23, delta: "6 waiting for context" },
  { label: "Critical Issues", value: 4, delta: "-2 since yesterday", severity: "critical" },
  { label: "High Issues", value: 17, delta: "+5 in auth services", severity: "high" },
  { label: "Medium Issues", value: 39, delta: "mostly dependency drift", severity: "medium" },
  { label: "Low Issues", value: 61, delta: "triaged automatically", severity: "low" },
  { label: "AI Confidence Score", value: 94, suffix: "%", delta: "based on 7-agent consensus" },
];

export const pullRequests: PullRequest[] = [
  {
    id: "#482",
    repository: "fintech-core",
    title: "Harden token exchange flow",
    author: "Aarav Mehta",
    status: "reviewing",
    risk: "critical",
    securityScore: 62,
    updated: "3 min ago",
    changedFiles: ["src/auth/tokenExchange.ts", "src/middleware/session.ts", "tests/auth/tokenExchange.spec.ts"],
    summary: "OAuth token exchange now validates PKCE challenges, but one retry branch can disclose provider error bodies.",
    findings: [
      {
        id: "SEC-1042",
        title: "Provider error body returned to client",
        severity: "critical",
        repository: "fintech-core",
        timestamp: "14:08",
        description: "Sensitive identity-provider diagnostics can leak tenant metadata through the API response.",
      },
      {
        id: "SEC-1043",
        title: "Refresh token rotation lacks replay telemetry",
        severity: "high",
        repository: "fintech-core",
        timestamp: "14:11",
        description: "Rotation is enforced, but replay attempts are not emitted to the security event stream.",
      },
    ],
    dependencyFindings: ["openid-client is pinned correctly", "transitive jose version requires advisory review"],
    qualityFindings: ["Retry handler needs a narrow typed error boundary", "Integration test should include expired verifier state"],
    attackSimulation: "Simulated OAuth error reflection reproduced tenant hint exposure in 2 of 5 retry paths.",
    suggestedFixes: ["Normalize upstream OAuth errors", "Emit replay attempts to audit-log", "Add regression for malformed verifier"],
    comments: ["Security agent blocked merge until response normalization lands.", "Reporter generated executive diff note."],
  },
  {
    id: "#477",
    repository: "identity-gateway",
    title: "Upgrade auth middleware",
    author: "Nisha Rao",
    status: "blocked",
    risk: "high",
    securityScore: 71,
    updated: "12 min ago",
    changedFiles: ["gateway/auth/middleware.ts", "gateway/policies/rbac.ts"],
    summary: "Middleware upgrade improves issuer validation but weakens tenant role fallback behavior.",
    findings: [
      {
        id: "SEC-1037",
        title: "Role fallback permits stale tenant grants",
        severity: "high",
        repository: "identity-gateway",
        timestamp: "13:54",
        description: "Cached tenant grants remain valid after policy cache invalidation in a degraded mode path.",
      },
    ],
    dependencyFindings: ["No vulnerable packages introduced"],
    qualityFindings: ["Policy cache wrapper should expose explicit degraded-mode type"],
    attackSimulation: "Replay of a stale role token retained reviewer access for 90 seconds after revocation.",
    suggestedFixes: ["Fail closed on policy cache misses", "Shorten degraded cache TTL", "Add revocation simulation test"],
    comments: ["Triage marked as high business impact due to privileged reviewer role."],
  },
  {
    id: "#463",
    repository: "payments-api",
    title: "Payment webhook reconciliation",
    author: "Kabir Singh",
    status: "approved",
    risk: "medium",
    securityScore: 86,
    updated: "28 min ago",
    changedFiles: ["src/webhooks/reconcile.ts", "src/ledger/writeModel.ts"],
    summary: "Webhook reconciliation adds idempotency guards and passes fraud-simulation checks.",
    findings: [
      {
        id: "SEC-1029",
        title: "Webhook replay window needs observability",
        severity: "medium",
        repository: "payments-api",
        timestamp: "13:31",
        description: "Replay prevention works, but dashboard visibility should include rejected duplicate signatures.",
      },
    ],
    dependencyFindings: ["Stripe SDK version aligns with policy baseline"],
    qualityFindings: ["Ledger write model has clear transaction boundaries"],
    attackSimulation: "Replay storm simulation rejected 10,000 duplicate events without balance drift.",
    suggestedFixes: ["Add webhook replay counter to telemetry"],
    comments: ["Approved with one non-blocking observability recommendation."],
  },
  {
    id: "#455",
    repository: "merchant-portal",
    title: "Admin invite redesign",
    author: "Isha Kapoor",
    status: "pending",
    risk: "low",
    securityScore: 92,
    updated: "45 min ago",
    changedFiles: ["app/admin/invites/page.tsx", "app/admin/invites/actions.ts"],
    summary: "Invite flow remains protected by scoped tokens and improves audit-copy clarity.",
    findings: [],
    dependencyFindings: ["No dependency changes"],
    qualityFindings: ["Client/server split is clear", "Form validation is covered"],
    attackSimulation: "Invite token brute-force simulation failed against rate limits.",
    suggestedFixes: ["Ship after final accessibility review"],
    comments: ["Waiting for quality agent completion."],
  },
];

export const pipelineStages = ["Triage", "Context", "Security", "Dependency", "Quality", "Memory", "Reporter"];

export const agents: Agent[] = [
  { name: "Orchestrator", status: "running", latency: "1.2s", workload: 82 },
  { name: "Triage", status: "completed", latency: "420ms", workload: 34 },
  { name: "Security", status: "running", latency: "2.8s", workload: 91 },
  { name: "Dependency", status: "completed", latency: "970ms", workload: 46 },
  { name: "Quality", status: "waiting", latency: "queued", workload: 18 },
  { name: "Memory", status: "completed", latency: "610ms", workload: 29 },
  { name: "Reporter", status: "waiting", latency: "queued", workload: 12 },
];

export const timelineEvents: TimelineEvent[] = [
  { id: "evt-1", time: "14:12:08", agent: "Security", event: "Detected OAuth error reflection in #482", severity: "critical" },
  { id: "evt-2", time: "14:11:39", agent: "Memory", event: "Matched prior tenant metadata leak pattern", severity: "high" },
  { id: "evt-3", time: "14:10:21", agent: "Dependency", event: "Flagged jose advisory for manual review", severity: "medium" },
  { id: "evt-4", time: "14:09:44", agent: "Triage", event: "Raised #477 to high impact", severity: "high" },
  { id: "evt-5", time: "14:08:03", agent: "Reporter", event: "Drafted merge-blocker summary", severity: "info" },
  { id: "evt-6", time: "14:06:57", agent: "Quality", event: "Confirmed transaction boundaries in payments-api", severity: "low" },
];

export const securityTrend: TrendPoint[] = [
  { label: "Mon", score: 78, critical: 7, high: 22 },
  { label: "Tue", score: 81, critical: 6, high: 19 },
  { label: "Wed", score: 80, critical: 6, high: 20 },
  { label: "Thu", score: 84, critical: 5, high: 18 },
  { label: "Fri", score: 88, critical: 4, high: 17 },
  { label: "Sat", score: 87, critical: 4, high: 16 },
  { label: "Sun", score: 90, critical: 3, high: 14 },
];

export const heatmapRows: HeatmapRow[] = [
  { repository: "fintech-core", critical: 2, high: 7, medium: 12, low: 18 },
  { repository: "identity-gateway", critical: 1, high: 5, medium: 8, low: 10 },
  { repository: "payments-api", critical: 0, high: 2, medium: 7, low: 14 },
  { repository: "merchant-portal", critical: 0, high: 1, medium: 6, low: 19 },
  { repository: "risk-engine", critical: 1, high: 2, medium: 6, low: 8 },
];

export const issueDistribution = [
  { name: "Critical", value: 4 },
  { name: "High", value: 17 },
  { name: "Medium", value: 39 },
  { name: "Low", value: 61 },
];

export const topVulnerabilities: VulnerabilityCategory[] = [
  { name: "SQL Injection", count: 3, severity: "critical", description: "Unsafe query construction in report filters" },
  { name: "Secrets", count: 6, severity: "high", description: "Keys and provider tokens exposed in diffs" },
  { name: "XSS", count: 5, severity: "high", description: "Unescaped markdown preview paths" },
  { name: "Unsafe Dependency", count: 14, severity: "medium", description: "Advisories requiring owner review" },
  { name: "Authentication", count: 8, severity: "high", description: "Token lifetime and replay risks" },
  { name: "Broken Access Control", count: 4, severity: "critical", description: "Tenant isolation and stale grants" },
];

export const vulnerabilityFeed = pullRequests.flatMap((pr) => pr.findings);

export const repositoryHealth: RepositoryHealth[] = [
  { repository: "fintech-core", securityScore: 74, openPrs: 12, averageReviewTime: "14m", criticalIssues: 2 },
  { repository: "identity-gateway", securityScore: 79, openPrs: 7, averageReviewTime: "11m", criticalIssues: 1 },
  { repository: "payments-api", securityScore: 88, openPrs: 5, averageReviewTime: "8m", criticalIssues: 0 },
  { repository: "risk-engine", securityScore: 81, openPrs: 9, averageReviewTime: "17m", criticalIssues: 1 },
];
