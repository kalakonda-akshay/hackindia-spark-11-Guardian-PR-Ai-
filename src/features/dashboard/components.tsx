import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileCode2,
  Flame,
  GitPullRequest,
  LockKeyhole,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useCountUp } from "../../hooks/use-count-up";
import type {
  Agent,
  HeatmapRow,
  Metric,
  PullRequest,
  RepositoryHealth,
  RiskLevel,
  SecurityFinding,
  Severity,
  TimelineEvent,
  TrendPoint,
  VulnerabilityCategory,
} from "../../types/security";
import { cn } from "../../utils/cn";

const severityTone: Record<Severity, "danger" | "warning" | "success" | "info"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "success",
};

const riskClasses: Record<RiskLevel, string> = {
  critical: "border-red-500/25 bg-red-500/12 text-red-500",
  high: "border-amber-500/25 bg-amber-500/12 text-amber-500",
  medium: "border-cyan-500/25 bg-cyan-500/12 text-cyan-500",
  low: "border-emerald-500/25 bg-emerald-500/12 text-emerald-500",
};

const chartPalette = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"];

export function StatCard({ metric }: { metric: Metric }) {
  const value = useCountUp(metric.value);
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-normal">
              {value}
              {metric.suffix}
            </p>
          </div>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md",
              metric.severity ? riskClasses[metric.severity] : "bg-primary/12 text-primary",
            )}
          >
            {metric.severity === "critical" ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{metric.delta}</p>
      </CardContent>
    </Card>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold capitalize", riskClasses[risk])}>{risk}</span>;
}

export function SecurityGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 84 ? "#10b981" : score > 70 ? "#06b6d4" : score > 55 ? "#f59e0b" : "#ef4444";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Security Score</CardTitle>
        <Badge tone={score > 84 ? "success" : "warning"}>Live</Badge>
      </CardHeader>
      <CardContent className="grid place-items-center">
        <div className="relative h-52 w-52">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={`Security score ${score}`}>
            <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
            <circle
              cx="60"
              cy="60"
              r="48"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-5xl font-semibold tracking-normal">{score}</p>
              <p className="text-xs font-medium uppercase text-muted-foreground">Enterprise posture</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PullRequestTable({ pullRequests, onSelect }: { pullRequests: PullRequest[]; onSelect: (pr: PullRequest) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Pull Requests</CardTitle>
        <Badge tone="info">{pullRequests.length} active</Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b">
              <th className="py-3 font-medium">Repository</th>
              <th className="py-3 font-medium">PR</th>
              <th className="py-3 font-medium">Author</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Risk</th>
              <th className="py-3 font-medium">Security Score</th>
              <th className="py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {pullRequests.map((pr) => (
              <tr
                key={pr.id}
                tabIndex={0}
                onClick={() => onSelect(pr)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onSelect(pr);
                  }
                }}
                className="cursor-pointer border-b transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none"
              >
                <td className="py-4 font-medium">{pr.repository}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4 text-primary" />
                    <span>{pr.id}</span>
                    <span className="max-w-[220px] truncate text-muted-foreground">{pr.title}</span>
                  </div>
                </td>
                <td className="py-4 text-muted-foreground">{pr.author}</td>
                <td className="py-4">
                  <Badge tone={pr.status === "approved" ? "success" : pr.status === "blocked" ? "danger" : "info"}>
                    {pr.status}
                  </Badge>
                </td>
                <td className="py-4">
                  <RiskBadge risk={pr.risk} />
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pr.securityScore}%` }} />
                    </div>
                    <span className="font-medium">{pr.securityScore}</span>
                  </div>
                </td>
                <td className="py-4 text-muted-foreground">{pr.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function ReviewPipeline({ stages }: { stages: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live PR Review Progress</CardTitle>
        <Badge tone="info">#482</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {stages.map((stage, index) => {
            const complete = index < 4;
            const active = index === 4;
            return (
              <div key={stage} className="relative rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", complete ? "bg-emerald-500/15 text-emerald-500" : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : active ? <Radar className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  </span>
                  {active && <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />}
                </div>
                <p className="mt-4 text-sm font-medium">{stage}</p>
                <p className="mt-1 text-xs text-muted-foreground">{complete ? "Completed" : active ? "Analyzing" : "Queued"}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentStatusGrid({ agents }: { agents: Agent[] }) {
  const statusIcon = {
    running: Activity,
    completed: CheckCircle2,
    waiting: Clock3,
    failed: AlertTriangle,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status Monitor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(agents ?? []).map((agent) => {
          const Icon = statusIcon[agent.status as keyof typeof statusIcon] ?? Clock3;
          return (
            <article key={agent.name} className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.latency}</p>
                  </div>
                </div>
                <Icon className={cn("h-4 w-4", agent.status === "failed" ? "text-red-500" : agent.status === "completed" ? "text-emerald-500" : agent.status === "running" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${agent.workload}%` }} />
              </div>
              <p className="mt-2 text-xs capitalize text-muted-foreground">{agent.status}</p>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function AgentTimeline({ events }: { events: TimelineEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [events]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Real-Time Agent Timeline</CardTitle>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      </CardHeader>
      <CardContent>
        <div ref={ref} className="max-h-80 space-y-3 overflow-auto pr-1" aria-live="polite">
          {events.map((event) => (
            <article key={event.id} className="rounded-lg border bg-background p-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">{event.time}</p>
                    <Badge tone={event.severity === "info" ? "info" : severityTone[event.severity]}>{event.agent}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{event.event}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityTrendChart({ data }: { data: TrendPoint[] }) {
  const [range, setRange] = useState("7 Days");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Trend</CardTitle>
        <div className="flex rounded-md border bg-background p-1">
          {["7 Days", "30 Days", "90 Days", "All Time"].map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={cn("focus-ring rounded px-2 py-1 text-xs font-medium", range === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[50, 100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SeverityHeatmap({ rows }: { rows: HeatmapRow[] }) {
  const severities: Severity[] = ["critical", "high", "medium", "low"];
  const max = Math.max(...rows.flatMap((row) => severities.map((severity) => row[severity])));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[520px] space-y-2">
          <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] gap-2 text-xs font-medium uppercase text-muted-foreground">
            <span>Repository</span>
            {severities.map((severity) => (
              <span key={severity} className="capitalize">{severity}</span>
            ))}
          </div>
          {rows.map((row) => (
            <div key={row.repository} className="grid grid-cols-[1.4fr_repeat(4,1fr)] gap-2">
              <span className="rounded-md border bg-background px-3 py-2 text-sm font-medium">{row.repository}</span>
              {severities.map((severity) => {
                const alpha = 0.12 + (row[severity] / max) * 0.6;
                const base = severity === "critical" ? "239, 68, 68" : severity === "high" ? "245, 158, 11" : severity === "medium" ? "6, 182, 212" : "16, 185, 129";
                return (
                  <span
                    key={severity}
                    title={`${row.repository}: ${row[severity]} ${severity} findings`}
                    className="rounded-md border px-3 py-2 text-center text-sm font-semibold"
                    style={{ backgroundColor: `rgba(${base}, ${alpha})` }}
                  >
                    {row[severity]}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function IssueDistributionChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Issue Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={86} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopVulnerabilities({ categories }: { categories: VulnerabilityCategory[] }) {
  const icons = [Flame, LockKeyhole, ShieldAlert, AlertTriangle, ShieldCheck, Radar];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vulnerabilities</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(categories ?? []).map((category, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article key={category.name} className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <Badge tone={severityTone[category.severity]}>{category.count}</Badge>
              </div>
              <p className="mt-4 text-sm font-semibold">{category.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function VulnerabilityFeed({ findings }: { findings: SecurityFinding[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Vulnerability Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {(findings ?? []).map((finding) => (
            <article key={finding.id} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={severityTone[finding.severity]}>{finding.severity}</Badge>
                <span className="text-xs text-muted-foreground">{finding.timestamp}</span>
              </div>
              <p className="mt-3 text-sm font-medium">{finding.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{finding.repository}</p>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveSummary() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-gradient-to-r from-primary/18 via-transparent to-emerald-500/12 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Executive AI Summary</p>
            <p className="text-xs text-muted-foreground">Backend-ready narrative generated from agent consensus</p>
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <p className="text-lg leading-8 text-foreground">
          The portfolio is trending healthier overall, but merge risk is concentrated in authentication-sensitive pull
          requests. Block #482 until upstream OAuth errors are normalized and #477 until degraded role-cache behavior
          fails closed. Payment changes are safe for release with observability follow-up.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Block critical auth PRs", "Patch jose advisory", "Add replay telemetry"].map((action) => (
            <div key={action} className="rounded-lg border bg-background p-3 text-sm font-medium">
              {action}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RepositoryHealthGrid({ repositories }: { repositories: RepositoryHealth[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Health</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {repositories.map((repo) => (
          <article key={repo.repository} className="rounded-lg border bg-background p-4">
            <p className="font-medium">{repo.repository}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Security Score</p>
                <p className="mt-1 font-semibold">{repo.securityScore}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open PRs</p>
                <p className="mt-1 font-semibold">{repo.openPrs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Review</p>
                <p className="mt-1 font-semibold">{repo.averageReviewTime}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="mt-1 font-semibold text-red-500">{repo.criticalIssues}</p>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

export function ReviewThroughputChart({ data }: { data: TrendPoint[] }) {
  const transformed = useMemo(() => data.map((item) => ({ ...item, reviews: Math.round(item.score / 4) })), [data]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Throughput</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transformed}>
            <defs>
              <linearGradient id="reviewThroughput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Area type="monotone" dataKey="reviews" stroke="#10b981" fill="url(#reviewThroughput)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PRDetailsDrawer({ pullRequest, onClose }: { pullRequest: PullRequest | null; onClose: () => void }) {
  if (!pullRequest) {
    return null;
  }

  const sections = [
    { title: "Security Findings", items: pullRequest.findings.map((finding) => `${finding.title}: ${finding.description}`) },
    { title: "Dependency Findings", items: pullRequest.dependencyFindings },
    { title: "Code Quality Findings", items: pullRequest.qualityFindings },
    { title: "Suggested Fixes", items: pullRequest.suggestedFixes },
    { title: "Comments", items: pullRequest.comments },
  ];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${pullRequest.id} details`}>
      <button className="absolute inset-0 bg-background/72 backdrop-blur-sm" onClick={onClose} aria-label="Close pull request details" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-auto border-l bg-card shadow-security-card">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card/95 p-5 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">{pullRequest.repository}</Badge>
              <RiskBadge risk={pullRequest.risk} />
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-normal">
              {pullRequest.id} {pullRequest.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Author: {pullRequest.author}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-5 p-5">
          <section className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold">Summary</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{pullRequest.summary}</p>
          </section>
          <section className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold">Changed Files</h3>
            <div className="mt-3 space-y-2">
              {pullRequest.changedFiles.map((file) => (
                <div key={file} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                  <FileCode2 className="h-4 w-4 text-primary" />
                  {file}
                </div>
              ))}
            </div>
          </section>
          {sections.map((section) => (
            <details key={section.title} open className="rounded-lg border bg-background p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {section.title}
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="mt-3 space-y-2">
                {section.items.length ? (
                  section.items.map((item) => (
                    <p key={item} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">No findings detected.</p>
                )}
              </div>
            </details>
          ))}
          <section className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold">Attack Simulation</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{pullRequest.attackSimulation}</p>
          </section>
          <Button className="w-full">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </aside>
    </div>
  );
}
