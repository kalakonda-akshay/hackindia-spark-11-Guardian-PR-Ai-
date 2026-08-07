import { useState } from "react";
import { ErrorState, PageSkeleton } from "../components/ui/status-states";
import {
  AgentStatusGrid,
  AgentTimeline,
  ExecutiveSummary,
  IssueDistributionChart,
  PRDetailsDrawer,
  PullRequestTable,
  RepositoryHealthGrid,
  ReviewPipeline,
  ReviewThroughputChart,
  SecurityGauge,
  SecurityTrendChart,
  SeverityHeatmap,
  StatCard,
  TopVulnerabilities,
  VulnerabilityFeed,
} from "../features/dashboard/components";
import { useDashboard } from "../hooks/use-dashboard";
import type { PullRequest } from "../types/security";

export default function DashboardPage() {
  const [selectedPullRequest, setSelectedPullRequest] = useState<PullRequest | null>(null);
  const dashboard = useDashboard();

  const [prUrl, setPrUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!prUrl) return;
    setIsScanning(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true"
        },
        body: JSON.stringify({ url: prUrl })
      });
      if (res.ok) {
        // Socket.IO will trigger a refetch automatically
        console.log("Scan started successfully");
      } else {
        const error = await res.json();
        alert(`Failed to start scan: ${error.error}`);
      }
    } catch (e) {
      alert("Failed to connect to backend");
    }
    setIsScanning(false);
  };

  if (dashboard.isLoading) {
    return <PageSkeleton />;
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Paste GitHub PR URL to start (e.g. https://github.com/owner/repo/pull/1)" 
            className="flex-1 rounded-md border bg-background px-4 py-2"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
          />
          <button 
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? "Starting..." : "Analyze PR"}
          </button>
        </div>
        <ErrorState
          title="No Active Session"
          message="Trigger a scan using the input above to view the dashboard."
          onRetry={() => void dashboard.refetch()}
        />
      </div>
    );
  }

  const data = dashboard.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Paste GitHub PR URL to start (e.g. https://github.com/owner/repo/pull/1)" 
            className="flex-1 rounded-md border bg-background px-4 py-2"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
          />
          <button 
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? "Starting..." : "Analyze PR"}
          </button>
        </div>
        
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Security review command center</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Live pull request intelligence, agent pipeline health, repository risk posture, and executive-ready
              remediation guidance.
            </p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-security-card">
            Active scan: <span className="font-semibold text-foreground">{data.pullRequests[0]?.repository || "None"} #{data.pullRequests[0]?.id || ""}</span>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <SecurityGauge score={data.securityScore} />
        <div className="space-y-4">
          <PullRequestTable pullRequests={data.pullRequests} onSelect={setSelectedPullRequest} />
          <ReviewPipeline stages={data.pipelineStages} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AgentStatusGrid agents={data.agents} />
        <AgentTimeline events={data.timelineEvents} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <SecurityTrendChart data={data.securityTrend} />
        <IssueDistributionChart data={data.issueDistribution} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <SeverityHeatmap rows={data.heatmapRows} />
        <VulnerabilityFeed findings={data.vulnerabilityFeed} />
      </section>

      <TopVulnerabilities categories={data.topVulnerabilities} />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <ExecutiveSummary />
        <ReviewThroughputChart data={data.securityTrend} />
      </section>

      <RepositoryHealthGrid repositories={data.repositoryHealth} />
      <PRDetailsDrawer pullRequest={selectedPullRequest} onClose={() => setSelectedPullRequest(null)} />
    </div>
  );
}
