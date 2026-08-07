import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileJson, FileText, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { ReportStatus, SecurityReport, Severity } from "../../types/security";
import { cn } from "../../utils/cn";

const filterSchema = z.object({
  repository: z.string(),
  dateRange: z.string(),
  severity: z.string(),
  author: z.string(),
  status: z.string(),
  search: z.string(),
});

type FilterValues = z.infer<typeof filterSchema>;

const severityTone: Record<Severity, "danger" | "warning" | "info" | "success"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "success",
};

const statusTone: Record<ReportStatus, "danger" | "warning" | "info" | "success"> = {
  blocked: "danger",
  open: "info",
  resolved: "success",
  approved: "success",
};

export function ReportsConsole({
  reports,
  onExport,
  exportPending,
}: {
  reports: SecurityReport[];
  onExport: (reportId: string, format: "PDF" | "CSV" | "JSON") => void;
  exportPending: boolean;
}) {
  const [expandedReportId, setExpandedReportId] = useState(reports[0]?.id ?? "");
  const { register, watch, reset } = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      repository: "all",
      dateRange: "30",
      severity: "all",
      author: "all",
      status: "all",
      search: "",
    },
  });

  const filters = watch();
  const repositories = useMemo(() => Array.from(new Set(reports.map((report) => report.repository))), [reports]);
  const authors = useMemo(() => Array.from(new Set(reports.map((report) => report.author))), [reports]);

  const filteredReports = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesRepository = filters.repository === "all" || report.repository === filters.repository;
      const matchesSeverity = filters.severity === "all" || report.severity === filters.severity;
      const matchesAuthor = filters.author === "all" || report.author === filters.author;
      const matchesStatus = filters.status === "all" || report.status === filters.status;
      const matchesSearch =
        !search ||
        [report.id, report.repository, report.pullRequest, report.title, report.author].some((field) =>
          field.toLowerCase().includes(search),
        );
      return matchesRepository && matchesSeverity && matchesAuthor && matchesStatus && matchesSearch;
    });
  }, [filters, reports]);

  const activeReport = filteredReports.find((report) => report.id === expandedReportId) ?? filteredReports[0] ?? reports[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => reset()} type="button">
            Reset
          </Button>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <Select label="Repository" {...register("repository")}>
              <option value="all">All repositories</option>
              {repositories.map((repository) => (
                <option key={repository} value={repository}>{repository}</option>
              ))}
            </Select>
            <Select label="Date Range" {...register("dateRange")}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </Select>
            <Select label="Severity" {...register("severity")}>
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Select label="Author" {...register("author")}>
              <option value="all">All authors</option>
              {authors.map((author) => (
                <option key={author} value={author}>{author}</option>
              ))}
            </Select>
            <Select label="Status" {...register("status")}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="blocked">Blocked</option>
              <option value="approved">Approved</option>
              <option value="resolved">Resolved</option>
            </Select>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="focus-ring h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                  placeholder="Report, PR, repo"
                  {...register("search")}
                />
              </span>
            </label>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Report Table</CardTitle>
            <Badge tone="info">{filteredReports.length} reports</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Report</th>
                  <th className="py-3 font-medium">Repository</th>
                  <th className="py-3 font-medium">PR</th>
                  <th className="py-3 font-medium">Severity</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Score</th>
                  <th className="py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => {
                  const expanded = activeReport?.id === report.id;
                  return (
                    <tr
                      key={report.id}
                      tabIndex={0}
                      onClick={() => setExpandedReportId(report.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setExpandedReportId(report.id);
                        }
                      }}
                      className={cn("cursor-pointer border-b transition hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none", expanded && "bg-muted/70")}
                    >
                      <td className="py-4">
                        <p className="font-medium">{report.id}</p>
                        <p className="max-w-[260px] truncate text-xs text-muted-foreground">{report.title}</p>
                      </td>
                      <td className="py-4 text-muted-foreground">{report.repository}</td>
                      <td className="py-4 font-medium">{report.pullRequest}</td>
                      <td className="py-4">
                        <Badge tone={severityTone[report.severity]}>{report.severity}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge tone={statusTone[report.status]}>{report.status}</Badge>
                      </td>
                      <td className="py-4 font-semibold">{report.score}</td>
                      <td className="py-4 text-muted-foreground">{report.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredReports.length && <EmptyReportsState />}
          </CardContent>
        </Card>

        {activeReport && (
          <DetailedReport report={activeReport} onExport={onExport} exportPending={exportPending} />
        )}
      </div>
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

function Select({ label, children, ...props }: SelectProps) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select className="focus-ring h-10 w-full rounded-md border bg-background px-3 text-sm" {...props}>
        {children}
      </select>
    </label>
  );
}

function DetailedReport({
  report,
  onExport,
  exportPending,
}: {
  report: SecurityReport;
  onExport: (reportId: string, format: "PDF" | "CSV" | "JSON") => void;
  exportPending: boolean;
}) {
  const sections = [
    ["Security Findings", report.securityFindings],
    ["Dependency Findings", report.dependencyFindings],
    ["Quality Findings", report.qualityFindings],
    ["Attack Simulations", report.attackSimulations],
    ["Recommendations", report.recommendations],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Detailed Report</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{report.id} · {report.repository} {report.pullRequest}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport(report.id, "PDF")} disabled={exportPending}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport(report.id, "CSV")} disabled={exportPending}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport(report.id, "JSON")} disabled={exportPending}>
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="rounded-lg border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={severityTone[report.severity]}>{report.severity}</Badge>
            <Badge tone={statusTone[report.status]}>{report.status}</Badge>
            <span className="text-sm font-semibold">Score {report.score}</span>
          </div>
          <h3 className="mt-4 font-semibold">Executive Summary</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.executiveSummary}</p>
        </section>
        {sections.map(([title, items]) => (
          <section key={title} className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold">{title}</h3>
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <p key={item} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyReportsState() {
  return (
    <div className="grid min-h-72 place-items-center text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border bg-background">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <p className="mt-4 font-semibold">No reports match these filters</p>
        <p className="mt-1 text-sm text-muted-foreground">Adjust severity, repository, or search terms to broaden the evidence set.</p>
      </div>
    </div>
  );
}
